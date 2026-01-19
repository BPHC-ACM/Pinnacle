import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/storage_service.dart';
import '../utils/logger.dart';

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

class ApiClient {
  final Dio _dio;
  final StorageService _storage;
  bool _isRefreshing = false;

  // Singleton instance
  static final ApiClient _instance = ApiClient._internal();

  factory ApiClient() => _instance;

  ApiClient._internal()
    : _storage = StorageService(),
      _dio = Dio(
        BaseOptions(
          // REPLACE with your local IP if running locally.
          // Android Emulator uses 10.0.2.2.
          // or use http://localhost:3000 if rerouting with adb
          baseUrl: 'http://localhost:3000',
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
          headers: {'Content-Type': 'application/json'},
        ),
      ) {
    _setupInterceptors();
  }

  // Expose the raw Dio client if needed, or helper methods (get, post, etc.)
  Dio get client => _dio;

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            if (e.requestOptions.path.contains('/auth/refresh')) {
              return handler.next(e);
            }

            if (_isRefreshing) {
              return handler.next(e);
            }

            _isRefreshing = true;
            logger.d("ApiClient: 401 received. Attempting to refresh token...");

            try {
              final refreshToken = await _storage.getRefreshToken();

              if (refreshToken == null) {
                logger.w("ApiClient: No refresh token available. Logging out.");
                await _storage.clearAll();
                return handler.next(e);
              }

              final refreshDio = Dio(
                BaseOptions(baseUrl: _dio.options.baseUrl),
              );

              final refreshResponse = await refreshDio.post(
                '/auth/refresh',
                data: {'refreshToken': refreshToken},
              );

              if (refreshResponse.statusCode == 200) {
                final newAccessToken = refreshResponse.data['accessToken'];
                logger.i("ApiClient: Token refreshed successfully.");

                // 1. Save new token
                await _storage.saveToken(newAccessToken);

                // 2. Update the original request with the new token
                final opts = e.requestOptions;
                opts.headers['Authorization'] = 'Bearer $newAccessToken';

                // 3. Retry the request
                final clonedRequest = await _dio.fetch(opts);
                return handler.resolve(clonedRequest);
              }
            } catch (refreshError) {
              logger.e("ApiClient: Token refresh failed.", error: refreshError);
              await _storage.clearAll();
            } finally {
              _isRefreshing = false;
            }
          }
          return handler.next(e);
        },
      ),
    );
  }

  // Helper method for GET requests (used by Repositories)
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.get(path, queryParameters: queryParameters);
  }

  // Helper method for POST requests
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.post(path, data: data, queryParameters: queryParameters);
  }

  // Helper method for PATCH requests
  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.patch(path, data: data, queryParameters: queryParameters);
  }

  // Helper method for DELETE requests
  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    return _dio.delete(path, data: data, queryParameters: queryParameters);
  }
}

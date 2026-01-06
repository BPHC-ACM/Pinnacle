import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/storage_service.dart';
import '../utils/logger.dart';

// 1. Define the global provider here
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

class ApiClient {
  final Dio _dio;
  final StorageService _storage;

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
            // Token expired or invalid
            await _storage.clearAll();
            if (kDebugMode) {
              logger.i("Session expired. User logged out.");
            }
          }
          return handler.next(e);
        },
      ),
    );
  }
}
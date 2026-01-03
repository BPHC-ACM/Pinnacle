import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../storage/storage_service.dart';

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
          // REPLACE with your local IP if running locally. Also Using nip.io to bypass Google's Private IP restriction.
          // Android Emulator uses 10.0.2.2.
          baseUrl: 'http://192.168.1.9.nip.io:3000',
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
          headers: {'Content-Type': 'application/json'},
        ),
      ) {
    _setupInterceptors();
  }

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
            // Token expired or invalid
            await _storage.clearAll();
            // TODO: Trigger a global navigation event to login screen
            if (kDebugMode) {
              print("Session expired. User logged out.");
            }
          }
          return handler.next(e);
        },
      ),
    );
  }
}

import 'package:dio/dio.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/storage_service.dart';
import '../models/user_model.dart';

class AuthRepository {
  final Dio _dio = ApiClient().client;
  final StorageService _storage = StorageService();

  // 1. Initiate Google Login
  Future<void> loginWithGoogle() async {
    try {
      print("Initiating login..."); // Debug print

      final response = await _dio.get('/auth/google/login');
      final String? authUrl = response.data['authUrl'];

      print("Backend returned URL: $authUrl"); // Debug print

      if (authUrl != null) {
        final uri = Uri.parse(authUrl);

        // Try launching directly if canLaunch fails (fallback)
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          print(
            "Warning: canLaunchUrl returned false. Attempting to launch anyway...",
          );
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      } else {
        throw Exception("Auth URL is null");
      }
    } catch (e) {
      print("Login Error: $e"); // Debug print
      rethrow;
    }
  }

  // 2. Fetch Current User Profile
  Future<User> getMe() async {
    try {
      final response = await _dio.get('/auth/me');
      // Backend returns { user: ... } based on auth.controller.ts
      return User.fromJson(response.data['user']);
    } catch (e) {
      throw Exception('Failed to fetch profile');
    }
  }

  // 3. Logout
  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      await _storage.clearAll();
    }
  }
}

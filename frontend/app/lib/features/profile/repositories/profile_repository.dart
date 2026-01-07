import 'dart:convert';
import 'dart:developer';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../models/student_profile_model.dart';

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepository(ref.read(apiClientProvider));
});

class ProfileRepository {
  final ApiClient _apiClient;

  ProfileRepository(this._apiClient);

  Future<StudentProfile> getProfile() async {
    try {
      final response = await _apiClient.get('/api/user-details/profile');

      dynamic data = response.data;

      // 1. Debugging Logs
      log("Response Status: ${response.statusCode}");
      log("Response Type: ${data.runtimeType}");

      // 2. Handle String response (Manual Decode)
      if (data is String) {
        // Check if it's actually HTML (common error when API route is wrong)
        if (data.trim().startsWith('<')) {
          throw Exception(
            "Server returned HTML instead of JSON. Check your API URL or Server logs.",
          );
        }
        try {
          data = jsonDecode(data);
        } catch (e) {
          throw Exception("Failed to parse server response: $data");
        }
      }

      // 3. Handle List response (Unexpected)
      if (data is List) {
        if (data.isEmpty)
          throw Exception("Profile not found (Empty List returned)");
        data = data.first; // Try to use the first item if it's a list
      }

      // 4. Validate Map
      if (data is! Map<String, dynamic>) {
        throw Exception(
          "Invalid data format. Expected Map, got: ${data.runtimeType}",
        );
      }

      log("Parsed Profile Data: $data");

      return StudentProfile.fromJson(data);
    } on DioException catch (e) {
      log("DioError: ${e.message}");
      log("DioError Data: ${e.response?.data}");
      throw Exception(
        e.response?.data['message'] ?? 'Failed to load profile connection',
      );
    } catch (e, stack) {
      log("Repository Error: $e", stackTrace: stack);
      rethrow;
    }
  }

  Future<void> updateProfile({
    String? phone,
    String? location,
    String? bio,
    String? title,
    String? linkedin,
    String? github,
    String? website,
  }) async {
    try {
      // FIX 1: Add the '/api' prefix to match the getProfile method and backend routes
      await _apiClient.patch(
        '/api/user-details/profile',
        data: {
          'phone': phone,
          'location': location,
          'bio': bio,
          'title': title,
          'linkedin': linkedin,
          'github': github,
          'website': website,
        },
      );
    } on DioException catch (e) {
      // FIX 2: Safely handle non-Map error responses (like 404 HTML/Text)
      final data = e.response?.data;
      String errorMessage = 'Failed to update profile';

      if (data is Map<String, dynamic> && data.containsKey('message')) {
        errorMessage = data['message'];
      } else if (data is String) {
        errorMessage = data; // Use the raw string if available
      }

      throw Exception(errorMessage);
    }
  }
}

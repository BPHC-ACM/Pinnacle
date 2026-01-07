import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/logger.dart'; // Import logger
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

      // Debugging Logs
      logger.d("Response Status: ${response.statusCode}");
      logger.d("Response Type: ${data.runtimeType}");

      if (data is String) {
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

      if (data is List) {
        if (data.isEmpty)
          throw Exception("Profile not found (Empty List returned)");
        data = data.first;
      }

      if (data is! Map<String, dynamic>) {
        throw Exception(
          "Invalid data format. Expected Map, got: ${data.runtimeType}",
        );
      }

      logger.d("Parsed Profile Data: $data");

      return StudentProfile.fromJson(data);
    } on DioException catch (e) {
      logger.e("DioError: ${e.message}", error: e, stackTrace: e.stackTrace);
      logger.e("DioError Data: ${e.response?.data}");
      throw Exception(
        e.response?.data['message'] ?? 'Failed to load profile connection',
      );
    } catch (e, stack) {
      logger.e("Repository Error: $e", error: e, stackTrace: stack);
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
      logger.i("Profile updated successfully");
    } on DioException catch (e) {
      final data = e.response?.data;
      String errorMessage = 'Failed to update profile';

      if (data is Map<String, dynamic> && data.containsKey('message')) {
        errorMessage = data['message'];
      } else if (data is String) {
        errorMessage = data;
      }
      
      logger.e("Update Profile Failed: $errorMessage");
      throw Exception(errorMessage);
    }
  }
}
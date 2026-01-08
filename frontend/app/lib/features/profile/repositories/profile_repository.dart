import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/logger.dart';
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

      logger.d("Response Status: ${response.statusCode}");

      if (data is String) data = jsonDecode(data);
      if (data is List) data = data.isNotEmpty ? data.first : {};

      return StudentProfile.fromJson(data);
    } on DioException catch (e) {
      logger.e("DioError: ${e.message}", error: e, stackTrace: e.stackTrace);
      throw Exception(e.response?.data['message'] ?? 'Failed to load profile');
    } catch (e, stack) {
      logger.e("Repository Error: $e", error: e, stackTrace: stack);
      rethrow;
    }
  }

  Future<void> updateProfile(Map<String, dynamic> data) async {
    try {
      await _apiClient.patch('/api/user-details/profile', data: data);
      logger.i("Profile updated successfully");
    } catch (e) {
      logger.e("Update Profile Failed", error: e);
      rethrow;
    }
  }

  // --- CRUD Helpers ---

  Future<void> _createItem(String endpoint, Map<String, dynamic> data) async {
    try {
      await _apiClient.post(endpoint, data: data);
      logger.i("Created item at $endpoint");
    } catch (e) {
      logger.e("Create failed at $endpoint", error: e);
      rethrow;
    }
  }

  Future<void> _updateItem(
    String endpoint,
    String id,
    Map<String, dynamic> data,
  ) async {
    try {
      await _apiClient.patch('$endpoint/$id', data: data);
      logger.i("Updated item $id at $endpoint");
    } catch (e) {
      logger.e("Update failed at $endpoint/$id", error: e);
      rethrow;
    }
  }

  Future<void> _deleteItem(String endpoint, String id) async {
    try {
      await _apiClient.delete('$endpoint/$id');
      logger.i("Deleted item $id at $endpoint");
    } catch (e) {
      logger.e("Delete failed at $endpoint/$id", error: e);
      rethrow;
    }
  }

  // --- Experience ---
  Future<void> createExperience(Map<String, dynamic> data) =>
      _createItem('/api/user-details/experiences', data);
  Future<void> updateExperience(String id, Map<String, dynamic> data) =>
      _updateItem('/api/user-details/experiences', id, data);
  Future<void> deleteExperience(String id) =>
      _deleteItem('/api/user-details/experiences', id);

  // --- Education ---
  Future<void> createEducation(Map<String, dynamic> data) =>
      _createItem('/api/user-details/education', data);
  Future<void> updateEducation(String id, Map<String, dynamic> data) =>
      _updateItem('/api/user-details/education', id, data);
  Future<void> deleteEducation(String id) =>
      _deleteItem('/api/user-details/education', id);

  // --- Skills ---
  Future<void> createSkill(Map<String, dynamic> data) =>
      _createItem('/api/user-details/skills', data);
  Future<void> updateSkill(String id, Map<String, dynamic> data) =>
      _updateItem('/api/user-details/skills', id, data);
  Future<void> deleteSkill(String id) =>
      _deleteItem('/api/user-details/skills', id);

  // --- Projects ---
  Future<void> createProject(Map<String, dynamic> data) =>
      _createItem('/api/user-details/projects', data);
  Future<void> updateProject(String id, Map<String, dynamic> data) =>
      _updateItem('/api/user-details/projects', id, data);
  Future<void> deleteProject(String id) =>
      _deleteItem('/api/user-details/projects', id);

  // --- Certifications ---
  Future<void> createCertification(Map<String, dynamic> data) =>
      _createItem('/api/user-details/certifications', data);
  Future<void> updateCertification(String id, Map<String, dynamic> data) =>
      _updateItem('/api/user-details/certifications', id, data);
  Future<void> deleteCertification(String id) =>
      _deleteItem('/api/user-details/certifications', id);

  // --- Languages ---
  Future<void> createLanguage(Map<String, dynamic> data) =>
      _createItem('/api/user-details/languages', data);
  Future<void> updateLanguage(String id, Map<String, dynamic> data) =>
      _updateItem('/api/user-details/languages', id, data);
  Future<void> deleteLanguage(String id) =>
      _deleteItem('/api/user-details/languages', id);
}

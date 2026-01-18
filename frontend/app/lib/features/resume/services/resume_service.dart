import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/utils/logger.dart';
import '../models/resume_model.dart';

final resumeServiceProvider = Provider<ResumeService>((ref) {
  return ResumeService(ref.read(apiClientProvider));
});

class ResumeService {
  final ApiClient _api;

  ResumeService(this._api);

  /// Get all user data for resume preview
  Future<ResumePreviewData> getResumePreviewData() async {
    try {
      final response = await _api.get('/api/resume/preview');
      return ResumePreviewData.fromJson(response.data);
    } catch (e) {
      logger.e('Failed to fetch resume preview data', error: e);
      rethrow;
    }
  }

  /// Get available resume templates
  Future<List<TemplateInfo>> getTemplates() async {
    try {
      final response = await _api.get('/api/resume/templates');
      return (response.data as List)
          .map((e) => TemplateInfo.fromJson(e))
          .toList();
    } catch (e) {
      logger.e('Failed to fetch templates', error: e);
      rethrow;
    }
  }

  /// Get all saved resumes for the authenticated user
  Future<List<SavedResume>> getSavedResumes() async {
    try {
      final response = await _api.get('/api/resume/saved');

      final data = response.data;
      final List list = (data is Map && data.containsKey('data'))
          ? data['data']
          : data;

      return list.map((e) => SavedResume.fromJson(e)).toList();
    } catch (e) {
      logger.e('Failed to fetch saved resumes', error: e);
      rethrow;
    }
  }

  /// Get a specific saved resume by ID
  Future<SavedResume> getSavedResume(String id) async {
    try {
      final response = await _api.get('/api/resume/saved/$id');
      return SavedResume.fromJson(response.data);
    } catch (e) {
      logger.e('Failed to fetch saved resume $id', error: e);
      rethrow;
    }
  }

  /// Create a new saved resume
  Future<SavedResume> createSavedResume(CreateResumeRequest request) async {
    try {
      final response = await _api.post(
        '/api/resume/saved',
        data: request.toJson(),
      );
      return SavedResume.fromJson(response.data);
    } catch (e) {
      logger.e('Failed to create saved resume', error: e);
      rethrow;
    }
  }

  /// Update a saved resume
  Future<SavedResume> updateSavedResume(
    String id,
    UpdateResumeRequest request,
  ) async {
    try {
      final response = await _api.patch(
        '/api/resume/saved/$id',
        data: request.toJson(),
      );
      return SavedResume.fromJson(response.data);
    } catch (e) {
      logger.e('Failed to update saved resume $id', error: e);
      rethrow;
    }
  }

  /// Delete a saved resume
  Future<void> deleteSavedResume(String id) async {
    try {
      await _api.delete('/api/resume/saved/$id');
    } catch (e) {
      logger.e('Failed to delete saved resume $id', error: e);
      rethrow;
    }
  }

  /// Generate a PDF resume for the authenticated user
  /// Returns the PDF file as bytes
  Future<Uint8List> generateMyResume() async {
    try {
      final response = await _api.client.post(
        '/api/resume/generate',
        options: Options(
          responseType: ResponseType.bytes,
        ),
      );
      return Uint8List.fromList(response.data);
    } catch (e) {
      logger.e('Failed to generate resume PDF', error: e);
      rethrow;
    }
  }
}

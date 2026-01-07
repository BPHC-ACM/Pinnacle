import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import '../../../core/utils/logger.dart';
import '../models/student_profile_model.dart';
import '../repositories/profile_repository.dart';

final profileProvider = StateNotifierProvider<ProfileNotifier, AsyncValue<StudentProfile>>((ref) {
  return ProfileNotifier(ref.read(profileRepositoryProvider));
});

class ProfileNotifier extends StateNotifier<AsyncValue<StudentProfile>> {
  final ProfileRepository _repository;

  ProfileNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadProfile();
  }

  Future<void> loadProfile() async {
    try {
      final profile = await _repository.getProfile();
      state = AsyncValue.data(profile);
    } catch (e, stack) {
      logger.e("ProfileNotifier: Failed to load", error: e, stackTrace: stack);
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> updateBasicProfile(Map<String, dynamic> data) async {
    try {
      await _repository.updateProfile(data);
      await loadProfile(); // Refresh to ensure sync
    } catch (e) {
      logger.e("ProfileNotifier: Basic update failed", error: e);
      rethrow;
    }
  }

  // --- Generic Generic Wrapper for CRUD ---
  Future<void> _performAction(Future<void> Function() action) async {
    try {
      await action();
      await loadProfile();
    } catch (e) {
      logger.e("ProfileNotifier: Action failed", error: e);
      rethrow;
    }
  }

  // Experience
  Future<void> addExperience(Map<String, dynamic> data) => _performAction(() => _repository.createExperience(data));
  Future<void> editExperience(String id, Map<String, dynamic> data) => _performAction(() => _repository.updateExperience(id, data));
  Future<void> removeExperience(String id) => _performAction(() => _repository.deleteExperience(id));

  // Education
  Future<void> addEducation(Map<String, dynamic> data) => _performAction(() => _repository.createEducation(data));
  Future<void> editEducation(String id, Map<String, dynamic> data) => _performAction(() => _repository.updateEducation(id, data));
  Future<void> removeEducation(String id) => _performAction(() => _repository.deleteEducation(id));

  // Skills
  Future<void> addSkill(Map<String, dynamic> data) => _performAction(() => _repository.createSkill(data));
  Future<void> editSkill(String id, Map<String, dynamic> data) => _performAction(() => _repository.updateSkill(id, data));
  Future<void> removeSkill(String id) => _performAction(() => _repository.deleteSkill(id));

  // Projects
  Future<void> addProject(Map<String, dynamic> data) => _performAction(() => _repository.createProject(data));
  Future<void> editProject(String id, Map<String, dynamic> data) => _performAction(() => _repository.updateProject(id, data));
  Future<void> removeProject(String id) => _performAction(() => _repository.deleteProject(id));

  // Certifications
  Future<void> addCertification(Map<String, dynamic> data) => _performAction(() => _repository.createCertification(data));
  Future<void> editCertification(String id, Map<String, dynamic> data) => _performAction(() => _repository.updateCertification(id, data));
  Future<void> removeCertification(String id) => _performAction(() => _repository.deleteCertification(id));
  
  // Languages
  Future<void> addLanguage(Map<String, dynamic> data) => _performAction(() => _repository.createLanguage(data));
  Future<void> editLanguage(String id, Map<String, dynamic> data) => _performAction(() => _repository.updateLanguage(id, data));
  Future<void> removeLanguage(String id) => _performAction(() => _repository.deleteLanguage(id));
}
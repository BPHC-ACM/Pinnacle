import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import '../../../core/utils/logger.dart'; // Import logger
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
    logger.d("ProfileNotifier: Loading profile...");
    try {
      state = const AsyncValue.loading();
      final profile = await _repository.getProfile();
      logger.i("ProfileNotifier: Profile loaded for ${profile.email}");
      state = AsyncValue.data(profile);
    } catch (e, stack) {
      logger.e("ProfileNotifier: Failed to load profile", error: e, stackTrace: stack);
      state = AsyncValue.error(e, stack);
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
    if (!state.hasValue) return;
    final currentProfile = state.value!;

    logger.d("ProfileNotifier: Attempting to update profile...");

    try {
      // Optimistic update
      state = AsyncValue.data(currentProfile.copyWith(
        phone: phone,
        location: location,
        bio: bio,
        title: title,
        linkedin: linkedin,
        github: github,
        website: website,
      ));

      await _repository.updateProfile(
        phone: phone,
        location: location,
        bio: bio,
        title: title,
        linkedin: linkedin,
        github: github,
        website: website,
      );
      
      logger.i("ProfileNotifier: Profile update confirmed by server.");
    } catch (e) {
      logger.e("ProfileNotifier: Profile update failed. Reverting optimistic update.", error: e);
      // Revert state if needed, or rely on next fetch
      state = AsyncValue.data(currentProfile);
      rethrow;
    }
  }
}
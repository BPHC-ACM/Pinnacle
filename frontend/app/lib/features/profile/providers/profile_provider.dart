import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
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
      state = const AsyncValue.loading();
      final profile = await _repository.getProfile();
      state = AsyncValue.data(profile);
    } catch (e, stack) {
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
    // Current state check
    if (!state.hasValue) return;
    final currentProfile = state.value!;

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
    
    } catch (e) {
      state = AsyncValue.data(currentProfile);
      rethrow;
    }
  }
}
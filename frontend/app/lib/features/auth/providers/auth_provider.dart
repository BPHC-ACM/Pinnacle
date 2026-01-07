import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import '../../../core/storage/storage_service.dart';
import '../../../core/utils/logger.dart'; // Import logger
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';

class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final User? user;
  final String? error;

  AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    User? user,
    String? error,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  final StorageService _storage;

  AuthNotifier(this._repository, this._storage)
    : super(AuthState(isLoading: true)) {
    logger.d("AuthNotifier: Initialized");
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    logger.d("AuthNotifier: Checking auth status...");
    final token = await _storage.getToken();
    logger.d("AuthNotifier: Token present in storage? ${token != null}");

    if (token != null) {
      try {
        final user = await _repository.getMe();
        logger.i("AuthNotifier: User profile fetched: ${user.email}");
        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          user: user,
        );
      } catch (e) {
        logger.w("AuthNotifier: Token invalid or user fetch failed", error: e);
        await _storage.clearAll();
        state = state.copyWith(isLoading: false, isAuthenticated: false);
      }
    } else {
      state = state.copyWith(isLoading: false, isAuthenticated: false);
    }
  }

  Future<void> login() async {
    logger.i("AuthNotifier: Login requested.");
    try {
      state = state.copyWith(isLoading: true);

      await _repository.loginWithGoogle();

      logger.d("AuthNotifier: Login flow completed at Repo. Refreshing status...");
      await checkAuthStatus();
    } catch (e) {
      logger.e("AuthNotifier: Login Failed", error: e);
      state = state.copyWith(
        isLoading: false,
        error: "Login Failed",
      );
    }
  }

  Future<void> logout() async {
    logger.i("AuthNotifier: Logout requested.");
    state = state.copyWith(isLoading: true);
    await _repository.logout();
    state = state.copyWith(
      isLoading: false,
      isAuthenticated: false,
      user: null,
    );
  }
}

final authRepositoryProvider = Provider((ref) => AuthRepository());
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(authRepositoryProvider),
    StorageService(),
  );
});

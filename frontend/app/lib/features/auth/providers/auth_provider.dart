import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/storage/storage_service.dart';
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';

// State Class
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

// Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  final StorageService _storage;

  AuthNotifier(this._repository, this._storage) : super(AuthState(isLoading: true)) {
    checkAuthStatus();
  }

  // Check if user is already logged in on app start
  Future<void> checkAuthStatus() async {
    final token = await _storage.getToken();
    if (token != null) {
      try {
        final user = await _repository.getMe();
        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          user: user,
        );
      } catch (e) {
        // Token invalid or network error
        await _storage.clearAll();
        state = state.copyWith(isLoading: false, isAuthenticated: false);
      }
    } else {
      state = state.copyWith(isLoading: false, isAuthenticated: false);
    }
  }

  // Called when Deep Link returns with a token
  Future<void> handleLoginSuccess(String token) async {
    state = state.copyWith(isLoading: true);
    await _storage.saveToken(token);
    await checkAuthStatus();
  }

  Future<void> login() async {
    try {
      await _repository.loginWithGoogle();
      // Logic pauses here; app goes to background while Browser opens.
      // The Deep Link (Phase 3) will trigger handleLoginSuccess later.
    } catch (e) {
      state = state.copyWith(error: "Failed to initiate login");
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    await _repository.logout();
    state = state.copyWith(
      isLoading: false, 
      isAuthenticated: false, 
      user: null
    );
  }
}

// Global Providers
final authRepositoryProvider = Provider((ref) => AuthRepository());
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(authRepositoryProvider),
    StorageService(),
  );
});
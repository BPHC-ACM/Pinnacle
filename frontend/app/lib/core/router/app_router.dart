import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/providers/auth_provider.dart';
// Import screens (We will create placeholders for these next)
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/auth_callback_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/splash/splash_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: AuthStateListenable(ref.read(authProvider.notifier)),
    
    // Redirect Logic
    redirect: (context, state) {
      final isLoggingIn = state.uri.path == '/login';
      final isCallback = state.uri.path.startsWith('/auth/callback');
      final isSplash = state.uri.path == '/';

      // 1. If Loading, stay on Splash
      if (authState.isLoading) return '/';

      // 2. If Authenticated...
      if (authState.isAuthenticated) {
        // ...and trying to access login/splash, go to Dashboard
        if (isLoggingIn || isSplash || isCallback) return '/dashboard';
      } else {
        // 3. If NOT Authenticated...
        // ...allow access to Login or Callback (for deep linking)
        if (isSplash) return '/login'; // Redirect root to login
        if (!isLoggingIn && !isCallback) return '/login';
      }

      return null; // No redirect needed
    },

    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      // Deep Link Handler Route
      GoRoute(
        path: '/auth/callback',
        builder: (context, state) {
          // The backend redirects to: pinnacle://callback/auth/callback?access_token=...
          // GoRouter handles the scheme, we just need to match the path.
          // NOTE: Depending on how the backend constructs the URL, 
          // you might need to adjust the path or backend redirect.
          // Assuming backend redirects to: pinnacle://callback/auth/callback?...
          return AuthCallbackScreen(queryParams: state.uri.queryParameters);
        },
      ),
    ],
  );
});

// Helper to convert Riverpod StateNotifier to Listenable for GoRouter
class AuthStateListenable extends ChangeNotifier {
  final AuthNotifier _notifier;
  
  AuthStateListenable(this._notifier) {
    _notifier.addListener((state) {
      notifyListeners();
    });
  }
}
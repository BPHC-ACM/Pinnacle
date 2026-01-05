import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/auth_callback_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/jobs/models/job_model.dart';
import '../../features/jobs/screens/job_details_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/splash/splash_screen.dart';

import '../../features/jobs/screens/jobs_screen.dart';
import '../components/main_nav_scaffold.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  final rootNavigatorKey = GlobalKey<NavigatorState>();
  // final shellNavigatorKey = GlobalKey<NavigatorState>();

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/',
    refreshListenable: AuthStateListenable(ref.read(authProvider.notifier)),

    // Redirect Logic
    redirect: (context, state) {
      final isLoggingIn = state.uri.path == '/login';
      final isCallback = state.uri.path.startsWith('/auth/callback');
      final isSplash = state.uri.path == '/';

      if (authState.isLoading) return '/';

      if (authState.isAuthenticated) {
        // If authenticated and trying to access guest routes, go to dashboard
        if (isLoggingIn || isSplash || isCallback) return '/dashboard';
      } else {
        // If NOT authenticated, block access to protected routes
        if (isSplash) return '/login';
        if (!isLoggingIn && !isCallback) return '/login';
      }

      return null;
    },

    routes: [
      GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/auth/callback',
        builder: (context, state) {
          return AuthCallbackScreen(queryParams: state.uri.queryParameters);
        },
      ),

      // Shell Route for Bottom Navigation
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainNavScaffold(navigationShell: navigationShell);
        },
        branches: [
          // Branch 1: Dashboard
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/dashboard',
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),

          // Branch 2: Jobs (FIXED: Added details route here)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/jobs',
                builder: (context, state) => const JobsScreen(),
                routes: [
                  // Job Details belongs under the Jobs tab history
                  GoRoute(
                    path: ':id',
                    builder: (context, state) {
                      final job = state.extra as JobModel?;
                      final id = state.pathParameters['id']!;
                      return JobDetailsScreen(jobId: id, initialJobData: job);
                    },
                  ),
                ],
              ),
            ],
          ),

          // Branch 3: Profile (FIXED: Points to ProfileScreen)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});

class AuthStateListenable extends ChangeNotifier {
  final AuthNotifier _notifier;

  AuthStateListenable(this._notifier) {
    _notifier.addListener((state) {
      notifyListeners();
    });
  }
}

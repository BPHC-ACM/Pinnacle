import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/onboarding_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/jobs/models/job_model.dart';
import '../../features/jobs/screens/job_details_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/resume/screens/resume_builder_screen.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/jobs/screens/jobs_screen.dart';
import '../components/main_nav_scaffold.dart';
import '../utils/logger.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  final rootNavigatorKey = GlobalKey<NavigatorState>();

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/',
    refreshListenable: AuthStateListenable(ref.read(authProvider.notifier)),

    redirect: (context, state) {
      final isLoggingIn = state.uri.path == '/login';
      final isSplash = state.uri.path == '/';
      final isOnboarding = state.uri.path == '/onboarding';

      logger.t(
        "Router: Check -> Path: ${state.uri.path}, "
        "Auth: ${authState.isAuthenticated}, "
        "Onboarded: ${authState.user?.hasOnboarded}, "
        "Loading: ${authState.isLoading}",
      );

      if (authState.isLoading) {
        if (isLoggingIn) return null;
        return '/';
      }

      if (authState.isAuthenticated) {
        final hasOnboarded = authState.user?.hasOnboarded ?? false;

        if (!hasOnboarded) {
          if (!isOnboarding) {
            logger.i(
              "Router: User pending onboarding. Redirecting to /onboarding",
            );
            return '/onboarding';
          }
          return null;
        }

        if (isLoggingIn || isSplash || isOnboarding) {
          logger.i("Router: User fully authorized. Redirecting to /dashboard");
          return '/dashboard';
        }
      } else {
        if (isSplash) {
          return '/login';
        }
        if (!isLoggingIn) {
          logger.i("Router: User unauthenticated. Redirecting to /login");
          return '/login';
        }
      }

      return null;
    },

    routes: [
      GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),

      GoRoute(
        path: '/resume/builder',
        builder: (context, state) => const ResumeBuilderScreen(),
      ),

      StatefulShellRoute(
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/dashboard',
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/jobs',
                builder: (context, state) => const JobsScreen(),
                routes: [
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
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
        navigatorContainerBuilder: (context, navigationShell, children) {
          return MainNavScaffold(
            navigationShell: navigationShell,
            currentPath: GoRouterState.of(context).uri.path,
            children: children,
          );
        },
        builder: (context, state, shell) => shell,
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

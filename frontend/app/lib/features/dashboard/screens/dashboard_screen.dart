import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/components/pinnacle_header_banner_gradient.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/dashboard_stats_model.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/profile_completion_card.dart';
import '../widgets/quick_actions_bar.dart';
import '../widgets/stats_overview_grid.dart';
import '../widgets/dashboard_header.dart'; // Import the new header

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  late ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _onRefresh() async {
    await ref.read(dashboardControllerProvider.notifier).refreshDashboard();
  }

  void _navigateTo(String route) {
    context.go(route);
  }

  void _pushTo(String route) {
    context.push(route);
  }

  bool _isDashboardEmpty(DashboardStatsModel stats) {
    return stats.experiences == 0 &&
        stats.education == 0 &&
        stats.projects == 0 &&
        stats.skills == 0 &&
        stats.certifications == 0;
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final statsAsync = ref.watch(dashboardStatsProvider);
    final completionAsync = ref.watch(profileCompletionProvider);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          AnimatedBuilder(
            animation: _scrollController,
            builder: (context, child) {
              double offset = 0;
              if (_scrollController.hasClients) {
                offset = _scrollController.offset;
              }
              final opacity = (1.0 - (offset / 150.0)).clamp(0.0, 1.0);
              return Opacity(opacity: opacity, child: child);
            },
            child: Stack(
              children: [
                const PinnacleHeaderBannerGradient(height: 280),
                Positioned(
                  top: 60,
                  left: 0,
                  right: 0,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Text(
                        "Dashboard",
                        style: GoogleFonts.inter(
                          fontSize: 26,
                          height: 1.1,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // 2. Scrollable Content
          RefreshIndicator(
            onRefresh: _onRefresh,
            edgeOffset: 100,
            color: theme.colorScheme.primary,
            child: CustomScrollView(
              controller: _scrollController,
              physics: const BouncingScrollPhysics(),
              slivers: [
                // Transparent App Bar with Title/Logout
                SliverAppBar(
                  expandedHeight: 80.0,
                  backgroundColor: Colors.transparent,
                  surfaceTintColor: Colors.transparent,
                  pinned: true,
                  elevation: 0,
                  centerTitle: true,
                  // title: Text(
                  //   "Dashboard",
                  //   style: GoogleFonts.inter(
                  //     fontWeight: FontWeight.w600,
                  //     color: Colors.white,
                  //   ),
                  // ),
                  actions: [
                    IconButton(
                      onPressed: () => ref.read(authProvider.notifier).logout(),
                      tooltip: "Logout",
                      icon: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: .2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          LucideIcons.logOut,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                  ],
                ),

                // Content List
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      const SizedBox(height: 10),

                      // 1. Floating Welcome Card (Overlaps Banner)
                      DashboardHeader(user: user),

                      // 2. Quick Actions
                      QuickActionsBar(
                        onBuildResume: () => _pushTo('/resume/builder'),
                        onViewJobs: () => _navigateTo('/jobs'),
                        onAddProject: () => _navigateTo('/profile'),
                      ),
                      const SizedBox(height: 24),

                      // 3. Profile Completion
                      completionAsync.when(
                        data: (data) => ProfileCompletionCard(
                          data: data,
                          onCompleteProfile: () => _navigateTo('/profile'),
                        ),
                        loading: () => const _DashboardSkeleton(isGrid: false),
                        error: (_, _) => const SizedBox.shrink(),
                      ),
                      const SizedBox(height: 24),

                      // 4. Stats Overview
                      Padding(
                        padding: const EdgeInsets.only(left: 4),
                        child: Text(
                          "Your Progress",
                          style: GoogleFonts.inter(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                      ),

                      statsAsync.when(
                        data: (stats) {
                          if (_isDashboardEmpty(stats)) {
                            return _EmptyDashboardState(
                              onStart: () => _navigateTo('/profile'),
                            );
                          }
                          return StatsOverviewGrid(
                            stats: stats,
                            onCardTap: (_) => _navigateTo('/profile'),
                          );
                        },
                        loading: () => const _DashboardSkeleton(isGrid: true),
                        error: (err, stack) => _ErrorState(
                          message: "Failed to load stats",
                          onRetry: () => ref.invalidate(dashboardStatsProvider),
                        ),
                      ),

                      const SizedBox(height: 120),
                    ]),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyDashboardState extends StatelessWidget {
  final VoidCallback onStart;

  const _EmptyDashboardState({required this.onStart});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(24),
      width: double.infinity,
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainer,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(
            LucideIcons.rocket,
            size: 48,
            color: theme.colorScheme.primary,
          ),
          const SizedBox(height: 16),
          Text(
            "Let's get started!",
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "Your profile is empty. Add your education, projects, and skills to stand out.",
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: onStart,
            child: const Text("Build My Profile"),
          ),
        ],
      ),
    );
  }
}

class _DashboardSkeleton extends StatelessWidget {
  final bool isGrid;
  const _DashboardSkeleton({required this.isGrid});

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(
      context,
    ).colorScheme.surfaceContainerHighest.withValues(alpha: .4);

    if (isGrid) {
      return GridView.builder(
        physics: const NeverScrollableScrollPhysics(),
        shrinkWrap: true,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.5,
        ),
        itemCount: 4,
        itemBuilder: (ctx, i) => Container(
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      );
    }
    return Container(
      height: 150,
      width: double.infinity,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(
          context,
        ).colorScheme.errorContainer.withValues(alpha: .2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(
            LucideIcons.circleAlert,
            color: Theme.of(context).colorScheme.error,
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(message)),
          IconButton(
            onPressed: onRetry,
            icon: const Icon(LucideIcons.refreshCw),
          ),
        ],
      ),
    );
  }
}

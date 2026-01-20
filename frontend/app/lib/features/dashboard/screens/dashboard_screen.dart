import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../auth/providers/auth_provider.dart';
import '../../../core/components/pinnacle_header_banner.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/profile_completion_card.dart';
import '../widgets/quick_actions_bar.dart';
import '../widgets/stats_overview_grid.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  Future<void> _onRefresh() async {
    await ref.read(dashboardControllerProvider.notifier).refreshDashboard();
  }

  void _navigateTo(String route) {
    context.go(route);
  }

  void _pushTo(String route) {
    context.push(route);
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final statsAsync = ref.watch(dashboardStatsProvider);
    final completionAsync = ref.watch(profileCompletionProvider);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        edgeOffset: 120, // Push refresh indicator down
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            _buildSliverAppBar(context, user?.name ?? "Student", user?.email),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: 10),

                  // 1. Quick Actions
                  QuickActionsBar(
                    onBuildResume: () => _pushTo('/resume/builder'),
                    onViewJobs: () => _navigateTo('/jobs'),
                    onAddProject: () => _navigateTo('/profile'),
                  ),
                  const SizedBox(height: 32),

                  // 2. Profile Completion
                  completionAsync.when(
                    data: (data) => ProfileCompletionCard(
                      data: data,
                      onCompleteProfile: () => _navigateTo('/profile'),
                    ),
                    loading: () => const SizedBox(height: 100),
                    error: (_, _) => const SizedBox.shrink(),
                  ),
                  const SizedBox(height: 32),

                  // 3. Stats Overview (Subtle)
                  Text(
                    "Your Progress",
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 16),
                  statsAsync.when(
                    data: (stats) => StatsOverviewGrid(
                      stats: stats,
                      onCardTap: (_) => _navigateTo('/profile'),
                    ),
                    loading: () => const _DashboardSkeleton(),
                    error: (err, stack) => Center(
                      child: TextButton.icon(
                        onPressed: () => ref.invalidate(dashboardStatsProvider),
                        icon: const Icon(Icons.refresh),
                        label: const Text("Retry loading stats"),
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSliverAppBar(
    BuildContext context,
    String userName,
    String? email,
  ) {
    final theme = Theme.of(context);
    return SliverAppBar(
      expandedHeight: 220.0,
      pinned: true,
      floating: true,
      backgroundColor: theme.scaffoldBackgroundColor,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        collapseMode: CollapseMode.parallax,
        background: Stack(
          fit: StackFit.expand,
          children: [
            // Background Pattern
            const PinnacleHeaderBanner(height: 280),

            // Fade Gradient
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.transparent,
                      theme.scaffoldBackgroundColor,
                    ],
                    stops: const [0, 1],
                    begin: AlignmentDirectional.topCenter,
                    end: AlignmentDirectional.bottomCenter,
                  ),
                ),
              ),
            ),

            // Content
            Positioned(
              top: 80,
              left: 20,
              right: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Welcome back,",
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      color: Colors.white.withValues(alpha: 0.9),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    userName,
                    style: GoogleFonts.inter(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      height: 1.1,
                    ),
                  ),
                  if (email != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      email,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: Colors.white.withValues(alpha: 0.7),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
      actions: [
        IconButton(
          onPressed: () => ref.read(authProvider.notifier).logout(),
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.2),
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
    );
  }
}

class _DashboardSkeleton extends StatelessWidget {
  const _DashboardSkeleton();

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.8,
      ),
      itemCount: 4,
      itemBuilder: (ctx, i) => Container(
        decoration: BoxDecoration(
          color: Theme.of(
            context,
          ).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../providers/jobs_provider.dart';
import '../components/job_card.dart';
import '../../../core/theme/app_colors.dart';

class JobsScreen extends ConsumerStatefulWidget {
  const JobsScreen({super.key});

  @override
  ConsumerState<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends ConsumerState<JobsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = "";

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final jobsState = ref.watch(jobsProvider);
    final notifier = ref.read(jobsProvider.notifier);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverAppBar(
              expandedHeight: 180.0,
              pinned: true,
              floating: true,
              backgroundColor: theme.scaffoldBackgroundColor,
              surfaceTintColor: Colors.transparent,
              elevation: 0,
              forceElevated: innerBoxIsScrolled,
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  color: theme.scaffoldBackgroundColor,
                  padding: const EdgeInsets.fromLTRB(20, 60, 20, 0),
                  alignment: Alignment.topLeft,
                  child: Text(
                    "Find your dream job",
                    style: GoogleFonts.inter(fontSize: 22, height: 1.1),
                  ),
                ),
              ),
              bottom: PreferredSize(
                preferredSize: const Size.fromHeight(110),
                child: Container(
                  color: theme.scaffoldBackgroundColor,
                  child: Column(
                    children: [
                      // Search Bar
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 8,
                        ),
                        child: Container(
                          decoration: BoxDecoration(
                            color: theme.cardTheme.color,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: theme.colorScheme.outline,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.03),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: TextField(
                            controller: _searchController,
                            style: GoogleFonts.inter(fontSize: 14),
                            decoration: InputDecoration(
                              hintText: "Search role, company, or location...",
                              hintStyle: GoogleFonts.inter(
                                color: AppColors.neutral400,
                              ),
                              prefixIcon: Icon(
                                LucideIcons.search,
                                size: 20,
                                color: AppColors.neutral400,
                              ),
                              border: InputBorder.none,
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 14,
                              ),
                              suffixIcon: _searchQuery.isNotEmpty
                                  ? IconButton(
                                      icon: const Icon(Icons.clear, size: 20),
                                      onPressed: () {
                                        _searchController.clear();
                                        FocusScope.of(context).unfocus();
                                      },
                                    )
                                  : null,
                            ),
                          ),
                        ),
                      ),
                      // Tab Bar
                      TabBar(
                        controller: _tabController,
                        labelColor: AppColors.primary500,
                        unselectedLabelColor: AppColors.neutral500,
                        indicatorColor: AppColors.primary500,
                        indicatorSize: TabBarIndicatorSize.label,
                        indicatorWeight: 3,
                        dividerColor: theme.colorScheme.outline.withOpacity(
                          0.5,
                        ),
                        labelStyle: GoogleFonts.inter(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                        unselectedLabelStyle: GoogleFonts.inter(
                          fontWeight: FontWeight.w500,
                          fontSize: 14,
                        ),
                        tabs: const [
                          Tab(text: "All Jobs"),
                          Tab(text: "Applied Jobs"),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ];
        },
        body: jobsState.isLoading
            ? _buildSkeletonList() // Use Skeleton List instead of spinner
            : jobsState.error != null
            ? _buildErrorState(jobsState.error!, theme, notifier)
            : TabBarView(
                controller: _tabController,
                children: [
                  // All Jobs Tab
                  _buildJobList(jobsState, notifier, showAll: true),
                  // Applied Jobs Tab
                  _buildJobList(jobsState, notifier, showAll: false),
                ],
              ),
      ),
    );
  }

  Widget _buildSkeletonList() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      itemCount: 5, // Show 5 skeleton items
      separatorBuilder: (context, index) => const SizedBox(height: 16),
      itemBuilder: (context, index) => const _JobCardSkeleton(),
    );
  }

  Widget _buildErrorState(
    String error,
    ThemeData theme,
    JobsNotifier notifier,
  ) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.warning_amber_rounded,
                size: 32,
                color: AppColors.error,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              "Something went wrong",
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w600,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(color: AppColors.neutral500),
            ),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: () => notifier.refresh(),
              icon: const Icon(Icons.refresh),
              label: const Text("Try Again"),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildJobList(
    JobsState state,
    JobsNotifier notifier, {
    required bool showAll,
  }) {
    // Filter jobs based on tab AND search query
    final filteredJobs = state.jobs.where((job) {
      // 1. Tab Filter
      final status = notifier.getApplicationStatus(job.id);
      final matchesTab = showAll ? true : status != 'Yet to apply';

      // 2. Search Filter
      // Use null-aware operators to safely access properties
      final companyName = job.company.name.toLowerCase();
      final title = job.title.toLowerCase();
      final location = job.location?.toLowerCase() ?? '';

      final matchesSearch =
          _searchQuery.isEmpty ||
          title.contains(_searchQuery) ||
          companyName.contains(_searchQuery) ||
          location.contains(_searchQuery);

      return matchesTab && matchesSearch;
    }).toList();

    // WRAP EVERYTHING IN REFRESH INDICATOR
    return RefreshIndicator(
      onRefresh: () async {
        // This triggers a full refresh of jobs and applications
        await notifier.refresh();
      },
      color: AppColors.primary500,
      backgroundColor: Colors.white,
      child: filteredJobs.isEmpty
          ? _buildEmptyState(showAll)
          : ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              itemCount: filteredJobs.length,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final job = filteredJobs[index];
                final status = notifier.getApplicationStatus(job.id);

                return JobCard(
                  job: job,
                  applicationStatus: status,
                  onTap: () {
                    context.push('/jobs/${job.id}', extra: job);
                  },
                );
              },
            ),
    );
  }

  Widget _buildEmptyState(bool showAll) {
    // LayoutBuilder ensures the ScrollView takes up at least the full height
    // enabling the pull-to-refresh gesture even on empty screens.
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppColors.neutral100,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      showAll ? LucideIcons.briefcase : LucideIcons.fileCheck,
                      size: 48,
                      color: AppColors.neutral300,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    _searchQuery.isNotEmpty
                        ? "No jobs found for \"$_searchQuery\""
                        : showAll
                        ? "No jobs available right now"
                        : "You haven't applied to any jobs yet",
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: AppColors.neutral600,
                    ),
                  ),
                  const SizedBox(height: 48),
                  if (!showAll && _searchQuery.isEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: TextButton(
                        onPressed: () => _tabController.animateTo(0),
                        child: const Text("Browse all jobs"),
                      ),
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _JobCardSkeleton extends StatelessWidget {
  const _JobCardSkeleton();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // Base skeleton colors (work in light & dark)
    final baseColor = colorScheme.surfaceVariant;
    final highlightColor = colorScheme.surface.withOpacity(0.6);
    final borderColor = colorScheme.outline.withOpacity(0.4);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SkeletonBox(width: 48, height: 48, color: baseColor, radius: 8),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _SkeletonBox(width: 150, height: 16, color: highlightColor),
                    const SizedBox(height: 8),
                    _SkeletonBox(width: 100, height: 12, color: baseColor),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _SkeletonBox(width: 80, height: 12, color: baseColor),
        ],
      ),
    );
  }
}

class _SkeletonBox extends StatelessWidget {
  final double width;
  final double height;
  final Color color;
  final double radius;

  const _SkeletonBox({
    required this.width,
    required this.height,
    required this.color,
    this.radius = 4,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}

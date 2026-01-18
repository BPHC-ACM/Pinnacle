import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../providers/jobs_provider.dart';
import '../components/job_card.dart';
import '../models/job_filter_model.dart';
import '../widgets/jobs_filter_dialog.dart';
import '../widgets/jobs_skeleton.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/components/pinnacle_header_banner.dart';

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
  JobFilterModel _filters = const JobFilterModel();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _searchController.addListener(() {
      setState(() => _searchQuery = _searchController.text.toLowerCase());
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _openFilterDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => JobsFilterDialog(
        currentFilters: _filters,
        onApply: (newFilters) => setState(() => _filters = newFilters),
        onClear: () => setState(() => _filters = const JobFilterModel()),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final jobsState = ref.watch(jobsProvider);
    final notifier = ref.read(jobsProvider.notifier);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          _buildSliverAppBar(theme, innerBoxIsScrolled),
        ],
        body: Container(
          color: theme.scaffoldBackgroundColor,
          child: jobsState.isLoading
              ? const JobsSkeletonList()
              : jobsState.error != null
              ? _buildErrorState(jobsState.error!, theme, notifier)
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildJobList(jobsState, notifier, showAll: true),
                    _buildJobList(jobsState, notifier, showAll: false),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildSliverAppBar(ThemeData theme, bool innerBoxIsScrolled) {
    return SliverAppBar(
      expandedHeight: 225.0,
      pinned: true,
      floating: true,
      backgroundColor: theme.scaffoldBackgroundColor,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      forceElevated: innerBoxIsScrolled,
      flexibleSpace: FlexibleSpaceBar(
        collapseMode: CollapseMode.parallax,
        background: Stack(
          fit: StackFit.expand,
          children: [
            Stack(
              children: [
                const PinnacleHeaderBanner(height: 280),
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
              ],
            ),

            Positioned(
              top: 60,
              left: 0,
              right: 0,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Text(
                    "Find your dream job",
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
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(130),
        child: Container(
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
          child: Column(
            children: [
              _buildSearchBar(theme),
              const SizedBox(height: 12),
              _buildTabBar(theme),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchBar(ThemeData theme) {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 48,
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: theme.colorScheme.outline.withValues(alpha: 0.5),
              ),
            ),
            child: TextField(
              controller: _searchController,
              style: GoogleFonts.inter(fontSize: 14),
              decoration: InputDecoration(
                hintText: "Search role, company...",
                hintStyle: GoogleFonts.inter(color: AppColors.neutral400),
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
        const SizedBox(width: 12),
        Container(
          height: 48,
          width: 48,
          decoration: BoxDecoration(
            color: AppColors.primary500,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary500.withValues(alpha: 0.25),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: IconButton(
            onPressed: _openFilterDialog,
            icon: const Icon(
              LucideIcons.slidersHorizontal,
              color: Colors.white,
              size: 20,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTabBar(ThemeData theme) {
    return TabBar(
      controller: _tabController,
      labelColor: AppColors.primary500,
      unselectedLabelColor: AppColors.neutral500,
      indicatorColor: AppColors.primary500,
      indicatorSize: TabBarIndicatorSize.label,
      indicatorWeight: 3,
      dividerColor: theme.colorScheme.outline.withValues(alpha: 0.5),
      labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 14),
      unselectedLabelStyle: GoogleFonts.inter(
        fontWeight: FontWeight.w500,
        fontSize: 14,
      ),
      tabs: const [
        Tab(text: "All Jobs"),
        Tab(text: "Applied Jobs"),
      ],
    );
  }

  Widget _buildJobList(
    JobsState state,
    JobsNotifier notifier, {
    required bool showAll,
  }) {
    final filteredJobs = state.jobs.where((job) {
      final appStatus = notifier.getApplicationStatus(job.id);

      if (!showAll && appStatus == 'Yet to apply') return false;

      final matchesSearch =
          _searchQuery.isEmpty ||
          job.title.toLowerCase().contains(_searchQuery) ||
          job.company.name.toLowerCase().contains(_searchQuery) ||
          (job.location ?? '').toLowerCase().contains(_searchQuery);

      if (!matchesSearch) return false;

      if (_filters.positionType != 'All') {
        if (job.type != null &&
            !job.type!.toLowerCase().contains(
              _filters.positionType.toLowerCase(),
            )) {
          return false;
        }
        if (job.type == null) return false;
      }

      if (_filters.applicationStatus != 'All') {
        if (appStatus != _filters.applicationStatus) return false;
      }

      return true;
    }).toList();

    filteredJobs.sort((a, b) {
      switch (_filters.sortBy) {
        case 'Oldest':
          return a.createdAt.compareTo(b.createdAt);
        case 'Deadline':
          if (a.deadline == null) return 1;
          if (b.deadline == null) return -1;
          return a.deadline!.compareTo(b.deadline!);
        case 'Newest':
        default:
          return b.createdAt.compareTo(a.createdAt);
      }
    });

    return RefreshIndicator(
      onRefresh: () async => await notifier.refresh(),
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
                return JobCard(
                  job: job,
                  applicationStatus: notifier.getApplicationStatus(job.id),
                  onTap: () => context.push('/jobs/${job.id}', extra: job),
                );
              },
            ),
    );
  }

  Widget _buildEmptyState(bool showAll) {
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
                        ? "No jobs match your search"
                        : "No jobs found",
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: AppColors.neutral600,
                    ),
                  ),
                  if (_filters.positionType != 'All' ||
                      _filters.applicationStatus != 'All')
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        "Try adjusting your filters",
                        style: GoogleFonts.inter(
                          color: AppColors.neutral400,
                          fontSize: 14,
                        ),
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
                color: AppColors.error.withValues(alpha: 0.1),
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
}

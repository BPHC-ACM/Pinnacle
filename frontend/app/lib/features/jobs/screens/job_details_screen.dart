import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'dart:ui'; // For BackdropFilter

import '../models/job_model.dart';
import '../providers/jobs_provider.dart';
import '../../../core/components/pinnacle_button.dart';
import '../../../core/theme/app_colors.dart';

class JobDetailsScreen extends ConsumerStatefulWidget {
  final String jobId;
  final JobModel? initialJobData;

  const JobDetailsScreen({super.key, required this.jobId, this.initialJobData});

  @override
  ConsumerState<JobDetailsScreen> createState() => _JobDetailsScreenState();
}

class _JobDetailsScreenState extends ConsumerState<JobDetailsScreen> {
  bool _isApplying = false;

  // String _formatDate(DateTime? date) {
  //   if (date == null) return 'Open indefinitely';
  //   return DateFormat('MMMM d, yyyy').format(date);
  // }

  String _getDaysRemaining(DateTime? deadline) {
    if (deadline == null) return 'No deadline';
    final now = DateTime.now();
    final diff = deadline.difference(now).inDays;

    if (diff < 0) return 'Closed';
    if (diff == 0) return 'Closes today';
    if (diff == 1) return 'Closes tomorrow';
    return '$diff days left';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    // Find job in provider state or use initial data
    final job = ref
        .watch(jobsProvider)
        .jobs
        .firstWhere(
          (element) => element.id == widget.jobId,
          orElse: () =>
              widget.initialJobData ??
              JobModel(
                id: '',
                companyId: '',
                title: 'Loading...',
                company: Company(id: '', name: 'Loading...'),
                createdAt: DateTime.now(),
                status: 'CLOSED',
              ),
        );

    final notifier = ref.read(jobsProvider.notifier);
    final status = notifier.getApplicationStatus(widget.jobId);
    final isApplied = status != 'Yet to apply';

    if (job.id.isEmpty) {
      return Scaffold(
        backgroundColor: theme.scaffoldBackgroundColor,
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
        body: Center(
          child: CircularProgressIndicator(color: colorScheme.primary),
        ),
      );
    }

    // Data prep
    final companyName = job.company.name.isNotEmpty
        ? job.company.name
        : 'Unknown Company';
    final companyInitial = companyName.isNotEmpty
        ? companyName[0].toUpperCase()
        : '?';
    final jobLocation = job.location ?? 'Remote';
    final jobType = job.type ?? 'Full-time';
    final jobDescription =
        job.description ?? 'No description provided for this role.';
    final jobSalary = job.salary;
    final isClosed = _getDaysRemaining(job.deadline) == 'Closed';

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      extendBody: true, // Allows content to flow behind bottom bar
      appBar: AppBar(
        backgroundColor: theme.scaffoldBackgroundColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft, color: colorScheme.onSurface),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          "Job Details",
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: colorScheme.onSurface,
          ),
        ),
      ),
      body: Stack(
        children: [
          // Scrollable Content
          Positioned.fill(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(
                24,
                12,
                24,
                120,
              ), // Bottom padding for fixed bar
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // 1. Header Section
                  const SizedBox(height: 12),
                  Container(
                    width: 88,
                    height: 88,
                    decoration: BoxDecoration(
                      color: colorScheme.surface,
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(
                        color: colorScheme.outline.withOpacity(0.5),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      companyInitial,
                      style: textTheme.displaySmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: colorScheme.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  Text(
                    job.title,
                    textAlign: TextAlign.center,
                    style: textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: colorScheme.onSurface,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    companyName,
                    style: textTheme.bodyLarge?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                      fontWeight: FontWeight.w500,
                    ),
                  ),

                  const SizedBox(height: 24),

                  // 2. Metadata Pills (Modern Look)
                  Wrap(
                    spacing: 8,
                    runSpacing: 10,
                    alignment: WrapAlignment.center,
                    children: [
                      _buildModernChip(
                        context,
                        LucideIcons.mapPin,
                        jobLocation,
                      ),
                      _buildModernChip(context, LucideIcons.briefcase, jobType),
                      if (jobSalary != null)
                        _buildModernChip(
                          context,
                          LucideIcons.banknote,
                          jobSalary,
                        ),
                      _buildModernChip(
                        context,
                        LucideIcons.clock,
                        _getDaysRemaining(job.deadline),
                      ),
                    ],
                  ),

                  const SizedBox(height: 32),
                  Divider(color: colorScheme.outlineVariant),
                  const SizedBox(height: 32),

                  // 3. Description
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      "About the Role",
                      style: textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: colorScheme.onSurface,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      jobDescription,
                      style: textTheme.bodyLarge?.copyWith(
                        height: 1.6,
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 4. Fixed Bottom Action Bar with Blur
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: ClipRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  padding: EdgeInsets.fromLTRB(
                    24,
                    20,
                    24,
                    20 + MediaQuery.paddingOf(context).bottom,
                  ),
                  decoration: BoxDecoration(
                    color: theme.scaffoldBackgroundColor.withOpacity(0.8),
                    border: Border(
                      top: BorderSide(
                        color: colorScheme.outline.withOpacity(0.5),
                      ),
                    ),
                  ),
                  child: SafeArea(
                    top: false,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (isClosed && !isApplied)
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: colorScheme.surface,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: colorScheme.outline),
                            ),
                            child: Text(
                              "Applications Closed",
                              textAlign: TextAlign.center,
                              style: textTheme.labelLarge?.copyWith(
                                color: colorScheme.onSurfaceVariant,
                              ),
                            ),
                          )
                        else
                          SizedBox(
                            width: double.infinity,
                            // PinnacleButton has fixed height 40, we wrap to ensure width stretch
                            child: PinnacleButton(
                              label: isApplied
                                  ? "Application $status"
                                  : "Apply Now",
                              onPressed: isApplied
                                  ? null
                                  : () => _handleApply(context, notifier),
                              variant: isApplied
                                  ? ButtonVariant.outline
                                  : ButtonVariant.primary,
                              isLoading: _isApplying,
                              icon: Icon(
                                isApplied
                                    ? LucideIcons.squareCheck
                                    : LucideIcons.send,
                                size: 18,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModernChip(BuildContext context, IconData icon, String label) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: colorScheme.outline.withOpacity(0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: colorScheme.onSurfaceVariant),
          const SizedBox(width: 8),
          Text(
            label,
            style: theme.textTheme.labelMedium?.copyWith(
              color: colorScheme.onSurface,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleApply(BuildContext context, JobsNotifier notifier) async {
    setState(() => _isApplying = true);
    try {
      await notifier.apply(widget.jobId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(LucideIcons.squareCheck, color: Colors.white, size: 20),
                SizedBox(width: 12),
                Text('Application submitted!'),
              ],
            ),
            backgroundColor: AppColors.success, // Semantic color
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isApplying = false);
    }
  }
}

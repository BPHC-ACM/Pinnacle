import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'dart:ui';

import '../models/job_model.dart';
import '../providers/jobs_provider.dart';
import '../../../core/components/pinnacle_button.dart';
import '../../../core/components/pinnacle_header_banner.dart';
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
    final isClosed = _getDaysRemaining(job.deadline) == 'Closed';

    if (job.id.isEmpty) {
      return Scaffold(
        backgroundColor: theme.scaffoldBackgroundColor,
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
        body: Center(
          child: CircularProgressIndicator(color: theme.colorScheme.primary),
        ),
      );
    }

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          // 1. Animated Header Banner with Scroll Fade
          AnimatedBuilder(
            animation: _scrollController,
            builder: (context, child) {
              // Calculate opacity: 1.0 at top, 0.0 after scrolling 150px
              double offset = 0;
              if (_scrollController.hasClients) {
                offset = _scrollController.offset;
              }
              final opacity = (1.0 - (offset / 150.0)).clamp(0.0, 1.0);

              return Opacity(
                opacity: opacity,
                child: child,
              );
            },
            child: Stack(
              children: [
                const PinnacleHeaderBanner(height: 280),
                // Gradient Overlay: Placed ON TOP to blend bottom edge into background
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.transparent,
                          Colors.transparent,
                          theme.scaffoldBackgroundColor,
                        ],
                        stops: const [0, .6, 1],
                        begin: AlignmentDirectional.topCenter,
                        end: AlignmentDirectional.bottomCenter,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 2. Scrollable Content with Slivers
          CustomScrollView(
            controller: _scrollController,
            physics: const BouncingScrollPhysics(),
            slivers: [
              SliverAppBar(
                backgroundColor: Colors.transparent,
                surfaceTintColor: Colors.transparent,
                pinned: true,
                elevation: 0,
                centerTitle: true,
                leading: IconButton(
                  icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
                title: Text(
                  "Job Details",
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    const SizedBox(height: 20),

                    // Floating Header Card
                    _buildFloatingHeader(context, job),

                    const SizedBox(height: 24),

                    // Description Content
                    _buildDescriptionCard(context, job),

                    const SizedBox(height: 120), // Padding for Bottom Bar
                  ]),
                ),
              ),
            ],
          ),

          // 3. Fixed Bottom Action Bar
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _buildBottomBar(
              context,
              job,
              isApplied,
              isClosed,
              status,
              notifier,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingHeader(BuildContext context, JobModel job) {
    final theme = Theme.of(context);
    final companyName = job.company.name.isNotEmpty
        ? job.company.name
        : 'Unknown Company';
    final companyInitial = companyName.isNotEmpty
        ? companyName[0].toUpperCase()
        : '?';

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        children: [
          // Company Logo
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: theme.scaffoldBackgroundColor,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: theme.colorScheme.outline.withOpacity(0.5),
              ),
            ),
            alignment: Alignment.center,
            child: Text(
              companyInitial,
              style: GoogleFonts.inter(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.primary,
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Job Title
          Text(
            job.title,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),

          // Company Name
          Text(
            companyName,
            style: GoogleFonts.inter(
              fontSize: 16,
              color: AppColors.neutral500,
              fontWeight: FontWeight.w500,
            ),
          ),

          const SizedBox(height: 24),
          Divider(color: theme.colorScheme.outline.withOpacity(0.5)),
          const SizedBox(height: 24),

          // Metadata Pills
          Wrap(
            spacing: 8,
            runSpacing: 10,
            alignment: WrapAlignment.center,
            children: [
              _buildModernChip(
                context,
                LucideIcons.mapPin,
                job.location ?? 'Remote',
              ),
              _buildModernChip(
                context,
                LucideIcons.briefcase,
                job.type ?? 'Full-time',
              ),
              if (job.salary != null)
                _buildModernChip(context, LucideIcons.banknote, job.salary!),
              _buildModernChip(
                context,
                LucideIcons.clock,
                _getDaysRemaining(job.deadline),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDescriptionCard(BuildContext context, JobModel job) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "About the Role",
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            job.description ?? "No description provided for this role.",
            style: GoogleFonts.inter(
              fontSize: 15,
              height: 1.6,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModernChip(BuildContext context, IconData icon, String label) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.neutral500),
          const SizedBox(width: 8),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(
    BuildContext context,
    JobModel job,
    bool isApplied,
    bool isClosed,
    String status,
    JobsNotifier notifier,
  ) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return ClipRect(
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
              top: BorderSide(color: colorScheme.outline.withOpacity(0.5)),
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
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w500,
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  )
                else
                  SizedBox(
                    width: double.infinity,
                    child: PinnacleButton(
                      label: isApplied
                          ? "Application status: ${status[0].toUpperCase() + status.substring(1).toLowerCase()}"
                          : "Apply Now",
                      onPressed: isApplied
                          ? null
                          : () => _handleApply(context, notifier, job),
                      variant: isApplied
                          ? ButtonVariant.outline
                          : ButtonVariant.primary,
                      isLoading: _isApplying,
                      icon: Icon(
                        isApplied ? LucideIcons.squareCheck : LucideIcons.send,
                        size: 18,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _handleApply(
    BuildContext context,
    JobsNotifier notifier,
    JobModel job,
  ) async {
    // Check if there are questions to answer
    Map<String, dynamic>? answers;

    if (job.questions.isNotEmpty) {
      answers = await showDialog<Map<String, dynamic>>(
        context: context,
        barrierDismissible: false,
        builder: (context) => _QuestionsDialog(questions: job.questions),
      );

      // If user cancelled dialog, return
      if (answers == null) return;
    }

    setState(() => _isApplying = true);
    try {
      await notifier.apply(widget.jobId, answers: answers);
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
            backgroundColor: AppColors.success,
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

// Separate widget for the questions dialog
class _QuestionsDialog extends StatefulWidget {
  final List<JobQuestion> questions;

  const _QuestionsDialog({required this.questions});

  @override
  State<_QuestionsDialog> createState() => _QuestionsDialogState();
}

class _QuestionsDialogState extends State<_QuestionsDialog> {
  final Map<String, TextEditingController> _controllers = {};

  @override
  void initState() {
    super.initState();
    for (var q in widget.questions) {
      _controllers[q.id] = TextEditingController();
    }
  }

  @override
  void dispose() {
    for (var controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AlertDialog(
      title: const Text('Additional Questions'),
      content: SizedBox(
        width: double.maxFinite,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: widget.questions.map((q) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${q.question}${q.required ? ' *' : ''}',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _controllers[q.id],
                      decoration: InputDecoration(
                        border: const OutlineInputBorder(),
                        hintText: 'Your answer',
                        isDense: true,
                        contentPadding: const EdgeInsets.all(12),
                      ),
                      maxLines: 2,
                      minLines: 1,
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(onPressed: _submit, child: const Text('Submit')),
      ],
    );
  }

  void _submit() {
    final answers = <String, String>{};
    bool hasError = false;

    for (var q in widget.questions) {
      final text = _controllers[q.id]?.text.trim() ?? '';
      if (q.required && text.isEmpty) {
        hasError = true;
        break;
      }
      if (text.isNotEmpty) {
        answers[q.id] = text;
      }
    }

    if (hasError) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please answer all required questions'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    Navigator.pop(context, answers);
  }
}

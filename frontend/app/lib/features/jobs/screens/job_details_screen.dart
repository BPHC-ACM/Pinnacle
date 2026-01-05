import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../models/job_model.dart';
import '../providers/jobs_provider.dart';
import '../../../core/components/pinnacle_button.dart';

class JobDetailsScreen extends ConsumerStatefulWidget {
  final String jobId;
  final JobModel? initialJobData; // Optional, passed from list for instant load

  const JobDetailsScreen({super.key, required this.jobId, this.initialJobData});

  @override
  ConsumerState<JobDetailsScreen> createState() => _JobDetailsScreenState();
}

class _JobDetailsScreenState extends ConsumerState<JobDetailsScreen> {
  bool _isApplying = false;

  String _formatDate(DateTime? date) {
    if (date == null) return 'Open indefinitely';
    return DateFormat('MMM d, yyyy').format(date);
  }

  @override
  Widget build(BuildContext context) {
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
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    // Placeholders for Null Fields
    final companyName = job.company.name.isNotEmpty
        ? job.company.name
        : 'Unknown Company';
    final jobLocation = job.location ?? 'Remote';
    final jobType = job.type ?? 'Full-time';
    final jobDescription =
        job.description ?? 'No description provided for this role.';
    final jobSalary = job.salary ?? 'Not disclosed';
    final jobDeadline = _formatDate(job.deadline);

    return Scaffold(
      appBar: AppBar(title: Text(companyName)),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Text(
                    job.title,
                    style: GoogleFonts.inter(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 16,
                    runSpacing: 8,
                    children: [
                      _buildIconText(Icons.location_on_outlined, jobLocation),
                      _buildIconText(Icons.work_outline, jobType),
                      _buildIconText(Icons.attach_money, jobSalary),
                      _buildIconText(
                        Icons.calendar_today_outlined,
                        'Due: $jobDeadline',
                      ),
                    ],
                  ),

                  const SizedBox(height: 32),

                  // Description
                  Text(
                    "Description",
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    jobDescription,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      height: 1.5,
                      color: job.description == null
                          ? Colors.grey
                          : Colors.black87,
                      fontStyle: job.description == null
                          ? FontStyle.italic
                          : FontStyle.normal,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Action Bar
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.grey.shade200)),
            ),
            child: SafeArea(
              child: PinnacleButton(
                label: isApplied ? "Applied ($status)" : "Apply Now",
                onPressed: isApplied
                    ? null
                    : () => _handleApply(context, notifier),
                variant: isApplied
                    ? ButtonVariant.outline
                    : ButtonVariant.primary,
                isLoading: _isApplying,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIconText(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: Colors.grey),
        const SizedBox(width: 4),
        Text(text, style: GoogleFonts.inter(color: Colors.grey, fontSize: 14)),
      ],
    );
  }

  Future<void> _handleApply(BuildContext context, JobsNotifier notifier) async {
    setState(() => _isApplying = true);
    try {
      await notifier.apply(widget.jobId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Application submitted successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to apply: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _isApplying = false);
    }
  }
}

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import '../../../core/utils/logger.dart'; // Import logger
import '../models/job_model.dart';
import '../models/application_model.dart';
import '../repositories/jobs_repository.dart';

final jobsRepositoryProvider = Provider((ref) => JobsRepository());

class JobsState {
  final bool isLoading;
  final List<JobModel> jobs;
  final List<ApplicationModel> applications;
  final String? error;

  JobsState({
    this.isLoading = false,
    this.jobs = const [],
    this.applications = const [],
    this.error,
  });

  JobsState copyWith({
    bool? isLoading,
    List<JobModel>? jobs,
    List<ApplicationModel>? applications,
    String? error,
  }) {
    return JobsState(
      isLoading: isLoading ?? this.isLoading,
      jobs: jobs ?? this.jobs,
      applications: applications ?? this.applications,
      error: error,
    );
  }
}

class JobsNotifier extends StateNotifier<JobsState> {
  final JobsRepository _repository;

  JobsNotifier(this._repository) : super(JobsState()) {
    refresh();
  }

  Future<void> refresh() async {
    logger.d("JobsNotifier: Refreshing jobs and applications...");
    state = state.copyWith(isLoading: true, error: null);
    try {
      final results = await Future.wait([
        _repository.getJobs(),
        _repository.getUserApplications(),
      ]);

      logger.i(
        "JobsNotifier: Loaded ${results[0].length} jobs and ${results[1].length} applications.",
      );

      state = state.copyWith(
        isLoading: false,
        jobs: results[0] as List<JobModel>,
        applications: results[1] as List<ApplicationModel>,
      );
    } catch (e) {
      logger.e("JobsNotifier: Refresh failed", error: e);
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> apply(String jobId, {Map<String, dynamic>? answers}) async {
    logger.i("JobsNotifier: Applying to job $jobId...");
    try {
      await _repository.applyToJob(jobId, answers: answers);

      // Refresh applications to update UI status
      final apps = await _repository.getUserApplications();
      logger.d(
        "JobsNotifier: Application successful. Updated application list.",
      );

      state = state.copyWith(applications: apps);
    } catch (e) {
      logger.e("JobsNotifier: Apply failed", error: e);
      rethrow;
    }
  }

  String getApplicationStatus(String jobId) {
    final app = state.applications.firstWhere(
      (element) => element.jobId == jobId,
      orElse: () => ApplicationModel(
        id: '',
        jobId: '',
        status: 'Yet to apply',
        createdAt: DateTime.now(),
      ),
    );
    return app.id.isEmpty ? 'Yet to apply' : app.status;
  }
}

final jobsProvider = StateNotifierProvider<JobsNotifier, JobsState>((ref) {
  return JobsNotifier(ref.watch(jobsRepositoryProvider));
});

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import '../models/dashboard_stats_model.dart';
import '../models/profile_completion_model.dart';
import '../repositories/dashboard_repository.dart';

// Provider for Dashboard Stats
final dashboardStatsProvider = FutureProvider.autoDispose<DashboardStatsModel>((
  ref,
) async {
  final repository = ref.watch(dashboardRepositoryProvider);
  return repository.getDashboardStats();
});

// Provider for Profile Completion
final profileCompletionProvider =
    FutureProvider.autoDispose<ProfileCompletionModel>((ref) async {
      final repository = ref.watch(dashboardRepositoryProvider);
      return repository.getProfileCompletion();
    });

// Controller to handle refreshing all dashboard data
class DashboardController extends StateNotifier<AsyncValue<void>> {
  final Ref _ref;

  DashboardController(this._ref) : super(const AsyncValue.data(null));

  Future<void> refreshDashboard() async {
    state = const AsyncValue.loading();
    try {
      // Invalidate providers to trigger a refetch
      _ref.invalidate(dashboardStatsProvider);
      _ref.invalidate(profileCompletionProvider);

      await Future.wait([
        _ref.read(dashboardStatsProvider.future),
        _ref.read(profileCompletionProvider.future),
      ]);

      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final dashboardControllerProvider =
    StateNotifierProvider<DashboardController, AsyncValue<void>>((ref) {
      return DashboardController(ref);
    });

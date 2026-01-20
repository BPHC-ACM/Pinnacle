import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/logger.dart';
import '../models/dashboard_stats_model.dart';
import '../models/profile_completion_model.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository(ref.watch(apiClientProvider));
});

class DashboardRepository {
  final ApiClient _apiClient;

  DashboardRepository(this._apiClient);

  Future<DashboardStatsModel> getDashboardStats() async {
    try {
      // FIX: Added '/api' prefix to match backend route
      final response = await _apiClient.get('/api/dashboard/stats');
      return DashboardStatsModel.fromJson(response.data);
    } on DioException catch (e) {
      logger.e("DashboardRepo: Error fetching stats", error: e);
      rethrow;
    }
  }

  Future<ProfileCompletionModel> getProfileCompletion() async {
    try {
      // FIX: Added '/api' prefix to match backend route
      final response = await _apiClient.get(
        '/api/dashboard/profile-completion',
      );
      return ProfileCompletionModel.fromJson(response.data);
    } on DioException catch (e) {
      logger.e("DashboardRepo: Error fetching profile completion", error: e);
      rethrow;
    }
  }
}

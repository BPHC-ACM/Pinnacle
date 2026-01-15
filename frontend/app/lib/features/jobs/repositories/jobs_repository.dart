import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/utils/logger.dart'; // Import logger
import '../models/job_model.dart';
import '../models/application_model.dart';

class JobsRepository {
  final ApiClient _apiClient;

  JobsRepository({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  Future<List<JobModel>> getJobs() async {
    try {
      final response = await _apiClient.client.get('/api/jobs');
      final List<dynamic> jobsData = response.data['data'];

      final Set<String> companyIds = jobsData
          .map((j) => j['companyId'] as String?)
          .where((id) => id != null && id.isNotEmpty)
          .cast<String>()
          .toSet();

      final Map<String, Company> companyMap = {};

      await Future.wait(
        companyIds.map((id) async {
          try {
            final companyRes = await _apiClient.client.get(
              '/api/companies/$id',
            );
            companyMap[id] = Company.fromJson(companyRes.data);
          } catch (e) {
            logger.e('Failed to fetch company details for $id', error: e);
          }
        }),
      );

      return jobsData.map((json) {
        final companyId = json['companyId'];
        final company = companyMap[companyId];
        return JobModel.fromJson(json, companyOverride: company);
      }).toList();
    } catch (e) {
      logger.e("Error fetching jobs", error: e);
      throw Exception('Failed to fetch jobs: $e');
    }
  }

  Future<JobModel> getJob(String id) async {
    try {
      final response = await _apiClient.client.get('/api/jobs/$id');
      final json = response.data;

      Company? company;
      if (json['company'] == null && json['companyId'] != null) {
        try {
          final companyRes = await _apiClient.client.get(
            '/api/companies/${json['companyId']}',
          );
          company = Company.fromJson(companyRes.data);
        } catch (e) {
          logger.e('Failed to fetch company for job $id', error: e);
        }
      }

      return JobModel.fromJson(json, companyOverride: company);
    } catch (e) {
      logger.e('Failed to fetch job details: $e');
      throw Exception('Failed to fetch job details: $e');
    }
  }

  Future<List<ApplicationModel>> getUserApplications() async {
    try {
      final response = await _apiClient.client.get('/api/applications');

      logger.d("Fetched Applications: ${response.data}");

      final List<dynamic> applicationsJson = response.data['data'];

      return applicationsJson.map((e) => ApplicationModel.fromJson(e)).toList();
    } catch (e) {
      logger.e("Error fetching applications", error: e);
      return [];
    }
  }

  Future<void> applyToJob(String jobId, {Map<String, dynamic>? answers}) async {
    try {
      final data = {if (answers != null) 'answers': answers};
      await _apiClient.client.post('/api/jobs/$jobId/applications', data: data);
      logger.i("Successfully applied to job $jobId");
    } catch (e) {
      if (e is DioException) {
        final data = e.response?.data;
        final errorMsg =
            data?['msg'] ??
            data?['message'] ??
            data?['error'] ??
            'Failed to apply';
        logger.e("Failed to apply to job", error: e);
        throw Exception(errorMsg);
      }
      throw Exception('Failed to apply to job');
    }
  }
}

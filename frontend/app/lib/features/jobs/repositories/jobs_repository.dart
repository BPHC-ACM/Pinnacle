import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
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

      // 1. Extract unique company IDs
      final Set<String> companyIds = jobsData
          .map((j) => j['companyId'] as String?)
          .where((id) => id != null && id.isNotEmpty)
          .cast<String>()
          .toSet();

      // 2. Fetch company details concurrently
      final Map<String, Company> companyMap = {};
      
      await Future.wait(companyIds.map((id) async {
        try {
          // Fetch individual company details
          final companyRes = await _apiClient.client.get('/api/companies/$id');
          companyMap[id] = Company.fromJson(companyRes.data);
        } catch (e) {
          print('Failed to fetch company details for $id: $e');
        }
      }));

      // 3. Map jobs with the fetched company data
      return jobsData.map((json) {
        final companyId = json['companyId'];
        final company = companyMap[companyId];
        // Inject the fetched company into the model
        return JobModel.fromJson(json, companyOverride: company);
      }).toList();

    } catch (e) {
      print("Error fetching jobs: $e");
      throw Exception('Failed to fetch jobs: $e');
    }
  }

  Future<JobModel> getJob(String id) async {
    try {
      final response = await _apiClient.client.get('/api/jobs/$id');
      final json = response.data;
      
      Company? company;
      // Fetch company for single job details if not present
      if (json['company'] == null && json['companyId'] != null) {
        try {
           final companyRes = await _apiClient.client.get('/api/companies/${json['companyId']}');
           company = Company.fromJson(companyRes.data);
        } catch (e) {
           print('Failed to fetch company for job $id: $e');
        }
      }

      return JobModel.fromJson(json, companyOverride: company);
    } catch (e) {
      throw Exception('Failed to fetch job details: $e');
    }
  }

  Future<List<ApplicationModel>> getUserApplications() async {
    try {
      final response = await _apiClient.client.get('/api/applications');
      return (response.data as List)
          .map((e) => ApplicationModel.fromJson(e))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<void> applyToJob(String jobId) async {
    try {
      await _apiClient.client.post('/api/jobs/$jobId/applications');
    } catch (e) {
      if (e is DioException) {
        throw Exception(e.response?.data['message'] ?? 'Failed to apply');
      }
      throw Exception('Failed to apply to job');
    }
  }
}
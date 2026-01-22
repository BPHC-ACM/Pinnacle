import { api } from '@/lib/api-client';
import type {
  AdminDashboardStats,
  JobWithStats,
  ApplicationWithDetails,
  AdminJobFilters,
  AdminApplicationFilters,
  PaginationParams,
  PaginatedResponse,
  UpdateJobRequest,
  BulkStatusUpdateRequest,
  ApplicationStatus,
  StudentUser,
  StudentFilters,
} from '@/types/admin.types';

export const adminService = {
  // ==================== DASHBOARD ====================
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // ==================== JOBS MANAGEMENT ====================
  getAllJobs: async (
    filters?: AdminJobFilters,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<JobWithStats>> => {
    const response = await api.get('/admin/jobs', {
      params: { ...filters, ...params },
    });
    return response.data;
  },

  getJobById: async (id: string): Promise<JobWithStats> => {
    const response = await api.get(`/admin/jobs/${id}`);
    return response.data;
  },

  updateJob: async (id: string, data: UpdateJobRequest): Promise<JobWithStats> => {
    const response = await api.patch(`/admin/jobs/${id}`, data);
    return response.data;
  },

  updateJobSchedule: async (
    id: string,
    data: import('@/types/admin.types').UpdateJobScheduleRequest,
  ): Promise<JobWithStats> => {
    const response = await api.patch(`/jobs/${id}/schedule`, data);
    return response.data;
  },

  deleteJob: async (id: string): Promise<{ message: string; job: JobWithStats }> => {
    const response = await api.delete(`/admin/jobs/${id}`);
    return response.data;
  },

  pauseJob: async (id: string): Promise<JobWithStats> => {
    const response = await api.patch(`/admin/jobs/${id}/pause`);
    return response.data;
  },

  reopenJob: async (id: string, deadline?: string): Promise<JobWithStats> => {
    const response = await api.patch(`/admin/jobs/${id}/reopen`, { deadline });
    return response.data;
  },

  exportJobApplications: async (id: string): Promise<unknown> => {
    const response = await api.get(`/admin/jobs/${id}/export`);
    return response.data;
  },

  getJobApplications: async (
    jobId: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<ApplicationWithDetails>> => {
    const response = await api.get(`/admin/jobs/${jobId}/applications`, {
      params,
    });
    return response.data;
  },

  // ==================== APPLICATIONS MANAGEMENT ====================
  getAllApplications: async (
    filters?: AdminApplicationFilters,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<ApplicationWithDetails>> => {
    const response = await api.get('/admin/applications', {
      params: { ...filters, ...params },
    });
    return response.data;
  },

  getApplicationById: async (id: string): Promise<ApplicationWithDetails> => {
    const response = await api.get(`/admin/applications/${id}`);
    return response.data;
  },

  updateApplicationStatus: async (
    id: string,
    status: ApplicationStatus,
  ): Promise<ApplicationWithDetails> => {
    const response = await api.patch(`/admin/applications/${id}/status`, { status });
    return response.data;
  },

  bulkUpdateApplicationStatus: async (
    data: BulkStatusUpdateRequest,
  ): Promise<{ updated: number; failed: string[] }> => {
    const response = await api.post('/admin/applications/bulk-status', data);
    return response.data;
  },

  deleteApplication: async (
    id: string,
  ): Promise<{ message: string; application: ApplicationWithDetails }> => {
    const response = await api.delete(`/admin/applications/${id}`);
    return response.data;
  },

  getApplicantProfile: async (applicationId: string): Promise<unknown> => {
    const response = await api.get(`/admin/applications/${applicationId}/profile`);
    return response.data;
  },

  // ==================== VERIFICATION ====================
  verifyItem: async (itemType: string, itemId: string, status: boolean): Promise<unknown> => {
    const response = await api.patch(`/admin/verify/${itemType}/${itemId}`, { status });
    return response.data;
  },

  // ==================== STUDENT MANAGEMENT ====================
  getStudents: async (
    filters?: StudentFilters & PaginationParams,
  ): Promise<{
    students: StudentUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const response = await api.get('/admin/students', { params: filters });
    return response.data;
  },

  // ==================== STUDENT MANAGEMENT ====================
  freezeStudent: async (
    userId: string,
    isFrozen: boolean,
    reason?: string,
  ): Promise<{ message: string }> => {
    const response = await api.post('/admin/students/freeze', { userId, isFrozen, reason });
    return response.data;
  },

  deleteStudent: async (userId: string, reason?: string): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/students/${userId}`, { data: { reason } });
    return response.data;
  },

  bulkFreezeStudents: async (
    userIds: string[],
    isFrozen: boolean,
  ): Promise<{ message: string; count: number }> => {
    const response = await api.post('/admin/students/bulk-freeze', { userIds, isFrozen });
    return response.data;
  },
};

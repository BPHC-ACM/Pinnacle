import type { Request, Response } from 'express';

import applicationService from '../services/application-service/application.service';
import type {
  AdminApplicationFilters,
  AdminJobFilters,
  UpdateJobRequest,
  BulkStatusUpdateRequest,
  ApplicationStatus,
} from '../types/application.types';

// ==================== DASHBOARD ====================

export const getAdminDashboard = async (_req: Request, res: Response): Promise<void> => {
  const stats = await applicationService.getAdminDashboardStats();
  res.json(stats);
};

// ==================== JOBS MANAGEMENT ====================

export const getAllJobs = async (req: Request, res: Response): Promise<void> => {
  const filters: AdminJobFilters = {
    status: req.query.status as AdminJobFilters['status'],
    companyId: req.query.companyId as string,
    search: req.query.search as string,
    fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
    toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
  };

  const jobs = await applicationService.getAllJobsWithStats(filters);
  res.json(jobs);
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Job ID required' });
    return;
  }

  const job = await applicationService.getJob(id);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Job ID required' });
    return;
  }

  const data = req.body as UpdateJobRequest;
  const job = await applicationService.updateJob(id, data);

  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Job ID required' });
    return;
  }

  const job = await applicationService.deleteJob(id);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json({ message: 'Job deleted successfully', job });
};

export const pauseJob = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Job ID required' });
    return;
  }

  const job = await applicationService.pauseJob(id);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
};

export const reopenJob = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Job ID required' });
    return;
  }

  const { deadline } = req.body as { deadline?: string };
  const newDeadline = deadline ? new Date(deadline) : undefined;

  const job = await applicationService.reopenJob(id, newDeadline);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
};

export const exportJobApplications = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Job ID required' });
    return;
  }

  const data = await applicationService.exportJobApplications(id);
  if (!data) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(data);
};

// ==================== APPLICATIONS MANAGEMENT ====================

export const getAllApplications = async (req: Request, res: Response): Promise<void> => {
  const filters: AdminApplicationFilters = {
    status: req.query.status as ApplicationStatus,
    jobId: req.query.jobId as string,
    companyId: req.query.companyId as string,
    search: req.query.search as string,
    fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
    toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
  };

  const applications = await applicationService.getAllApplications(filters);
  res.json(applications);
};

export const getApplicationById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Application ID required' });
    return;
  }

  const application = await applicationService.getApplicationDetails(id);
  if (!application) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(application);
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Application ID required' });
    return;
  }

  const { status } = req.body as { status: ApplicationStatus };
  if (!status) {
    res.status(400).json({ error: 'Status required' });
    return;
  }

  const application = await applicationService.updateStatus(id, status);
  if (!application) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(application);
};

export const bulkUpdateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  const { applicationIds, status } = req.body as BulkStatusUpdateRequest;

  if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
    res.status(400).json({ error: 'Application IDs required' });
    return;
  }
  if (!status) {
    res.status(400).json({ error: 'Status required' });
    return;
  }

  const result = await applicationService.bulkUpdateStatus(applicationIds, status);
  res.json(result);
};

export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Application ID required' });
    return;
  }

  const application = await applicationService.deleteApplication(id);
  if (!application) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json({ message: 'Application deleted successfully', application });
};

export const getApplicantProfile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Application ID required' });
    return;
  }

  const profile = await applicationService.getApplicantProfile(id);
  if (!profile) {
    res.status(404).json({ error: 'Application or applicant not found' });
    return;
  }
  res.json(profile);
};

// Get applications for a specific job (Admin view with full details)
export const getJobApplicationsAdmin = async (req: Request, res: Response): Promise<void> => {
  const { jobId } = req.params;
  if (!jobId) {
    res.status(400).json({ error: 'Job ID required' });
    return;
  }

  const applications = await applicationService.getAllApplications({ jobId });
  res.json(applications);
};

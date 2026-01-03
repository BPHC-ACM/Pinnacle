import type { Request, Response } from 'express';

import applicationService from '../services/application-service/application.service';
import jobService from '../services/job-service/job.service';
import { unifiedNotificationService } from '../services/notification-service/UnifiedNotification.service';
import { notifyJobApplicants } from '../services/notification-service/job-notifications.helper';
import { verificationService } from '../services/verification-service/verification.service';
import type {
  AdminApplicationFilters,
  BulkStatusUpdateRequest,
  ApplicationStatus,
} from '../types/application.types';
import { ValidationError, NotFoundError } from '../types/errors.types';
import type { AdminJobFilters, UpdateJobRequest } from '../types/job.types';
import { parsePagination } from '../types/pagination.types';

//  DASHBOARD

export const getAdminDashboard = async (_req: Request, res: Response): Promise<void> => {
  const stats = await applicationService.getAdminDashboardStats();
  res.json(stats);
};

//  JOBS MANAGEMENT

export const getAllJobs = async (req: Request, res: Response): Promise<void> => {
  const filters: AdminJobFilters = {
    status: req.query.status as AdminJobFilters['status'],
    companyId: req.query.companyId as string,
    search: req.query.search as string,
    fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
    toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
  };
  const params = parsePagination(req.query as Record<string, unknown>);
  const jobs = await jobService.getAllJobsWithStats(filters, params);
  res.json(jobs);
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    throw new ValidationError('Job ID required', 'Job ID required');
  }

  const job = await jobService.getJob(id);
  if (!job) {
    throw new NotFoundError('Job not found', 'Job not found');
  }
  res.json(job);
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    throw new ValidationError('Job ID required', 'Job ID required');
  }

  const data = req.body as UpdateJobRequest;
  const job = await jobService.updateJob(id, data);

  if (!job) {
    throw new NotFoundError('Job not found', 'Job not found');
  }

  // Send notifications to applicants
  if (data.deadline) {
    await notifyJobApplicants(
      id,
      'JOB_DEADLINE_EXTENDED',
      'Job Deadline Extended',
      `The deadline for ${job.title} has been updated. Check the job details for more information.`,
      { newDeadline: data.deadline.toISOString() },
    );
  } else if (Object.keys(data).length > 0) {
    await notifyJobApplicants(
      id,
      'JOB_UPDATED',
      'Job Updated',
      `${job.title} has been updated. Please review the latest job details.`,
    );
  }

  res.json(job);
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    throw new ValidationError('Job ID required', 'Job ID required');
  }

  const job = await jobService.deleteJob(id);
  if (!job) {
    throw new NotFoundError('Job not found', 'Job not found');
  }
  res.json({ message: 'Job deleted successfully', job });
};

export const reopenJob = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    throw new ValidationError('Job ID required', 'Job ID required');
  }

  const { deadline } = req.body as { deadline?: string };
  const newDeadline = deadline ? new Date(deadline) : undefined;

  const job = await jobService.reopenJob(id, newDeadline);
  if (!job) {
    throw new NotFoundError('Job not found', 'Job not found');
  }

  // Notify all applicants
  await notifyJobApplicants(
    id,
    'JOB_REOPENED',
    'Job Reopened',
    `Good news! ${job.title} has been reopened${newDeadline ? ` with a new deadline of ${newDeadline.toLocaleDateString()}` : ''}.`,
    newDeadline ? { newDeadline: newDeadline.toISOString() } : undefined,
  );

  res.json(job);
};

export const exportJobApplications = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    throw new ValidationError('Job ID required', 'Job ID required');
  }

  const data = await jobService.exportJobApplications(id);
  if (!data) {
    throw new NotFoundError('Job not found', 'Job not found');
  }
  res.json(data);
};

//  APPLICATIONS MANAGEMENT

export const getAllApplications = async (req: Request, res: Response): Promise<void> => {
  const filters: AdminApplicationFilters = {
    status: req.query.status as ApplicationStatus,
    jobId: req.query.jobId as string,
    companyId: req.query.companyId as string,
    search: req.query.search as string,
    fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
    toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
  };
  const params = parsePagination(req.query as Record<string, unknown>);
  const applications = await applicationService.getAllApplications(filters, params);
  res.json(applications);
};

export const getApplicationById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    throw new ValidationError('Application ID required', 'Application ID required');
  }

  const application = await applicationService.getApplicationDetails(id);
  if (!application) {
    throw new NotFoundError('Application not found', 'Application not found');
  }
  res.json(application);
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    throw new ValidationError('Application ID required', 'Application ID required');
  }

  const { status } = req.body as { status: ApplicationStatus };
  if (!status) {
    throw new ValidationError('Status required', 'Status required');
  }

  const application = await applicationService.updateStatus(id, status);
  if (!application) {
    throw new NotFoundError('Application not found', 'Application not found');
  }

  // Send notification to the user
  const appWithJob = await applicationService.getApplicationDetails(id);
  if (appWithJob) {
    await unifiedNotificationService.notifyUsers({
      userIds: [application.userId],
      type: 'APPLICATION_STATUS_CHANGED',
      title: 'Application Status Updated',
      message: `Your application status for ${appWithJob.job?.title ?? 'a job'} has been updated to ${status}`,
      data: {
        applicationId: application.id,
        newStatus: status,
        jobId: application.jobId,
      },
    });
  }

  res.json(application);
};

export const bulkUpdateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as BulkStatusUpdateRequest;
  const { applicationIds, status } = body;

  if (!applicationIds || applicationIds.length === 0) {
    throw new ValidationError(
      'applicationIds array is required',
      'applicationIds array is required',
    );
  }

  if (!status) {
    throw new ValidationError('status is required', 'status is required');
  }

  const result = await applicationService.bulkUpdateStatus(applicationIds, status);

  // Send notifications to all affected users
  if (result.updatedApplications.length > 0) {
    const userIds = result.updatedApplications.map((app) => app.userId);
    const uniqueUserIds = [...new Set(userIds)];

    const firstApp = result.updatedApplications[0];
    if (firstApp) {
      const jobTitle = (firstApp as unknown as { job?: { title?: string } }).job?.title ?? 'a job';

      await unifiedNotificationService.notifyUsers({
        userIds: uniqueUserIds,
        type: 'APPLICATION_STATUS_CHANGED',
        title: 'Application Status Updated',
        message: `Your application status for ${jobTitle} has been updated to ${status}`,
        data: {
          applicationIds: result.updatedApplications.map((app) => app.id),
          newStatus: status,
          jobId: firstApp.jobId,
        },
      });
    }
  }

  res.json(result);
};

export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    throw new ValidationError('Application ID required', 'Application ID required');
  }

  const application = await applicationService.deleteApplication(id);
  if (!application) {
    throw new NotFoundError('Application not found', 'Application not found');
  }
  res.json({ message: 'Application deleted successfully', application });
};

export const getApplicantProfile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    throw new ValidationError('Application ID required', 'Application ID required');
  }
  const profile = await applicationService.getApplicantProfile(id);

  if (!profile) {
    throw new NotFoundError(
      'Application or applicant not found',
      'Application or applicant not found',
    );
  }
  res.json(profile);
};

// Get applications for a specific job (Admin view with full details)
export const getJobApplicationsAdmin = async (req: Request, res: Response): Promise<void> => {
  const { jobId } = req.params;
  if (!jobId) {
    throw new ValidationError('Job ID required', 'Job ID required');
  }
  const params = parsePagination(req.query as Record<string, unknown>);
  const applications = await applicationService.getAllApplications({ jobId }, params);
  res.json(applications);
};

//  VERIFICATION

export const verifyItem = async (
  req: Request<{ itemType: string; itemId: string }, unknown, { status?: unknown }>,
  res: Response,
): Promise<void> => {
  const { itemType, itemId } = req.params;
  const { status } = req.body;

  if (!itemType) {
    throw new ValidationError('Item type required', 'Item type required');
  }
  if (!itemId) {
    throw new ValidationError('Item ID required', 'Item ID required');
  }

  if (typeof status !== 'string' || !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    throw new ValidationError('Invalid status', 'Status must be PENDING, APPROVED, or REJECTED');
  }

  const updatedItem = await verificationService.verifyItem({
    itemType,
    itemId,
    status: status as 'PENDING' | 'APPROVED' | 'REJECTED',
  });

  res.json(updatedItem);
};

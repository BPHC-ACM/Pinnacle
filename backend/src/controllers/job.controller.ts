import type { Request, Response } from 'express';

import applicationService from '../services/application-service/application.service';
import jobService from '../services/job-service/job.service';
import { notifyJobApplicants } from '../services/notification-service/job-notifications.helper';
import type { ApplyRequest } from '../types/application.types';
import { ValidationError, AuthError, NotFoundError } from '../types/errors.types';
import type { CreateJobRequest, PublicJobFilters } from '../types/job.types';
import { parsePagination } from '../types/pagination.types';

export async function createJob(req: Request, res: Response): Promise<void> {
  const data = req.body as CreateJobRequest;
  const job = await jobService.createJob(data);
  res.status(201).json(job);
}

export async function getJob(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!id) throw new ValidationError('ID parameter is missing', 'ID parameter is required');

  const job = await jobService.getJob(id);
  if (!job) {
    throw new NotFoundError(`Job with ID ${id} not found`, 'Job not found');
  }
  res.json(job);
}

export async function getJobs(req: Request, res: Response): Promise<void> {
  const params = parsePagination(req.query as Record<string, unknown>);
  const filters: PublicJobFilters = {
    companyId: req.query.companyId as string,
    search: req.query.q as string,
    industry: req.query.industry as string,
    jobType: req.query.jobType as string,
  };
  const jobs = await jobService.getJobs(filters, params);
  res.json(jobs);
}

export async function closeJob(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!id) throw new ValidationError('ID parameter is missing', 'ID parameter is required');

  const job = await jobService.closeJob(id);
  if (!job) {
    throw new NotFoundError(`Job with ID ${id} not found`, 'Job not found');
  }

  // Notify all applicants
  await notifyJobApplicants(
    id,
    'JOB_CLOSED',
    'Job Closed',
    `${job.title} has been closed. Thank you for your application.`,
  );

  res.json(job);
}

export async function apply(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new AuthError('User not authenticated', 'Unauthorized');

  const { jobId } = req.params;
  if (!jobId) {
    throw new ValidationError('Job ID is required', 'Job ID is required');
  }

  const data = req.body as ApplyRequest;
  const result = await applicationService.apply(userId, jobId, data);
  res.status(201).json(result);
}

export async function getJobApplications(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;
  if (!jobId) {
    throw new ValidationError('Job ID is required', 'Job ID is required');
  }
  const params = parsePagination(req.query as Record<string, unknown>);
  const applications = await applicationService.getJobApplications(jobId, params);
  res.json(applications);
}

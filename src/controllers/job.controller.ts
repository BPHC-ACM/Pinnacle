import type { Request, Response } from 'express';

import applicationService from '../services/application-service/application.service';
import type { CreateJobRequest, ApplyRequest } from '../types/application.types';
import { ValidationError, AuthError, NotFoundError } from '../types/errors.types';
import { parsePagination } from '../types/pagination.types';

const getUserId = (req: Request): string => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AuthError('User not authenticated', 'Unauthorized');
  }
  return userId;
};

const getParamId = (req: Request): string => {
  const { id } = req.params;
  if (!id) {
    throw new ValidationError('ID parameter is missing', 'ID parameter is required');
  }
  return id;
};

export async function createJob(req: Request, res: Response): Promise<void> {
  const data = req.body as CreateJobRequest;
  const job = await applicationService.createJob(data);
  res.status(201).json(job);
}

export async function getJob(req: Request, res: Response): Promise<void> {
  const id = getParamId(req);
  const job = await applicationService.getJob(id);
  if (!job) {
    throw new NotFoundError(`Job with ID ${id} not found`, 'Job not found');
  }
  res.json(job);
}

export async function getJobs(req: Request, res: Response): Promise<void> {
  const params = parsePagination(req.query as Record<string, unknown>);
  const jobs = await applicationService.getJobs(req.query.companyId as string | undefined, params);
  res.json(jobs);
}

export async function closeJob(req: Request, res: Response): Promise<void> {
  const id = getParamId(req);
  const job = await applicationService.closeJob(id);
  res.json(job);
}

export async function apply(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
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

import type { Request, Response } from 'express';

import applicationService from '../services/application-service/application.service';
import type {
  CreateJobRequest,
  ApplyRequest,
  UpdateApplicationStatusRequest,
} from '../types/application.types';

export const createJob = async (req: Request, res: Response): Promise<void> => {
  const data = req.body as CreateJobRequest;
  const job = await applicationService.createJob(data);
  res.status(201).json(job);
};

export const getJob = async (req: Request, res: Response): Promise<void> => {
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

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  const jobs = await applicationService.getJobs(req.query.companyId as string | undefined);
  res.json(jobs);
};

export const closeJob = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Job ID required' });
    return;
  }
  const job = await applicationService.closeJob(id);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
};

export const apply = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { jobId } = req.params;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!jobId) {
    res.status(400).json({ error: 'Job ID required' });
    return;
  }

  const data = req.body as ApplyRequest;
  const result = await applicationService.apply(userId, jobId, data);

  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  res.status(201).json(result);
};

export const getUserApplications = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const applications = await applicationService.getUserApplications(userId);
  res.json(applications);
};

export const getJobApplications = async (req: Request, res: Response): Promise<void> => {
  const { jobId } = req.params;
  if (!jobId) {
    res.status(400).json({ error: 'Job ID required' });
    return;
  }
  const applications = await applicationService.getJobApplications(jobId);
  res.json(applications);
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Application ID required' });
    return;
  }
  const { status } = req.body as UpdateApplicationStatusRequest;
  const application = await applicationService.updateStatus(id, status);
  if (!application) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(application);
};

export const withdrawApplication = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!id) {
    res.status(400).json({ error: 'Application ID required' });
    return;
  }

  const result = await applicationService.withdraw(userId, id);
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
};

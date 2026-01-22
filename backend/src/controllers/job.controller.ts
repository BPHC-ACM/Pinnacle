import type { Request, Response } from 'express';

import applicationService from '../services/application-service/application.service';
import {
  jobEligibilityService,
  attendanceService,
} from '../services/job-eligibility-service/job-eligibility.service';
import jobService from '../services/job-service/job.service';
import { notifyJobApplicants } from '../services/notification-service/job-notifications.helper';
import type { ApplyRequest } from '../types/application.types';
import { ValidationError, AuthError, NotFoundError } from '../types/errors.types';
import type {
  CreateJobRequest,
  PublicJobFilters,
  UpdateJobScheduleRequest,
  CreateJobEligibilityRequest,
  MarkAttendanceRequest,
  AttendanceType,
} from '../types/job.types';
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

// ========== JOB SCHEDULING ==========

export async function updateJobSchedule(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;
  if (!jobId) {
    throw new ValidationError('Job ID is required', 'Job ID is required');
  }

  const data = req.body as UpdateJobScheduleRequest;
  const job = await jobService.updateJobSchedule(jobId, data);
  res.json(job);
}

export async function getJobSchedule(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;
  if (!jobId) {
    throw new ValidationError('Job ID is required', 'Job ID is required');
  }

  const job = await jobService.getJob(jobId);
  if (!job) {
    throw new NotFoundError(`Job with ID ${jobId} not found`, 'Job not found');
  }

  res.json({
    oaDate: job.oaDate,
    oaVenue: job.oaVenue,
    oaInstructions: job.oaInstructions,
    pptDate: job.pptDate,
    pptVenue: job.pptVenue,
    pptInstructions: job.pptInstructions,
    interviewDate: job.interviewDate,
    interviewVenue: job.interviewVenue,
    interviewInstructions: job.interviewInstructions,
    selectionStatus: job.selectionStatus,
  });
}

// ========== JOB ELIGIBILITY ==========

export async function createJobEligibility(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;
  if (!jobId) {
    throw new ValidationError('Job ID is required', 'Job ID is required');
  }

  const data = req.body as CreateJobEligibilityRequest;
  const eligibility = await jobEligibilityService.createEligibility(jobId, data);
  res.status(201).json(eligibility);
}

export async function getJobEligibility(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;
  if (!jobId) {
    throw new ValidationError('Job ID is required', 'Job ID is required');
  }

  const eligibility = await jobEligibilityService.getEligibility(jobId);
  res.json(eligibility);
}

export async function checkEligibility(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new AuthError('User not authenticated', 'Unauthorized');

  const { jobId } = req.params;
  if (!jobId) {
    throw new ValidationError('Job ID is required', 'Job ID is required');
  }

  const isEligible = await jobEligibilityService.checkUserEligibility(userId, jobId);
  res.json({ isEligible });
}

// ========== ATTENDANCE ==========
export async function markAttendance(req: Request, res: Response): Promise<void> {
  const adminId = req.user?.id;
  if (!adminId) throw new AuthError('Admin not authenticated', 'Unauthorized');

  const { jobId } = req.params;
  if (!jobId) {
    throw new ValidationError('Job ID is required', 'Job ID is required');
  }

  const data = req.body as MarkAttendanceRequest;
  const attendance = await attendanceService.markAttendance(jobId, data, adminId);
  res.status(201).json(attendance);
}

export async function bulkMarkAttendance(req: Request, res: Response): Promise<void> {
  const adminId = req.user?.id;
  if (!adminId) throw new AuthError('Admin not authenticated', 'Unauthorized');

  const { jobId } = req.params;
  if (!jobId) {
    throw new ValidationError('Job ID is required', 'Job ID is required');
  }

  const { eventType, attendanceRecords } = req.body as {
    eventType: AttendanceType;
    attendanceRecords: { userId: string; attended: boolean; remarks?: string }[];
  };
  const count = await attendanceService.bulkMarkAttendance(
    jobId,
    eventType,
    { attendanceRecords },
    adminId,
  );
  res.json({ message: `${count} attendance records marked`, count });
}

export async function getJobAttendance(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;
  if (!jobId) {
    throw new ValidationError('Job ID is required', 'Job ID is required');
  }

  const eventType = req.query.eventType as 'OA' | 'PPT' | 'INTERVIEW' | undefined;
  const records = await attendanceService.getJobAttendance(jobId, eventType);
  res.json(records);
}

export async function getAttendanceStats(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;
  if (!jobId) {
    throw new ValidationError('Job ID is required', 'Job ID is required');
  }

  const eventType = req.query.eventType as 'OA' | 'PPT' | 'INTERVIEW';
  if (!eventType) {
    throw new ValidationError('Event type is required', 'Event type is required');
  }

  const stats = await attendanceService.getAttendanceStats(jobId, eventType);
  res.json(stats);
}

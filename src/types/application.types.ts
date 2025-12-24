import { z } from 'zod';

export type ApplicationStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'INTERVIEWING'
  | 'REJECTED'
  | 'HIRED'
  | 'WITHDRAWN';
export type JobStatus = 'OPEN' | 'CLOSED' | 'PAUSED';

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  location?: string;
  type?: string;
  salary?: string;
  deadline?: Date;
  status: JobStatus;
  questions?: JobQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JobQuestion {
  id: string;
  jobId: string;
  question: string;
  required: boolean;
  order: number;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  resumeId?: string;
  status: ApplicationStatus;
  coverLetter?: string;
  answers?: Record<string, boolean | string>;
  appliedAt: Date;
  updatedAt: Date;
  withdrawnAt?: Date;
}

export interface CreateJobRequest {
  companyId: string;
  title: string;
  description?: string;
  location?: string;
  type?: string;
  salary?: string;
  deadline?: Date;
  questions?: { question: string; required?: boolean }[];
}

export interface ApplyRequest {
  resumeId?: string;
  coverLetter?: string;
  answers?: Record<string, boolean | string>;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
}

// Admin-specific types
export interface AdminApplicationFilters {
  status?: ApplicationStatus;
  jobId?: string;
  companyId?: string;
  fromDate?: Date;
  toDate?: Date;
  search?: string; // Search by user name/email
}

export interface AdminJobFilters {
  status?: JobStatus;
  companyId?: string;
  fromDate?: Date;
  toDate?: Date;
  search?: string; // Search by job title
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  location?: string;
  type?: string;
  salary?: string;
  deadline?: Date;
  status?: JobStatus;
}

export interface ApplicationWithDetails extends Application {
  job?: Job;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    linkedin?: string;
    github?: string;
  };
  resume?: {
    id: string;
    title: string;
  };
}

export interface JobWithStats extends Job {
  _count?: {
    applications: number;
  };
  applicationStats?: {
    total: number;
    applied: number;
    shortlisted: number;
    interviewing: number;
    rejected: number;
    hired: number;
    withdrawn: number;
  };
}

export interface AdminDashboardStats {
  totalJobs: number;
  openJobs: number;
  closedJobs: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  hiredApplications: number;
}

export interface BulkStatusUpdateRequest {
  applicationIds: string[];
  status: ApplicationStatus;
}

// ==================== ZOD SCHEMAS ====================

// Job Question Schema
const jobQuestionSchema = z.object({
  question: z.string().min(1).max(1000),
  required: z.boolean().optional(),
});

// Create Job Schema
export const createJobSchema = z.object({
  companyId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  location: z.string().max(255).optional(),
  type: z.string().max(100).optional(),
  salary: z.string().max(255).optional(),
  deadline: z.coerce.date().optional(),
  questions: z.array(jobQuestionSchema).optional(),
});

// Apply Request Schema
export const applyRequestSchema = z.object({
  resumeId: z.string().uuid().optional(),
  coverLetter: z.string().max(5000).optional(),
  answers: z.record(z.string(), z.union([z.string(), z.boolean()])).optional(),
});

// Update Application Status Schema
export const updateApplicationStatusSchema = z.object({
  status: z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'REJECTED', 'HIRED', 'WITHDRAWN']),
});

// Bulk Status Update Schema
export const bulkStatusUpdateSchema = z.object({
  applicationIds: z.array(z.string().uuid()).min(1),
  status: z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'REJECTED', 'HIRED', 'WITHDRAWN']),
});

// Update Job Schema
export const updateJobSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  location: z.string().max(255).optional(),
  type: z.string().max(100).optional(),
  salary: z.string().max(255).optional(),
  deadline: z.coerce.date().optional(),
  status: z.enum(['OPEN', 'CLOSED', 'PAUSED']).optional(),
});

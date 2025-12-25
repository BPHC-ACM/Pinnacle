import { z } from 'zod';

import type { Job } from './job.types';

export type ApplicationStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'INTERVIEWING'
  | 'REJECTED'
  | 'HIRED'
  | 'WITHDRAWN';

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

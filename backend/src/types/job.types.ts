import { z } from 'zod';

export type JobStatus = 'OPEN' | 'CLOSED';

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  descriptionDocument?: string; // CDN URL for job description document/PDF
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

export interface CreateJobRequest {
  companyId: string;
  title: string;
  description?: string;
  descriptionDocument?: string; // CDN URL for job description document/PDF
  location?: string;
  type?: string;
  salary?: string;
  deadline?: Date;
  questions?: { question: string; required?: boolean }[];
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  descriptionDocument?: string; // CDN URL for job description document/PDF
  location?: string;
  type?: string;
  salary?: string;
  deadline?: Date;
  status?: JobStatus;
}

export interface AdminJobFilters {
  status?: JobStatus;
  companyId?: string;
  fromDate?: Date;
  toDate?: Date;
  search?: string; // Search by job title
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

//  ZOD SCHEMAS

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

// Update Job Schema
export const updateJobSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  location: z.string().max(255).optional(),
  type: z.string().max(100).optional(),
  salary: z.string().max(255).optional(),
  deadline: z.coerce.date().optional(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
});

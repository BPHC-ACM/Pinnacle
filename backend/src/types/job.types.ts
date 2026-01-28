import { z } from 'zod';

export type JobStatus = 'OPEN' | 'CLOSED' | 'PAUSED';

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
  oaDate?: Date;
  oaVenue?: string;
  oaInstructions?: string;
  pptDate?: Date;
  pptVenue?: string;
  pptInstructions?: string;
  interviewDate?: Date;
  interviewVenue?: string;
  interviewInstructions?: string;
  selectionStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  offerDate?: Date;
  joiningDate?: Date;
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
  placementCycleId: string;
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

export interface PublicJobFilters {
  companyId?: string;
  search?: string; // Search by job title or company name
  industry?: string;
  jobType?: string;
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

// ========== JOB SCHEDULING TYPES ==========
export interface UpdateJobScheduleRequest {
  oaDate?: Date;
  oaVenue?: string;
  oaInstructions?: string;
  pptDate?: Date;
  pptVenue?: string;
  pptInstructions?: string;
  interviewDate?: Date;
  interviewVenue?: string;
  interviewInstructions?: string;
  selectionStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  offerDate?: Date;
  joiningDate?: Date;
}

export const updateJobScheduleSchema = z.object({
  oaDate: z.coerce.date().optional(),
  oaVenue: z.string().max(500).optional(),
  oaInstructions: z.string().max(2000).optional(),
  pptDate: z.coerce.date().optional(),
  pptVenue: z.string().max(500).optional(),
  pptInstructions: z.string().max(2000).optional(),
  interviewDate: z.coerce.date().optional(),
  interviewVenue: z.string().max(500).optional(),
  interviewInstructions: z.string().max(2000).optional(),
  selectionStatus: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
  offerDate: z.coerce.date().optional(),
  joiningDate: z.coerce.date().optional(),
});

// ========== JOB ELIGIBILITY TYPES ==========
export interface JobEligibility {
  id: string;
  jobId: string;
  minCgpa?: number;
  maxActiveBacklogs?: number;
  maxTotalBacklogs?: number;
  allowedBranches: string[];
  allowedYears: number[];
  customCriteria?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobEligibilityRequest {
  minCgpa?: number;
  maxActiveBacklogs?: number;
  maxTotalBacklogs?: number;
  allowedBranches?: string[];
  allowedYears?: number[];
  customCriteria?: Record<string, unknown>;
}

export interface UpdateJobEligibilityRequest {
  minCgpa?: number;
  maxActiveBacklogs?: number;
  maxTotalBacklogs?: number;
  allowedBranches?: string[];
  allowedYears?: number[];
  customCriteria?: Record<string, unknown>;
}

export const createJobEligibilitySchema = z.object({
  minCgpa: z.number().min(0).max(10).optional(),
  maxActiveBacklogs: z.number().int().min(0).optional(),
  maxTotalBacklogs: z.number().int().min(0).optional(),
  allowedBranches: z.array(z.string()).optional(),
  allowedYears: z.array(z.number().int().min(1).max(5)).optional(),
  customCriteria: z.record(z.string(), z.unknown()).optional(),
});

export const updateJobEligibilitySchema = createJobEligibilitySchema;

// ========== ATTENDANCE TYPES ==========
export type AttendanceType = 'OA' | 'PPT' | 'INTERVIEW';

export interface AttendanceRecord {
  id: string;
  jobId: string;
  userId: string;
  eventType: AttendanceType;
  attended: boolean;
  markedBy?: string;
  markedAt?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarkAttendanceRequest {
  userId: string;
  eventType: AttendanceType;
  attended: boolean;
  remarks?: string;
}

export interface BulkMarkAttendanceRequest {
  attendanceRecords: {
    userId: string;
    attended: boolean;
    remarks?: string;
  }[];
}

export const markAttendanceSchema = z.object({
  userId: z.string().uuid(),
  eventType: z.enum(['OA', 'PPT', 'INTERVIEW']),
  attended: z.boolean(),
  remarks: z.string().max(500).optional(),
});

export const bulkMarkAttendanceSchema = z.object({
  attendanceRecords: z.array(
    z.object({
      userId: z.string().uuid(),
      attended: z.boolean(),
      remarks: z.string().max(500).optional(),
    }),
  ),
});

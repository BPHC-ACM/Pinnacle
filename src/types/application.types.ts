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
  descriptionDocument?: string; // CDN URL for job description document/PDF
  logo?: string; // CDN URL for job logo/image
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
  descriptionDocument?: string; // CDN URL for job description document/PDF
  logo?: string; // CDN URL for job logo/image
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
  descriptionDocument?: string; // CDN URL for job description document/PDF
  logo?: string; // CDN URL for job logo/image
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

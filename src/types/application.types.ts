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

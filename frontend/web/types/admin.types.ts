// Admin-specific types for the frontend

export type ApplicationStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'INTERVIEWING'
  | 'REJECTED'
  | 'HIRED'
  | 'WITHDRAWN';

export type JobStatus = 'DRAFT' | 'PENDING' | 'OPEN' | 'CLOSED' | 'PAUSED';

export type PlacementStatus = 'UNPLACED' | 'PLACED' | 'DEFERRED';

export type ProfileStatus = 'INCOMPLETE' | 'COMPLETE' | 'LOCKED';

export interface AdminDashboardStats {
  totalJobs: number;
  openJobs: number;
  closedJobs: number;
  pendingJobs: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  hiredApplications: number;
}

export interface ApplicationWithDetails {
  id: string;
  userId: string;
  jobId: string;
  resumeId?: string;
  status: ApplicationStatus;
  coverLetter?: string;
  answers?: Record<string, boolean | string>;
  appliedAt: string;
  updatedAt: string;
  withdrawnAt?: string;
  job?: JobWithDetails;
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

export interface JobWithDetails {
  id: string;
  title: string;
  description: string;
  companyId: string;
  status: JobStatus;
  deadline?: string;
  salary?: string;
  location?: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
  eligibility?: {
    minCgpa?: number;
    maxBacklogs?: number;
    departments?: string[];
    batches?: number[];
  };
  questions?: {
    id: string;
    question: string;
    required: boolean;
  }[];
  oaDate?: string;
  oaVenue?: string;
  oaInstructions?: string;
  pptDate?: string;
  pptVenue?: string;
  pptInstructions?: string;
  interviewDate?: string;
  interviewVenue?: string;
  interviewInstructions?: string;
  selectionStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface JobWithStats extends JobWithDetails {
  applicationStats: {
    total: number;
    applied: number;
    shortlisted: number;
    interviewing: number;
    rejected: number;
    hired: number;
    withdrawn: number;
  };
}

export interface AdminJobFilters {
  status?: JobStatus;
  companyId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AdminApplicationFilters {
  status?: ApplicationStatus;
  jobId?: string;
  companyId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  companyId?: string;
  status?: JobStatus;
  deadline?: Date;
  salary?: string;
  location?: string;
  type?: string;
}

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
}

export interface BulkStatusUpdateRequest {
  applicationIds: string[];
  status: ApplicationStatus;
}

// Student Management Types
export interface StudentUser {
  id: string;
  email: string;
  name: string | null;
  studentId: string | null;
  branch: string | null; // Department
  currentYear: number | null; // Batch
  isFrozen: boolean;
  phone: string | null;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  profileStatus: string;
  verificationStatus: string; // VerificationStatus enum
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  education?: {
    gpa: string | null;
    degree: string;
  }[];
  applications?: {
    status: string;
  }[];
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  batch: number;
  cgpa: number;
  backlogs: number;
  placementStatus: PlacementStatus;
  profileStatus: ProfileStatus;
  isEligible: boolean;
  photoUrl?: string;
  resumeId?: string;
  linkedin?: string;
  github?: string;
  createdAt: string;
  updatedAt: string;
  profileLockedAt?: string;
  offers?: number;
  appliedJobs?: number;
}

export interface StudentFilters {
  batch?: number;
  department?: string;
  placementStatus?: PlacementStatus;
  profileStatus?: ProfileStatus;
  minCgpa?: number;
  maxCgpa?: number;
  isEligible?: boolean;
  search?: string;
}

export interface BulkStudentAction {
  studentIds: string[];
  action: 'lock' | 'unlock' | 'mark_eligible' | 'mark_ineligible';
}

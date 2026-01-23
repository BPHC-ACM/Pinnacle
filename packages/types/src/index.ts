// packages/types/src/index.ts

// --- Enums (Source of Truth) ---
export enum Sector {
  IT = 'IT',
  FINANCE = 'FINANCE',
  ECOMMERCE = 'ECOMMERCE',
  HEALTHCARE = 'HEALTHCARE',
  CONSULTING = 'CONSULTING',
  ANALYTICS = 'ANALYTICS',
  ELECTRONICS = 'ELECTRONICS',
  MECHANICS = 'MECHANICS',
  MANAGEMENT = 'MANAGEMENT',
  OTHERS = 'OTHERS',
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEWING = 'INTERVIEWING',
  REJECTED = 'REJECTED',
  HIRED = 'HIRED',
  WITHDRAWN = 'WITHDRAWN',
}

export type JobStatus = 'OPEN' | 'CLOSED' | 'PAUSED';

// --- Interfaces (DTOs) ---

export interface Company {
  id: string;
  name: string;
  website?: string;
  description?: string;
  logo?: string;
  industry?: string;
  size?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  createdAt: string; // Dates are strings over JSON
  updatedAt: string;
}

export interface JobQuestion {
  id: string;
  jobId: string;
  question: string;
  required: boolean;
  order: number;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  descriptionDocument?: string;
  location?: string;
  type?: string;
  salary?: string;
  deadline?: string; // Dates are strings over JSON
  status: JobStatus;
  questions?: JobQuestion[];
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
  createdAt: string; // Dates are strings over JSON
  updatedAt: string;
  company?: Company; // Often resolved in API responses
}

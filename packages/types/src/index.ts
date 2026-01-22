// packages/types/src/index.ts

// --- Enums (Source of Truth) ---
export enum Sector {
  ALL_SECTORS = 'ALL_SECTORS',
  ANALYTICS = 'ANALYTICS',
  CONSULTING = 'CONSULTING',
  COMPUTER_SCIENCE_SOFTWARE_IT = 'COMPUTER_SCIENCE_SOFTWARE_IT',
  E_COMMERCE = 'E_COMMERCE',
  EDUCATION = 'EDUCATION',
  ENGINEERING_TECHNOLOGY = 'ENGINEERING_TECHNOLOGY',
  FINANCE_BFSI = 'FINANCE_BFSI',
  FMCG = 'FMCG',
  HEALTHCARE = 'HEALTHCARE',
  MEDIA_ENTERTAINMENT = 'MEDIA_ENTERTAINMENT',
  RESEARCH_DEVELOPMENT = 'RESEARCH_DEVELOPMENT',
  TELECOM = 'TELECOM',
  ENERGY = 'ENERGY',
  MANUFACTURING_TECHNOLOGY = 'MANUFACTURING_TECHNOLOGY',
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

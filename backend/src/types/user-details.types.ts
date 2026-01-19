import { z } from 'zod';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

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

export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
  NATIVE = 'NATIVE',
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  picture?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  bio?: string;
  title?: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileRequest {
  name?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  bio?: string;
  title?: string;
  summary?: string;
}

export interface Experience {
  id: string;
  userId: string;
  company: string;
  position: string;
  location: string;
  sector?: Sector;
  salaryRange?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
  highlights: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExperienceRequest {
  company: string;
  position: string;
  location: string;
  sector?: Sector;
  salaryRange?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  highlights?: string[];
  order?: number;
}

export interface UpdateExperienceRequest {
  company?: string;
  position?: string;
  location?: string;
  sector?: Sector;
  salaryRange?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  highlights?: string[];
  order?: number;
}

export interface Education {
  id: string;
  userId: string;
  institution: string;
  degree: string;
  branch: string;
  rollNumber?: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  gpa?: string;
  achievements: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEducationRequest {
  institution: string;
  degree: string;
  branch: string;
  rollNumber?: string;
  location: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  achievements?: string[];
  order?: number;
}

export interface UpdateEducationRequest {
  institution?: string;
  degree?: string;
  branch?: string;
  rollNumber?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  achievements?: string[];
  order?: number;
}

export interface Skill {
  id: string;
  userId: string;
  category: string;
  items: string[];
  proficiency?: ProficiencyLevel;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSkillRequest {
  category: string;
  items: string[];
  proficiency?: ProficiencyLevel;
  order?: number;
}

export interface UpdateSkillRequest {
  category?: string;
  items?: string[];
  proficiency?: ProficiencyLevel;
  order?: number;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  domain: string;
  tools: string[];
  description: string;
  outcomes: string[];
  referenceUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequest {
  title: string;
  domain: string;
  tools?: string[];
  description: string;
  outcomes?: string[];
  referenceUrl?: string;
  order?: number;
}

export interface UpdateProjectRequest {
  title?: string;
  domain?: string;
  tools?: string[];
  description?: string;
  outcomes?: string[];
  referenceUrl?: string;
  order?: number;
}

export interface Certification {
  id: string;
  userId: string;
  name: string;
  issuer: string;
  date: Date;
  url?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCertificationRequest {
  name: string;
  issuer: string;
  date: string;
  url?: string;
  order?: number;
}

export interface UpdateCertificationRequest {
  name?: string;
  issuer?: string;
  date?: string;
  url?: string;
  order?: number;
}

export interface Language {
  id: string;
  userId: string;
  name: string;
  proficiency: ProficiencyLevel;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLanguageRequest {
  name: string;
  proficiency: ProficiencyLevel;
  order?: number;
}

export interface UpdateLanguageRequest {
  name?: string;
  proficiency?: ProficiencyLevel;
  order?: number;
}

// ZOD SCHEMAS

// User Profile Schemas
export const updateUserProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(50).nullable().optional(),
  location: z.string().max(255).nullable().optional(),
  linkedin: z.string().url().or(z.literal('')).nullable().optional(),
  github: z.string().url().or(z.literal('')).nullable().optional(),
  website: z.string().url().or(z.literal('')).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
  title: z.string().max(255).nullable().optional(),
  summary: z.string().max(2000).nullable().optional(),
});

// Experience Schemas
export const createExperienceSchema = z.object({
  company: z.string().min(1).max(255),
  position: z.string().min(1).max(255),
  location: z.string().min(1).max(255),
  sector: z
    .enum([
      'ALL_SECTORS',
      'ANALYTICS',
      'CONSULTING',
      'COMPUTER_SCIENCE_SOFTWARE_IT',
      'E_COMMERCE',
      'EDUCATION',
      'ENGINEERING_TECHNOLOGY',
      'FINANCE_BFSI',
      'FMCG',
      'HEALTHCARE',
      'MEDIA_ENTERTAINMENT',
      'RESEARCH_DEVELOPMENT',
      'TELECOM',
      'ENERGY',
      'MANUFACTURING_TECHNOLOGY',
      'OTHERS',
    ])
    .optional(),
  salaryRange: z.string().max(100).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .nullable() // Added nullable
    .optional(),
  current: z.boolean().optional(),
  description: z.string().max(2000).optional(),
  highlights: z.array(z.string().max(500)).optional(),
  order: z.number().int().min(0).optional(),
});

export const updateExperienceSchema = z.object({
  company: z.string().min(1).max(255).optional(),
  position: z.string().min(1).max(255).optional(),
  location: z.string().min(1).max(255).optional(),
  sector: z
    .enum([
      'ALL_SECTORS',
      'ANALYTICS',
      'CONSULTING',
      'COMPUTER_SCIENCE_SOFTWARE_IT',
      'E_COMMERCE',
      'EDUCATION',
      'ENGINEERING_TECHNOLOGY',
      'FINANCE_BFSI',
      'FMCG',
      'HEALTHCARE',
      'MEDIA_ENTERTAINMENT',
      'RESEARCH_DEVELOPMENT',
      'TELECOM',
      'ENERGY',
      'MANUFACTURING_TECHNOLOGY',
      'OTHERS',
    ])
    .optional(),
  salaryRange: z.string().max(100).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .nullable() // Added nullable
    .optional(),
  current: z.boolean().optional(),
  description: z.string().max(2000).optional(),
  highlights: z.array(z.string().max(500)).optional(),
  order: z.number().int().min(0).optional(),
});

// Education Schemas
export const createEducationSchema = z.object({
  institution: z.string().min(1).max(255),
  degree: z.string().min(1).max(255),
  branch: z.string().min(1).max(255),
  rollNumber: z.string().max(100).optional(),
  location: z.string().min(1).max(255),
  startDate: z.string().regex(/^\d{4}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .nullable() // Added nullable
    .optional(),
  gpa: z.string().max(20).optional(),
  achievements: z.array(z.string().max(500)).optional(),
  order: z.number().int().min(0).optional(),
});

export const updateEducationSchema = z.object({
  institution: z.string().min(1).max(255).optional(),
  degree: z.string().min(1).max(255).optional(),
  branch: z.string().min(1).max(255).optional(),
  rollNumber: z.string().max(100).optional(),
  location: z.string().min(1).max(255).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .nullable() // Added nullable
    .optional(),
  gpa: z.string().max(20).optional(),
  achievements: z.array(z.string().max(500)).optional(),
  order: z.number().int().min(0).optional(),
});

// Skill Schemas
export const createSkillSchema = z.object({
  category: z.string().min(1).max(255),
  items: z.array(z.string().min(1).max(255)).min(1),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'NATIVE']).optional(),
  order: z.number().int().min(0).optional(),
});

export const updateSkillSchema = z.object({
  category: z.string().min(1).max(255).optional(),
  items: z.array(z.string().min(1).max(255)).min(1).optional(),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'NATIVE']).optional(),
  order: z.number().int().min(0).optional(),
});

// Project Schemas
export const createProjectSchema = z.object({
  title: z.string().min(1).max(255),
  domain: z.string().min(1).max(255),
  tools: z.array(z.string().max(100)).optional(),
  description: z.string().min(1).max(5000),
  outcomes: z.array(z.string().max(500)).optional(),
  referenceUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int().min(0).optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  domain: z.string().min(1).max(255).optional(),
  tools: z.array(z.string().max(100)).optional(),
  description: z.string().min(1).max(5000).optional(),
  outcomes: z.array(z.string().max(500)).optional(),
  referenceUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int().min(0).optional(),
});

// Certification Schemas
export const createCertificationSchema = z.object({
  name: z.string().min(1).max(255),
  issuer: z.string().min(1).max(255),
  date: z.string().regex(/^\d{4}-\d{2}$/),
  url: z.string().url().optional().or(z.literal('')),
  order: z.number().int().min(0).optional(),
});

export const updateCertificationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  issuer: z.string().min(1).max(255).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  url: z.string().url().optional().or(z.literal('')),
  order: z.number().int().min(0).optional(),
});

// Language Schemas
export const createLanguageSchema = z.object({
  name: z.string().min(1).max(255),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'NATIVE']),
  order: z.number().int().min(0).optional(),
});

export const updateLanguageSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'NATIVE']).optional(),
  order: z.number().int().min(0).optional(),
});

// Position of Responsibility
export interface PositionOfResponsibility {
  id: string;
  userId: string;
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePositionOfResponsibilityRequest {
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  order?: number;
}

export interface UpdatePositionOfResponsibilityRequest {
  title?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  order?: number;
}

export const createPositionOfResponsibilitySchema = z.object({
  title: z.string().min(1).max(255),
  organization: z.string().min(1).max(255),
  startDate: z.string().regex(/^\d{4}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .nullable() // Added nullable
    .optional(),
  current: z.boolean().optional(),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0).optional(),
});

export const updatePositionOfResponsibilitySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  organization: z.string().min(1).max(255).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .nullable() // Added nullable
    .optional(),
  current: z.boolean().optional(),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0).optional(),
});

// Course
export interface Course {
  id: string;
  userId: string;
  name: string;
  institution: string;
  completionDate?: string;
  grade?: string;
  description?: string;
  url?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseRequest {
  name: string;
  institution: string;
  completionDate?: string;
  grade?: string;
  description?: string;
  url?: string;
  order?: number;
}

export interface UpdateCourseRequest {
  name?: string;
  institution?: string;
  completionDate?: string;
  grade?: string;
  description?: string;
  url?: string;
  order?: number;
}

export const createCourseSchema = z.object({
  name: z.string().min(1).max(255),
  institution: z.string().min(1).max(255),
  completionDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  grade: z.string().max(20).optional(),
  description: z.string().max(1000).optional(),
  url: z.string().url().optional().or(z.literal('')),
  order: z.number().int().min(0).optional(),
});

export const updateCourseSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  institution: z.string().min(1).max(255).optional(),
  completionDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  grade: z.string().max(20).optional(),
  description: z.string().max(1000).optional(),
  url: z.string().url().optional().or(z.literal('')),
  order: z.number().int().min(0).optional(),
});

// Generic Accomplishment (Awards, Certifications, Competitions, Conferences, Test Scores, Patents, Publications, Scholarships)
export enum AccomplishmentType {
  AWARD = 'AWARD',
  CERTIFICATION = 'CERTIFICATION',
  COMPETITION = 'COMPETITION',
  CONFERENCE = 'CONFERENCE',
  TEST_SCORE = 'TEST_SCORE',
  PATENT = 'PATENT',
  PUBLICATION = 'PUBLICATION',
  SCHOLARSHIP = 'SCHOLARSHIP',
}

export interface Accomplishment {
  id: string;
  userId: string;
  type: AccomplishmentType;
  title: string;
  issuer?: string; // Organization, institution, or issuing body
  date: string;
  description?: string;
  url?: string;
  metadata?: Record<string, unknown>; // For type-specific additional data
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccomplishmentRequest {
  type: AccomplishmentType;
  title: string;
  issuer?: string;
  date: string;
  description?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  order?: number;
}

export interface UpdateAccomplishmentRequest {
  type?: AccomplishmentType;
  title?: string;
  issuer?: string;
  date?: string;
  description?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  order?: number;
}

export const createAccomplishmentSchema = z.object({
  type: z.enum([
    'AWARD',
    'CERTIFICATION',
    'COMPETITION',
    'CONFERENCE',
    'TEST_SCORE',
    'PATENT',
    'PUBLICATION',
    'SCHOLARSHIP',
  ]),
  title: z.string().min(1).max(500),
  issuer: z.string().max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}$/),
  description: z.string().max(2000).optional(),
  url: z.string().url().optional().or(z.literal('')),
  metadata: z.record(z.string(), z.unknown()).optional(),
  order: z.number().int().min(0).optional(),
});

export const updateAccomplishmentSchema = z.object({
  type: z
    .enum([
      'AWARD',
      'CERTIFICATION',
      'COMPETITION',
      'CONFERENCE',
      'TEST_SCORE',
      'PATENT',
      'PUBLICATION',
      'SCHOLARSHIP',
    ])
    .optional(),
  title: z.string().min(1).max(500).optional(),
  issuer: z.string().max(255).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  description: z.string().max(2000).optional(),
  url: z.string().url().optional().or(z.literal('')),
  metadata: z.record(z.string(), z.unknown()).optional(),
  order: z.number().int().min(0).optional(),
});

// Extracurricular
export interface Extracurricular {
  id: string;
  userId: string;
  activity: string;
  role?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExtracurricularRequest {
  activity: string;
  role?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  order?: number;
}

export interface UpdateExtracurricularRequest {
  activity?: string;
  role?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  order?: number;
}

export const createExtracurricularSchema = z.object({
  activity: z.string().min(1).max(255),
  role: z.string().max(255).optional(),
  organization: z.string().max(255).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .nullable() // Added nullable
    .optional(),
  current: z.boolean().optional(),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0).optional(),
});

export const updateExtracurricularSchema = z.object({
  activity: z.string().min(1).max(255).optional(),
  role: z.string().max(255).optional(),
  organization: z.string().max(255).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .nullable() // Added nullable
    .optional(),
  current: z.boolean().optional(),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0).optional(),
});

// User Details (Personal Info)
export interface UserDetails {
  id: string;
  userId: string;
  name: string;
  branch: string;
  address: string;
  parentName: string;
  parentMobileNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDetailsRequest {
  name: string;
  branch: string;
  address: string;
  parentName: string;
  parentMobileNumber: string;
}

export const createUserDetailsSchema = z.object({
  name: z.string().min(1).max(255),
  branch: z.string().min(1).max(255),
  address: z.string().min(1).max(1000),
  parentName: z.string().min(1).max(255),
  parentMobileNumber: z.string().min(10).max(15),
});

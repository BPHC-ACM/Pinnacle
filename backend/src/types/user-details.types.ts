import { z } from 'zod';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
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
  startDate: string;
  endDate?: string;
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
  field: string;
  location: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  achievements: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEducationRequest {
  institution: string;
  degree: string;
  field: string;
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
  field?: string;
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
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSkillRequest {
  category: string;
  items: string[];
  order?: number;
}

export interface UpdateSkillRequest {
  category?: string;
  items?: string[];
  order?: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  highlights: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  github?: string;
  highlights?: string[];
  order?: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  technologies?: string[];
  url?: string;
  github?: string;
  highlights?: string[];
  order?: number;
}

export interface Certification {
  id: string;
  userId: string;
  name: string;
  issuer: string;
  date: string;
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
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Basic';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLanguageRequest {
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Basic';
  order?: number;
}

export interface UpdateLanguageRequest {
  name?: string;
  proficiency?: 'Native' | 'Fluent' | 'Professional' | 'Basic';
  order?: number;
}

// ZOD SCHEMAS

// User Profile Schemas
export const updateUserProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(50).optional(),
  location: z.string().max(255).optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(1000).optional(),
  title: z.string().max(255).optional(),
  summary: z.string().max(2000).optional(),
});

// Experience Schemas
export const createExperienceSchema = z.object({
  company: z.string().min(1).max(255),
  position: z.string().min(1).max(255),
  location: z.string().min(1).max(255),
  startDate: z.string().regex(/^\d{4}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
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
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
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
  field: z.string().min(1).max(255),
  location: z.string().min(1).max(255),
  startDate: z.string().regex(/^\d{4}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  gpa: z.string().max(20).optional(),
  achievements: z.array(z.string().max(500)).optional(),
  order: z.number().int().min(0).optional(),
});

export const updateEducationSchema = z.object({
  institution: z.string().min(1).max(255).optional(),
  degree: z.string().min(1).max(255).optional(),
  field: z.string().min(1).max(255).optional(),
  location: z.string().min(1).max(255).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  gpa: z.string().max(20).optional(),
  achievements: z.array(z.string().max(500)).optional(),
  order: z.number().int().min(0).optional(),
});

// Skill Schemas
export const createSkillSchema = z.object({
  category: z.string().min(1).max(255),
  items: z.array(z.string().min(1).max(255)).min(1),
  order: z.number().int().min(0).optional(),
});

export const updateSkillSchema = z.object({
  category: z.string().min(1).max(255).optional(),
  items: z.array(z.string().min(1).max(255)).min(1).optional(),
  order: z.number().int().min(0).optional(),
});

// Project Schemas
export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(2000),
  technologies: z.array(z.string().max(100)).optional(),
  url: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  highlights: z.array(z.string().max(500)).optional(),
  order: z.number().int().min(0).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(2000).optional(),
  technologies: z.array(z.string().max(100)).optional(),
  url: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  highlights: z.array(z.string().max(500)).optional(),
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
  proficiency: z.enum(['Native', 'Fluent', 'Professional', 'Basic']),
  order: z.number().int().min(0).optional(),
});

export const updateLanguageSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  proficiency: z.enum(['Native', 'Fluent', 'Professional', 'Basic']).optional(),
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
  metadata: z.record(z.unknown()).optional(),
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
  metadata: z.record(z.unknown()).optional(),
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
    .optional(),
  current: z.boolean().optional(),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0).optional(),
});

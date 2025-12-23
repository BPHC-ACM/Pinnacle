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

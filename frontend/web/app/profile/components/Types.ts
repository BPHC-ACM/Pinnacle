// Enums based on the Prisma schema
export enum Sector {
  IT = 'IT',
  FINANCE = 'FINANCE',
  ECOMMERCE = 'ECOMMERCE',
  HEALTHCARE = 'HEALTHCARE',
  CONSULTING = 'CONSULTING',
  ANALYTICS = 'ANALYTICS',
  EDUCATION = 'EDUCATION',
  ELECTRONICS = 'ELECTRONICS',
  MECHANICS = 'MECHANICS',
  MANAGEMENT = 'MANAGEMENT',
  OTHERS = 'OTHERS',
}

export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
  NATIVE = 'NATIVE',
}

// Interfaces for profile-related data
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  sector?: Sector;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  branch: string;
  rollNumber?: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  gpa?: string;
  achievements: string[];
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
  proficiency?: ProficiencyLevel;
}

export interface Project {
  id: string;
  title: string;
  tools: string[];
  description: string;
  domain: string;
  referenceUrl?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: Date;
  url?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: ProficiencyLevel;
}

export type TabType =
  | 'personal'
  | 'education'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages';

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

import { z } from 'zod';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyRequest {
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
}

export interface UpdateCompanyRequest {
  name?: string;
  website?: string;
  description?: string;
  logo?: string;
  industry?: string;
  size?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
}

// ZOD SCHEMAS

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  website: z.string().url('Invalid URL').or(z.literal('')).optional(),
  description: z.string().optional(),
  logo: z.string().url('Invalid logo URL').or(z.literal('')).optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')).optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').optional(),
  website: z.string().url('Invalid URL').or(z.literal('')).optional(),
  description: z.string().optional(),
  logo: z.string().url('Invalid logo URL').or(z.literal('')).optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')).optional(),
});

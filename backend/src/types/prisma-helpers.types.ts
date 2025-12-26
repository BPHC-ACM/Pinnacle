import type { Prisma } from '@prisma/client';

// Helper types for Prisma operations with proper typing
export type PrismaFindUniqueResult<T> = T | null;
export type PrismaFindFirstResult<T> = T | null;
export type PrismaFindManyResult<T> = T[];
export type PrismaCreateResult<T> = T;
export type PrismaUpdateResult<T> = T;
export type PrismaDeleteResult<T> = T;
export type PrismaCountResult = number;
export type PrismaAggregateResult<T> = T;

// User types
export type UserWithPicture = { id: string; picture: string | null };
export type UserBasic = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  role: string;
};

// Company types
export type CompanyWithLogo = { id: string; logo: string | null; deletedAt: Date | null };
export type CompanyBasic = {
  id: string;
  name: string;
  logo: string | null;
  deletedAt: Date | null;
};

// Job types
export type JobWithLogo = { id: string; logo: string | null; deletedAt: Date | null };
export type JobWithDocument = { id: string; descriptionDocument: string | null; deletedAt: Date | null };
export type JobBasic = {
  id: string;
  title: string;
  companyId: string;
  logo: string | null;
  descriptionDocument: string | null;
  deletedAt: Date | null;
};

// Resume types
export type ResumeFile = {
  id: string;
  userId: string;
  objectKey: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
};

// Application types
export type ApplicationBasic = {
  id: string;
  userId: string;
  jobId: string;
  resumeId: string | null;
  status: string;
};

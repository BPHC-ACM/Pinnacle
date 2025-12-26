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
export interface UserWithPicture {
  id: string;
  picture: string | null;
}
export interface UserBasic {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  role: string;
}

// Company types
export interface CompanyWithLogo {
  id: string;
  logo: string | null;
  deletedAt: Date | null;
}
export interface CompanyBasic {
  id: string;
  name: string;
  logo: string | null;
  deletedAt: Date | null;
}

// Job types
export interface JobWithDocument {
  id: string;
  descriptionDocument: string | null;
  deletedAt: Date | null;
}
export interface JobBasic {
  id: string;
  title: string;
  companyId: string;
  logo: string | null;
  descriptionDocument: string | null;
  deletedAt: Date | null;
}

// Resume types
export interface ResumeFile {
  id: string;
  userId: string;
  objectKey: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
}

// Application types
export interface ApplicationBasic {
  id: string;
  userId: string;
  jobId: string;
  resumeId: string | null;
  status: string;
}

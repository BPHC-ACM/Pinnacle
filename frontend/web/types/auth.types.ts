export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  JPT = 'JPT',
  SPT = 'SPT',
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleId?: string; // Optional now as it might not be present in all contexts
  role: UserRole;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  bio?: string;
  title?: string;
  summary?: string;
  createdAt?: string;
  updatedAt?: string;
  hasOnboarded?: boolean;
  studentId?: string;
  branch?: string;
  currentYear?: number;
  isFrozen?: boolean;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  parentRelation?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

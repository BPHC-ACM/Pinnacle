export enum UserRole {
  USER = 'USER',
  JPT = 'JPT', // Junior Placement Team - Attendance management only
  SPT = 'SPT', // Senior Placement Team - Full administrative control
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

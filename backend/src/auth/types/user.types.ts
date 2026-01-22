export enum UserRole {
  USER = 'USER',
  JPT = 'JPT', // Junior Placement Team - Attendance management only
  SPT = 'SPT', // Senior Placement Team - Full administrative control
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  picture?: string;
  googleId: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

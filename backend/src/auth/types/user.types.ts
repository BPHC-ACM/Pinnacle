export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
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

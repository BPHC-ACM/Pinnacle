import type { Request, Response } from 'express';

import { logger } from '../../config/logger.config';
import { prisma } from '../../db/client';
import { UserRole } from '../types/user.types';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';

interface DevLoginBody {
  email: string;
  password: string;
}

// Development only - simple login without Google OAuth
export const devLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({ error: 'Dev login not available in production' });
      return;
    }

    const { email, password } = req.body as DevLoginBody;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    // Simple hardcoded check for test admin
    if (email === 'admin@gmail.com' && password === 'admin_pw') {
      // Find or create the admin user
      let dbUser = await prisma.user.findUnique({
        where: { email: 'admin@gmail.com' },
      });

      if (!dbUser) {
        // Create admin user if doesn't exist
        dbUser = await prisma.user.create({
          data: {
            email: 'admin@gmail.com',
            name: 'SPT Admin User',
            googleId: 'dev-admin-google-id',
            role: 'SPT',
            phone: '+1234567890',
          },
        });
      } else if (!['SPT', 'JPT'].includes(dbUser.role)) {
        // Update role to SPT if user exists but isn't an admin
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { role: 'SPT' },
        });
      }

      logger.info({ userId: dbUser.id, email: dbUser.email }, 'Dev login successful');

      // Generate JWT tokens
      const accessToken = generateAccessToken({
        userId: dbUser.id,
        email: dbUser.email,
        role: dbUser.role as UserRole,
      });

      const refreshToken = generateRefreshToken({
        userId: dbUser.id,
        email: dbUser.email,
        role: dbUser.role as UserRole,
      });

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        },
      });
      return;
    }

    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    logger.error({ err: error }, 'Dev login failed');
    res.status(500).json({
      error: 'Login failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

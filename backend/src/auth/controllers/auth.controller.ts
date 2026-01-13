import type { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

import { logger } from '../../config/logger.config';
import prisma from '../../db/client';
import { config } from '../config/env.config';
import { UserRole } from '../types/user.types';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';

interface RefreshTokenRequestBody {
  refreshToken: string;
}

const oauth2Client = new OAuth2Client(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri,
);

// Step 1: Generate Google OAuth URL and redirect
export const googleLogin = (_req: Request, res: Response): void => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent',
  });

  res.json({ authUrl });
};

// Step 2: Handle Google OAuth callback
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Authorization code required' });
      return;
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      res.status(400).json({ error: 'Failed to get user info' });
      return;
    }

    if (!payload.email) {
      res.status(400).json({ error: 'Email is required from Google' });
      return;
    }

    const name = payload.name ?? payload.email.split('@')[0];

    // Check if user exists by googleId
    let dbUser = await prisma.user.findUnique({
      where: { googleId: payload.sub },
    });

    if (dbUser) {
      // Update existing user
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          email: payload.email,
          name: name,
          picture: payload.picture,
        },
      });
    } else {
      // Check if user exists by email
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (existingUserByEmail) {
        // Link Google account to existing user
        dbUser = await prisma.user.update({
          where: { id: existingUserByEmail.id },
          data: {
            googleId: payload.sub,
            name: name,
            picture: payload.picture,
          },
        });
      } else {
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            googleId: payload.sub,
            email: payload.email,
            name: name ?? payload.email.split('@')[0] ?? '',
            picture: payload.picture,
            role: 'USER',
          },
        });
      }
    }

    logger.info({ userId: dbUser.id, email: dbUser.email }, 'User authenticated via Google OAuth');

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

    // In production, save refreshToken to database
    // Redirect to frontend with tokens
    res.redirect(
      `${config.frontendUrl}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`,
    );
  } catch (error) {
    logger.error({ err: error }, 'Google OAuth authentication failed');
    res.status(500).json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

// For Google SignIn in flutter app
export const googleMobileLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body as { idToken?: string };

    if (!idToken) {
      res.status(400).json({ error: 'ID Token is required' });
      return;
    }

    // Verify the ID Token from the mobile app
    const ticket = await oauth2Client.verifyIdToken({
      idToken: idToken,
      audience: config.googleClientId, // Ensure this matches the client ID used in the Flutter app
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      res.status(400).json({ error: 'Invalid token payload' });
      return;
    }

    const name = payload.name ?? payload.email.split('@')[0];

    // Reuse your existing logic to Find or Create User
    let dbUser = await prisma.user.findUnique({
      where: { googleId: payload.sub },
    });

    if (dbUser) {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { email: payload.email, name: name, picture: payload.picture },
      });
    } else {
      const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
      if (existingUser) {
        dbUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { googleId: payload.sub, name: name, picture: payload.picture },
        });
      } else {
        dbUser = await prisma.user.create({
          data: {
            googleId: payload.sub,
            email: payload.email,
            name: name ?? '',
            picture: payload.picture,
            role: 'USER',
          },
        });
      }
    }

    // Generate Tokens
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

    // Return JSON directly instead of redirecting
    res.json({ accessToken, refreshToken, user: dbUser });
  } catch (error) {
    logger.error({ err: error }, 'Mobile Google Login failed');
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Step 3: Refresh access token
export const refreshAccessToken = (
  req: Request<object, object, RefreshTokenRequestBody>,
  res: Response,
): void => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== 'string') {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token (role is already in the decoded token)
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    logger.debug({ userId: decoded.userId }, 'Access token refreshed');
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    logger.warn({ err: error }, 'Invalid refresh token provided');
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

// Get current user info
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set by auth middleware, contains basic info from JWT
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch full user details from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch user details');
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

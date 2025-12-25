import type { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

import { logger } from '../../config/logger.config';
import { config } from '../config/env.config';
import { User, UserRole } from '../types/user.types';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';

interface RefreshTokenRequestBody {
  refreshToken: string;
}

const oauth2Client = new OAuth2Client(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri,
);

// Step 1: Generate Google OAuth URL
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

    // Create user object (in production, save/fetch from database to get actual role)
    const user: User = {
      id: payload.sub,
      email: payload.email!,
      name: payload.name!,
      role: UserRole.USER, // Default role, fetch from DB in production
      picture: payload.picture,
      googleId: payload.sub,
    };

    logger.info({ userId: user.id, email: user.email }, 'User authenticated via Google OAuth');

    // Generate JWT tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // In production, save refreshToken to database
    // Redirect to frontend with tokens
    res.redirect(
      `${config.frontendUrl}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`,
    );
  } catch (error) {
    logger.error({ err: error }, 'Google OAuth authentication failed');
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
export const getMe = (req: Request, res: Response): void => {
  // req.user is set by auth middleware
  res.json({ user: req.user });
};

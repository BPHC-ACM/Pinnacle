import type { Request, Response, NextFunction } from 'express';

import { logger } from '../../config/logger.config';
import { verifyAccessToken } from '../utils/jwt.utils';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
      logger.warn(
        { path: req.path, method: req.method },
        'Authentication failed: No token provided',
      );
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user info to request (you'd fetch full user from DB in production)
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: '', // You'd fetch from DB
      googleId: '',
    };

    next();
  } catch (error) {
    logger.warn({ err: error, path: req.path }, 'Invalid or expired token');
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

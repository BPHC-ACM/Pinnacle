import type { Request, Response, NextFunction } from 'express';

import { logger } from '../../config/logger.config';
import { UserRole } from '../types/user.types';

// Must be used after authenticateToken middleware
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if user exists (should be attached by authenticateToken middleware)
    if (!req.user) {
      logger.warn(
        { path: req.path, method: req.method },
        'Admin check failed: User not authenticated',
      );
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if user has admin role
    if (req.user.role !== UserRole.ADMIN) {
      logger.warn(
        {
          userId: req.user.id,
          email: req.user.email,
          role: req.user.role,
          path: req.path,
          method: req.method,
        },
        'Admin access denied: Insufficient permissions',
      );
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    // User is admin, proceed
    logger.info(
      {
        userId: req.user.id,
        email: req.user.email,
        path: req.path,
        method: req.method,
      },
      'Admin access granted',
    );
    next();
  } catch (error) {
    logger.error({ err: error, path: req.path }, 'Admin middleware error');
    res.status(500).json({ error: 'Internal server error' });
  }
};

import type { Request, Response, NextFunction } from 'express';

import { logger } from '../config/logger.config.js';
import { AuthError } from '../types/errors.types.js';
import { UserRole } from '../types/user-details.types.js';

/**
 * Middleware to check if user has admin role (ADMIN, SUPER_ADMIN, JPT, or SPT)
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userRole = req.user?.role;

    if (
      !userRole ||
      ![UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.JPT, UserRole.SPT].includes(
        userRole as UserRole,
      )
    ) {
      logger.warn(
        { userId: req.user?.id, role: userRole, path: req.path },
        'Access denied: Admin privileges required',
      );
      throw new AuthError('Admin privileges required', 'Forbidden');
    }

    next();
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(403).json({ error: error.message });
      return;
    }
    logger.error({ err: error }, 'Error in requireAdmin middleware');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to check if user has super admin role
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userRole = req.user?.role as UserRole | undefined;

    if (userRole !== UserRole.SUPER_ADMIN) {
      logger.warn(
        { userId: req.user?.id, role: userRole, path: req.path },
        'Access denied: Super admin privileges required',
      );
      throw new AuthError('Super admin privileges required', 'Forbidden');
    }

    next();
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(403).json({ error: error.message });
      return;
    }
    logger.error({ err: error }, 'Error in requireSuperAdmin middleware');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to check if user has JPT (Job Placement Team) role
 */
export const requireJPT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userRole = req.user?.role;

    if (![UserRole.SUPER_ADMIN, UserRole.JPT].includes(userRole as UserRole)) {
      logger.warn(
        { userId: req.user?.id, role: userRole, path: req.path },
        'Access denied: JPT privileges required',
      );
      throw new AuthError('JPT privileges required', 'Forbidden');
    }

    next();
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(403).json({ error: error.message });
      return;
    }
    logger.error({ err: error }, 'Error in requireJPT middleware');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to check if user has SPT (Student Placement Team) role
 */
export const requireSPT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userRole = req.user?.role;

    if (![UserRole.SUPER_ADMIN, UserRole.SPT].includes(userRole as UserRole)) {
      logger.warn(
        { userId: req.user?.id, role: userRole, path: req.path },
        'Access denied: SPT privileges required',
      );
      throw new AuthError('SPT privileges required', 'Forbidden');
    }

    next();
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(403).json({ error: error.message });
      return;
    }
    logger.error({ err: error }, 'Error in requireSPT middleware');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware factory to check if user has any of the specified roles
 */
export const requireAnyRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userRole = req.user?.role;

      if (!userRole || !roles.includes(userRole as UserRole)) {
        logger.warn(
          { userId: req.user?.id, role: userRole, requiredRoles: roles, path: req.path },
          'Access denied: Required role not found',
        );
        throw new AuthError(`One of these roles required: ${roles.join(', ')}`, 'Forbidden');
      }

      next();
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(403).json({ error: error.message });
        return;
      }
      logger.error({ err: error }, 'Error in requireAnyRole middleware');
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

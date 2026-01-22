import type { Request, Response, NextFunction } from 'express';

import { logger } from '../config/logger.config.js';
import { AuthError } from '../types/errors.types.js';
import { UserRole } from '../types/user-details.types.js';

/**
 * Middleware to check if user has admin role (JPT or SPT)
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userRole = req.user?.role;

    if (!userRole || ![UserRole.JPT, UserRole.SPT].includes(userRole as UserRole)) {
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
 * Middleware to check if user has senior admin role (SPT - full administrative control)
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userRole = req.user?.role as UserRole | undefined;

    if (userRole !== UserRole.SPT) {
      logger.warn(
        { userId: req.user?.id, role: userRole, path: req.path },
        'Access denied: Senior admin privileges required (SPT)',
      );
      throw new AuthError('Senior admin privileges required (SPT)', 'Forbidden');
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
 * Middleware to check if user has JPT (Junior Placement Team) role
 * JPT has attendance-only permissions, SPT has override access
 */
export const requireJPT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userRole = req.user?.role;

    if (![UserRole.SPT, UserRole.JPT].includes(userRole as UserRole)) {
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
 * Middleware to check if user has SPT (Senior Placement Team) role
 * SPT has full administrative control over all operations
 */
export const requireSPT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userRole = req.user?.role as UserRole | undefined;

    if (userRole !== UserRole.SPT) {
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

/**
 * Middleware to check if JPT is accessing allowed attendance types (OA and PPT only)
 * SPT has unrestricted access
 */
export const restrictJPTAttendance = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userRole = req.user?.role as UserRole | undefined;
    // Type guard and safe access for req.body.eventType
    const bodyEventType =
      req.body && typeof req.body === 'object' && 'eventType' in req.body
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (req.body.eventType as string | undefined)
        : undefined;
    const eventType = bodyEventType ?? (req.query?.eventType as string | undefined);

    // SPT has full access
    if (userRole === UserRole.SPT) {
      next();
      return;
    }

    // JPT can only access OA and PPT attendance
    if (userRole === UserRole.JPT) {
      if (!eventType || !['OA', 'PPT'].includes(eventType)) {
        logger.warn(
          { userId: req.user?.id, role: userRole, eventType, path: req.path },
          'Access denied: JPT can only access OA and PPT attendance',
        );
        throw new AuthError(
          'JPT can only manage attendance for Online Assessments (OA) and Pre-Placement Talks (PPT)',
          'Forbidden',
        );
      }
      next();
      return;
    }

    // Any other role shouldn't reach here, but deny access
    throw new AuthError('Insufficient privileges', 'Forbidden');
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(403).json({ error: error.message });
      return;
    }
    logger.error({ err: error }, 'Error in restrictJPTAttendance middleware');
    res.status(500).json({ error: 'Internal server error' });
  }
};

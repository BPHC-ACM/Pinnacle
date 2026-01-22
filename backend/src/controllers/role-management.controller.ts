import type { Request, Response } from 'express';

import { logger } from '../config/logger.config';
import { prisma } from '../db/client';
import { AuthError, NotFoundError, ValidationError } from '../types/errors.types';
import { UserRole } from '../types/user-details.types';

/**
 * Get admin ID from request
 */
const getAdminId = (req: Request): string => {
  const adminId = req.user?.id;
  if (!adminId) {
    throw new AuthError('Admin not authenticated', 'Unauthorized');
  }
  return adminId;
};

/**
 * Grant role to a user (SPT only)
 * @route POST /api/admin/roles/grant
 */
export async function grantRole(req: Request, res: Response): Promise<void> {
  try {
    const adminId = getAdminId(req);
    const { userId, role, remarks } = req.body as {
      userId: string;
      role: UserRole;
      remarks?: string;
    };

    // Validate role
    if (!userId || !role) {
      throw new ValidationError('User ID and role are required', 'Invalid request');
    }

    // Only allow granting SPT, JPT, or ADMIN roles
    if (![UserRole.SPT, UserRole.JPT, UserRole.ADMIN].includes(role)) {
      throw new ValidationError(
        'Invalid role. Can only grant SPT, JPT, or ADMIN roles',
        'Invalid role',
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`, 'User not found');
    }

    // Check if user already has an active admin role

    const existingActiveRole = await prisma.adminRole.findFirst({
      where: {
        userId,
        role,
        isActive: true,
      },
    });

    if (existingActiveRole) {
      throw new ValidationError(`User already has an active ${role} role`, 'Role already assigned');
    }

    // Use a transaction to update both User and AdminRole tables

    const result = await prisma.$transaction(async (tx) => {
      // Update user role in User table
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          updatedAt: true,
        },
      });

      // Create AdminRole record to track who granted the role and when

      const adminRole = await tx.adminRole.create({
        data: {
          userId,
          role,
          grantedBy: adminId,
          remarks,
          isActive: true,
        },
        include: {
          grantor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return { updatedUser, adminRole };
    });

    logger.info(
      {
        adminId,
        userId,
        oldRole: user.role,
        newRole: role,
        remarks,
      },
      'User role granted',
    );

    res.json({
      message: `Role ${role} granted successfully to ${user.name}`,

      user: result.updatedUser,

      adminRole: result.adminRole,
    });
  } catch (error) {
    if (
      error instanceof AuthError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      throw error;
    }
    logger.error({ err: error }, 'Error granting role');
    throw new Error('Failed to grant role');
  }
}

/**
 * Revoke role from a user (SPT only) - revert to USER role
 * @route POST /api/admin/roles/revoke
 */
export async function revokeRole(req: Request, res: Response): Promise<void> {
  try {
    const adminId = getAdminId(req);
    const { userId, remarks } = req.body as { userId: string; remarks?: string };

    if (!userId) {
      throw new ValidationError('User ID is required', 'Invalid request');
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`, 'User not found');
    }

    // Prevent revoking SUPER_ADMIN role
    if (user.role === (UserRole.SUPER_ADMIN as string)) {
      throw new ValidationError('Cannot revoke SUPER_ADMIN role', 'Invalid operation');
    }

    // Use a transaction to update both User and AdminRole tables

    const result = await prisma.$transaction(async (tx) => {
      // Revert to USER role
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { role: UserRole.USER },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          updatedAt: true,
        },
      });

      // Mark all active admin roles as revoked

      await tx.adminRole.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
          revokedAt: new Date(),
          revokedBy: adminId,
          remarks: remarks ?? 'Role revoked by SPT',
        },
      });

      return { updatedUser };
    });

    logger.info(
      {
        adminId,
        userId,
        oldRole: user.role,
        newRole: UserRole.USER,
        remarks,
      },
      'User role revoked',
    );

    res.json({
      message: `Role revoked successfully for ${user.name}. User is now a regular USER`,

      user: result.updatedUser,
    });
  } catch (error) {
    if (
      error instanceof AuthError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      throw error;
    }
    logger.error({ err: error }, 'Error revoking role');
    throw new Error('Failed to revoke role');
  }
}

/**
 * Get all users with admin roles (SPT, JPT, ADMIN)
 * @route GET /api/admin/roles
 */
export async function getAdminUsers(_req: Request, res: Response): Promise<void> {
  try {
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.SUPER_ADMIN, UserRole.SPT, UserRole.JPT, UserRole.ADMIN],
        },
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        picture: true,
        studentId: true,
        branch: true,
        currentYear: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });

    res.json({
      count: adminUsers.length,
      users: adminUsers,
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching admin users');
    throw new Error('Failed to fetch admin users');
  }
}

/**
 * Search for users to grant roles to
 * @route GET /api/admin/roles/search?q=query
 */
export async function searchUsers(req: Request, res: Response): Promise<void> {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      throw new ValidationError('Search query is required', 'Invalid query');
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { deletedAt: null },
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { studentId: { contains: q, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        picture: true,
        studentId: true,
        branch: true,
        currentYear: true,
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    res.json({
      count: users.length,
      users,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logger.error({ err: error }, 'Error searching users');
    throw new Error('Failed to search users');
  }
}

/**
 * Get admin role history for a user or all users
 * @route GET /api/admin/roles/history?userId=xxx
 */
export async function getAdminRoleHistory(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.query;

    const where = userId ? { userId: userId as string } : {};

    const history = await prisma.adminRole.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
          },
        },
        grantor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        revoker: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { grantedAt: 'desc' },
      take: 100,
    });

    res.json({
      count: history.length,

      history,
    });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching admin role history');
    throw new Error('Failed to fetch admin role history');
  }
}

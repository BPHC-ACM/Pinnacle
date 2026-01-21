import type { Request, Response } from 'express';

import { prisma } from '../db/client';
import { AuthError, NotFoundError, ValidationError } from '../types/errors.types';
import { UserRole } from '../types/user-details.types';
import { logger } from '../config/logger.config';

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
    const { userId, role } = req.body as { userId: string; role: UserRole };

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

    // Update user role
    const updatedUser = await prisma.user.update({
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

    logger.info(
      {
        adminId,
        userId,
        oldRole: user.role,
        newRole: role,
      },
      'User role granted',
    );

    res.json({
      message: `Role ${role} granted successfully to ${user.name}`,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof AuthError || error instanceof ValidationError || error instanceof NotFoundError) {
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
    const { userId } = req.body as { userId: string };

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
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ValidationError('Cannot revoke SUPER_ADMIN role', 'Invalid operation');
    }

    // Revert to USER role
    const updatedUser = await prisma.user.update({
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

    logger.info(
      {
        adminId,
        userId,
        oldRole: user.role,
        newRole: UserRole.USER,
      },
      'User role revoked',
    );

    res.json({
      message: `Role revoked successfully for ${user.name}. User is now a regular USER`,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof AuthError || error instanceof ValidationError || error instanceof NotFoundError) {
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
export async function getAdminUsers(req: Request, res: Response): Promise<void> {
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
      orderBy: [
        { role: 'asc' },
        { name: 'asc' },
      ],
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

import { logger } from '../../config/logger.config';
import { prisma } from '../../db/client';
import { NotFoundError, ValidationError } from '../../types/errors.types';
import type { FreezeStudentRequest } from '../../types/user-details.types';

class AdminStudentService {
  /**
   * Freeze or unfreeze a student account
   */
  async freezeStudent(data: FreezeStudentRequest, adminId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new NotFoundError('User not found', 'User not found');
      }

      await prisma.user.update({
        where: { id: data.userId },
        data: { isFrozen: data.isFrozen },
      });

      logger.info(
        {
          userId: data.userId,
          isFrozen: data.isFrozen,
          adminId,
          reason: data.reason,
        },
        `Student ${data.isFrozen ? 'frozen' : 'unfrozen'} successfully`,
      );
    } catch (error) {
      logger.error({ err: error, userId: data.userId }, 'Error freezing student');
      throw error;
    }
  }

  /**
   * Soft delete a student (set deletedAt timestamp)
   */
  async deleteStudent(userId: string, adminId: string, reason?: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundError('User not found', 'User not found');
      }

      if (user.deletedAt) {
        throw new ValidationError('User is already deleted', 'User already deleted');
      }

      await prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
      });

      logger.info(
        {
          userId,
          adminId,
          reason,
        },
        'Student deleted successfully',
      );
    } catch (error) {
      logger.error({ err: error, userId }, 'Error deleting student');
      throw error;
    }
  }

  /**
   * Restore a deleted student
   */
  async restoreStudent(userId: string, adminId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundError('User not found', 'User not found');
      }

      if (!user.deletedAt) {
        throw new ValidationError('User is not deleted', 'User is not deleted');
      }

      await prisma.user.update({
        where: { id: userId },
        data: { deletedAt: null },
      });

      logger.info({ userId, adminId }, 'Student restored successfully');
    } catch (error) {
      logger.error({ err: error, userId }, 'Error restoring student');
      throw error;
    }
  }

  /**
   * Get all students with filters
   */
  async getStudents(filters: {
    branch?: string;
    currentYear?: number;
    isFrozen?: boolean;
    includeDeleted?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    students: {
      id: string;
      email: string;
      name: string | null;
      studentId: string | null;
      branch: string | null;
      currentYear: number | null;
      isFrozen: boolean;
      deletedAt: Date | null;
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 50, search, includeDeleted = false, ...whereFilters } = filters;

      const where: {
        role?: 'USER';
        branch?: string;
        currentYear?: number;
        isFrozen?: boolean;
        deletedAt?: Date | null;
        OR?: {
          name?: { contains: string; mode: 'insensitive' };
          email?: { contains: string; mode: 'insensitive' };
          studentId?: { contains: string; mode: 'insensitive' };
        }[];
      } = {
        role: 'USER',
        ...whereFilters,
      };

      if (!includeDeleted) {
        where.deletedAt = null;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { studentId: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [students, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            studentId: true,
            branch: true,
            currentYear: true,
            isFrozen: true,
            phone: true,
            parentName: true,
            parentEmail: true,
            parentPhone: true,
            profileStatus: true,
            verificationStatus: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        students,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error({ err: error }, 'Error fetching students');
      throw error;
    }
  }

  /**
   * Bulk freeze students
   */
  async bulkFreezeStudents(userIds: string[], isFrozen: boolean, adminId: string): Promise<number> {
    try {
      const result = await prisma.user.updateMany({
        where: {
          id: { in: userIds },
          role: 'USER',
        },
        data: { isFrozen },
      });

      logger.info(
        {
          count: result.count,
          isFrozen,
          adminId,
        },
        `Bulk ${isFrozen ? 'freeze' : 'unfreeze'} completed`,
      );

      return result.count;
    } catch (error) {
      logger.error({ err: error }, 'Error in bulk freeze operation');
      throw error;
    }
  }
}

export default new AdminStudentService();

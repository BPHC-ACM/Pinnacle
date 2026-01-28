import { logger } from '../../config/logger.config';
import { prisma } from '../../db/client';
import { NotFoundError } from '../../types/errors.types';
import type {
  CreateJobEligibilityRequest,
  UpdateJobEligibilityRequest,
  JobEligibility,
  MarkAttendanceRequest,
  AttendanceRecord,
  BulkMarkAttendanceRequest,
  AttendanceType,
} from '../../types/job.types';

class JobEligibilityService {
  /**
   * Create eligibility criteria for a job
   */
  async createEligibility(
    jobId: string,
    data: CreateJobEligibilityRequest,
  ): Promise<JobEligibility> {
    try {
      // Check if job exists
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) {
        throw new NotFoundError('Job not found', 'Job not found');
      }

      // Delete existing eligibility criteria if any
      await prisma.jobEligibility.deleteMany({
        where: { jobId },
      });

      const eligibility = await prisma.jobEligibility.create({
        data: {
          jobId,
          minCgpa: data.minCgpa,
          maxActiveBacklogs: data.maxActiveBacklogs,
          maxTotalBacklogs: data.maxTotalBacklogs,
          allowedBranches: data.allowedBranches ?? [],
          allowedYears: data.allowedYears ?? [],
          customCriteria: (data.customCriteria ?? undefined) as never,
        },
      });

      logger.info({ jobId, eligibilityId: eligibility.id }, 'Job eligibility created');
      return eligibility as JobEligibility;
    } catch (error) {
      logger.error({ err: error, jobId }, 'Error creating job eligibility');
      throw error;
    }
  }

  /**
   * Update eligibility criteria for a job
   */
  async updateEligibility(
    jobId: string,
    data: UpdateJobEligibilityRequest,
  ): Promise<JobEligibility> {
    try {
      const existing = await prisma.jobEligibility.findFirst({
        where: { jobId },
      });

      if (!existing) {
        // Create if doesn't exist
        return this.createEligibility(jobId, data);
      }

      const eligibility = await prisma.jobEligibility.update({
        where: { id: existing.id },
        data: {
          minCgpa: data.minCgpa,
          maxActiveBacklogs: data.maxActiveBacklogs,
          maxTotalBacklogs: data.maxTotalBacklogs,
          allowedBranches: data.allowedBranches,
          allowedYears: data.allowedYears,
          customCriteria: (data.customCriteria ?? undefined) as never,
        },
      });

      logger.info({ jobId, eligibilityId: eligibility.id }, 'Job eligibility updated');
      return eligibility as JobEligibility;
    } catch (error) {
      logger.error({ err: error, jobId }, 'Error updating job eligibility');
      throw error;
    }
  }

  /**
   * Get eligibility criteria for a job
   */
  async getEligibility(jobId: string): Promise<JobEligibility | null> {
    try {
      const eligibility = await prisma.jobEligibility.findFirst({
        where: { jobId },
      });

      return eligibility as JobEligibility | null;
    } catch (error) {
      logger.error({ err: error, jobId }, 'Error fetching job eligibility');
      throw error;
    }
  }

  /**
   * Check if a user is eligible for a job
   */
  async checkUserEligibility(userId: string, jobId: string): Promise<boolean> {
    try {
      const [user, eligibility] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          include: {
            education: {
              where: { deletedAt: null },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        }),
        this.getEligibility(jobId),
      ]);

      if (!user) {
        throw new NotFoundError('User not found', 'User not found');
      }

      // If no eligibility criteria set, all users are eligible
      if (!eligibility) {
        return true;
      }

      // Check if user is frozen
      if (user.isFrozen) {
        return false;
      }

      // Check branch eligibility
      if (
        eligibility.allowedBranches.length > 0 &&
        user.branch &&
        !eligibility.allowedBranches.includes(user.branch)
      ) {
        return false;
      }

      // Check year eligibility
      if (
        eligibility.allowedYears.length > 0 &&
        user.currentYear &&
        !eligibility.allowedYears.includes(user.currentYear)
      ) {
        return false;
      }

      // Check CGPA (assuming latest education entry has GPA)
      if (eligibility.minCgpa && user.education.length > 0) {
        const latestEducation = user.education[0];
        if (latestEducation?.gpa) {
          const gpa = parseFloat(latestEducation.gpa);
          if (gpa < eligibility.minCgpa) {
            return false;
          }
        }
      }

      // Additional custom criteria checks can be added here
      return true;
    } catch (error) {
      logger.error({ err: error, userId, jobId }, 'Error checking user eligibility');
      throw error;
    }
  }
}

class AttendanceService {
  /**
   * Mark attendance for a user for a specific event
   */
  async markAttendance(
    jobId: string,
    data: MarkAttendanceRequest,
    markedBy: string,
  ): Promise<AttendanceRecord> {
    try {
      // Check if job exists
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) {
        throw new NotFoundError('Job not found', 'Job not found');
      }

      // Check if user exists
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (!user) {
        throw new NotFoundError('User not found', 'User not found');
      }

      // Upsert attendance record
      const attendance = await prisma.attendanceRecord.upsert({
        where: {
          jobId_userId_eventType: {
            jobId,
            userId: data.userId,
            eventType: data.eventType,
          },
        },
        update: {
          attended: data.attended,
          markedBy,
          markedAt: new Date(),
          remarks: data.remarks,
        },
        create: {
          jobId,
          userId: data.userId,
          eventType: data.eventType,
          attended: data.attended,
          markedBy,
          markedAt: new Date(),
          remarks: data.remarks,
        },
      });

      logger.info(
        { jobId, userId: data.userId, eventType: data.eventType, attended: data.attended },
        'Attendance marked',
      );

      return attendance as AttendanceRecord;
    } catch (error) {
      logger.error({ err: error, jobId }, 'Error marking attendance');
      throw error;
    }
  }

  /**
   * Bulk mark attendance for multiple users
   */
  async bulkMarkAttendance(
    jobId: string,
    eventType: AttendanceType,
    data: BulkMarkAttendanceRequest,
    markedBy: string,
  ): Promise<number> {
    try {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) {
        throw new NotFoundError('Job not found', 'Job not found');
      }

      let count = 0;
      for (const record of data.attendanceRecords) {
        await this.markAttendance(
          jobId,
          {
            userId: record.userId,
            eventType,
            attended: record.attended,
            remarks: record.remarks,
          },
          markedBy,
        );
        count++;
      }

      logger.info({ jobId, eventType, count }, 'Bulk attendance marked');
      return count;
    } catch (error) {
      logger.error({ err: error, jobId }, 'Error in bulk mark attendance');
      throw error;
    }
  }

  /**
   * Get attendance records for a job
   */
  async getJobAttendance(jobId: string, eventType?: AttendanceType): Promise<AttendanceRecord[]> {
    try {
      const where: { jobId: string; eventType?: AttendanceType } = { jobId };
      if (eventType) {
        where.eventType = eventType;
      }

      const records = await prisma.attendanceRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return records as AttendanceRecord[];
    } catch (error) {
      logger.error({ err: error, jobId }, 'Error fetching job attendance');
      throw error;
    }
  }

  /**
   * Get attendance records for a user across all jobs
   */
  async getUserAttendance(userId: string, jobId?: string): Promise<AttendanceRecord[]> {
    try {
      const where: { userId: string; jobId?: string } = { userId };
      if (jobId) {
        where.jobId = jobId;
      }

      const records = await prisma.attendanceRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return records as AttendanceRecord[];
    } catch (error) {
      logger.error({ err: error, userId }, 'Error fetching user attendance');
      throw error;
    }
  }

  /**
   * Get attendance statistics for a job
   */
  async getAttendanceStats(
    jobId: string,
    eventType: AttendanceType,
  ): Promise<{
    total: number;
    attended: number;
    absent: number;
    attendanceRate: number;
  }> {
    try {
      const [total, attended, absent] = await Promise.all([
        prisma.attendanceRecord.count({
          where: { jobId, eventType },
        }),
        prisma.attendanceRecord.count({
          where: { jobId, eventType, attended: true },
        }),
        prisma.attendanceRecord.count({
          where: { jobId, eventType, attended: false },
        }),
      ]);

      return {
        total,
        attended,
        absent,
        attendanceRate: total > 0 ? (attended / total) * 100 : 0,
      };
    } catch (error) {
      logger.error({ err: error, jobId, eventType }, 'Error fetching attendance stats');
      throw error;
    }
  }
}

export const jobEligibilityService = new JobEligibilityService();
export const attendanceService = new AttendanceService();

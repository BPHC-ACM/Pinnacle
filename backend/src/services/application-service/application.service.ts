import type { User } from '@pinnacle/types';

import { logger } from '../../config/logger.config';
import prisma from '../../db/client';
import type {
  Application,
  ApplyRequest,
  ApplicationStatus,
  AdminApplicationFilters,
  ApplicationWithDetails,
  AdminDashboardStats,
} from '../../types/application.types';
import type { PaginationParams, PaginatedResponse } from '../../types/pagination.types';

export class ApplicationService {
  async apply(
    userId: string,
    jobId: string,
    data: ApplyRequest,
  ): Promise<Application | { error: string }> {
    const job = await prisma.job.findFirst({
      where: { id: jobId, deletedAt: null },
      include: { questions: true },
    });
    if (!job) return { error: 'Job not found' };
    if (job.status !== 'OPEN') return { error: 'Job is no longer accepting applications' };
    if (job.deadline && new Date() > job.deadline) {
      return { error: 'Application deadline has passed' };
    }

    // Validate required questions are answered
    const requiredQuestions = job.questions.filter((q) => q.required);
    if (requiredQuestions.length > 0) {
      const answersObj = data.answers ?? {};
      const unanswered = requiredQuestions.filter((q) => !answersObj[q.id]);
      if (unanswered.length > 0) {
        return {
          error: `Required questions not answered: ${unanswered.map((q) => q.question).join(', ')}`,
        };
      }
    }

    const existing = await prisma.application.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (existing) return { error: 'You have already applied to this job' };

    if (data.resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: data.resumeId, userId, deletedAt: null },
      });
      if (!resume) return { error: 'Resume not found' };
    }

    const application = await prisma.application.create({
      data: { userId, jobId, ...data },
    });
    logger.info({ applicationId: application.id, userId, jobId }, 'Application submitted');
    return application as unknown as Application;
  }

  async getApplication(id: string): Promise<Application | null> {
    return prisma.application.findUnique({
      where: { id },
    }) as unknown as Promise<Application | null>;
  }

  async getUserApplications(
    userId: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Application>> {
    const { page = 1, limit = 20, sortBy = 'appliedAt', sortOrder = 'desc' } = params ?? {};
    const where = { userId };
    const [data, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);
    return {
      data: data as unknown as Application[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getJobApplications(
    jobId: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Application>> {
    const { page = 1, limit = 20, sortBy = 'appliedAt', sortOrder = 'desc' } = params ?? {};
    const where = { jobId };
    const [data, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);
    return {
      data: data as unknown as Application[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<Application | null> {
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) return null;
    const updated = await prisma.application.update({ where: { id }, data: { status } });
    logger.info({ applicationId: id, status }, 'Application status updated');
    return updated as unknown as Application;
  }

  async withdraw(userId: string, id: string): Promise<Application | { error: string }> {
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) return { error: 'Application not found' };
    if (app.userId !== userId) return { error: 'Unauthorized' };
    if (app.status === 'WITHDRAWN') return { error: 'Already withdrawn' };

    const withdrawn = await prisma.application.update({
      where: { id },
      data: { status: 'WITHDRAWN', withdrawnAt: new Date() },
    });
    logger.info({ applicationId: id }, 'Application withdrawn');
    return withdrawn as unknown as Application;
  }

  //  ADMIN METHODS

  // Get admin dashboard statistics
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const [
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      hiredApplications,
    ] = await Promise.all([
      prisma.job.count({ where: { deletedAt: null } }),
      prisma.job.count({ where: { deletedAt: null, status: 'OPEN' } }),
      prisma.job.count({ where: { deletedAt: null, status: 'CLOSED' } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'APPLIED' } }),
      prisma.application.count({ where: { status: 'SHORTLISTED' } }),
      prisma.application.count({ where: { status: 'HIRED' } }),
    ]);

    return {
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      hiredApplications,
    };
  }

  // Get all applications with filters (Admin)
  async getAllApplications(
    filters: AdminApplicationFilters = {},
    params?: PaginationParams,
  ): Promise<PaginatedResponse<ApplicationWithDetails>> {
    const { page = 1, limit = 20, sortBy = 'appliedAt', sortOrder = 'desc' } = params ?? {};
    const { status, jobId, companyId, fromDate, toDate, search } = filters;

    const where = {
      ...(status && { status }),
      ...(jobId && { jobId }),
      ...(companyId && { job: { companyId } }),
      ...(fromDate && { appliedAt: { gte: fromDate } }),
      ...(toDate && { appliedAt: { lte: toDate } }),
      ...(search && {
        OR: [{ job: { title: { contains: search, mode: 'insensitive' as const } } }],
      }),
    };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: { job: { include: { questions: true } } },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    // Fetch user details separately since User is not directly related to Application in schema
    const userIds = [...new Set(applications.map((app) => app.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        linkedin: true,
        github: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Fetch resume details
    const resumeIds = applications.filter((a) => a.resumeId).map((a) => a.resumeId!);
    const resumes = await prisma.resume.findMany({
      where: { id: { in: resumeIds } },
      select: { id: true, title: true },
    });
    const resumeMap = new Map(resumes.map((r) => [r.id, r]));

    const data = applications.map((app) => ({
      ...app,
      user: userMap.get(app.userId),
      resume: app.resumeId ? resumeMap.get(app.resumeId) : undefined,
    })) as unknown as ApplicationWithDetails[];

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Get single application with full details (Admin)
  async getApplicationDetails(id: string): Promise<ApplicationWithDetails | null> {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: { questions: true },
        },
      },
    });

    if (!application) return null;

    const user = await prisma.user.findUnique({
      where: { id: application.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        linkedin: true,
        github: true,
      },
    });

    const resume = application.resumeId
      ? await prisma.resume.findUnique({
          where: { id: application.resumeId },
          select: { id: true, title: true },
        })
      : undefined;

    return {
      ...application,
      user: user ?? undefined,
      resume: resume ?? undefined,
    } as unknown as ApplicationWithDetails;
  }

  // Bulk update application status (Admin)
  async bulkUpdateStatus(
    applicationIds: string[],
    status: ApplicationStatus,
  ): Promise<{ updated: number; failed: string[] }> {
    const failed: string[] = [];
    let updated = 0;

    for (const id of applicationIds) {
      try {
        await prisma.application.update({
          where: { id },
          data: { status },
        });
        updated++;
      } catch {
        failed.push(id);
      }
    }

    logger.info({ updated, failed: failed.length, status }, 'Bulk status update completed');
    return { updated, failed };
  }

  // Delete application (Admin)
  async deleteApplication(id: string): Promise<Application | null> {
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) return null;

    await prisma.application.delete({ where: { id } });
    logger.info({ applicationId: id }, 'Application deleted');
    return app as unknown as Application;
  }

  // Get applicant's full profile for an application (Admin)
  async getApplicantProfile(applicationId: string): Promise<User | null> {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) return null;

    const user = await prisma.user.findUnique({
      where: { id: app.userId },
      include: {
        experiences: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
        education: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
        skills: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
        projects: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
        certifications: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
        languages: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
      },
    });

    return user;
  }
}

export default new ApplicationService();

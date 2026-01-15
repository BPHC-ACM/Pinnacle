import type { User } from '@repo/database';
import { prisma } from '@repo/database';
import { ApplicationStatus } from '@repo/types';

import { logger } from '../../config/logger.config';
import type {
  Application,
  ApplyRequest,
  AdminApplicationFilters,
  ApplicationWithDetails,
  AdminDashboardStats,
} from '../../types/application.types';
import { NotFoundError, ValidationError } from '../../types/errors.types';
import type { PaginatedResponse, PaginationParams } from '../../types/pagination.types';

const ALLOWED_APP_SORT_FIELDS = ['appliedAt', 'status', 'updatedAt'];

export class ApplicationService {
  async apply(userId: string, jobId: string, data: ApplyRequest): Promise<Application> {
    const job = await prisma.job.findFirst({
      where: { id: jobId, deletedAt: null },
      include: { questions: true },
    });
    if (!job) throw new NotFoundError('Job not found', 'Job not found');
    if (job.status !== 'OPEN')
      throw new ValidationError(
        'Job is no longer accepting applications',
        'Job is no longer accepting applications',
      );
    if (job.deadline && new Date() > job.deadline) {
      throw new ValidationError(
        'Application deadline has passed',
        'Application deadline has passed',
      );
    }

    // Validate required questions are answered
    const requiredQuestions = job.questions.filter((q) => q.required);
    if (requiredQuestions.length > 0) {
      const answersObj = data.answers ?? {};
      const unanswered = requiredQuestions.filter((q) => !(q.id in answersObj));
      if (unanswered.length > 0) {
        const questionsList = unanswered.map((q) => q.question).join(', ');
        throw new ValidationError(
          `Required questions not answered: ${questionsList}`,
          'Please answer all required questions',
        );
      }
    }

    const existing = await prisma.application.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (existing)
      throw new ValidationError(
        'You have already applied to this job',
        'You have already applied to this job',
      );

    if (data.resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: data.resumeId, userId, deletedAt: null },
      });
      if (!resume) throw new NotFoundError('Resume not found', 'Resume not found');
    }

    const application = await prisma.application.create({
      data: { userId, jobId, status: ApplicationStatus.APPLIED, ...data },
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

    let safeSortBy = sortBy;
    if (safeSortBy === 'createdAt') {
      safeSortBy = 'appliedAt';
    }

    if (!ALLOWED_APP_SORT_FIELDS.includes(safeSortBy)) {
      safeSortBy = 'appliedAt';
    }

    const orderBy = { [safeSortBy]: sortOrder };

    const [data, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy,
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

    let safeSortBy = sortBy;
    if (safeSortBy === 'createdAt') {
      safeSortBy = 'appliedAt';
    }

    if (!ALLOWED_APP_SORT_FIELDS.includes(safeSortBy)) {
      safeSortBy = 'appliedAt';
    }

    const orderBy = { [safeSortBy]: sortOrder };

    const [data, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy,
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

  async withdraw(userId: string, id: string): Promise<Application> {
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundError('Application not found', 'Application not found');
    if (app.userId !== userId) throw new ValidationError('Unauthorized', 'Unauthorized');
    if (app.status === 'WITHDRAWN')
      throw new ValidationError('Already withdrawn', 'Already withdrawn');

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

    let safeSortBy = sortBy;
    if (safeSortBy === 'createdAt') {
      safeSortBy = 'appliedAt';
    }

    if (!ALLOWED_APP_SORT_FIELDS.includes(safeSortBy)) {
      safeSortBy = 'appliedAt';
    }

    const orderBy = { [safeSortBy]: sortOrder };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: { job: { include: { questions: true } } },
        orderBy,
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
  ): Promise<{ updated: number; failed: string[]; updatedApplications: Application[] }> {
    const failed: string[] = [];
    const updatedApplications: Application[] = [];

    for (const id of applicationIds) {
      try {
        const updated = await prisma.application.update({
          where: { id },
          data: { status },
          include: { job: true },
        });
        updatedApplications.push(updated as unknown as Application);
      } catch {
        failed.push(id);
      }
    }

    logger.info(
      { updated: updatedApplications.length, failed: failed.length, status },
      'Bulk status update completed',
    );
    return { updated: updatedApplications.length, failed, updatedApplications };
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

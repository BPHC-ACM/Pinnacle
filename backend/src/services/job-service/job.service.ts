import { logger } from '../../config/logger.config';
import prisma from '../../db/client';
import type { Application } from '../../types/application.types';
import type {
  Job,
  CreateJobRequest,
  AdminJobFilters,
  UpdateJobRequest,
  JobWithStats,
} from '../../types/job.types';
import type { PaginationParams, PaginatedResponse } from '../../types/pagination.types';

export class JobService {
  async createJob(data: CreateJobRequest): Promise<Job> {
    const { questions, ...jobData } = data;
    const job = await prisma.job.create({
      data: {
        ...jobData,
        questions: questions
          ? {
              create: questions.map((q, i) => ({
                question: q.question,
                required: q.required ?? true,
                order: i,
              })),
            }
          : undefined,
      },
      include: { questions: true },
    });
    logger.info({ jobId: job.id }, 'Job created');
    return job as unknown as Job;
  }

  async getJob(id: string): Promise<Job | null> {
    return prisma.job.findFirst({
      where: { id, deletedAt: null },
      include: { questions: { orderBy: { order: 'asc' } }, company: true },
    }) as unknown as Promise<Job | null>;
  }

  async getJobs(companyId?: string, params?: PaginationParams): Promise<PaginatedResponse<Job>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params ?? {};
    const where = { deletedAt: null, ...(companyId && { companyId }) };
    const [data, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { questions: { orderBy: { order: 'asc' } }, company: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);
    return {
      data: data as unknown as Job[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async closeJob(id: string): Promise<Job | null> {
    const job = await prisma.job.findFirst({ where: { id, deletedAt: null } });
    if (!job) return null;

    return (await prisma.job.update({
      where: { id },
      data: { status: 'CLOSED' },
    })) as unknown as Job;
  }

  // ADMIN METHODS

  // Get all jobs with application stats (Admin)
  async getAllJobsWithStats(
    filters: AdminJobFilters = {},
    params?: PaginationParams,
  ): Promise<PaginatedResponse<JobWithStats>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params ?? {};
    const { status, companyId, fromDate, toDate, search } = filters;

    const where = {
      deletedAt: null,
      ...(status && { status }),
      ...(companyId && { companyId }),
      ...(fromDate && { createdAt: { gte: fromDate } }),
      ...(toDate && { createdAt: { lte: toDate } }),
      ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          questions: { orderBy: { order: 'asc' } },
          _count: { select: { applications: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    // Get application stats for all jobs in one query
    const jobIds = jobs.map((j) => j.id);
    const allStats = await prisma.application.groupBy({
      by: ['jobId', 'status'],
      where: { jobId: { in: jobIds } },
      _count: true,
    });

    // Map stats to jobs
    const jobsWithStats = jobs.map((job) => {
      const jobStats = allStats.filter((s) => s.jobId === job.id);
      const statMap = Object.fromEntries(jobStats.map((s) => [s.status, s._count]));

      return {
        ...job,
        applicationStats: {
          total: job._count.applications,
          applied: statMap.APPLIED ?? 0,
          shortlisted: statMap.SHORTLISTED ?? 0,
          interviewing: statMap.INTERVIEWING ?? 0,
          rejected: statMap.REJECTED ?? 0,
          hired: statMap.HIRED ?? 0,
          withdrawn: statMap.WITHDRAWN ?? 0,
        },
      };
    });

    return {
      data: jobsWithStats as unknown as JobWithStats[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Update job details (Admin)
  async updateJob(id: string, data: UpdateJobRequest): Promise<Job | null> {
    const job = await prisma.job.findFirst({ where: { id, deletedAt: null } });
    if (!job) return null;

    const updated = await prisma.job.update({
      where: { id },
      data,
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    logger.info({ jobId: id, updates: Object.keys(data) }, 'Job updated');
    return updated as unknown as Job;
  }

  // Delete job (soft delete) (Admin)
  async deleteJob(id: string): Promise<Job | null> {
    const job = await prisma.job.findFirst({ where: { id, deletedAt: null } });
    if (!job) return null;

    const deleted = await prisma.job.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CLOSED' },
    });

    logger.info({ jobId: id }, 'Job deleted');
    return deleted as unknown as Job;
  }

  // Reopen a closed job (Admin)
  async reopenJob(id: string, newDeadline?: Date): Promise<Job | null> {
    const job = await prisma.job.findFirst({ where: { id, deletedAt: null } });
    if (!job) return null;

    const updated = await prisma.job.update({
      where: { id },
      data: {
        status: 'OPEN',
        ...(newDeadline && { deadline: newDeadline }),
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    logger.info({ jobId: id }, 'Job reopened');
    return updated as unknown as Job;
  }

  // Export applications data for a job (Admin)
  async exportJobApplications(
    jobId: string,
  ): Promise<{ job: Job; applications: Application[] } | null> {
    const job = await prisma.job.findFirst({
      where: { id: jobId, deletedAt: null },
      include: { questions: true },
    });

    if (!job) return null;

    const applications = await prisma.application.findMany({
      where: { jobId },
      orderBy: { appliedAt: 'desc' },
    });

    const userIds = applications.map((a) => a.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        linkedin: true,
        github: true,
        location: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return {
      job: {
        id: job.id,
        title: job.title,
        companyId: job.companyId,
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      } as Job,
      applications: applications.map((app) => ({
        ...app,
        resumeId: app.resumeId ?? undefined,
        coverLetter: app.coverLetter ?? undefined,
        user: userMap.get(app.userId),
      })) as Application[],
    };
  }
}

export default new JobService();

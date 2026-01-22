import { prisma, Prisma, Sector as PrismaSector } from '@repo/database';

import { logger } from '../../config/logger.config';
import type { Application } from '../../types/application.types';
import type {
  CreateJobRequest,
  AdminJobFilters,
  PublicJobFilters,
  UpdateJobRequest,
  JobWithStats,
  Job,
} from '../../types/job.types';
import type { PaginationParams, PaginatedResponse } from '../../types/pagination.types';

const ALLOWED_SORT_FIELDS = ['createdAt', 'title', 'deadline', 'updatedAt'];

function mapJobToDto(job: unknown): Job {
  return job as Job;
}

export class JobService {
  async createJob(data: CreateJobRequest): Promise<Job> {
    const { questions, placementCycleId, ...jobData } = data;

    const job = await prisma.job.create({
      data: {
        ...jobData,
        placementCycleId,
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

    return mapJobToDto(job);
  }

  async getJob(id: string): Promise<Job | null> {
    const job = await prisma.job.findFirst({
      where: { id, deletedAt: null },
      include: { questions: { orderBy: { order: 'asc' } }, company: true },
    });
    return job ? mapJobToDto(job) : null;
  }

  async getJobs(
    filters: PublicJobFilters,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Job>> {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params ?? {};
      const { companyId, search, industry, jobType } = filters;

      const where: Prisma.JobWhereInput = { deletedAt: null };

      if (companyId) where.companyId = companyId;
      if (jobType && jobType !== 'All') where.type = jobType;

      if (industry && industry !== 'ALL_SECTORS') {
        where.company = {
          is: {
            sector: industry as PrismaSector,
          },
        };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { company: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';

      const orderBy = { [safeSortBy]: sortOrder } as Prisma.JobOrderByWithRelationInput;

      const [data, total] = await Promise.all([
        prisma.job.findMany({
          where,
          include: {
            questions: { orderBy: { order: 'asc' } },
            company: true,
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.job.count({ where }),
      ]);

      return {
        data: data as unknown as Job[],
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error({ err: error, filters, params }, 'JobService.getJobs failed');
      throw error;
    }
  }

  async closeJob(id: string): Promise<Job | null> {
    const job = await prisma.job.findFirst({ where: { id, deletedAt: null } });
    if (!job) return null;

    const updated = await prisma.job.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
    return mapJobToDto(updated);
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
      const jobDto = mapJobToDto(job);

      return {
        ...jobDto,
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
    return mapJobToDto(updated);
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
    return mapJobToDto(deleted);
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
    return mapJobToDto(updated);
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
    const jobDto = mapJobToDto(job);

    const userMap = new Map(users.map((u) => [u.id, u]));

    return {
      job: jobDto,
      applications: applications.map((app) => ({
        ...app,
        resumeId: app.resumeId ?? undefined,
        coverLetter: app.coverLetter ?? undefined,
        user: userMap.get(app.userId),
      })) as Application[],
    };
  }

  async updateJobSchedule(
    jobId: string,
    data: import('../../types/job.types').UpdateJobScheduleRequest,
  ): Promise<Job> {
    const job = await prisma.job.findFirst({ where: { id: jobId, deletedAt: null } });
    if (!job) {
      throw new Error('Job not found');
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        oaDate: data.oaDate,
        oaVenue: data.oaVenue,
        oaInstructions: data.oaInstructions,
        pptDate: data.pptDate,
        pptVenue: data.pptVenue,
        pptInstructions: data.pptInstructions,
        interviewDate: data.interviewDate,
        interviewVenue: data.interviewVenue,
        interviewInstructions: data.interviewInstructions,
        selectionStatus: data.selectionStatus,
      },
      include: { questions: true, company: true },
    });

    logger.info({ jobId }, 'Job schedule updated');
    return mapJobToDto(updated);
  }
}

export default new JobService();

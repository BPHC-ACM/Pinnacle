import type { User } from '@prisma/client';

import { logger } from '../../config/logger.config';
import prisma from '../../db/client';
import type {
  Job,
  Application,
  CreateJobRequest,
  ApplyRequest,
  ApplicationStatus,
  AdminApplicationFilters,
  AdminJobFilters,
  UpdateJobRequest,
  ApplicationWithDetails,
  JobWithStats,
  AdminDashboardStats,
} from '../../types/application.types';

export class ApplicationService {
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
      include: { questions: { orderBy: { order: 'asc' } } },
    }) as unknown as Promise<Job | null>;
  }

  async getJobs(companyId?: string): Promise<Job[]> {
    return prisma.job.findMany({
      where: { deletedAt: null, ...(companyId && { companyId }) },
      include: { questions: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Promise<Job[]>;
  }

  async closeJob(id: string): Promise<Job | null> {
    const job = await prisma.job.findFirst({ where: { id, deletedAt: null } });
    if (!job) return null;
    return prisma.job.update({
      where: { id },
      data: { status: 'CLOSED' },
    }) as unknown as Promise<Job>;
  }

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

  async getUserApplications(userId: string): Promise<Application[]> {
    return prisma.application.findMany({
      where: { userId },
      orderBy: { appliedAt: 'desc' },
    }) as unknown as Promise<Application[]>;
  }

  async getJobApplications(jobId: string): Promise<Application[]> {
    return prisma.application.findMany({
      where: { jobId },
      orderBy: { appliedAt: 'desc' },
    }) as unknown as Promise<Application[]>;
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

  // ==================== ADMIN METHODS ====================

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
  ): Promise<ApplicationWithDetails[]> {
    const { status, jobId, companyId, fromDate, toDate, search } = filters;

    const applications = await prisma.application.findMany({
      where: {
        ...(status && { status }),
        ...(jobId && { jobId }),
        ...(companyId && { job: { companyId } }),
        ...(fromDate && { appliedAt: { gte: fromDate } }),
        ...(toDate && { appliedAt: { lte: toDate } }),
        ...(search && {
          OR: [{ job: { title: { contains: search, mode: 'insensitive' } } }],
        }),
      },
      include: {
        job: {
          include: { questions: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

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

    return applications.map((app) => ({
      ...app,
      user: userMap.get(app.userId),
      resume: app.resumeId ? resumeMap.get(app.resumeId) : undefined,
    })) as unknown as ApplicationWithDetails[];
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

  // Get all jobs with application stats (Admin)
  async getAllJobsWithStats(filters: AdminJobFilters = {}): Promise<JobWithStats[]> {
    const { status, companyId, fromDate, toDate, search } = filters;

    const jobs = await prisma.job.findMany({
      where: {
        deletedAt: null,
        ...(status && { status }),
        ...(companyId && { companyId }),
        ...(fromDate && { createdAt: { gte: fromDate } }),
        ...(toDate && { createdAt: { lte: toDate } }),
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
      },
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get application stats for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const stats = await prisma.application.groupBy({
          by: ['status'],
          where: { jobId: job.id },
          _count: true,
        });

        const statMap = Object.fromEntries(stats.map((s) => [s.status, s._count]));

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
      }),
    );

    return jobsWithStats as unknown as JobWithStats[];
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

  // Pause a job (Admin)
  async pauseJob(id: string): Promise<Job | null> {
    const job = await prisma.job.findFirst({ where: { id, deletedAt: null } });
    if (!job) return null;

    const updated = await prisma.job.update({
      where: { id },
      data: { status: 'PAUSED' },
    });

    logger.info({ jobId: id }, 'Job paused');
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
      },
      questions: job.questions,
      applications: applications.map((app) => ({
        ...app,
        user: userMap.get(app.userId),
      })),
    };
  }
}

export default new ApplicationService();

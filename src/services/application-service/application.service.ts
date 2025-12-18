import { logger } from '../../config/logger.config';
import prisma from '../../db/client';
import type {
  Job,
  Application,
  CreateJobRequest,
  ApplyRequest,
  ApplicationStatus,
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
}

export default new ApplicationService();

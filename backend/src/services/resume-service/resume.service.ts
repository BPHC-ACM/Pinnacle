import prisma from '../../db/client';
import type { PaginationParams, PaginatedResponse } from '../../types/pagination.types';
import type {
  SavedResume,
  CreateResumeRequest,
  UpdateResumeRequest,
  ResumePreviewData,
  TemplateInfo,
  ResumeTemplate,
} from '../../types/resume.types';

export class ResumeService {
  /**
   * Get all saved resumes for a user
   */
  async getSavedResumes(
    userId: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<SavedResume>> {
    const { page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = params ?? {};
    const where = { userId, deletedAt: null };
    const [resumes, total] = await Promise.all([
      prisma.resume.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.resume.count({ where }),
    ]);

    return {
      data: resumes.map((resume: { data: unknown } & Omit<SavedResume, 'data'>) => ({
        ...resume,
        data: resume.data as SavedResume['data'],
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a specific saved resume
   */
  async getSavedResume(userId: string, resumeId: string): Promise<SavedResume | null> {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId, deletedAt: null },
    });

    if (!resume) return null;

    return {
      ...resume,
      data: resume.data as unknown as SavedResume['data'],
    };
  }

  /**
   * Create a new saved resume
   */
  async createResume(userId: string, data: CreateResumeRequest): Promise<SavedResume> {
    const resume = await prisma.resume.create({
      data: {
        userId,
        title: data.title,
        template: data.template ?? 'modern',
        data: data.data as object,
      },
    });

    return {
      ...resume,
      data: resume.data as unknown as SavedResume['data'],
    };
  }

  /**
   * Update a saved resume
   */
  async updateResume(
    userId: string,
    resumeId: string,
    data: UpdateResumeRequest,
  ): Promise<SavedResume | null> {
    const existing = await prisma.resume.findFirst({
      where: { id: resumeId, userId, deletedAt: null },
    });

    if (!existing) return null;

    const resume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.template && { template: data.template }),
        ...(data.data && { data: data.data as object }),
      },
    });

    return {
      ...resume,
      data: resume.data as unknown as SavedResume['data'],
    };
  }

  /**
   * Delete a saved resume (soft delete)
   */
  async deleteResume(userId: string, resumeId: string): Promise<boolean> {
    const existing = await prisma.resume.findFirst({
      where: { id: resumeId, userId, deletedAt: null },
    });

    if (!existing) return false;

    await prisma.resume.update({
      where: { id: resumeId },
      data: { deletedAt: new Date() },
    });

    return true;
  }

  /**
   * Get all user data for resume preview
   */
  async getResumePreviewData(userId: string): Promise<ResumePreviewData | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        phone: true,
        location: true,
        linkedin: true,
        github: true,
        website: true,
        bio: true,
        title: true,
        summary: true,
      },
    });

    if (!user) return null;

    const [experiences, education, skills, projects, certifications, languages] = await Promise.all(
      [
        prisma.experience.findMany({
          where: { userId, deletedAt: null },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            company: true,
            position: true,
            location: true,
            sector: true,
            salaryRange: true,
            startDate: true,
            endDate: true,
            current: true,
            description: true,
            highlights: true,
            order: true,
          },
        }),
        prisma.education.findMany({
          where: { userId, deletedAt: null },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            institution: true,
            degree: true,
            branch: true,
            rollNumber: true,
            location: true,
            startDate: true,
            endDate: true,
            gpa: true,
            achievements: true,
            order: true,
          },
        }),
        prisma.skill.findMany({
          where: { userId, deletedAt: null },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            category: true,
            items: true,
            proficiency: true,
            order: true,
          },
        }),
        prisma.project.findMany({
          where: { userId, deletedAt: null },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            technologies: true,
            url: true,
            repoUrl: true,
            highlights: true,
            order: true,
          },
        }),
        prisma.certification.findMany({
          where: { userId, deletedAt: null },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            issuer: true,
            date: true,
            url: true,
            order: true,
          },
        }),
        prisma.language.findMany({
          where: { userId, deletedAt: null },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            proficiency: true,
            order: true,
          },
        }),
      ],
    );

    return {
      profile: user,
      experiences,
      education,
      skills,
      projects,
      certifications,
      languages,
    };
  }

  /**
   * Get available resume templates
   */
  getAvailableTemplates(): TemplateInfo[] {
    return [
      {
        id: 'modern',
        name: 'Modern',
        description: 'A clean, modern design with a sidebar for contact information and skills.',
      },
      {
        id: 'classic',
        name: 'Classic',
        description: 'A traditional resume layout, perfect for conservative industries.',
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simple and elegant, letting your content speak for itself.',
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'A professional layout with clear sections and modern typography.',
      },
    ];
  }

  /**
   * Validate template name
   */
  isValidTemplate(template: string): template is ResumeTemplate {
    return ['modern', 'classic', 'minimal', 'professional'].includes(template);
  }
}

export default new ResumeService();

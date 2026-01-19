import { prisma, Sector } from '@repo/database'; // Import Sector from Prisma

import { NotFoundError, ForbiddenError } from '../../types/errors.types';
import type { PaginationParams, PaginatedResponse } from '../../types/pagination.types';
import type {
  UserProfile,
  UpdateUserProfileRequest,
  Experience,
  CreateExperienceRequest,
  UpdateExperienceRequest,
  Education,
  CreateEducationRequest,
  UpdateEducationRequest,
  Skill,
  CreateSkillRequest,
  UpdateSkillRequest,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  Certification,
  CreateCertificationRequest,
  UpdateCertificationRequest,
  Language,
  CreateLanguageRequest,
  UpdateLanguageRequest,
  UserDetails,
  CreateUserDetailsRequest,
} from '../../types/user-details.types';

// Helper to convert YYYY-MM string to Date object (defaults to 1st of month)
const parseDate = (dateStr: string): Date => new Date(`${dateStr}-01`);
const parseOptionalDate = (dateStr?: string | null): Date | null | undefined => {
  if (dateStr === undefined) return undefined;
  if (dateStr === null) return null;
  return new Date(`${dateStr}-01`);
};

export class UserService {
  // Profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return (await prisma.user.findUnique({
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
        createdAt: true,
        updatedAt: true,
        experiences: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        education: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        skills: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        projects: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        certifications: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        languages: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    })) as unknown as UserProfile | null;
  }

  async updateUserProfile(userId: string, data: UpdateUserProfileRequest): Promise<UserProfile> {
    return (await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        verificationStatus: 'PENDING',
      },
    })) as UserProfile;
  }

  // Experience
  async getExperiences(
    userId: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Experience>> {
    const { page = 1, limit = 20, sortBy = 'order', sortOrder = 'asc' } = params ?? {};
    const where = { userId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.experience.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.experience.count({ where }),
    ]);
    return {
      data: data as Experience[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createExperience(userId: string, data: CreateExperienceRequest): Promise<Experience> {
    const { sector, startDate, endDate, ...rest } = data;
    const safeSector = (sector as string) === 'ALL_SECTORS' ? null : (sector as Sector);

    return (await prisma.experience.create({
      data: {
        ...rest,
        sector: safeSector,
        userId,
        startDate: parseDate(startDate),
        endDate: parseOptionalDate(endDate),
        highlights: data.highlights ?? [],
        current: data.current ?? false,
        order: data.order ?? 0,
      },
    })) as Experience;
  }

  async updateExperience(
    userId: string,
    id: string,
    data: UpdateExperienceRequest,
  ): Promise<Experience> {
    const experience = await prisma.experience.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!experience) {
      throw new NotFoundError(
        `Experience with ID ${id} not found for user ${userId}`,
        'Experience not found',
      );
    }

    const { sector, startDate, endDate, ...rest } = data;

    let safeSector = undefined;
    if (sector !== undefined) {
      safeSector = (sector as string) === 'ALL_SECTORS' ? null : (sector as Sector);
    }

    return (await prisma.experience.update({
      where: { id },
      data: {
        ...rest,
        verificationStatus: 'PENDING',
        ...(safeSector !== undefined && { sector: safeSector }),
        ...(startDate && { startDate: parseDate(startDate) }),
        ...(endDate !== undefined && { endDate: parseOptionalDate(endDate) }),
      },
    })) as Experience;
  }

  async deleteExperience(userId: string, id: string): Promise<Experience> {
    const experience = await prisma.experience.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!experience) {
      throw new NotFoundError(
        `Experience with ID ${id} not found for user ${userId}`,
        'Experience not found',
      );
    }
    return (await prisma.experience.update({
      where: { id },
      data: { deletedAt: new Date() },
    })) as Experience;
  }

  // Education
  async getEducation(
    userId: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Education>> {
    const { page = 1, limit = 20, sortBy = 'order', sortOrder = 'asc' } = params ?? {};
    const where = { userId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.education.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.education.count({ where }),
    ]);
    return {
      data: data as Education[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createEducation(userId: string, data: CreateEducationRequest): Promise<Education> {
    return (await prisma.education.create({
      data: {
        ...data,
        // Date parsing fix
        startDate: parseDate(data.startDate),
        endDate: parseOptionalDate(data.endDate),
        userId,
        achievements: data.achievements ?? [],
        order: data.order ?? 0,
      },
    })) as Education;
  }

  async updateEducation(
    userId: string,
    id: string,
    data: UpdateEducationRequest,
  ): Promise<Education> {
    const education = await prisma.education.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!education) {
      throw new NotFoundError(
        `Education with ID ${id} not found for user ${userId}`,
        'Education not found',
      );
    }

    // date conversion
    const updateData = {
      ...data,
      verificationStatus: 'PENDING' as const,
      ...(data.startDate && { startDate: parseDate(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: parseOptionalDate(data.endDate) }),
    };

    return (await prisma.education.update({
      where: { id },
      data: updateData,
    })) as Education;
  }

  async deleteEducation(userId: string, id: string): Promise<Education> {
    const education = await prisma.education.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!education) {
      throw new NotFoundError(
        `Education with ID ${id} not found for user ${userId}`,
        'Education not found',
      );
    }
    return (await prisma.education.update({
      where: { id },
      data: { deletedAt: new Date() },
    })) as Education;
  }

  // Skills
  async getSkills(userId: string, params?: PaginationParams): Promise<PaginatedResponse<Skill>> {
    const { page = 1, limit = 20, sortBy = 'order', sortOrder = 'asc' } = params ?? {};
    const where = { userId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.skill.count({ where }),
    ]);
    return {
      data: data as Skill[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createSkill(userId: string, data: CreateSkillRequest): Promise<Skill> {
    return (await prisma.skill.create({
      data: { ...data, userId, order: data.order ?? 0 },
    })) as Skill;
  }

  async updateSkill(userId: string, id: string, data: UpdateSkillRequest): Promise<Skill> {
    const skill = await prisma.skill.findFirst({ where: { id, userId, deletedAt: null } });
    if (!skill) {
      throw new NotFoundError(
        `Skill with ID ${id} not found for user ${userId}`,
        'Skill not found',
      );
    }
    return (await prisma.skill.update({
      where: { id },
      data: {
        ...data,
        verificationStatus: 'PENDING',
      },
    })) as Skill;
  }

  async deleteSkill(userId: string, id: string): Promise<Skill> {
    const skill = await prisma.skill.findFirst({ where: { id, userId, deletedAt: null } });
    if (!skill) {
      throw new NotFoundError(
        `Skill with ID ${id} not found for user ${userId}`,
        'Skill not found',
      );
    }
    return (await prisma.skill.update({
      where: { id },
      data: { deletedAt: new Date() },
    })) as Skill;
  }

  // Projects
  async getProjects(
    userId: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Project>> {
    const { page = 1, limit = 20, sortBy = 'order', sortOrder = 'asc' } = params ?? {};
    const where = { userId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);
    return {
      data: data as Project[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createProject(userId: string, data: CreateProjectRequest): Promise<Project> {
    return (await prisma.project.create({
      data: {
        ...data,
        userId,
        tools: data.tools ?? [],
        outcomes: data.outcomes ?? [],
        order: data.order ?? 0,
      },
    })) as Project;
  }

  async updateProject(userId: string, id: string, data: UpdateProjectRequest): Promise<Project> {
    const project = await prisma.project.findFirst({ where: { id, userId, deletedAt: null } });
    if (!project) {
      throw new NotFoundError(
        `Project with ID ${id} not found for user ${userId}`,
        'Project not found',
      );
    }
    return (await prisma.project.update({
      where: { id },
      data: {
        ...data,
        verificationStatus: 'PENDING',
      },
    })) as Project;
  }

  async deleteProject(userId: string, id: string): Promise<Project> {
    const project = await prisma.project.findFirst({ where: { id, userId, deletedAt: null } });
    if (!project) {
      throw new NotFoundError(
        `Project with ID ${id} not found for user ${userId}`,
        'Project not found',
      );
    }
    return (await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    })) as Project;
  }

  // Certifications
  async getCertifications(
    userId: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Certification>> {
    const { page = 1, limit = 20, sortBy = 'order', sortOrder = 'asc' } = params ?? {};
    const where = { userId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.certification.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.certification.count({ where }),
    ]);
    return {
      data: data as Certification[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createCertification(
    userId: string,
    data: CreateCertificationRequest,
  ): Promise<Certification> {
    return (await prisma.certification.create({
      data: {
        ...data,
        // Date parsing fix
        date: parseDate(data.date),
        userId,
        order: data.order ?? 0,
      },
    })) as Certification;
  }

  async updateCertification(
    userId: string,
    id: string,
    data: UpdateCertificationRequest,
  ): Promise<Certification> {
    const certification = await prisma.certification.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!certification) {
      throw new NotFoundError(
        `Certification with ID ${id} not found for user ${userId}`,
        'Certification not found',
      );
    }

    // date conversion
    const updateData = {
      ...data,
      verificationStatus: 'PENDING' as const,
      ...(data.date && { date: parseDate(data.date) }),
    };

    return (await prisma.certification.update({
      where: { id },
      data: updateData,
    })) as Certification;
  }

  async deleteCertification(userId: string, id: string): Promise<Certification> {
    const certification = await prisma.certification.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!certification) {
      throw new NotFoundError(
        `Certification with ID ${id} not found for user ${userId}`,
        'Certification not found',
      );
    }
    return (await prisma.certification.update({
      where: { id },
      data: { deletedAt: new Date() },
    })) as Certification;
  }

  // Languages
  async getLanguages(
    userId: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Language>> {
    const { page = 1, limit = 20, sortBy = 'order', sortOrder = 'asc' } = params ?? {};
    const where = { userId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.language.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.language.count({ where }),
    ]);
    return {
      data: data as Language[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createLanguage(userId: string, data: CreateLanguageRequest): Promise<Language> {
    return (await prisma.language.create({
      data: { ...data, userId, order: data.order ?? 0 },
    })) as Language;
  }

  async updateLanguage(userId: string, id: string, data: UpdateLanguageRequest): Promise<Language> {
    const language = await prisma.language.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!language) {
      throw new NotFoundError(
        `Language with ID ${id} not found for user ${userId}`,
        'Language not found',
      );
    }
    return (await prisma.language.update({
      where: { id },
      data: {
        ...data,
      },
    })) as Language;
  }

  async deleteLanguage(userId: string, id: string): Promise<Language> {
    const language = await prisma.language.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!language) {
      throw new NotFoundError(
        `Language with ID ${id} not found for user ${userId}`,
        'Language not found',
      );
    }
    return (await prisma.language.update({
      where: { id },
      data: { deletedAt: new Date() },
    })) as Language;
  }

  // User Details
  async getUserDetails(userId: string): Promise<UserDetails | null> {
    return (await prisma.userDetails.findUnique({
      where: { userId },
    })) as unknown as UserDetails | null;
  }

  async createUserDetails(userId: string, data: CreateUserDetailsRequest): Promise<UserDetails> {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { hasOnboarded: true },
      });

      if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`, 'User not found');
      }

      if (user.hasOnboarded) {
        throw new ForbiddenError(
          `User ${userId} has already onboarded`,
          'User has already onboarded',
        );
      }

      const userDetails = await tx.userDetails.create({
        data: {
          ...data,
          userId,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { hasOnboarded: true },
      });

      return userDetails as unknown as UserDetails;
    });
  }
}

export default new UserService();

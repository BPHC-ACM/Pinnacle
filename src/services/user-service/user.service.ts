import prisma from '../../db/client';
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
} from '../../types/user-details.types';

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
      },
    })) as UserProfile | null;
  }

  async updateUserProfile(userId: string, data: UpdateUserProfileRequest): Promise<UserProfile> {
    return (await prisma.user.update({
      where: { id: userId },
      data,
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
    return (await prisma.experience.create({
      data: {
        ...data,
        userId,
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
  ): Promise<Experience | null> {
    const experience = await prisma.experience.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!experience) return null;
    return (await prisma.experience.update({ where: { id }, data })) as Experience;
  }

  async deleteExperience(userId: string, id: string): Promise<Experience | null> {
    const experience = await prisma.experience.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!experience) return null;
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
      data: { ...data, userId, achievements: data.achievements ?? [], order: data.order ?? 0 },
    })) as Education;
  }

  async updateEducation(
    userId: string,
    id: string,
    data: UpdateEducationRequest,
  ): Promise<Education | null> {
    const education = await prisma.education.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!education) return null;
    return (await prisma.education.update({ where: { id }, data })) as Education;
  }

  async deleteEducation(userId: string, id: string): Promise<Education | null> {
    const education = await prisma.education.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!education) return null;
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

  async updateSkill(userId: string, id: string, data: UpdateSkillRequest): Promise<Skill | null> {
    const skill = await prisma.skill.findFirst({ where: { id, userId, deletedAt: null } });
    if (!skill) return null;
    return (await prisma.skill.update({ where: { id }, data })) as Skill;
  }

  async deleteSkill(userId: string, id: string): Promise<Skill | null> {
    const skill = await prisma.skill.findFirst({ where: { id, userId, deletedAt: null } });
    if (!skill) return null;
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
        technologies: data.technologies ?? [],
        highlights: data.highlights ?? [],
        order: data.order ?? 0,
      },
    })) as Project;
  }

  async updateProject(
    userId: string,
    id: string,
    data: UpdateProjectRequest,
  ): Promise<Project | null> {
    const project = await prisma.project.findFirst({ where: { id, userId, deletedAt: null } });
    if (!project) return null;
    return (await prisma.project.update({ where: { id }, data })) as Project;
  }

  async deleteProject(userId: string, id: string): Promise<Project | null> {
    const project = await prisma.project.findFirst({ where: { id, userId, deletedAt: null } });
    if (!project) return null;
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
      data: { ...data, userId, order: data.order ?? 0 },
    })) as Certification;
  }

  async updateCertification(
    userId: string,
    id: string,
    data: UpdateCertificationRequest,
  ): Promise<Certification | null> {
    const certification = await prisma.certification.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!certification) return null;
    return (await prisma.certification.update({ where: { id }, data })) as Certification;
  }

  async deleteCertification(userId: string, id: string): Promise<Certification | null> {
    const certification = await prisma.certification.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!certification) return null;
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

  async updateLanguage(
    userId: string,
    id: string,
    data: UpdateLanguageRequest,
  ): Promise<Language | null> {
    const language = await prisma.language.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!language) return null;
    return (await prisma.language.update({ where: { id }, data })) as Language;
  }

  async deleteLanguage(userId: string, id: string): Promise<Language | null> {
    const language = await prisma.language.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!language) return null;
    return (await prisma.language.update({
      where: { id },
      data: { deletedAt: new Date() },
    })) as Language;
  }
}

export default new UserService();

import prisma from '../../db/client';
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
  async getExperiences(userId: string): Promise<Experience[]> {
    return (await prisma.experience.findMany({
      where: { userId, deletedAt: null },
      orderBy: { order: 'asc' },
    })) as Experience[];
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
  async getEducation(userId: string): Promise<Education[]> {
    return (await prisma.education.findMany({
      where: { userId, deletedAt: null },
      orderBy: { order: 'asc' },
    })) as Education[];
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
  async getSkills(userId: string): Promise<Skill[]> {
    return (await prisma.skill.findMany({
      where: { userId, deletedAt: null },
      orderBy: { order: 'asc' },
    })) as Skill[];
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
  async getProjects(userId: string): Promise<Project[]> {
    return (await prisma.project.findMany({
      where: { userId, deletedAt: null },
      orderBy: { order: 'asc' },
    })) as Project[];
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
  async getCertifications(userId: string): Promise<Certification[]> {
    return (await prisma.certification.findMany({
      where: { userId, deletedAt: null },
      orderBy: { order: 'asc' },
    })) as Certification[];
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
  async getLanguages(userId: string): Promise<Language[]> {
    return (await prisma.language.findMany({
      where: { userId, deletedAt: null },
      orderBy: { order: 'asc' },
    })) as Language[];
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

import type { Request, Response } from 'express';

import userService from '../services/user-service/user.service';
import { AuthError, ValidationError, NotFoundError } from '../types/errors.types';
import { parsePagination } from '../types/pagination.types';
import type {
  UpdateUserProfileRequest,
  CreateExperienceRequest,
  UpdateExperienceRequest,
  CreateEducationRequest,
  UpdateEducationRequest,
  CreateSkillRequest,
  UpdateSkillRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateCertificationRequest,
  UpdateCertificationRequest,
  CreateLanguageRequest,
  UpdateLanguageRequest,
  CreateUserDetailsRequest,
} from '../types/user-details.types';

const getUserId = (req: Request): string => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AuthError('User not authenticated', 'Unauthorized');
  }
  return userId;
};

const getParamId = (req: Request): string => {
  const { id } = req.params;
  if (!id) {
    throw new ValidationError('ID parameter is missing', 'ID parameter is required');
  }
  return id;
};

export async function getUserProfile(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const user = await userService.getUserProfile(userId);
  if (!user) {
    throw new NotFoundError(`User with ID ${userId} not found`, 'User not found');
  }
  res.json(user);
}

export async function updateUserProfile(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  res.json(await userService.updateUserProfile(userId, req.body as UpdateUserProfileRequest));
}

export async function getUserDetails(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const details = await userService.getUserDetails(userId);
  if (!details) {
    throw new NotFoundError(`User details not found for user ${userId}`, 'User details not found');
  }
  res.json(details);
}

export async function addUserDetails(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  res
    .status(201)
    .json(await userService.addUserDetails(userId, req.body as CreateUserDetailsRequest));
}

export async function getOnboardingStatus(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  res.json(await userService.getOnboardingStatus(userId));
}

export async function getExperiences(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const params = parsePagination(req.query as Record<string, unknown>);
  res.json(await userService.getExperiences(userId, params));
}

export async function createExperience(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  res
    .status(201)
    .json(await userService.createExperience(userId, req.body as CreateExperienceRequest));
}

export async function updateExperience(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const id = getParamId(req);
  const result = await userService.updateExperience(
    userId,
    id,
    req.body as UpdateExperienceRequest,
  );
  res.json(result);
}

export async function deleteExperience(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const id = getParamId(req);
  await userService.deleteExperience(userId, id);
  res.status(204).send();
}

export async function getEducation(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const params = parsePagination(req.query as Record<string, unknown>);
  res.json(await userService.getEducation(userId, params));
}

export async function createEducation(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  res
    .status(201)
    .json(await userService.createEducation(userId, req.body as CreateEducationRequest));
}

export async function updateEducation(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const id = getParamId(req);
  const result = await userService.updateEducation(userId, id, req.body as UpdateEducationRequest);
  res.json(result);
}

export async function deleteEducation(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const id = getParamId(req);
  await userService.deleteEducation(userId, id);
  res.status(204).send();
}

export async function getSkills(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const params = parsePagination(req.query as Record<string, unknown>);
  res.json(await userService.getSkills(userId, params));
}

export async function createSkill(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  res.status(201).json(await userService.createSkill(userId, req.body as CreateSkillRequest));
}

export async function updateSkill(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const id = getParamId(req);
  const result = await userService.updateSkill(userId, id, req.body as UpdateSkillRequest);
  res.json(result);
}

export async function deleteSkill(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const id = getParamId(req);
  await userService.deleteSkill(userId, id);
  res.status(204).send();
}

export async function getProjects(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const params = parsePagination(req.query as Record<string, unknown>);
  res.json(await userService.getProjects(userId, params));
}

export async function createProject(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  res.status(201).json(await userService.createProject(userId, req.body as CreateProjectRequest));
}

export async function updateProject(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const id = getParamId(req);
  const result = await userService.updateProject(userId, id, req.body as UpdateProjectRequest);
  res.json(result);
}

export async function deleteProject(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const id = getParamId(req);
  await userService.deleteProject(userId, id);
  res.status(204).send();
}

export async function getCertifications(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const params = parsePagination(req.query as Record<string, unknown>);
  res.json(await userService.getCertifications(userId, params));
}

export async function createCertification(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  res
    .status(201)
    .json(await userService.createCertification(userId, req.body as CreateCertificationRequest));
}

export async function updateCertification(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const id = getParamId(req);
  const result = await userService.updateCertification(
    userId,
    id,
    req.body as UpdateCertificationRequest,
  );
  res.json(result);
}

export async function deleteCertification(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const id = getParamId(req);
  await userService.deleteCertification(userId, id);
  res.status(204).send();
}

export async function getLanguages(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const params = parsePagination(req.query as Record<string, unknown>);
  res.json(await userService.getLanguages(userId, params));
}

export async function createLanguage(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  res.status(201).json(await userService.createLanguage(userId, req.body as CreateLanguageRequest));
}

export async function updateLanguage(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const id = getParamId(req);
  const result = await userService.updateLanguage(userId, id, req.body as UpdateLanguageRequest);
  res.json(result);
}

export async function deleteLanguage(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const id = getParamId(req);
  await userService.deleteLanguage(userId, id);
  res.status(204).send();
}

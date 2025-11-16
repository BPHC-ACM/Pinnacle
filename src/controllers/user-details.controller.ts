import type { Request, Response } from 'express';

import userService from '../services/user-service/user.service';
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
} from '../types/user-details.types';

const handleError = (res: Response, error: unknown, message: string): void => {
  console.error('Error:', error);
  res.status(500).json({ error: message });
};

const getUserId = (req: Request, res: Response): string | null => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return userId;
};

const getParamId = (req: Request, res: Response): string | null => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'ID parameter is required' });
    return null;
  }
  return id;
};

export async function getUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const user = await userService.getUserProfile(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    handleError(res, error, 'Failed to fetch user profile');
  }
}

export async function updateUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    res.json(await userService.updateUserProfile(userId, req.body as UpdateUserProfileRequest));
  } catch (error) {
    handleError(res, error, 'Failed to update user profile');
  }
}

export async function getExperiences(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    res.json(await userService.getExperiences(userId));
  } catch (error) {
    handleError(res, error, 'Failed to fetch experiences');
  }
}

export async function createExperience(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    res
      .status(201)
      .json(await userService.createExperience(userId, req.body as CreateExperienceRequest));
  } catch (error) {
    handleError(res, error, 'Failed to create experience');
  }
}

export async function updateExperience(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = getParamId(req, res);
    if (!id) return;
    const result = await userService.updateExperience(
      userId,
      id,
      req.body as UpdateExperienceRequest,
    );
    if (!result) {
      res.status(404).json({ error: 'Experience not found' });
      return;
    }
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Failed to update experience');
  }
}

export async function deleteExperience(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = getParamId(req, res);
    if (!id) return;
    const result = await userService.deleteExperience(userId, id);
    if (!result) {
      res.status(404).json({ error: 'Experience not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete experience');
  }
}

export async function getEducation(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    res.json(await userService.getEducation(userId));
  } catch (error) {
    handleError(res, error, 'Failed to fetch education');
  }
}

export async function createEducation(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    res
      .status(201)
      .json(await userService.createEducation(userId, req.body as CreateEducationRequest));
  } catch (error) {
    handleError(res, error, 'Failed to create education');
  }
}

export async function updateEducation(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = getParamId(req, res);
    if (!id) return;
    const result = await userService.updateEducation(
      userId,
      id,
      req.body as UpdateEducationRequest,
    );
    if (!result) {
      res.status(404).json({ error: 'Education not found' });
      return;
    }
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Failed to update education');
  }
}

export async function deleteEducation(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = getParamId(req, res);
    if (!id) return;
    const result = await userService.deleteEducation(userId, id);
    if (!result) {
      res.status(404).json({ error: 'Education not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete education');
  }
}

export async function getSkills(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    res.json(await userService.getSkills(userId));
  } catch (error) {
    handleError(res, error, 'Failed to fetch skills');
  }
}

export async function createSkill(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    res.status(201).json(await userService.createSkill(userId, req.body as CreateSkillRequest));
  } catch (error) {
    handleError(res, error, 'Failed to create skill');
  }
}

export async function updateSkill(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = getParamId(req, res);
    if (!id) return;
    const result = await userService.updateSkill(userId, id, req.body as UpdateSkillRequest);
    if (!result) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Failed to update skill');
  }
}

export async function deleteSkill(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = getParamId(req, res);
    if (!id) return;
    const result = await userService.deleteSkill(userId, id);
    if (!result) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete skill');
  }
}

export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    res.json(await userService.getProjects(userId));
  } catch (error) {
    handleError(res, error, 'Failed to fetch projects');
  }
}

export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    res.status(201).json(await userService.createProject(userId, req.body as CreateProjectRequest));
  } catch (error) {
    handleError(res, error, 'Failed to create project');
  }
}

export async function updateProject(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = getParamId(req, res);
    if (!id) return;
    const result = await userService.updateProject(userId, id, req.body as UpdateProjectRequest);
    if (!result) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Failed to update project');
  }
}

export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = getParamId(req, res);
    if (!id) return;
    const result = await userService.deleteProject(userId, id);
    if (!result) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete project');
  }
}

export async function getCertifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    res.json(await userService.getCertifications(userId));
  } catch (error) {
    handleError(res, error, 'Failed to fetch certifications');
  }
}

export async function createCertification(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    res
      .status(201)
      .json(await userService.createCertification(userId, req.body as CreateCertificationRequest));
  } catch (error) {
    handleError(res, error, 'Failed to create certification');
  }
}

export async function updateCertification(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = getParamId(req, res);
    if (!id) return;
    const result = await userService.updateCertification(
      userId,
      id,
      req.body as UpdateCertificationRequest,
    );
    if (!result) {
      res.status(404).json({ error: 'Certification not found' });
      return;
    }
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Failed to update certification');
  }
}

export async function deleteCertification(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = getParamId(req, res);
    if (!id) return;
    const result = await userService.deleteCertification(userId, id);
    if (!result) {
      res.status(404).json({ error: 'Certification not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete certification');
  }
}

export async function getLanguages(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    res.json(await userService.getLanguages(userId));
  } catch (error) {
    handleError(res, error, 'Failed to fetch languages');
  }
}

export async function createLanguage(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    res
      .status(201)
      .json(await userService.createLanguage(userId, req.body as CreateLanguageRequest));
  } catch (error) {
    handleError(res, error, 'Failed to create language');
  }
}

export async function updateLanguage(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = getParamId(req, res);
    if (!id) return;
    const result = await userService.updateLanguage(userId, id, req.body as UpdateLanguageRequest);
    if (!result) {
      res.status(404).json({ error: 'Language not found' });
      return;
    }
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Failed to update language');
  }
}

export async function deleteLanguage(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;
    const id = getParamId(req, res);
    if (!id) return;
    const result = await userService.deleteLanguage(userId, id);
    if (!result) {
      res.status(404).json({ error: 'Language not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete language');
  }
}

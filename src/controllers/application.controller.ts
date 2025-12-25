import type { Request, Response } from 'express';

import applicationService from '../services/application-service/application.service';
import { updateApplicationStatusSchema } from '../types/application.types';
import { parsePagination } from '../types/pagination.types';

export const getUserApplications = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const params = parsePagination(req.query as Record<string, unknown>);
  const applications = await applicationService.getUserApplications(userId, params);
  res.json(applications);
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Application ID required' });
    return;
  }

  // Validate request body with Zod
  const validation = updateApplicationStatusSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: 'Invalid request data', details: validation.error.issues });
    return;
  }

  const { status } = validation.data;
  const application = await applicationService.updateStatus(id, status);
  res.json(application);
};

export const withdrawApplication = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!id) {
    res.status(400).json({ error: 'Application ID required' });
    return;
  }

  const result = await applicationService.withdraw(userId, id);
  res.json(result);
};

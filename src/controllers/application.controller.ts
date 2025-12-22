import type { Request, Response } from 'express';

import applicationService from '../services/application-service/application.service';
import type { UpdateApplicationStatusRequest } from '../types/application.types';
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
  const { status } = req.body as UpdateApplicationStatusRequest;
  const application = await applicationService.updateStatus(id, status);
  if (!application) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
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
  if ('error' in result) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
};

import { Request, Response, NextFunction } from 'express';

import { announcementService } from '../services/announcement-service/announcement.service';
import { CreateAnnouncementRequest } from '../types/announcement.types';
import { AuthError, ValidationError } from '../types/errors.types';

export const createAnnouncement = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { title, content } = req.body as CreateAnnouncementRequest;
    const senderId = req.user?.id;

    if (!senderId) {
      throw new AuthError('User not authenticated', 'You must be logged in to perform this action');
    }

    if (!title || !content) {
      throw new ValidationError('Title and content are required', 'Title and content are required');
    }

    const announcement = await announcementService.createAnnouncement({ title, content }, senderId);

    res.status(201).json({
      status: 'success',
      data: { announcement },
    });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const result = await announcementService.getAnnouncements(limit, offset);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

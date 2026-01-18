import type { Request, Response } from 'express';

import { prisma } from '../db/client';
import { unifiedNotificationService } from '../services/notification-service/UnifiedNotification.service';
import { AuthError, ValidationError, NotFoundError } from '../types/errors.types';

/**
 * Get user's notifications with pagination
 */
export async function getNotifications(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new AuthError('User not authenticated', 'Unauthorized');
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;

  const result = await unifiedNotificationService.getUserNotifications(userId, limit, offset);
  res.json(result);
}

/**
 * Mark specific notifications as read
 */
export async function markNotificationsAsRead(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new AuthError('User not authenticated', 'Unauthorized');
  const { notificationIds } = req.body as { notificationIds: string[] };

  if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
    throw new ValidationError(
      'notificationIds array is required',
      'notificationIds array is required',
    );
  }

  await unifiedNotificationService.markAsRead(notificationIds, userId);
  res.json({ message: 'Notifications marked as read' });
}

/**
 * Mark all notifications as read for the user
 */
export async function markAllNotificationsAsRead(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new AuthError('User not authenticated', 'Unauthorized');
  await unifiedNotificationService.markAllAsRead(userId);
  res.json({ message: 'All notifications marked as read' });
}

/**
 * Register a device token for push notifications
 */
export async function registerDeviceToken(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new AuthError('User not authenticated', 'Unauthorized');
  const { token } = req.body as { token: string; platform?: 'ios' | 'android' | 'web' };

  if (!token) {
    throw new ValidationError('token is required', 'token is required');
  }

  // Add the token to the user's deviceTokens array if not already present
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { deviceTokens: true },
  });

  if (!user) {
    throw new NotFoundError('User not found', 'User not found');
  }

  if (!user.deviceTokens.includes(token)) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        deviceTokens: {
          push: [token],
        },
      },
    });
  }

  res.json({ message: 'Device token registered successfully' });
}

/**
 * Unregister a device token
 */
export async function unregisterDeviceToken(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new AuthError('User not authenticated', 'Unauthorized');
  const { token } = req.body as { token: string };

  if (!token) {
    throw new ValidationError('token is required', 'token is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { deviceTokens: true },
  });

  if (!user) {
    throw new NotFoundError('User not found', 'User not found');
  }

  const updatedTokens = user.deviceTokens.filter((t: string) => t !== token);

  await prisma.user.update({
    where: { id: userId },
    data: {
      deviceTokens: updatedTokens,
    },
  });

  res.json({ message: 'Device token unregistered successfully' });
}

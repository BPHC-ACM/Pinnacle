import { Router } from 'express';

import { authenticateToken } from '@/auth/middleware/auth.middleware';
import {
  getNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  registerDeviceToken,
  unregisterDeviceToken,
} from '@/controllers/notification.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's notifications
router.get('/', getNotifications);

// Mark specific notifications as read
router.post('/mark-read', markNotificationsAsRead);

// Mark all notifications as read
router.post('/mark-all-read', markAllNotificationsAsRead);

// Register device token for push notifications
router.post('/device-token', registerDeviceToken);

// Unregister device token
router.delete('/device-token', unregisterDeviceToken);

export default router;

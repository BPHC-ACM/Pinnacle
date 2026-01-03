import { api } from '@/lib/api-client';
import type { NotificationResponse } from '@/types/notification.types';

export const notificationService = {
  /**
   * Get user's notifications with pagination
   */
  async getNotifications(limit = 20, offset = 0): Promise<NotificationResponse> {
    const response = await api.get<NotificationResponse>('/notifications', {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Mark specific notifications as read
   */
  async markAsRead(notificationIds: string[]): Promise<void> {
    await api.post('/notifications/mark-read', { notificationIds });
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/mark-all-read');
  },

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(token: string, platform?: 'ios' | 'android' | 'web'): Promise<void> {
    await api.post('/notifications/device-token', { token, platform });
  },

  /**
   * Unregister device token
   */
  async unregisterDeviceToken(token: string): Promise<void> {
    await api.delete('/notifications/device-token', { data: { token } });
  },
};

import { api } from '@/lib/api-client';
import type { AnnouncementsResponse } from '@/types/announcement.types';

export const announcementService = {
  // Get all announcements with pagination
  async getAnnouncements(page = 1, limit = 10): Promise<AnnouncementsResponse> {
    const response = await api.get<AnnouncementsResponse>('/announcements', {
      params: { page, limit },
    });
    return response.data;
  },
};

import { logger } from '../../config/logger.config';
import prisma from '../../db/client';
import { CreateAnnouncementRequest, AnnouncementResponse } from '../../types/announcement.types';
import { unifiedNotificationService } from '../notification-service/UnifiedNotification.service';

export class AnnouncementService {
  async createAnnouncement(
    data: CreateAnnouncementRequest,
    senderId: string,
  ): Promise<AnnouncementResponse> {
    try {
      // Create announcement in DB
      const announcement = await prisma.announcement.create({
        data: {
          title: data.title,
          content: data.content,
          senderId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Send emails via UnifiedNotificationService in background
      this.sendAnnouncementEmailsInBackground(data.title, data.content).catch((err) => {
        logger.error({ err }, 'Failed to trigger background email sending');
      });

      return announcement;
    } catch (error) {
      logger.error({ err: error }, 'Error creating announcement');
      throw error;
    }
  }

  private async sendAnnouncementEmailsInBackground(title: string, content: string): Promise<void> {
    const BATCH_SIZE = 500;
    let cursor: string | undefined;

    try {
      while (true) {
        const users = await prisma.user.findMany({
          where: {
            deletedAt: null, // Only send to active users
          },
          select: {
            id: true,
            email: true,
          },
          take: BATCH_SIZE,
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: {
            id: 'asc',
          },
        });

        if (users.length === 0) {
          break;
        }

        await unifiedNotificationService.sendAnnouncementEmails(users, title, content);

        if (users.length < BATCH_SIZE) {
          break;
        }

        cursor = users[users.length - 1]?.id;
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to send announcement emails in background');
    }
  }

  async getAnnouncements(
    limit = 10,
    offset = 0,
  ): Promise<{ announcements: AnnouncementResponse[]; total: number; pages: number }> {
    try {
      const [announcements, total] = await Promise.all([
        prisma.announcement.findMany({
          skip: offset,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.announcement.count(),
      ]);

      return {
        announcements,
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error({ err: error }, 'Error fetching announcements');
      throw error;
    }
  }
}

export const announcementService = new AnnouncementService();

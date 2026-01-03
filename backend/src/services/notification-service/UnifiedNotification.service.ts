import type { NotificationChannel, NotificationType, Prisma } from '@pinnacle/types';
import * as amqplib from 'amqplib';

import { getFirebaseAdmin } from '../../config/firebase.config';
import { logger } from '../../config/logger.config';
import prismaClient from '../../db/client';

const prisma = prismaClient;

interface NotificationArgs {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[]; // Default: ['IN_APP', 'EMAIL', 'PUSH']
}

class UnifiedNotificationService {
  private rabbitMQConnection: amqplib.ChannelModel | null = null;
  private rabbitMQChannel: amqplib.Channel | null = null;
  private readonly queueName = process.env.QUEUE_NAME ?? 'notifications';

  /**
   * Initialize RabbitMQ connection for email notifications
   */
  private async initRabbitMQ(): Promise<void> {
    if (this.rabbitMQChannel) return;

    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL;
      if (!rabbitmqUrl) {
        logger.warn('RABBITMQ_URL not configured. Email notifications will be disabled.');
        return;
      }

      const connection = await amqplib.connect(rabbitmqUrl);
      this.rabbitMQConnection = connection;
      this.rabbitMQChannel = await connection.createChannel();
      await this.rabbitMQChannel.assertQueue(this.queueName, { durable: true });
      logger.info('RabbitMQ initialized for email notifications');
    } catch (error: unknown) {
      logger.error({ err: error }, 'Failed to initialize RabbitMQ');
    }
  }

  /**
   * Main method to send notifications to users across all channels
   */
  async notifyUsers({
    userIds,
    type,
    title,
    message,
    data,
    channels = ['IN_APP', 'EMAIL', 'PUSH'] as NotificationChannel[],
  }: NotificationArgs): Promise<void> {
    if (userIds.length === 0) {
      logger.warn('No user IDs provided for notification');
      return;
    }

    try {
      // Fetch user details (email and device tokens)
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          email: true,
          name: true,
          deviceTokens: true,
        },
      });

      if (users.length === 0) {
        logger.warn({ userIds }, 'No users found for the provided IDs');
        return;
      }

      // 1. Store notifications in database (IN_APP)
      if (channels.includes('IN_APP')) {
        await this.storeInAppNotifications(
          users.map((u) => u.id),
          type,
          title,
          message,
          data,
        );
      }

      // 2. Send email notifications
      if (channels.includes('EMAIL')) {
        await this.sendEmailNotifications(users, title, message);
      }

      // 3. Send push notifications
      if (channels.includes('PUSH')) {
        const deviceTokens = users.flatMap((u) => u.deviceTokens);
        await this.sendPushNotifications(deviceTokens, title, message, data);
      }

      logger.info({ userCount: users.length, type, channels }, 'Notifications sent successfully');
    } catch (error: unknown) {
      logger.error({ err: error, userIds, type }, 'Failed to send notifications');
      throw new Error('Failed to send notifications', { cause: error });
    }
  }

  /**
   * Store notifications in database for in-app display
   */
  private async storeInAppNotifications(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await prisma.notification.createMany({
        data: userIds.map((userId) => ({
          userId,
          type,
          channel: 'IN_APP' as NotificationChannel,
          title,
          message,
          data: data as unknown as Prisma.InputJsonValue,
        })),
      });
      logger.info({ count: userIds.length }, 'In-app notifications stored');
    } catch (error: unknown) {
      logger.error({ err: error }, 'Failed to store in-app notifications');
    }
  }

  // Queue announcement emails via RabbitMQ
  public async sendAnnouncementEmails(
    users: { email: string }[],
    subject: string,
    body: string,
  ): Promise<void> {
    try {
      await this.initRabbitMQ();

      if (!this.rabbitMQChannel) {
        logger.warn('RabbitMQ channel not available. Skipping announcement emails.');
        return;
      }

      for (const user of users) {
        const emailNotification = {
          to: user.email,
          subject,
          text: body,
        };

        this.rabbitMQChannel.sendToQueue(
          this.queueName,
          Buffer.from(JSON.stringify(emailNotification)),
          { persistent: true },
        );
      }

      logger.info({ count: users.length }, 'Announcement emails queued');
    } catch (error: unknown) {
      logger.error({ err: error }, 'Failed to queue announcement emails');
    }
  }

  /**
   * Queue email notifications via RabbitMQ
   */
  private async sendEmailNotifications(
    users: { id: string; email: string; name: string }[],
    subject: string,
    body: string,
  ): Promise<void> {
    try {
      await this.initRabbitMQ();

      if (!this.rabbitMQChannel) {
        logger.warn('RabbitMQ channel not available. Skipping email notifications.');
        return;
      }

      for (const user of users) {
        const emailNotification = {
          to: user.email,
          subject,
          text: `Hi ${user.name},\n\n${body}`,
        };

        this.rabbitMQChannel.sendToQueue(
          this.queueName,
          Buffer.from(JSON.stringify(emailNotification)),
          { persistent: true },
        );
      }

      logger.info({ count: users.length }, 'Email notifications queued');
    } catch (error: unknown) {
      logger.error({ err: error }, 'Failed to queue email notifications');
    }
  }

  /**
   * Send push notifications via Firebase Cloud Messaging
   */
  private async sendPushNotifications(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    if (tokens.length === 0) {
      logger.info('No device tokens found. Skipping push notifications.');
      return;
    }

    try {
      const firebaseApp = getFirebaseAdmin();

      if (!firebaseApp) {
        logger.warn('Firebase Admin not configured. Skipping push notifications.');
        return;
      }

      // Convert data values to strings (FCM requirement)
      const fcmData = data
        ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
        : undefined;

      const message = {
        notification: { title, body },
        data: fcmData,
      };

      // Use sendEachForMulticast for efficient bulk sending
      const response = await firebaseApp.messaging().sendEachForMulticast({
        tokens,
        ...message,
      });

      logger.info(
        {
          successCount: response.successCount,
          failureCount: response.failureCount,
          totalTokens: tokens.length,
        },
        'Push notifications sent',
      );

      // Log failures for debugging
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            logger.error(
              { token: tokens[idx], error: resp.error },
              'Failed to send push notification to token',
            );
          }
        });
      }
    } catch (error: unknown) {
      logger.error({ err: error }, 'Failed to send push notifications');
    }
  }

  /**
   * Get unread notifications for a user
   */
  async getUserNotifications(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<{
    notifications: {
      id: string;
      type: NotificationType;
      title: string;
      message: string;
      data: unknown;
      isRead: boolean;
      readAt: Date | null;
      createdAt: Date;
    }[];
    unreadCount: number;
  }> {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId, channel: 'IN_APP' },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({
        where: { userId, channel: 'IN_APP', isRead: false },
      }),
    ]);

    return { notifications, unreadCount };
  }

  /**
   * Mark notification(s) as read
   */
  async markAsRead(notificationIds: string[], userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Clean up connections
   */
  async cleanup(): Promise<void> {
    try {
      if (this.rabbitMQChannel) await this.rabbitMQChannel.close();
      if (this.rabbitMQConnection) {
        await this.rabbitMQConnection.close();
      }
      logger.info('Notification service connections closed');
    } catch (error: unknown) {
      logger.error({ err: error }, 'Error during cleanup');
    }
  }
}

export const unifiedNotificationService = new UnifiedNotificationService();

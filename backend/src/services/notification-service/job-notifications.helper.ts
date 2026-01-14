import { NotificationType, prisma } from '@repo/database';

import { logger } from '../../config/logger.config';

import { unifiedNotificationService } from './UnifiedNotification.service';

// Helper to notify all applicants about job status changes
export async function notifyJobApplicants(
  jobId: string,
  notificationType: NotificationType,
  title: string,
  message: string,
  additionalData?: Record<string, unknown>,
): Promise<void> {
  try {
    // Fetch all unique applicant user IDs for this job
    const applications = await prisma.application.findMany({
      where: { jobId },
      select: { userId: true },
    });

    const applicantUserIds = [...new Set(applications.map((app) => app.userId))];

    if (applicantUserIds.length === 0) {
      logger.info({ jobId }, 'No applicants to notify for job');
      return;
    }

    // Send notifications to all applicants
    await unifiedNotificationService.notifyUsers({
      userIds: applicantUserIds,
      type: notificationType,
      title,
      message,
      data: {
        jobId,
        ...additionalData,
      },
    });

    logger.info(
      { jobId, applicantCount: applicantUserIds.length, notificationType },
      'Job applicants notified',
    );
  } catch (error) {
    logger.error({ err: error, jobId, notificationType }, 'Failed to notify job applicants');
  }
}

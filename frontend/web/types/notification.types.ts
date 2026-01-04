export enum NotificationType {
  JOB_CREATED = 'JOB_CREATED',
  JOB_UPDATED = 'JOB_UPDATED',
  JOB_DEADLINE_EXTENDED = 'JOB_DEADLINE_EXTENDED',
  JOB_CLOSED = 'JOB_CLOSED',
  JOB_REOPENED = 'JOB_REOPENED',
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  OFFER_RECEIVED = 'OFFER_RECEIVED',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

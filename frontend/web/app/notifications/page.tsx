'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Bell, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationService } from '@/services/notification-service';
import type { Notification } from '@/types/notification.types';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await notificationService.getNotifications(50, 0);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void fetchNotifications();
    }
  }, [isAuthenticated]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead([notification.id]);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="w-full border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={logout} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Bell className="h-16 w-16 mx-auto mb-4 opacity-30 text-red-500" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => void fetchNotifications()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="h-16 w-16 mx-auto mb-4 opacity-30 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No notifications yet</h2>
            <p className="text-muted-foreground">
              When you receive notifications, they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => void handleNotificationClick(notification)}
                className={`p-6 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer ${
                  !notification.isRead ? 'bg-blue-500/5 border-blue-500/30' : 'bg-card'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

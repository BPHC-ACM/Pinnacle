'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, ListChecks } from 'lucide-react';
import { notificationService } from '@/services/notifications';
import { Button } from '@/components/ui/button';
import type { Notification } from '@/types/notification.types';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastReadTime, setLastReadTime] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load last read time from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('notificationLastReadTime');
    if (stored) {
      setLastReadTime(parseInt(stored, 10));
    }
  }, []);

  const calculateUnreadCount = useCallback((notifs: Notification[], lastRead: number) => {
    return notifs.filter((n) => new Date(n.createdAt).getTime() > lastRead).length;
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications(20, 0);
      setNotifications(data.notifications);
      // Update unread count based on local storage time
      const storedTime = parseInt(localStorage.getItem('notificationLastReadTime') || '0', 10);
      setUnreadCount(calculateUnreadCount(data.notifications, storedTime));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [calculateUnreadCount]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      // Fetch latest notifications to calculate local unread count
      const data = await notificationService.getNotifications(20, 0);
      const storedTime = parseInt(localStorage.getItem('notificationLastReadTime') || '0', 10);
      setUnreadCount(calculateUnreadCount(data.notifications, storedTime));
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      // Silently fail for unread count
      setUnreadCount(0);
    }
  }, [calculateUnreadCount]);

  const handleMarkAllAsRead = () => {
    const now = Date.now();
    setLastReadTime(now);
    localStorage.setItem('notificationLastReadTime', now.toString());
    setUnreadCount(0);
  };

  useEffect(() => {
    void fetchUnreadCount();
    const interval = setInterval(() => {
      void fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      void fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="relative flex items-center gap-2"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-xs text-white! flex items-center justify-center font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="fixed left-4 right-4 top-18 max-h-[80vh] sm:absolute sm:top-full sm:left-auto sm:right-0 sm:max-h-none sm:mt-2 sm:w-96 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              title="Mark all as read"
            >
              <ListChecks className="h-4 w-4 mr-1" />
              Read All
            </Button>
          </div>

          <div className="max-h-100 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No notifications</div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => {
                  const isUnread = new Date(notification.createdAt).getTime() > lastReadTime;
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 transition-colors ${
                        isUnread ? 'bg-muted/20' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-2">
                          {isUnread && (
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                          <h4 className={`text-sm ${isUnread ? 'font-semibold' : 'font-medium'}`}>
                            {notification.title}
                          </h4>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className={`text-sm text-muted-foreground mt-1 ${isUnread ? 'pl-4' : ''}`}>
                        {notification.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

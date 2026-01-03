'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { notificationService } from '@/services/notification-service';
import { Button } from '@/components/ui/button';

export default function NotificationButton() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const data = await notificationService.getNotifications(1, 0);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
        // Silently fail and keep unread count at 0
        setUnreadCount(0);
      }
    };

    void fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      void fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Button
      onClick={() => router.push('/notifications')}
      variant="outline"
      size="sm"
      className="relative flex items-center gap-2"
    >
      <Bell className="h-4 w-4" />
      <span>Notifications</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-semibold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );
}

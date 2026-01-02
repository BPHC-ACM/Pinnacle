'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';

// Icon components
const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{ id: number; message: string; time: string; read: boolean }>
  >([]);

  const fetchNotifications = async () => {
    try {
      // Check if notifications were cleared
      const cleared = localStorage.getItem('notificationsCleared');
      if (cleared === 'true') {
        setNotifications([]);
        return;
      }

      // In the future, fetch from API: const response = await api.get('/notifications');
      // For now, just leave empty since there's no backend endpoint yet
      setNotifications([]);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    // Don't check auth while still loading
    if (authLoading) return;

    if (!isAuthenticated) {
      console.log('Dashboard: Not authenticated, redirecting to home');
      router.push('/');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchNotifications();
    }
  }, [isAuthenticated, authLoading, router]);

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('notificationsCleared', 'true');
    setShowNotifications(false);
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      {/* Grid background pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <header className="w-full border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                onClick={() => setShowNotifications(!showNotifications)}
                variant="outline"
                size="sm"
                className="relative flex items-center gap-2"
              >
                <BellIcon className="h-4 w-4" />
                <span>Notifications</span>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-semibold">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div
                    className="absolute right-0 mt-2 w-96 rounded-xl border border-border shadow-2xl z-50 overflow-hidden"
                    style={{ backgroundColor: 'hsl(var(--card))' }}
                  >
                    <div
                      className="p-4 border-b border-border flex items-center justify-between"
                      style={{ backgroundColor: 'hsl(var(--card))' }}
                    >
                      <h3 className="font-semibold text-foreground text-lg">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                          >
                            Clear All
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-muted-foreground hover:text-foreground text-xl leading-none"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div
                      className="max-h-96 overflow-y-auto"
                      style={{ backgroundColor: 'hsl(var(--card))' }}
                    >
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <BellIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-border last:border-b-0 hover:bg-accent/5 transition-colors group ${
                              !notif.read ? 'bg-accent/10' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground font-medium mb-1">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-muted-foreground">{notif.time}</p>
                              </div>
                              {!notif.read && (
                                <button
                                  onClick={() => markAsRead(notif.id)}
                                  className="text-xs text-primary-500 hover:text-primary-600 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Mark Read
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <ThemeToggle />
            <Button onClick={logout} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        <>
          {/* Welcome Section */}
          <div className="text-center w-full mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-3">
              Hello, {user.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your job applications and manage your profile in one place.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => router.push('/jobs')}
              className="group p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="p-4 rounded-xl bg-accent/10 w-fit mb-4">
                <FileTextIcon className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Browse Jobs & Applications
              </h3>
              <p className="text-sm text-muted-foreground">
                View all available job opportunities and track your application status
              </p>
            </div>

            <div
              onClick={() => router.push('/profile')}
              className="group p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="p-4 rounded-xl bg-accent/10 w-fit mb-4">
                <UserIcon className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Complete Your Profile</h3>
              <p className="text-sm text-muted-foreground">
                Add your details, education, and experience to improve your applications
              </p>
            </div>
          </div>
        </>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Pinnacle. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

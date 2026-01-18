'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AnnouncementsFeed from '@/components/AnnouncementsFeed';
import { Header } from '@/components/Header';

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

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't check auth while still loading
    if (authLoading) return;

    if (!isAuthenticated) {
      console.log('Dashboard: Not authenticated, redirecting to home');
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

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
      <Header />
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full py-12">
        <>
          {/* Welcome Section */}
          <div className="text-center w-full mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-3">
              Hello,{' '}
              {user.name
                ?.trim()
                .split(' ')[0]
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase()) || 'there'}
              !
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your job applications and manage your profile in one place.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="order-2 md:order-1 md:col-span-2 p-8 rounded-2xl border border-border bg-card">
              <AnnouncementsFeed />
            </div>

            <div className="order-1 md:order-2 md:col-span-1 flex flex-col gap-6">
              <div
                onClick={() => router.push('/jobs')}
                className="group p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-center"
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
                className="group p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-center"
              >
                <div className="p-4 rounded-xl bg-accent/10 w-fit mb-4">
                  <UserIcon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Complete Your Profile
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add your details, education, and experience to improve your applications
                </p>
              </div>
            </div>
          </div>
        </>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
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

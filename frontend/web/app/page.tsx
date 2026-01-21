'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

// Feature icon components
const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function Home() {
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authenticated, redirect based on onboarding status
    if (!authLoading && isAuthenticated) {
      if (user && !user.hasOnboarded) {
        console.log('Landing page - user not onboarded, redirecting to onboarding');
        router.push('/onboarding');
      } else {
        console.log('Landing page - user is authenticated, redirecting to dashboard');
        router.push('/dashboard');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  // If already logged in, show loading/null while redirecting
  if (isAuthenticated) {
    return null;
  }

  console.log('Landing page - rendering main content');
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

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-7xl w-full space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-foreground">
              Your Career Journey
              <br />
              <span className="bg-linear-to-r from-accent to-accent/60 bg-clip-text text-primary-300">
                Starts Here
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover opportunities, connect with top companies, and take control of your
              professional growth with Pinnacle.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              className="group p-6 rounded-2xl border border-border bg-card backdrop-blur-none hover:shadow-lg transition-all duration-300"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="mb-4 p-3 rounded-xl bg-accent/10 w-fit">
                <BriefcaseIcon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Top Companies</h3>
              <p className="text-sm text-muted-foreground">
                Connect with leading employers and discover roles that match your skills and
                aspirations.
              </p>
            </div>

            <div
              className="group p-6 rounded-2xl border border-border bg-card backdrop-blur-none hover:shadow-lg transition-all duration-300"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="mb-4 p-3 rounded-xl bg-accent/10 w-fit">
                <ShieldIcon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Data Security</h3>
              <p className="text-sm text-muted-foreground">
                Your information is protected with enterprise-grade encryption and security
                measures.
              </p>
            </div>

            <div
              className="group p-6 rounded-2xl border border-border bg-card backdrop-blur-none hover:shadow-lg transition-all duration-300"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="mb-4 p-3 rounded-xl bg-accent/10 w-fit">
                <ZapIcon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Experience blazing-fast performance with our optimized platform built for speed.
              </p>
            </div>

            <div
              className="group p-6 rounded-2xl border border-border bg-card backdrop-blur-none hover:shadow-lg transition-all duration-300"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="mb-4 p-3 rounded-xl bg-accent/10 w-fit">
                <TrendingUpIcon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your applications and career journey with intuitive dashboards and insights.
              </p>
            </div>

            <div
              className="group p-6 rounded-2xl border border-border bg-card backdrop-blur-none hover:shadow-lg transition-all duration-300"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="mb-4 p-3 rounded-xl bg-accent/10 w-fit">
                <BellIcon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Stay updated with real-time alerts about opportunities that match your profile.
              </p>
            </div>

            <div
              className="group p-6 rounded-2xl border border-border bg-card backdrop-blur-none hover:shadow-lg transition-all duration-300"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <div className="mb-4 p-3 rounded-xl bg-accent/10 w-fit">
                <UsersIcon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quick Support</h3>
              <p className="text-sm text-muted-foreground">
                Get instant help and support from the Placement Unit to assist your career journey.
              </p>
            </div>
          </div>
        </div>
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

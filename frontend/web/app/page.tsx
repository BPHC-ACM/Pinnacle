'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

// Google icon SVG component
const Google = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="white">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

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
  const { login, isLoading, isAuthenticated } = useAuth();

  // If already logged in, the context handles the redirect
  if (isAuthenticated) return null;

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
        <div className="max-w-6xl mx-auto py-4 flex items-center justify-between">
          <Logo size="md" />
          <Button
            onClick={() => login()}
            disabled={isLoading}
            variant="accent"
            className="flex bg-primary-500 hover:bg-primary-600 active:bg-primary-600 h-10 items-center justify-center gap-2 rounded-lg px-6 text-sm font-medium shadow-sm transition-transform"
          >
            <Google className="h-4 w-4" />
            {isLoading ? 'Connecting…' : 'Sign in with Google'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl w-full space-y-16">
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

'use client';

import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationButton from '@/components/NotificationButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Briefcase, User } from 'lucide-react';

export function Header() {
  const { isAuthenticated, logout, login } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogoClick = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 w-full border-b border-border bg-background/90 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="cursor-pointer" onClick={handleLogoClick}>
            <Logo size="md" />
          </div>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-accent-500 hover:text-accent-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link
                href="/jobs"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive('/jobs')
                    ? 'text-accent-500 hover:text-accent-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Jobs
              </Link>
              <Link
                href="/profile"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'text-accent-500 hover:text-accent-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && <NotificationButton />}
          <ThemeToggle />
          {isAuthenticated ? (
            <Button onClick={logout} variant="outline" size="sm">
              Sign Out
            </Button>
          ) : (
            <Button onClick={login} variant="default" size="sm">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

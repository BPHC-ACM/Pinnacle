'use client';

import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationButton from '@/components/NotificationButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export function Header() {
  const { isAuthenticated, logout, login } = useAuth();
  const router = useRouter();

  const handleLogoClick = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  return (
    <header className="w-full border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="cursor-pointer" onClick={handleLogoClick}>
          <Logo size="md" />
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

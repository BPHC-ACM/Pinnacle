'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    console.log('Callback - Access Token:', accessToken ? 'Present' : 'Missing');
    console.log('Callback - Refresh Token:', refreshToken ? 'Present' : 'Missing');

    if (accessToken) {
      console.log('Saving tokens to localStorage...');
      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      console.log('Calling refreshUser...');
      refreshUser()
        .then((userData) => {
          console.log('refreshUser succeeded!', userData);
          if (userData && !userData.hasOnboarded) {
            console.log('User not onboarded, redirecting to /onboarding');
            setTimeout(() => router.push('/onboarding'), 500);
          } else {
            console.log('User onboarded, redirecting to /dashboard');
            setTimeout(() => router.push('/dashboard'), 500);
          }
        })
        .catch((error) => {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed. Please try again.');
          setTimeout(() => router.push('/'), 2000);
        });
    } else {
      console.error('No access token found in callback URL');
      toast.error('No authentication token received. Please try again.');
      setTimeout(() => router.push('/'), 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}

# Frontend Authentication Setup

This directory contains the authentication infrastructure for the Pinnacle frontend.

## Structure

```
frontend/web/
├── contexts/
│   └── auth-context.tsx          # Auth state management
├── lib/
│   └── api-client.ts              # Axios instance with interceptors
├── services/
│   └── auth.service.ts            # Auth API calls
├── types/
│   ├── auth.types.ts              # Auth type definitions
│   └── api.types.ts               # API response types
├── app/
│   └── auth/
│       └── callback/
│           └── page.tsx           # OAuth callback handler
└── .env.local                     # Environment variables
```

## Usage

### 1. Login Button

```tsx
import { useAuth } from '@/contexts/auth-context';

function LoginButton() {
  const { login } = useAuth();

  return <button onClick={login}>Sign in with Google</button>;
}
```

### 2. Display User Info

```tsx
import { useAuth } from '@/contexts/auth-context';

function UserProfile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div>
      <img src={user?.picture} alt={user?.name} />
      <p>{user?.name}</p>
      <p>{user?.email}</p>
    </div>
  );
}
```

### 3. Logout Button

```tsx
import { useAuth } from '@/contexts/auth-context';

function LogoutButton() {
  const { logout } = useAuth();

  return <button onClick={logout}>Logout</button>;
}
```

### 4. Protected Routes

```tsx
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected content</div>;
}
```

### 5. Check Admin Role

```tsx
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/types/auth.types';

function AdminPanel() {
  const { user } = useAuth();

  if (![UserRole.JPT, UserRole.SPT].includes(user?.role as UserRole)) {
    return <div>Access denied</div>;
  }

  return <div>Admin content</div>;
}
```

### 6. Making API Calls

```tsx
import { api } from '@/lib/api-client';

async function fetchJobs() {
  try {
    const response = await api.get('/jobs');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    throw error;
  }
}
```

## OAuth Flow

1. User clicks "Login with Google"
2. `login()` redirects to: `http://localhost:3000/api/auth/google`
3. Backend handles Google OAuth
4. Backend redirects to: `http://localhost:3001/auth/callback?token=<jwt>`
5. Callback page stores token in localStorage
6. Callback page fetches user data with token
7. User is redirected to dashboard

## Backend URL Configuration

Set in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For production, update to your deployed backend URL.

## Token Management

- Token stored in `localStorage` as `token`
- User data cached in `localStorage` as `user`
- Token automatically added to all API requests via axios interceptor
- If token expires (401 response), user is logged out automatically

## Next Steps

Once UI is ready:

1. Import `useAuth` hook in your components
2. Use `login()` for sign-in button
3. Use `user` object to display user info
4. Use `isAuthenticated` to show/hide UI elements
5. Use `logout()` for sign-out button
6. Wrap protected pages with auth check

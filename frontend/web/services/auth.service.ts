import { api } from '@/lib/api-client';
import { User } from '@/types/auth.types';

export const authService = {
  // Get current user
  me: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Initiate Google login (redirect to backend)
  loginWithGoogle: (): void => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    window.location.href = `${apiUrl}/api/auth/google`;
  },
};

import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from './client';
import type { AuthResponse, User } from '@/types';

// Auth API calls
export const authApi = {
  loginWithTelegram: async (initData: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/telegram', { initData });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// React Query hooks
export const useLoginWithTelegram = () => {
  return useMutation({
    mutationFn: authApi.loginWithTelegram,
    onError: (error) => {
      console.error('Telegram login failed:', error);
    },
  });
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
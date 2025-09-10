import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User, AuthTokens } from '@/types';
import { tokenManager } from '@/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setDemoMode: (demo: boolean) => void;
  updateBalance: (newBalance: number) => void;
}

// Demo user for testing without Telegram
const DEMO_USER: User = {
  id: 12345,
  firstName: 'Demo',
  lastName: 'User',
  username: 'demo_user',
  balance: 1000,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isDemoMode: false,

      setUser: (user: User) => {
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
      },

      setTokens: (tokens: AuthTokens) => {
        tokenManager.setTokens(tokens);
      },

      logout: () => {
        tokenManager.clearTokens();
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setDemoMode: (demo: boolean) => {
        set({ 
          isDemoMode: demo,
          user: demo ? DEMO_USER : null,
          isAuthenticated: demo,
          isLoading: false
        });
      },

      updateBalance: (newBalance: number) => {
        const { user } = get();
        if (user) {
          set({ 
            user: { ...user, balance: newBalance } 
          });
        }
      },
    }),
    {
      name: 'auth-store',
    }
  )
);
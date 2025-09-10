import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLoginWithTelegram } from '@/api/auth';
import { LoaderScreen } from '@/components/LoaderScreen';
import telegramService from '@/lib/telegram';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { setUser, setTokens, setDemoMode, setLoading } = useAuthStore();
  const { mutate: loginWithTelegram } = useLoginWithTelegram();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if running in Telegram WebApp
        if (telegramService.isAvailable && telegramService.initData) {
          console.log('Telegram WebApp detected, attempting login...');
          
          loginWithTelegram(telegramService.initData, {
            onSuccess: (response) => {
              console.log('Telegram login successful:', response.user);
              setUser(response.user);
              setTokens({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
              });
              setIsInitializing(false);
            },
            onError: (error) => {
              console.error('Telegram login failed:', error);
              // Fallback to demo mode
              setDemoMode(true);
              setIsInitializing(false);
            },
          });
        } else {
          console.log('Not in Telegram WebApp, using demo mode');
          // Not in Telegram WebApp - use demo mode
          setDemoMode(true);
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setDemoMode(true);
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [setUser, setTokens, setDemoMode, loginWithTelegram]);

  if (isInitializing) {
    return <LoaderScreen onComplete={() => setIsInitializing(false)} />;
  }

  return <>{children}</>;
};
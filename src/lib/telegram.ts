import WebApp from '@twa-dev/sdk';
import type { TelegramWebApp } from '@/types';

class TelegramService {
  private webApp: TelegramWebApp | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        this.webApp = window.Telegram.WebApp;
        this.webApp.ready();
        this.webApp.expand();
        this.isInitialized = true;
        
        // Set theme
        if (this.webApp.colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
        
        console.log('Telegram WebApp initialized:', {
          version: this.webApp.version,
          platform: this.webApp.platform,
          initData: !!this.webApp.initData
        });
      } else {
        console.warn('Telegram WebApp not available - running in demo mode');
      }
    } catch (error) {
      console.error('Failed to initialize Telegram WebApp:', error);
    }
  }

  get isAvailable(): boolean {
    return this.isInitialized && !!this.webApp;
  }

  get initData(): string {
    return this.webApp?.initData || '';
  }

  get user() {
    return this.webApp?.initDataUnsafe?.user;
  }

  get themeParams() {
    return this.webApp?.themeParams || {};
  }

  close() {
    if (this.webApp) {
      this.webApp.close();
    }
  }

  // Haptic feedback
  impactOccurred(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (this.webApp && 'HapticFeedback' in this.webApp) {
      // @ts-ignore - Telegram WebApp types might not include HapticFeedback
      this.webApp.HapticFeedback?.impactOccurred(style);
    }
  }

  notificationOccurred(type: 'error' | 'success' | 'warning') {
    if (this.webApp && 'HapticFeedback' in this.webApp) {
      // @ts-ignore
      this.webApp.HapticFeedback?.notificationOccurred(type);
    }
  }

  selectionChanged() {
    if (this.webApp && 'HapticFeedback' in this.webApp) {
      // @ts-ignore
      this.webApp.HapticFeedback?.selectionChanged();
    }
  }
}

export const telegramService = new TelegramService();
export default telegramService;
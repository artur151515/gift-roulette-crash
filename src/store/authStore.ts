import { create } from 'zustand';

interface AuthStore {
    user: {
        firstName?: string;
        lastName?: string;
        username?: string;
        balance?: number;
        photoUrl?: string;
        id?: number;
    } | null;
    isAuthReady: boolean;
    setAuthReady: (value: boolean) => void;
    setUser: (userData: {
        firstName?: string;
        lastName?: string;
        username?: string;
        balance?: number;
        photoUrl?: string;
        id?: number;
    }) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    isAuthReady: false,
    setAuthReady: (value) => set({ isAuthReady: value }),
    setUser: (userData) => set({ user: userData, isAuthReady: true }), // Обновление данных пользователя
    clearUser: () => set({ user: null, isAuthReady: false }),
}));


import { create } from "zustand";
import { apiClient } from "@/api/apiClient.ts";
import { TelegramUser } from "@/types/auth.ts";
import { getCurrentUser } from "@/api/auth.ts";
import { safeEncryptToken, safeDecryptToken, clearEncryptionData } from "@/lib/tokenEncryption.ts";

interface AuthStore {
    user: TelegramUser | null;
    accessToken: string | null;

    // setters
    setUser: (user: TelegramUser | null) => void;

    // tokens
    setAccessToken: (token: string | null) => void;
    clearAuth: () => void;

    // actions
    refresh: () => Promise<void>;
    logout: () => Promise<void>;
    updateBalance: (delta: number) => void;
    setBalance: (newBalance: number) => void;
    fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    accessToken: null,

    setUser: (user) => set({ user }),

    setAccessToken: (token) => {
        // Шифруем токен перед сохранением в памяти
        const encryptedToken = safeEncryptToken(token);
        set({ accessToken: encryptedToken });
    },

    clearAuth: () => {
        clearEncryptionData(); // Очищаем данные шифрования
        set({ accessToken: null, user: null });
    },

    // Попытка обновить accessToken через cookie (httponly refresh). Не передаём body.
    refresh: async () => {
        try {
            const { data } = await apiClient.post("/auth/refresh");
            const payload = data?.data ?? data;
            const newAccess = payload?.accessToken ?? payload?.tokens?.accessToken ?? null;
            const user = payload?.user ?? null;

            if (!newAccess) throw new Error("No access token returned from refresh");

            // Шифруем новый токен перед сохранением
            const encryptedToken = safeEncryptToken(newAccess);
            set({ accessToken: encryptedToken, user });
        } catch (err) {
            // При неудаче — полностью очистить стейт
            clearEncryptionData();
            set({ accessToken: null, user: null });
            throw err;
        }
    },

    logout: async () => {
        try {
            // TODO: будет реализовано в будущем на бекенде
            await apiClient.post("/auth/logout"); // cookie будет удалено бекендом
        } catch (e) {
            // игнорируем ошибки при logout, но можно логировать
            // console.warn("Logout failed:", e);
        } finally {
            clearEncryptionData(); // Очищаем данные шифрования
            set({ accessToken: null, user: null });
        }
    },

    updateBalance: (delta: number) => {
        const currentUser = get().user;
        if (currentUser) {
            set({
                user: {
                    ...currentUser,
                    balance: (currentUser.balance || 0) + delta,
                },
            });
        }
    },

    setBalance: (newBalance: number) => {
        const currentUser = get().user;
        if (currentUser) {
            set({
                user: {
                    ...currentUser,
                    balance: newBalance,
                },
            });
        }
    },

    fetchCurrentUser: async () => {
        try {
            const userData = await getCurrentUser();
            set({ user: userData });
        } catch (error) {
            // console.error('Failed to fetch current user:', error);
            // Don't clear auth on fetch error, just log it
        }
    },
}));

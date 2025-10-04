import { create } from "zustand";
import { apiClient } from "@/api/new/apiClient.ts";

interface User {
    firstName?: string;
    lastName?: string;
    username?: string;
    balance?: number;
    photoUrl?: string;
    id?: number;
}

interface AuthStore {
    user: User | null;
    accessToken: string | null;

    // setters
    setUser: (user: User | null) => void;

    // tokens
    setAccessToken: (token: string | null) => void;
    clearAuth: () => void;

    // actions
    refresh: () => Promise<void>;
    logout: () => Promise<void>;
    updateBalance: (delta: number) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    accessToken: null,

    setUser: (user) => set({ user }),

    setAccessToken: (token) => set({ accessToken: token }),

    clearAuth: () => set({ accessToken: null, user: null }),

    // Попытка обновить accessToken через cookie (httponly refresh). Не передаём body.
    refresh: async () => {
        try {
            const { data } = await apiClient.post("/auth/refresh");
            const payload = data?.data ?? data;
            const newAccess = payload?.accessToken ?? payload?.tokens?.accessToken ?? null;
            const user = payload?.user ?? null;

            if (!newAccess) throw new Error("No access token returned from refresh");

            set({ accessToken: newAccess, user });
        } catch (err) {
            // При неудаче — полностью очистить стейт
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
            console.warn("Logout failed:", e);
        } finally {
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
}));

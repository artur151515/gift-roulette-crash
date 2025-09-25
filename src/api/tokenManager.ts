import { create } from "zustand";
import { AuthTokens, RefreshTokenResponseDto } from "@/types/new/auth.ts";
import apiClient from "@/api/new/apiClient.ts";

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
    isAuthReady: boolean;
    accessToken: string | null;
    refreshToken: string | null;

    // setters
    setAuthReady: (value: boolean) => void;
    setUser: (user: User) => void;
    clearUser: () => void;

    // tokens
    setTokens: (tokens: AuthTokens) => void;
    clearTokens: () => void;
    refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    isAuthReady: false,
    accessToken: null,
    refreshToken: localStorage.getItem("refreshToken"),

    setAuthReady: (value) => set({ isAuthReady: value }),
    setUser: (user) => set({ user, isAuthReady: true }),
    clearUser: () => set({ user: null, isAuthReady: false }),

    setTokens: (tokens) => {
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
        localStorage.setItem("refreshToken", tokens.refreshToken);
    },

    clearTokens: () => {
        set({ accessToken: null, refreshToken: null });
        localStorage.removeItem("refreshToken");
    },

    refresh: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await apiClient.post<RefreshTokenResponseDto>("/auth/refresh", {
            refreshToken,
        });

        get().setTokens(data.tokens);
    },
}));
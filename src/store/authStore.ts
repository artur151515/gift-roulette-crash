// src/store/authStore.ts
import { create } from 'zustand';
import { api } from '@/lib/api';

type User = {
    id: string;
    firstName: string;
    lastName?: string;
    username?: string;
    balance: number;
};

type AuthState = {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthReady: boolean;
    loginWithTelegram: (initData: string) => Promise<void>;
    refreshTokens: () => Promise<void>;
    loadMe: () => Promise<void>;
    logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthReady: false,

    async loginWithTelegram(initData) {
        // Бекенд: POST /auth/telegram (initData из WebApp)
        // Схема ответа в OpenAPI пустая, но обычно это { accessToken, refreshToken, user }
        // Проверь точные имена полей на своей стороне.
        const { data } = await api.post('/auth/telegram', { initData }); // :contentReference[oaicite:3]{index=3}
        set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user ?? null,
            isAuthReady: true,
        });
        // (Необязательно) запланируй авто-рефреш за ~30–60с до exp
        scheduleProactiveRefresh();
    },

    async refreshTokens() {
        const rt = get().refreshToken;
        if (!rt) throw new Error('No refresh token');
        const { data } = await api.post('/auth/refresh', { refreshToken: rt }); // :contentReference[oaicite:4]{index=4}
        set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        scheduleProactiveRefresh();
    },

    async loadMe() {
        const { data } = await api.get('/auth/me'); // :contentReference[oaicite:5]{index=5}
        set({ user: data });
    },

    logout() {
        set({ user: null, accessToken: null, refreshToken: null, isAuthReady: true });
    },
}));

// ===== Вспомогательное: проактивный рефреш по exp =====
let refreshTimer: number | undefined;
function scheduleProactiveRefresh() {
    const { accessToken, refreshTokens } = useAuthStore.getState();
    if (!accessToken) return;
    try {
        const [, payload] = accessToken.split('.');
        const { exp } = JSON.parse(atob(payload));
        const msLeft = exp * 1000 - Date.now();
        const when = Math.max(5_000, msLeft - 60_000); // за минуту до истечения
        if (refreshTimer) window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => refreshTokens().catch(() => {}), when);
    } catch {
        // если токен без exp — ничего не планируем
    }
}

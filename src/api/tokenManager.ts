import { AuthTokens, RefreshTokenResponseDto } from '@/types/auth';
import { http } from './http';

type Listener = (t: AuthTokens | null) => void;

let accessToken: string | null = null;
let refreshToken: string | null = localStorage.getItem('refreshToken');
let refreshTimer: number | null = null;

const listeners = new Set<Listener>();
const notify = (t: AuthTokens | null) => listeners.forEach((l) => l(t));

function decodeExpMs(token: string): number | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch { return null; }
}

function scheduleRefresh(tokens: AuthTokens) {
    if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null; }

    const expMs = tokens.expiresAt ? tokens.expiresAt * 1000 : decodeExpMs(tokens.accessToken);
    if (!expMs) return; // не знаем срок — не планируем

    const skewMs = 30_000; // обновимся за 30s до смерти
    const delay = Math.max(0, expMs - Date.now() - skewMs);

    refreshTimer = window.setTimeout(async () => {
        try {
            await tokenManager.refresh();
        } catch {
            tokenManager.forceLogout();
        }
    }, delay) as unknown as number;
}

export const tokenManager = {
    onChange(cb: Listener) { listeners.add(cb); return () => listeners.delete(cb); },

    setTokens(tokens: AuthTokens) {
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        localStorage.setItem('refreshToken', refreshToken);
        scheduleRefresh(tokens);
        notify(tokens);
    },

    clearTokens() {
        accessToken = null;
        refreshToken = null;
        localStorage.removeItem('refreshToken');
        if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null; }
        notify(null);
    },

    getAccessToken() { return accessToken; },
    getRefreshToken() { return refreshToken; },

    async refresh(): Promise<void> {
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await http.post<RefreshTokenResponseDto>('/auth/refresh', { refreshToken });
        this.setTokens(data.tokens);
    },

    // Позовём из интерцептора при фатальной ошибке
    forceLogout() {
        this.clearTokens();
        // пусть стор отреагирует
        window.dispatchEvent(new CustomEvent('auth:force-logout'));
    },
};

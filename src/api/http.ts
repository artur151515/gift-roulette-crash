import axios from 'axios';
import { tokenManager } from './tokenManager';

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

http.interceptors.request.use((config) => {
    const at = tokenManager.getAccessToken();
    if (at) config.headers.Authorization = `Bearer ${at}`;
    return config;
});

let refreshInFlight: Promise<void> | null = null;

http.interceptors.response.use(
    (r) => r,
    async (error) => {
        const original = error.config;
        const status = error?.response?.status;

        if (status === 401 && !original.__isRetry) {
            if (!refreshInFlight) {
                refreshInFlight = tokenManager.refresh().finally(() => {
                    refreshInFlight = null;
                });
            }
            try {
                await refreshInFlight;
                original.__isRetry = true;
                return http(original);
            } catch {
                // refresh не удался — полный логаут
                tokenManager.forceLogout();
            }
        }
        return Promise.reject(error);
    }
);

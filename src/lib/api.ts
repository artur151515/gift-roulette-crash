// src/lib/apiClient.ts
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // например, https://api.example.com
    withCredentials: false,
});

// Добавляем accessToken в каждый запрос
api.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

// Если 401 — пробуем рефреш и повтор запроса один раз
let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
    (r) => r,
    async (error) => {
        const { refreshToken, refreshTokens, logout } = useAuthStore.getState();
        const original = error.config;

        if (error?.response?.status === 401 && refreshToken && !original._retry) {
            if (isRefreshing) {
                await new Promise<void>((res) => queue.push(res));
                original.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
                return api(original);
            }
            original._retry = true;
            try {
                isRefreshing = true;
                await refreshTokens(); // дернёт /auth/refresh
                queue.forEach((res) => res());
                queue = [];
                original.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
                return api(original);
            } catch (e) {
                logout();
                throw e;
            } finally {
                isRefreshing = false;
            }
        }
        throw error;
    }
);

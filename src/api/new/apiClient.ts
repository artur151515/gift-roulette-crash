import axios from "axios";
import { refreshToken as refreshTokenRequest } from "@/api/new/auth.ts"; // твой метод refresh

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ❗️ ( заменить на Zustand)
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
    accessToken = access;
    refreshToken = refresh;
};

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Добавляем accessToken к каждому запросу
apiClient.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Перехватчик ответов: если 401 → пробуем обновить токен
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            refreshToken
        ) {
            originalRequest._retry = true;
            try {
                const newTokens = await refreshTokenRequest(refreshToken);
                setTokens(newTokens.data.accessToken, newTokens.data.refreshToken);

                // Повторяем запрос с новым токеном
                originalRequest.headers.Authorization = `Bearer ${newTokens.data.accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error("Refresh token failed", refreshError);
                // здесь можно сделать logout
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
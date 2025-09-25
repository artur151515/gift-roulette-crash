import apiClient, { setTokens } from "./apiClient";
import { TelegramLoginResponse, TelegramUser } from "@/types/new/auth.ts";

export const loginWithTelegram = async (
    initData: string
): Promise<TelegramLoginResponse> => {
    const { data } = await apiClient.post<TelegramLoginResponse>(
        "/auth/telegram",
        { initData }
    );
    setTokens(data.data.accessToken, data.data.refreshToken);
    return data;
};

export const refreshToken = async (
    refreshToken: string
): Promise<TelegramLoginResponse> => {
    const { data } = await apiClient.post<TelegramLoginResponse>(
        "/auth/refresh",
        { refreshToken }
    );
    return data;
};

export const getCurrentUser = async (): Promise<TelegramUser> => {
    const { data } = await apiClient.get<TelegramUser>("/auth/me");
    return data;
};
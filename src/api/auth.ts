import { apiClient } from "./apiClient.ts";
import {GetMeResponse, TelegramLoginResponse, TelegramUser} from "@/types/new/auth.ts";
import {useAuthStore} from "@/store/authStore.ts";

export const loginWithTelegram = async (
    initData: string
): Promise<TelegramLoginResponse> => {
    const { data } = await apiClient.post<TelegramLoginResponse>(
        "/auth/telegram",
        { initData }
    );

    useAuthStore.getState().setAccessToken(data.data.accessToken);
    return data;
};

export const refreshAccessToken = async (): Promise<TelegramLoginResponse> => {
    const { data } = await apiClient.post<TelegramLoginResponse>("/auth/refresh");
    return data;
};

export const getCurrentUser = async (): Promise<TelegramUser> => {
    const { data } = await apiClient.get<GetMeResponse>("/auth/me");
    return data.data;
};
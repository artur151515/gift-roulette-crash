import { apiClient } from "./apiClient.ts";
import {GetMeResponse, TelegramLoginResponse, TelegramUser} from "@/types/auth.ts";
import {useAuthStore} from "@/store/authStore.ts";

export const loginWithTelegram = async (
	initData: string
): Promise<TelegramLoginResponse> => {
	// Базовая проверка формата
	if (!initData || typeof initData !== "string") {
		throw new Error("Invalid initData");
	}

	// Проверка наличия обязательных полей
	const params = new URLSearchParams(initData);
	if (!params.has("user") || !params.has("auth_date") || !params.has("hash")) {
		throw new Error("Invalid initData format");
	}

	// Проверка времени (не старше 24 часов)
	const authDate = parseInt(params.get("auth_date") || "0");
	const now = Math.floor(Date.now() / 1000);
	if (now - authDate > 86400) {
		throw new Error("initData expired");
	}

	const { data } = await apiClient.post("/auth/telegram", { initData });

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
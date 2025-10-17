import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore.ts";
import { safeDecryptToken } from "@/lib/tokenEncryption.ts";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const apiClient = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
});

// Добавление accessToken к каждому запросу
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const authStore = useAuthStore.getState();
	const encryptedToken = authStore.accessToken;
	
	if (encryptedToken) {
		// Расшифровываем токен перед отправкой
		const decryptedToken = safeDecryptToken(encryptedToken);
		if (decryptedToken) {
			config.headers.Authorization = `Bearer ${decryptedToken}`;
		}
	}
	return config;
});

// Очередь для запросов во время refresh
let isRefreshing = false;
type QueueItem = {
	resolve: (value?: unknown) => void;
	reject: (reason?: unknown) => void;
};
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) reject(error);
		else resolve(token);
	});
	failedQueue = [];
};

apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError & { config?: InternalAxiosRequestConfig }) => {
		const originalRequest = error.config;

		if (!originalRequest) {
			return Promise.reject(error);
		}

		// Обрабатываем только 401
		if (error.response?.status === 401) {
			if (isRefreshing) {
				// ждём пока закончится текущий refresh
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				}).then((token) => {
					if (token && originalRequest.headers) {
						originalRequest.headers.Authorization = `Bearer ${token as string}`;
					}
					return apiClient(originalRequest);
				});
			}

			isRefreshing = true;

			try {
				await useAuthStore.getState().refresh();
				const encryptedToken = useAuthStore.getState().accessToken;
				
				// Расшифровываем токен перед использованием
				const decryptedToken = safeDecryptToken(encryptedToken);

				processQueue(null, decryptedToken);

				if (decryptedToken && originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${decryptedToken}`;
				}

				return apiClient(originalRequest);
			} catch (refreshErr) {
				processQueue(refreshErr, null);
				useAuthStore.getState().clearAuth();
				window.dispatchEvent(new CustomEvent("auth:force-logout"));
				return Promise.reject(refreshErr);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}
);

export default apiClient;
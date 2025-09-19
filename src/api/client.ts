import axios from 'axios';
import {AuthTokens} from "@/types/auth.ts";


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
class TokenManager {
  private tokens: AuthTokens | null = null;

  getTokens(): AuthTokens | null {
    if (!this.tokens) {
      const stored = localStorage.getItem('auth_tokens');
      if (stored) {
        try {
          this.tokens = JSON.parse(stored);
        } catch (error) {
          console.error('Failed to parse stored tokens:', error);
          this.clearTokens();
        }
      }
    }
    return this.tokens;
  }

  setTokens(tokens: AuthTokens) {
    this.tokens = tokens;
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }

  clearTokens() {
    this.tokens = null;
    localStorage.removeItem('auth_tokens');
  }

  getAccessToken(): string | null {
    return this.getTokens()?.accessToken || null;
  }

  getRefreshToken(): string | null {
    return this.getTokens()?.refreshToken || null;
  }
}

export const tokenManager = new TokenManager();

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          tokenManager.setTokens({ accessToken, refreshToken: newRefreshToken });

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          tokenManager.clearTokens();
          // Redirect to auth or show login modal
          window.location.reload();
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
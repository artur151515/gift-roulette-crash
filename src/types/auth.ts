// Core types for the Telegram Mini App
export interface User {
    id: number | string;
    firstName: string;
    lastName?: string;
    username?: string;
    avatarUrl?: string | null;
    balance: number;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt?: number; // UNIX seconds (опционально)
}

export type TelegramLoginDto = {
    initData: string; // raw строка initData из Telegram.WebApp
};

export type TelegramLoginResponseDto = {
    user: User;
    tokens: AuthTokens;
};

// /auth/refresh
export type RefreshTokenDto = { refreshToken: string };
export type RefreshTokenResponseDto = { tokens: AuthTokens };

// /auth/me
export type UserResponseDto = { user: User };
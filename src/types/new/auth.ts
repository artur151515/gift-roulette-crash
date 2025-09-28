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

export type TelegramUser = {
    id: number;
    first_name: string;
    last_name?: string;
    username: string;
    language_code: string;
    allows_write_to_pm: boolean;
    photo_url: string;
};

export type TelegramLoginResponse = {
    success: boolean;
    data: {
        accessToken: string;
        // refreshToken: string;
    }
};

export type TelegramLoginDto = {
    initData: string; // raw строка initData из Telegram.WebApp
};

export type TelegramLoginResponseDto = {
    user: User;
    tokens: AuthTokens;
};

export type RefreshTokenDto = { refreshToken: string };
export type RefreshTokenResponseDto = { tokens: AuthTokens };


export type UserResponseDto = { user: User };
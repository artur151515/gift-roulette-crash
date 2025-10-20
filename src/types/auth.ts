export type TelegramUser = {
    id: string;
    createdAt: string;
    updatedAt: string;
    telegramId: string;
    username: string;
    firstName: string;
    lastName?: string;
    photoUrl?: string;
    balance: number;
};

export type GetMeResponse = {
    success: boolean;
    data: TelegramUser;
}

export type TelegramLoginResponse = {
    success: boolean;
    data: {
        accessToken: string;
    }
};

// export type TelegramLoginDto = {
//     initData: string; // raw строка initData из Telegram.WebApp
// };
//
// export type TelegramLoginResponseDto = {
//     user: User;
//     tokens: AuthTokens;
// };
//
// export type RefreshTokenDto = { refreshToken: string };
// export type RefreshTokenResponseDto = { tokens: AuthTokens };
//
//
// export type UserResponseDto = { user: User };
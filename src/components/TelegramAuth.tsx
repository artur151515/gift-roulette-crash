import React, { useEffect, useState } from "react";
import { loginWithTelegram } from "@/api";
import { useAuthStore } from "@/store/authStore";

const TelegramAuth: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const setAuthReady = useAuthStore((state) => state.setAuthReady);
    const setUser = useAuthStore((state) => state.setUser);

    useEffect(() => {
        const initData = window.Telegram?.WebApp?.initData;
        if (!initData) {
            setError("initData пустой");
            return;
        }

        const authenticate = async () => {
            try {
                // Отправляем initData на сервер для авторизации
                const result = await loginWithTelegram(initData);

                // Декодируем initData для отображения
                const decoded = decodeURIComponent(initData.split("&")[0].split("=")[1]);
                const userData = JSON.parse(decoded);

                // Убедитесь, что данные пользователя имеют правильную структуру
                const user = {
                    firstName: userData.first_name,
                    lastName: userData.last_name || '',
                    username: userData.username,
                    id: userData.id,
                    balance: 0, // Если баланс можно получить с сервера, обновите это поле
                    photoUrl: userData.photo_url,
                };

                // Сохраняем данные пользователя в хранилище
                setUser(user);
                setAuthReady(true);

                // Сохраняем токены в localStorage
                localStorage.setItem("accessToken", result.accessToken);
                localStorage.setItem("refreshToken", result.refreshToken);
            } catch (err: any) {
                setError(err.message);
                setAuthReady(false);
            }
        };

        authenticate();
    }, [setAuthReady, setUser]);

    return (
        <div>
            <p>Telegram Auth Component</p>
            {error && <p>{error}</p>}
        </div>
    );
};

export default TelegramAuth;

import React, { useEffect, useState } from 'react';

const TelegramAuth: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [jwtToken, setJwtToken] = useState<string | null>(null);

    useEffect(() => {
        // Проверка, доступна ли информация о пользователе через WebApp Telegram
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();

            // Получаем initData с Telegram
            const initData = window.Telegram.WebApp.initData;
            if (initData) {
                authenticateWithTelegram(initData);
            } else {
                console.log("initData is empty");
            }
        }
    }, []);

    const authenticateWithTelegram = async (initData: string) => {
        try {
            // Декодируем initData (параметры URL)
            const decodedData = decodeURIComponent(initData.split("&")[0].split("=")[1]);
            const userData = JSON.parse(decodedData);
            // setError(JSON.stringify(initData))
            // Отправляем initData на сервер для авторизации
            const response = await fetch('https://turkeywrind.cloudpub.ru/auth/telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ initData }),
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const data = await response.json();

            // Успешная авторизация, сохраняем токен и информацию о пользователе
            setUser(userData);
            setJwtToken(data.accessToken); // Сохраняем JWT токен

            // Сохранение токенов в localStorage для дальнейшего использования
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

        } catch (err) {
            setError('Ошибка авторизации');
            console.error(err);
        }
    };

    return (
        <div>
            {user ? (
                <div>
                    <h1>Добро пожаловать, {user.first_name}!</h1>
                    <p>Ваш баланс: {user.balance || 'Неизвестен'}</p>
                    <img src={user.photo_url} alt="User profile" />
                    <p>Ваш Telegram: @{user.username}</p>
                </div>
            ) : (
                <div>
                    {error && <p>{error}</p>}
                    <h2>Авторизация через Telegram</h2>
                    {/* Выводим объект WebApp для теста */}
                    <pre>{JSON.stringify(window.Telegram.WebApp, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default TelegramAuth;

// src/auth/bootstrapAuth.ts
import { useAuthStore } from '@/store/authStore';

export async function bootstrapAuth() {
    const tg = window.Telegram.WebApp;
    const initData = tg?.initData;

    // Выводим initData в консоль, чтобы проверить её
    console.log("Telegram initData:", tg);

    if (initData) {
        try {
            // Отправляем initData на сервер для авторизации
            // await loginWithTelegram(initData); // Функция для авторизации
            // await useAuthStore.getState().loadMe(); // Загрузка информации о пользователе
            return;
        } catch (e) {
            console.error("Ошибка авторизации:", e);
        }
    } else {
        console.error("initData не получено!");
    }
}

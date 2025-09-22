import { useAuthStore } from "@/store/authStore";
import TelegramAuth from "@/components/Telegram/TelegramAuth.tsx"; // Используем хранилище

function AuthGate({ children }: { children: React.ReactNode }) {
    const isAuthReady = useAuthStore((s) => s.isAuthReady);
    // useAuthStore.getState().clearUser();
    // localStorage.removeItem('accessToken');
    // localStorage.removeItem('refreshToken');

    // Если авторизация не завершена, показываем компонент для авторизации через Telegram
    if (!isAuthReady) {
        return <TelegramAuth />;
    }

    return <>{children}</>;
}

export default AuthGate;
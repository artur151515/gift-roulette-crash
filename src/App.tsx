import { StrictMode, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./app/router";
import { useAuthStore } from "@/store/authStore";
import {loginWithTelegram} from "@/api/auth.ts";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
                if (error?.response?.status === 401 || error?.response?.status === 403) return false;
                return failureCount < 2;
            },
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
        },
        mutations: {
            retry: false,
        }
    },
});

const App = () => {
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const setAccessToken = useAuthStore((s) => s.setAccessToken);
    const setUser = useAuthStore((s) => s.setUser);
    const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);

    useEffect(() => {
        (async () => {
            try {
                await useAuthStore.getState().refresh();
                // After successful refresh, fetch current user data
                await fetchCurrentUser();
            } catch {
                try {
                    const params = new URLSearchParams(window.location.search);
                    const initDataFromQuery = params.get("initData");
                    const tgInitData = (window as any)?.Telegram?.WebApp?.initData;
                    const initData = initDataFromQuery ?? tgInitData ?? null;

                    if (initData) {
                        // отправляем initData на бекенд; бекенд должен установить httponly refresh cookie и вернуть accessToken
                        const res = await loginWithTelegram(initData);
                        window.history.replaceState({}, "", window.location.pathname);
                        // After successful login, fetch current user data
                        await fetchCurrentUser();
                    } else {
                        // нет initData и нет valid refresh — пользователь не аутентифицирован
                        // если у тебя нет логина — можно показать кнопку Login Widget в UI
                    }
                } catch (e) {
                    console.warn("Telegram login attempt failed", e);
                }
            } finally {
                setIsBootstrapping(false);
            }
        })();
    }, [setAccessToken, setUser, fetchCurrentUser]);

    if (isBootstrapping) {
        return (
            <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
                <div>Загрузка…</div>
            </div>
        );
    }

    return (
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <BrowserRouter>
                        <AppRouter />
                    </BrowserRouter>
                    <Toaster />
                    <Sonner />
                </TooltipProvider>
            </QueryClientProvider>
        </StrictMode>
    );
};

export default App;

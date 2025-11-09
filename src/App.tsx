import { StrictMode, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./app/router";
import { useAuthStore } from "@/store/authStore";
import { loginWithTelegram } from "@/api/auth.ts";
import {ErrorBoundary} from "@/components/ErrorBoundary.tsx";

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
                    // console.warn("Telegram login attempt failed", e);
                }
            } finally {
                setIsBootstrapping(false);
            }
        })();
    }, [setAccessToken, setUser, fetchCurrentUser]);

    if (isBootstrapping) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-background/50 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
                    {/* Logo/Icon Animation */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl animate-spin-slow">
                            <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center">
                                <span className="text-4xl">🎁</span>
                            </div>
                        </div>
                    </div>

                    {/* Loading Text */}
                    <div className="flex flex-col items-center gap-3">
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">
                            Gift Roulette
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                        </div>
                        <p className="text-sm text-muted-foreground">Загрузка...</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-64 h-1 bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent animate-progress" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <StrictMode>
            <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                    <TooltipProvider>
                        <BrowserRouter>
                            <AppRouter />
                        </BrowserRouter>
                        <Toaster />
                        <Sonner />
                    </TooltipProvider>
                </QueryClientProvider>
            </ErrorBoundary>
        </StrictMode>
    );
};

export default App;

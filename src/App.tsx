import { StrictMode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./app/router";
import AuthGate from "@/components/AuthGate.tsx"; // Компонент для авторизации через Telegram

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
    },
});

const App = () => (
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <BrowserRouter>
                    <AuthGate>
                        <AppRouter />
                    </AuthGate>
                </BrowserRouter>
                <Toaster />
                <Sonner />
            </TooltipProvider>
        </QueryClientProvider>
    </StrictMode>
);

export default App;

import { StrictMode, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter /* см. примечание про HashRouter ниже */ } from "react-router-dom";
import { AppRouter } from "./app/router";
import { useAuthStore } from "@/store/authStore";
import { bootstrapAuth } from "@/auth/bootstrapAuth";
import TelegramAuth from "@/components/TelegramAuth.tsx"; // тот, что авторизует по Telegram initData

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       // меньше «дёрганья» API в мини-приложении
//       refetchOnWindowFocus: false,
//       retry: (failureCount, error: any) => {
//         if (error?.response?.status === 401 || error?.response?.status === 403) return false;
//         return failureCount < 2;
//       },
//       staleTime: 5 * 60 * 1000,
//       gcTime: 10 * 60 * 1000,
//     },
//   },
// });

// function AuthGate({ children }: { children: React.ReactNode }) {
//   const isAuthReady = useAuthStore((s) => s.isAuthReady);
//
//   useEffect(() => {
//     // единоразовый bootstrap авторизации и Telegram WebApp API
//     bootstrapAuth();
//   }, []);
//
//   if (!isAuthReady) {
//     // глобальный сплэш/заглушка пока определяемся (initData/refresh/me)
//     return (
//         <div className="min-h-screen p-4">
//           <div className="space-y-4">
//             <div className="h-10 w-1/2 rounded-lg bg-muted animate-pulse" />
//             <div className="h-24 rounded-xl bg-muted animate-pulse" />
//             <div className="h-48 rounded-xl bg-muted animate-pulse" />
//           </div>
//         </div>
//     );
//   }
//   return <>{children}</>;
// }

// const App = () => (
//     <StrictMode>
//       <QueryClientProvider client={queryClient}>
//         <TooltipProvider>
//           <BrowserRouter>
//             <AuthGate>
//               <AppRouter />
//             </AuthGate>
//           </BrowserRouter>
//           <Toaster />
//           <Sonner />
//         </TooltipProvider>
//       </QueryClientProvider>
//     </StrictMode>
// );

const App = () => {
  return (
      <div>
        <h1>Добро пожаловать в наше приложение!</h1>
        <TelegramAuth /> {/* Вставка компонента авторизации */}
      </div>
  );
};


export default App;

import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import telegramService from '@/lib/telegram';
import ReferralSystem from "@/components/Profile/ReferralSystem.tsx";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ReferralPage = () => {
    const { user } = useAuthStore();

    const tg = (window as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: Record<string, unknown> } } } })?.Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;

    const displayId = user?.telegramId ? parseInt(user.telegramId) : (tgUser?.id as number);

    const referralLink = `${import.meta.env.VITE_BOT_URL}${displayId ?? '0'}`;

    const handleCopyReferralLink = () => {
        navigator.clipboard.writeText(referralLink);
        telegramService.notificationOccurred('success');
        toast({
            title: "Ссылка скопирована!",
            description: "Реферальная ссылка скопирована в буфер обмена",
        });
    };

    if (!tgUser && !user) {
        return (
            <div className="flex-1 pb-20 p-4">
                <div className="space-y-6">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-40 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 pb-20">
            <div className="p-4 space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Реферальная программа</h1>
                    <p className="text-muted-foreground">
                        Приглашайте друзей и зарабатывайте вместе
                    </p>
                </div>

                {/* Referral System Card */}
                <ReferralSystem 
                    referralLink={referralLink} 
                    onCopyReferralLink={handleCopyReferralLink} 
                />

                {/* Additional Info Cards */}
                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle>Как это работает?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                1
                            </div>
                            <div>
                                <h3 className="font-medium">Поделитесь ссылкой</h3>
                                <p className="text-sm text-muted-foreground">
                                    Отправьте свою реферальную ссылку друзьям
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                2
                            </div>
                            <div>
                                <h3 className="font-medium">Друзья регистрируются</h3>
                                <p className="text-sm text-muted-foreground">
                                    Они переходят по вашей ссылке и начинают играть
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                3
                            </div>
                            <div>
                                <h3 className="font-medium">Получайте бонусы</h3>
                                <p className="text-sm text-muted-foreground">
                                    Зарабатывайте 10% от каждого их депозита
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Card (placeholder for future implementation) */}
                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle>Ваша статистика</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/20 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-sm text-muted-foreground">Рефералов</p>
                            </div>
                            <div className="bg-muted/20 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-sm text-muted-foreground">Заработано</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};


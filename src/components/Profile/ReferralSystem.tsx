import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import {Button} from "@/components/ui/button.tsx";
import {Copy, Share2} from "lucide-react";
import telegramService from "@/lib/telegram";

const ReferralSystem: React.FC<{ referralLink: string; onCopyReferralLink: () => void }> = ({ referralLink, onCopyReferralLink }) => {
    const handleShareToTelegram = () => {
        try {
            // Получаем Telegram WebApp
            const webApp = (window as any)?.Telegram?.WebApp;
            
            if (webApp) {
                // Текст приглашения
                const shareText = `🎁 Присоединяйся к Gift Roulette! Открывай кейсы и выигрывай крутые подарки!`;
                
                // Используем нативный метод Telegram для шаринга
                // const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
                const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}`;

                // Открываем окно шаринга
                webApp.openTelegramLink(shareUrl);

                telegramService.impactOccurred('light');
            } else {
                onCopyReferralLink();
            }
        } catch (error) {
            console.error('Error sharing to Telegram:', error);
            // Fallback: копируем ссылку при ошибке
            onCopyReferralLink();
        }
    };

    return (
        <Card className="card-elevated">
            <CardHeader>
                <CardTitle>Зарабатывайте от депозитов ваших друзей</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
                {/*<p className="text-muted-foreground text-sm">Приглашайте друзей и получайте 10% от их депозитов в виде бонуса!</p>*/}
                <div className="flex gap-3">
                    <Button 
                        onClick={handleShareToTelegram} 
                        className="flex-1 btn-primary flex items-center gap-2"
                    >
                        <Share2 className="h-4 w-4" />
                        Пригласить друга
                    </Button>
                    <Button 
                        onClick={onCopyReferralLink} 
                        variant="outline"
                        className="flex items-center gap-2 px-4"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <div className="bg-muted/20 rounded-lg p-3 text-center">
                    <p className="text-sm text-muted-foreground">Условия</p>
                    <p className="text-xs text-muted-foreground mt-1">Пригласите друзей в бота и получайте 10% от суммы каждого их пополнения на свой счет</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default ReferralSystem;

import { Copy, Gift, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useInventory } from '@/api/user';
import { cn } from '@/lib/utils';
import telegramService from '@/lib/telegram';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const { openDepositModal } = useUIStore();
  const { data: inventory, isLoading: isLoadingInventory } = useInventory();

  const handleCopyReferralLink = () => {
    const referralLink = `https://t.me/your_bot?start=ref_${user?.id}`;
    navigator.clipboard.writeText(referralLink);
    telegramService.notificationOccurred('success');
    toast({
      title: "Ссылка скопирована!",
      description: "Реферальная ссылка скопирована в буфер обмена",
    });
  };

  const handleDepositGifts = () => {
    telegramService.impactOccurred('light');
    openDepositModal();
  };

  const handleDepositTON = () => {
    telegramService.impactOccurred('light');
    // In real app, this would open TON payment
    toast({
      title: "Пополнение TON",
      description: "Функция будет доступна в ближайшее время",
    });
  };

  if (!user) {
    return (
      <div className="flex-1 pb-20 p-4">
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>

        {/* User Info Card */}
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {user.firstName.charAt(0).toUpperCase()}
              </div>

              {/* User Details */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">
                  {user.firstName} {user.lastName}
                </h2>
                {user.username && (
                  <p className="text-muted-foreground text-sm">
                    @{user.username}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg">💎</span>
                  <span className="font-bold text-lg text-foreground">
                    {user.balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deposit Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button
                onClick={handleDepositGifts}
                className="btn-primary flex items-center gap-2"
              >
                <Gift className="h-4 w-4" />
                Пополнить
              </Button>
              
              <Button
                onClick={handleDepositTON}
                variant="outline"
                className="btn-secondary flex items-center gap-2"
              >
                <Coins className="h-4 w-4" />
                Пополнить TON
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Инвентарь ({inventory?.length || 0})</span>
              <Button variant="ghost" size="sm" className="text-primary">
                Продать все
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {isLoadingInventory ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : inventory && inventory.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="relative bg-card/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors"
                  >
                    {/* Quantity badge */}
                    {item.quantity && item.quantity > 1 && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-1 -right-1 h-5 min-w-5 text-xs"
                      >
                        {item.quantity}
                      </Badge>
                    )}

                    {/* Item image placeholder */}
                    <div className="aspect-square rounded-lg bg-primary/10 flex items-center justify-center text-2xl mb-2">
                      🎁
                    </div>

                    {/* Item info */}
                    <div className="text-center space-y-1">
                      <p className="text-xs font-medium line-clamp-1 text-foreground">
                        {item.name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        💎{item.price}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="font-semibold text-foreground">
                  Инвентарь пуст
                </h3>
                <p className="text-muted-foreground text-sm">
                  Откройте кейсы, чтобы получить предметы!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referral System */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Зарабатывайте 10% от депозитов ваших друзей</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <p className="text-muted-foreground text-sm">
              Приглашайте друзей и получайте 10% от их депозитов в виде бонуса!
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={handleCopyReferralLink}
                className="flex-1 btn-primary flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Пригласить
              </Button>
              
              <Button variant="outline" size="sm" className="px-3">
                📋
              </Button>
            </div>

            <div className="bg-muted/20 rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">Условия</p>
              <p className="text-xs text-muted-foreground mt-1">
                Получайте 10% от каждого депозита ваших рефералов
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
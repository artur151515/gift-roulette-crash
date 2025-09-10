import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useCreateInvoice } from '@/api/deposits';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import telegramService from '@/lib/telegram';

const GIFT_PACKAGES = [
  { stars: 50, gems: 1.0, popular: false },
  { stars: 100, gems: 2.1, popular: true },
  { stars: 250, gems: 5.5, popular: false },
  { stars: 500, gems: 11.5, popular: false },
  { stars: 1000, gems: 24.0, popular: false },
];

const TON_PACKAGES = [
  { ton: 1, gems: 200, popular: false },
  { ton: 5, gems: 1100, popular: true },
  { ton: 10, gems: 2300, popular: false },
];

export const DepositModal = () => {
  const { isDepositModalOpen, closeDepositModal, selectedCurrency, setCurrency } = useUIStore();
  const { user } = useAuthStore();
  const { mutate: createInvoice, isPending } = useCreateInvoice();
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const handlePackageSelect = (pkg: any) => {
    telegramService.selectionChanged();
    setSelectedPackage(pkg);
  };

  const handlePurchase = () => {
    if (!selectedPackage) return;

    telegramService.impactOccurred('medium');

    if (selectedCurrency === 'gifts') {
      // Simulate Telegram Stars payment
      toast({
        title: "Демо режим",
        description: `Покупка ${selectedPackage.stars} звезд за ${selectedPackage.gems} 💎`,
      });
      closeDepositModal();
    } else {
      // TON payment
      createInvoice(
        { amount: selectedPackage.ton, currency: 'ton' },
        {
          onSuccess: (invoice) => {
            toast({
              title: "Счет создан",
              description: "Переходим к оплате...",
            });
            // In real app, redirect to invoice.payUrl
            closeDepositModal();
          },
          onError: () => {
            toast({
              title: "Ошибка",
              description: "Не удалось создать счет",
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  return (
    <Dialog open={isDepositModalOpen} onOpenChange={closeDepositModal}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Сделать ставку</DialogTitle>
          <DialogDescription>
            Выберите способ пополнения баланса
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCurrency} onValueChange={(v) => setCurrency(v as 'gifts' | 'ton')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gifts" className="flex items-center gap-2">
              🎁 Подарки
            </TabsTrigger>
            <TabsTrigger value="ton" className="flex items-center gap-2">
              TON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gifts" className="space-y-4">
            {user?.balance === 0 && (
              <div className="text-center py-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  У вас нет подарков
                </p>
              </div>
            )}

            <div className="space-y-3">
              {GIFT_PACKAGES.map((pkg) => (
                <Card
                  key={pkg.stars}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedPackage?.stars === pkg.stars && "ring-2 ring-primary",
                    pkg.popular && "border-primary/50"
                  )}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">⭐</div>
                        <div>
                          <p className="font-semibold">{pkg.stars} звезд</p>
                          <p className="text-sm text-muted-foreground">
                            💎 {pkg.gems.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      {pkg.popular && (
                        <Badge variant="secondary" className="text-xs">
                          Популярный
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ton" className="space-y-4">
            <div className="space-y-3">
              {TON_PACKAGES.map((pkg) => (
                <Card
                  key={pkg.ton}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedPackage?.ton === pkg.ton && "ring-2 ring-primary",
                    pkg.popular && "border-primary/50"
                  )}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">💎</div>
                        <div>
                          <p className="font-semibold">{pkg.ton} TON</p>
                          <p className="text-sm text-muted-foreground">
                            💎 {pkg.gems}
                          </p>
                        </div>
                      </div>
                      {pkg.popular && (
                        <Badge variant="secondary" className="text-xs">
                          Популярный
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={handlePurchase}
          disabled={!selectedPackage || isPending}
          className="w-full btn-primary"
        >
          {isPending ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Обработка...
            </>
          ) : (
            'Пополнить'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
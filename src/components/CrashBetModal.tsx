import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useCrashStore } from '@/store/crashStore';
import { toast } from '@/hooks/use-toast';
import telegramService from '@/lib/telegram';

export const CrashBetModal = () => {
	const { crashBetModalOpen, closeCrashBetModal, selectedCurrency, setCurrency } = useUIStore();
	const { user, updateBalance } = useAuthStore();
	const { placeBet } = useCrashStore();
	const [betAmount, setBetAmount] = useState('');

	const handlePlaceBet = () => {
		const amount = parseFloat(betAmount);

		if (!amount || amount <= 0) {
			toast({
				title: "Неверная сумма",
				description: "Введите корректную сумму ставки",
				variant: "destructive",
			});
			return;
		}

		if (!user || user.balance < amount) {
			toast({
				title: "Недостаточно средств",
				description: "У вас не хватает средств для этой ставки",
				variant: "destructive",
			});
			return;
		}

		telegramService.impactOccurred('medium');

		// Place bet and update balance
		placeBet(amount, selectedCurrency);
		updateBalance(user.balance - amount);

		toast({
			title: "Ставка принята!",
			description: `Поставлено ${selectedCurrency === 'gifts' ? '💎' : 'TON'} ${amount}`,
		});

		closeCrashBetModal();
		setBetAmount('');
	};

	const maxBet = user?.balance || 0;
	const quickBets = [
		Math.min(10, maxBet),
		Math.min(50, maxBet),
		Math.min(100, maxBet),
		maxBet
	].filter(amount => amount > 0);

	return (
		<Dialog open={crashBetModalOpen} onOpenChange={closeCrashBetModal}>
			<DialogContent className="max-w-sm mx-auto">
				<DialogHeader>
					<DialogTitle>Сделать ставку</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Currency Selection */}
					<Tabs value={selectedCurrency} onValueChange={(v) => setCurrency(v as 'gifts' | 'ton')}>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="gifts" className="flex items-center gap-2">
								💎 Подарки
							</TabsTrigger>
							<TabsTrigger value="ton" className="flex items-center gap-2">
								TON
							</TabsTrigger>
						</TabsList>

						<TabsContent value="gifts" className="space-y-4">
							<div className="text-center p-4 bg-muted/20 rounded-lg">
								<p className="text-sm text-muted-foreground">
									Баланс: 💎 {user?.balance.toFixed(2) || '0.00'}
								</p>
							</div>
						</TabsContent>

						<TabsContent value="ton" className="space-y-4">
							<div className="text-center p-4 bg-muted/20 rounded-lg">
								<p className="text-sm text-muted-foreground">
									У вас нет подарков
								</p>
								<Button
									variant="link"
									size="sm"
									className="mt-2 text-primary"
									onClick={() => {
										closeCrashBetModal();
										// Open deposit modal
									}}
								>
									Пополнить
								</Button>
							</div>
						</TabsContent>
					</Tabs>

					{/* Bet Amount Input */}
					<div className="space-y-2">
						<Label htmlFor="betAmount">Сумма ставки</Label>
						<Input
							id="betAmount"
							type="number"
							placeholder="0.00"
							value={betAmount}
							onChange={(e) => setBetAmount(e.target.value)}
							min="0"
							max={maxBet}
							step="0.01"
						/>
					</div>

					{/* Quick Bet Buttons */}
					{quickBets.length > 0 && (
						<div className="space-y-2">
							<Label>Быстрая ставка</Label>
							<div className="grid grid-cols-4 gap-2">
								{quickBets.map((amount) => (
									<Button
										key={amount}
										variant="outline"
										size="sm"
										onClick={() => setBetAmount(amount.toString())}
										className="text-xs"
									>
										{amount === maxBet ? 'MAX' : amount}
									</Button>
								))}
							</div>
						</div>
					)}

					{/* Place Bet Button */}
					<Button
						onClick={handlePlaceBet}
						disabled={!betAmount || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > maxBet}
						className="w-full btn-primary"
					>
						Поставить {betAmount ? `${selectedCurrency === 'gifts' ? '💎' : 'TON'} ${betAmount}` : ''}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
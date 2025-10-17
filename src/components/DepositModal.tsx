import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { createInvoice, getDepositStatus } from '@/api/deposits';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import telegramService from '@/lib/telegram';
import { Star, Sparkles, Zap, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { DepositPackage } from '@/types/deposits';

const DEPOSIT_PACKAGES: DepositPackage[] = [
	{ id: '1', stars: 50, gems: 50, popular: false },
	{ id: '2', stars: 100, gems: 110, bonus: 10, popular: true },
	{ id: '3', stars: 250, gems: 300, bonus: 50, popular: false },
	{ id: '4', stars: 500, gems: 650, bonus: 150, bestValue: true },
	{ id: '5', stars: 1000, gems: 1400, bonus: 400, popular: false },
	{ id: '6', stars: 2500, gems: 3750, bonus: 1250, bestValue: false },
];

type PaymentStatus = 'idle' | 'creating' | 'processing' | 'success' | 'failed';

export const DepositModal = () => {
	const { isDepositModalOpen, closeDepositModal } = useUIStore();
	const { user, updateBalance, fetchCurrentUser } = useAuthStore();
	const [selectedPackage, setSelectedPackage] = useState<DepositPackage | null>(null);
	const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
	const [depositId, setDepositId] = useState<string | null>(null);

	// Reset state when modal closes
	useEffect(() => {
		if (!isDepositModalOpen) {
			setSelectedPackage(null);
			setPaymentStatus('idle');
			setDepositId(null);
		}
	}, [isDepositModalOpen]);

	// Poll deposit status
	useEffect(() => {
		if (!depositId || paymentStatus !== 'processing') return;

		const pollInterval = setInterval(async () => {
			try {
				const status = await getDepositStatus(depositId);

				if (status.status === 'COMPLETED') {
					clearInterval(pollInterval);
					setPaymentStatus('success');
					await fetchCurrentUser();
					telegramService.notificationOccurred('success');

					toast({
						title: "✅ Пополнение успешно!",
						description: `Ваш баланс пополнен на ${selectedPackage?.gems} 💎`,
					});

					// Close modal after 2 seconds
					setTimeout(() => {
						closeDepositModal();
					}, 2000);
				} else if (status.status === 'FAILED' || status.status === 'EXPIRED') {
					clearInterval(pollInterval);
					setPaymentStatus('failed');
					telegramService.notificationOccurred('error');

					toast({
						title: "❌ Ошибка оплаты",
						description: "Пополнение не удалось. Попробуйте еще раз.",
						variant: "destructive",
					});
				}
			} catch (error) {
				console.error('Error polling deposit status:', error);
			}
		}, 2000);

		return () => clearInterval(pollInterval);
	}, [depositId, paymentStatus, selectedPackage, fetchCurrentUser, closeDepositModal]);

	const handlePackageSelect = (pkg: DepositPackage) => {
		telegramService.selectionChanged();
		setSelectedPackage(pkg);
	};

	const handlePurchase = async () => {
		if (!selectedPackage) return;

		telegramService.impactOccurred('medium');
		setPaymentStatus('creating');

		try {
			// Create invoice
			const invoice = await createInvoice({ amount: selectedPackage.stars });

			setDepositId(invoice.depositId);
			setPaymentStatus('processing');

			// Open Telegram payment interface
			if (telegramService.isAvailable) {
				telegramService.openInvoice(
					invoice.invoiceUrl,
					(status: string) => {
						if (status === 'paid') {
							// Payment completed, polling will handle the rest
							telegramService.notificationOccurred('success');
						} else if (status === 'cancelled') {
							setPaymentStatus('failed');
							telegramService.notificationOccurred('error');
							toast({
								title: "❌ Оплата отменена",
								description: "Вы отменили оплату",
								variant: "destructive",
							});
						} else if (status === 'failed') {
							setPaymentStatus('failed');
							telegramService.notificationOccurred('error');
							toast({
								title: "❌ Ошибка оплаты",
								description: "Не удалось обработать платеж",
								variant: "destructive",
							});
						}
					}
				);
			} else {
				// Fallback: open invoice URL directly
				window.open(invoice.invoiceUrl, '_blank');
			}
		} catch (error: any) {
			console.error('Error creating invoice:', error);
			setPaymentStatus('failed');
			telegramService.notificationOccurred('error');

			toast({
				title: "❌ Ошибка",
				description: error?.response?.data?.message || "Не удалось создать счет на оплату",
				variant: "destructive",
			});
		}
	};

	const getStatusIcon = () => {
		switch (paymentStatus) {
			case 'creating':
				return <Clock className="h-4 w-4 animate-spin" />;
			case 'processing':
				return <Clock className="h-4 w-4 animate-pulse" />;
			case 'success':
				return <CheckCircle2 className="h-4 w-4 text-green-500" />;
			case 'failed':
				return <XCircle className="h-4 w-4 text-red-500" />;
			default:
				return null;
		}
	};

	const getStatusText = () => {
		switch (paymentStatus) {
			case 'creating':
				return 'Создание счета...';
			case 'processing':
				return 'Ожидание оплаты...';
			case 'success':
				return 'Пополнение успешно!';
			case 'failed':
				return 'Ошибка оплаты';
			default:
				return 'Пополнить баланс';
		}
	};

	return (
		<Dialog open={isDepositModalOpen} onOpenChange={closeDepositModal}>
			<DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto rounded-xl">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold flex items-center gap-2">
						<Sparkles className="h-6 w-6 text-primary" />
						Пополнить баланс
					</DialogTitle>
					<DialogDescription>
						Выберите пакет и оплатите через Telegram Stars
					</DialogDescription>
				</DialogHeader>

				{/* Current Balance */}
				<div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">Текущий баланс</p>
							<p className="text-2xl font-bold flex items-center gap-1">
								{user?.balance?.toFixed(2) || '0.00'} <span className="text-lg">💎</span>
							</p>
						</div>
						<div className="p-3 bg-primary/10 rounded-full">
							<Sparkles className="h-8 w-8 text-primary" />
						</div>
					</div>
				</div>

				{/* Packages Grid */}
				<div className="space-y-3">
					{DEPOSIT_PACKAGES.map((pkg) => (
						<Card
							key={pkg.id}
							className={cn(
								"cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
								selectedPackage?.id === pkg.id && "ring-2 ring-primary shadow-lg scale-[1.02]",
								pkg.popular && "border-primary/50",
								pkg.bestValue && "border-green-500/50 bg-green-500/5"
							)}
							onClick={() => handlePackageSelect(pkg)}
						>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3 flex-1">
										<div className="p-2 bg-primary/10 rounded-lg">
											<Star className="h-5 w-5 text-primary fill-primary" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<p className="font-bold text-lg">{pkg.stars}</p>
												<span className="text-sm text-muted-foreground">звезд</span>
											</div>
											<div className="flex items-center gap-1 mt-1">
												<span className="text-sm font-semibold text-primary">{pkg.gems} 💎</span>
												{pkg.bonus && (
													<Badge variant="secondary" className="text-xs">
														+{pkg.bonus} бонус
													</Badge>
												)}
											</div>
										</div>
									</div>
									<div className="flex flex-col items-end gap-1">
										{pkg.popular && (
											<Badge variant="default" className="text-xs">
												<Zap className="h-3 w-3 mr-1" />
												Популярный
											</Badge>
										)}
										{pkg.bestValue && (
											<Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
												<Sparkles className="h-3 w-3 mr-1" />
												Выгодно
											</Badge>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Info Box */}
				<div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2">
					<AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
					<p className="text-xs text-blue-700 dark:text-blue-300">
						Оплата производится через Telegram Stars. Ваш баланс пополнится автоматически после подтверждения платежа.
					</p>
				</div>

				{/* Action Button */}
				<Button
					onClick={handlePurchase}
					disabled={!selectedPackage || paymentStatus === 'creating' || paymentStatus === 'processing'}
					className="w-full h-12 text-base font-semibold"
					size="lg"
				>
					{paymentStatus !== 'idle' && getStatusIcon()}
					<span className={paymentStatus !== 'idle' ? 'ml-2' : ''}>
						{getStatusText()}
					</span>
				</Button>

				{selectedPackage && paymentStatus === 'idle' && (
					<p className="text-xs text-center text-muted-foreground">
						Вы получите <span className="font-semibold text-primary">{selectedPackage.gems} 💎</span>
						{selectedPackage.bonus && (
							<> + <span className="font-semibold text-green-500">{selectedPackage.bonus} бонус</span></>
						)}
					</p>
				)}
			</DialogContent>
		</Dialog>
	);
};

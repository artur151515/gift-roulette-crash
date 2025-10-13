import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RouletteStrip } from '@/components/RouletteStrip';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import telegramService from '@/lib/telegram';
import { getCaseDetails, openCase } from '@/api/cases';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import {ItemDto} from "@/types/inventory.ts";

export const CaseDetailsPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user, updateBalance, fetchCurrentUser } = useAuthStore();
	const queryClient = useQueryClient();
	const [isSpinning, setIsSpinning] = useState(false);
	const [wonItem, setWonItem] = useState<ItemDto | null>(null);
	const [rollResult, setRollResult] = useState<{ item: ItemDto; probability: number } | null>(null);

	const { data: caseDetails, isLoading, isError } = useQuery({
		queryKey: ['case', id],
		queryFn: () => getCaseDetails(id!),
		enabled: !!id,
	});

	const openCaseMutation = useMutation({
		mutationFn: () => openCase(id!),
		onSuccess: async (result) => {
			// Обновляем баланс (вычитаем стоимость кейса)
			if (caseDetails) {
				updateBalance(-caseDetails.price);
			}

			// Получаем выигранный предмет из ответа API
			const wonItemData = result.inventoryItem.item;
			
			if (wonItemData) {
				// Сохраняем результат для показа после анимации
				setRollResult({
					item: wonItemData,
					probability: result.rollDetails.probability
				});
				
				// Запускаем анимацию рулетки
				setWonItem(wonItemData);
				setIsSpinning(true);
			}

			// Обновляем данные пользователя и инвентарь
			await fetchCurrentUser();
			queryClient.invalidateQueries({ queryKey: ['user-inventory'] });
		},
		onError: (error: { response?: { data?: { message?: string } } }) => {
			telegramService.notificationOccurred('error');
			toast({
				title: "Ошибка",
				description: error.response?.data?.message || "Не удалось открыть кейс",
				variant: "destructive",
			});
			// Очищаем состояние анимации при ошибке
			setIsSpinning(false);
			setWonItem(null);
			setRollResult(null);
		},
	});

	const handleBack = () => {
		navigate('/cases');
	};

	const handleOpenCase = () => {
		// Предотвращаем повторное открытие во время анимации
		if (isSpinning || openCaseMutation.isPending) {
			return;
		}

		if (!caseDetails || !user || user.balance < caseDetails.price) {
			telegramService.notificationOccurred('error');
			toast({
				title: "Недостаточно средств",
				description: `Нужно еще 💎${(caseDetails?.price || 0) - (user?.balance || 0)}`,
				variant: "destructive",
			});
			return;
		}

		telegramService.impactOccurred('medium');
		openCaseMutation.mutate();
	};

	const handleRouletteResult = (result: ItemDto) => {
		console.log('Roulette result:', result);
		setIsSpinning(false);
		setWonItem(null);
		
		// Показываем toast только после завершения анимации
		if (rollResult) {
			toast({
				title: "Поздравляем! 🎉",
				description: `Вы получили: ${rollResult.item.name} (${rollResult.probability.toFixed(1)}%)`,
			});
			setRollResult(null); // Очищаем результат
		}
	};

	if (isLoading) {
		return (
			<div className="flex-1 pb-20">
				<div className="sticky bg-background/95 backdrop-blur-md border-b border-border z-40">
					<div className="flex items-center gap-4 p-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleBack}
							className="h-8 w-8 p-0"
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<Skeleton className="h-6 w-32" />
						<div className="flex-1" />
						<Skeleton className="h-6 w-20" />
					</div>
				</div>
				<div className="p-4 space-y-8">
					<Skeleton className="h-40 rounded-xl" />
					<div className="space-y-4">
						<Skeleton className="h-8 w-32" />
						<div className="grid grid-cols-3 gap-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<Skeleton key={i} className="aspect-square rounded-lg" />
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (isError || !caseDetails) {
		return (
			<div className="flex-1 pb-20">
				<div className="sticky bg-background/95 backdrop-blur-md border-b border-border z-40">
					<div className="flex items-center gap-4 p-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleBack}
							className="h-8 w-8 p-0"
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
					</div>
				</div>
				<div className="p-4">
					<div className="text-center py-12 space-y-3">
						<div className="text-4xl mb-4">⚠️</div>
						<h3 className="text-lg font-semibold text-foreground">
							Ошибка загрузки
						</h3>
						<p className="text-muted-foreground">
							Не удалось загрузить кейс. Попробуйте позже.
						</p>
					</div>
				</div>
			</div>
		);
	}

	const canAfford = user && user.balance >= caseDetails.price;

	return (
		<div className="flex-1 pb-20">
			{/* Header */}
			<div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border z-40">
				<div className="flex items-center gap-4 p-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleBack}
						className="h-8 w-8 p-0"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>

					<div className="flex-1">
						<h1 className="font-bold text-lg text-foreground">
							{caseDetails.name}
						</h1>
					</div>

					<Badge
						variant="outline"
						className="font-semibold"
					>
						💎 {caseDetails.price}
					</Badge>
				</div>
			</div>

			<div className="p-4 space-y-8">
				{/* Case Image */}
				{caseDetails.imageUrl && (
					<div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
						<img
							src={caseDetails.imageUrl}
							alt={caseDetails.name}
							className="w-full h-full object-cover"
						/>
					</div>
				)}

				{caseDetails.description && (
					<p className="text-sm text-muted-foreground">
						{caseDetails.description}
					</p>
				)}

				{/* Roulette Section */}
				<div className="space-y-4">
					<h2 className="text-xl font-bold text-foreground">
						Рулетка
					</h2>
					<RouletteStrip
						items={caseDetails.items}
						onSpin={handleRouletteResult}
						isSpinning={isSpinning}
						wonItem={wonItem}
					/>
				</div>

				{/* What's Inside Section */}
				<div className="space-y-4">
					<h2 className="text-xl font-bold text-foreground">
						Что внутри?
					</h2>

					<div className="grid grid-cols-3 gap-3">
						{caseDetails.items.map((itemData) => (
							<div
								key={itemData.item.id}
								className={cn(
									"p-3 rounded-lg border text-center space-y-2 bg-card"
								)}
							>
								<div className="aspect-square w-full mx-auto rounded-lg bg-background/50 flex items-center justify-center overflow-hidden">
									{itemData.item.imageUrl ? (
										<img
											src={itemData.item.imageUrl}
											alt={itemData.item.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<span className="text-2xl">🎁</span>
									)}
								</div>
								<div>
									<p className="text-xs font-medium line-clamp-1">
										{itemData.item.name}
									</p>
									<div className="flex items-center justify-center gap-1.5	 mt-1 flex-col">
										<Badge variant="outline" className="text-xs">
											💎{itemData.item.price}
										</Badge>
										<Badge variant="secondary" className="text-xs">
											{itemData.probability.toFixed(1)}%
										</Badge>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Open Case Button */}
				<div className="sticky bottom-20 bg-background/95 backdrop-blur-md p-4 -mx-4 border-t border-border">
					<Button
						onClick={handleOpenCase}
						disabled={!canAfford || openCaseMutation.isPending || isSpinning}
						className={cn(
							"w-full py-4 text-base font-semibold",
							canAfford && !openCaseMutation.isPending && !isSpinning ? "btn-primary" : "btn-secondary"
						)}
					>
						{openCaseMutation.isPending || isSpinning ? (
							<>Открытие...</>
						) : !canAfford ? (
							<>Недостаточно средств</>
						) : (
							<>Открыть кейс 🚀</>
						)}
					</Button>

					{!canAfford && user && (
						<p className="text-xs text-muted-foreground text-center mt-2">
							Нужно еще 💎{(caseDetails.price - user.balance).toFixed(2)}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};
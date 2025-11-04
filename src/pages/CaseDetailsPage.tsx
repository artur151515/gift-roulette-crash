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
import { useGiftsFeedStore } from '@/store/giftsFeedStore';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useState, useCallback, useEffect } from 'react';
import { ItemDto } from "@/types/inventory.ts";
import { CaseItemWithWeight } from "@/types/cases.ts";

export const CaseDetailsPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user, updateBalance, fetchCurrentUser } = useAuthStore();
	const { setAllItems, setUserWonItem, clearUserWonItem } = useGiftsFeedStore();
	const queryClient = useQueryClient();
	const [isSpinning, setIsSpinning] = useState(false);
	const [wonItem, setWonItem] = useState<ItemDto | null>(null);
	const [rollResult, setRollResult] = useState<{ item: ItemDto; probability: number } | null>(null);

	// Очистка состояния при размонтировании
	useEffect(() => {
		return () => {
			setIsSpinning(false);
			setWonItem(null);
			setRollResult(null);
		};
	}, []);

	const { data: caseDetails, isLoading, isError } = useQuery({
		queryKey: ['case', id],
		queryFn: () => getCaseDetails(id!),
		enabled: !!id,
	});

	// Обновление списка всех подарков для ленты при загрузке кейса
	useEffect(() => {
		if (caseDetails && caseDetails.items) {
			const allItemsForFeed = caseDetails.items.map(itemData => itemData.item);
			setAllItems(allItemsForFeed);
		}
	}, [caseDetails, setAllItems]);

	const openCaseMutation = useMutation({
		mutationFn: () => openCase(id!),
		onSuccess: async (result) => {
			// Оптимистично обновляем баланс
			if (caseDetails) {
				updateBalance(-caseDetails.price);
			}

			const wonItemData = result.inventoryItem.item;

			if (wonItemData) {
				// Сохраняем результат для показа после анимации
				const rollInfo = {
					item: wonItemData,
					probability: result.rollDetails.probability
				};

				setRollResult(rollInfo);
				setWonItem(wonItemData);
				setIsSpinning(true);
			}

			// Обновляем данные пользователя и инвентарь
			try {
				await fetchCurrentUser();
				queryClient.invalidateQueries({ queryKey: ['user-inventory'] });
			} catch (error) {
				console.error('Failed to refresh user data:', error);
			}
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

	const handleBack = useCallback(() => {
		navigate('/cases');
	}, [navigate]);

	const handleOpenCase = useCallback(() => {
		// Предотвращаем повторное открытие во время анимации
		if (isSpinning || openCaseMutation.isPending) {
			return;
		}

		if (!caseDetails || !user) {
			toast({
				title: "Ошибка",
				description: "Данные кейса не загружены",
				variant: "destructive",
			});
			return;
		}

		if (user.balance < caseDetails.price) {
			telegramService.notificationOccurred('error');
			toast({
				title: "Недостаточно средств",
				description: `Нужно еще 💎${caseDetails.price - user.balance}`,
				variant: "destructive",
			});
			return;
		}

		telegramService.impactOccurred('medium');
		openCaseMutation.mutate();
	}, [caseDetails, user, isSpinning, openCaseMutation]);

	const handleRouletteResult = useCallback((result: ItemDto) => {
		// Roulette result logged
		setIsSpinning(false);

		// Добавляем выбитый подарок в ленту после завершения анимации
		setUserWonItem(result);
		
		// Очищаем через 10 секунд для следующего выигрыша
		setTimeout(() => {
			clearUserWonItem();
		}, 10000);

		// Показываем toast после завершения анимации
		if (rollResult) {
			toast({
				title: "Поздравляем! 🎉",
				description: `Вы получили: ${rollResult.item.name} (${rollResult.probability.toFixed(1)}%)`,
			});
		}

		// Очищаем состояния с задержкой чтобы toast успел показаться
		setTimeout(() => {
			setWonItem(null);
			setRollResult(null);
		}, 100);
	}, [rollResult, setUserWonItem, clearUserWonItem]);

	const canAfford = user && caseDetails && user.balance >= caseDetails.price;
	const isButtonDisabled = !canAfford || openCaseMutation.isPending || isSpinning;

	// Loading State
	if (isLoading) {
		return (
			<div className="flex-1 pb-20 bg-gradient-to-b from-background to-background/50">
				<Header onBack={handleBack} isLoading />
				<div className="p-4 space-y-8">
					<div className="space-y-4">
						<Skeleton className="h-48 rounded-2xl" />
						<Skeleton className="h-4 w-3/4 rounded-lg" />
						<Skeleton className="h-4 w-1/2 rounded-lg" />
					</div>
					
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Skeleton className="h-7 w-32 rounded-lg" />
							<Skeleton className="h-7 w-7 rounded-full" />
						</div>
						<Skeleton className="h-32 rounded-2xl" />
					</div>

					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Skeleton className="h-7 w-40 rounded-lg" />
							<Skeleton className="h-7 w-7 rounded-full" />
						</div>
						<div className="grid grid-cols-3 gap-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="space-y-2">
									<Skeleton className="aspect-square rounded-xl" />
									<Skeleton className="h-3 w-full rounded" />
									<Skeleton className="h-3 w-2/3 mx-auto rounded" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Error State
	if (isError || !caseDetails) {
		return (
			<div className="flex-1 pb-20">
				<Header onBack={handleBack} />
				<div className="p-4">
					<ErrorState />
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 pb-20 bg-gradient-to-b from-background to-background/50">
			<Header
				onBack={handleBack}
				title={caseDetails.name}
				price={caseDetails.price}
			/>

			<div className="p-4 space-y-8">
				{/* Case Image & Description */}
				<div className="space-y-4">
					{caseDetails.imageUrl && (
						<div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 shadow-2xl border border-border/50 group">
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
							<img
								src={caseDetails.imageUrl}
								alt={caseDetails.name}
								className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
							/>
							<div className="absolute inset-0 z-20 flex items-end p-6">
								<div className="space-y-2">
									<h2 className="text-2xl font-bold text-white drop-shadow-lg">
										{caseDetails.name}
									</h2>
									<div className="flex items-center gap-3">
										<div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
											<span className="text-white font-semibold">
												💎 {caseDetails.price}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{caseDetails.description && (
						<div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
							<p className="text-sm text-muted-foreground leading-relaxed">
								{caseDetails.description}
							</p>
						</div>
					)}
				</div>

				{/* Roulette Section */}
				<RouletteSection
					items={caseDetails.items}
					onSpin={handleRouletteResult}
					isSpinning={isSpinning}
					wonItem={wonItem}
				/>

				{/* What's Inside Section */}
				<ItemsGrid items={caseDetails.items} />

				{/* Open Case Button */}
				<OpenCaseButton
					onClick={handleOpenCase}
					disabled={isButtonDisabled}
					isLoading={openCaseMutation.isPending || isSpinning}
					canAfford={canAfford}
					casePrice={caseDetails.price}
					userBalance={user?.balance}
				/>
			</div>
		</div>
	);
};

// Sub-components для лучшей читаемости

interface HeaderProps {
	onBack: () => void;
	isLoading?: boolean;
	title?: string;
	price?: number;
}

const Header = ({ onBack, isLoading, title, price }: HeaderProps) => (
	<div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/50 z-40 shadow-sm">
		<div className="flex items-center gap-4 p-4">
			<Button
				variant="ghost"
				size="sm"
				onClick={onBack}
				className="h-10 w-10 p-0 rounded-full hover:bg-accent/50 transition-colors"
			>
				<ArrowLeft className="h-5 w-5" />
			</Button>

			<div className="flex-1">
				{isLoading ? (
					<Skeleton className="h-6 w-32" />
				) : (
					<h1 className="font-bold text-lg text-foreground tracking-tight">
						{title}
					</h1>
				)}
			</div>

			{!isLoading && price !== undefined && (
				<Badge variant="outline" className="font-semibold px-3 py-1.5 bg-primary/10 border-primary/20 text-primary">
					💎 {price}
				</Badge>
			)}
			{isLoading && <Skeleton className="h-8 w-20 rounded-full" />}
		</div>
	</div>
);

const ErrorState = () => (
	<div className="text-center py-16 space-y-4">
		<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-4">
			<span className="text-4xl">⚠️</span>
		</div>
		<h3 className="text-xl font-bold text-foreground">
			Ошибка загрузки
		</h3>
		<p className="text-muted-foreground max-w-sm mx-auto">
			Не удалось загрузить кейс. Попробуйте позже.
		</p>
	</div>
);

interface RouletteSectionProps {
	items: CaseItemWithWeight[];
	onSpin: (result: ItemDto) => void;
	isSpinning: boolean;
	wonItem: ItemDto | null;
}

const RouletteSection = ({ items, onSpin, isSpinning, wonItem }: RouletteSectionProps) => (
	<div className="space-y-4">
		<div className="flex items-center gap-2">
			<h2 className="text-2xl font-bold text-foreground tracking-tight">
				Рулетка
			</h2>
			<span className="text-2xl">🎰</span>
		</div>
		<div className="rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 p-4 border border-border/50 shadow-sm">
			<RouletteStrip
				items={items}
				onSpin={onSpin}
				isSpinning={isSpinning}
				wonItem={wonItem}
			/>
		</div>
	</div>
);

interface ItemsGridProps {
	items: CaseItemWithWeight[];
}

const ItemsGrid = ({ items }: ItemsGridProps) => {
	// Сортируем подарки по цене (от дорогих к дешевым)
	const sortedItems = [...items].sort((a, b) => b.item.price - a.item.price);

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<h2 className="text-2xl font-bold text-foreground tracking-tight">
					Что внутри?
				</h2>
				<span className="text-2xl">🎁</span>
			</div>

			<div className="grid grid-cols-3 gap-3">
				{sortedItems.map((itemData) => (
				<div
					key={itemData.item.id}
					className="group relative p-3 rounded-xl border text-center space-y-2 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-105"
				>
					<div className="aspect-square w-full mx-auto rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors">
						{itemData.item.imageUrl ? (
							<img
								src={itemData.item.imageUrl}
								alt={itemData.item.name}
								className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
							/>
						) : (
							<span className="text-3xl">🎁</span>
						)}
					</div>
					<div className="space-y-1.5">
						<p className="text-xs font-semibold line-clamp-1 text-foreground">
							{itemData.item.name}
						</p>
						<div className="flex items-center justify-center gap-1 flex-col">
							<Badge variant="outline" className="text-xs font-semibold bg-primary/10 border-primary/20 text-primary">
								💎{itemData.item.price}
							</Badge>
							<Badge variant="secondary" className="text-xs font-medium">
								{itemData.probability.toFixed(1)}%
							</Badge>
						</div>
					</div>
				</div>
				))}
			</div>
		</div>
	);
};

interface OpenCaseButtonProps {
	onClick: () => void;
	disabled: boolean;
	isLoading: boolean;
	canAfford: boolean;
	casePrice: number;
	userBalance?: number;
}

const OpenCaseButton = ({
							onClick,
							disabled,
							isLoading,
							canAfford,
							casePrice,
							userBalance
						}: OpenCaseButtonProps) => (
	<div className="sticky bottom-20 bg-background/95 backdrop-blur-xl p-4 -mx-4 border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
		<Button
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"w-full py-6 text-base font-bold transition-all duration-300 rounded-xl shadow-lg",
				canAfford && !isLoading
					? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
					: "bg-muted hover:bg-muted/80 cursor-not-allowed"
			)}
		>
			{isLoading ? (
				<span className="flex items-center gap-2">
					<span className="animate-spin">⏳</span>
					Открытие...
				</span>
			) : !canAfford ? (
				<span className="flex items-center gap-2">
					❌ Недостаточно средств
				</span>
			) : (
				<span className="flex items-center gap-2">
					Открыть кейс 🚀
				</span>
			)}
		</Button>

		{!canAfford && userBalance !== undefined && (
			<div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
				<p className="text-xs font-semibold text-destructive text-center">
					Нужно еще 💎{Math.ceil(casePrice - userBalance)}
				</p>
			</div>
		)}
	</div>
);
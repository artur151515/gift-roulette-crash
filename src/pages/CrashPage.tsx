import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCrashStore } from '@/store/crashStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import telegramService from '@/lib/telegram';

export const CrashPage = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const {
		isRunning,
		multiplier,
		myBet,
		history,
		startDemoGame,
		cashOut,
		isGameEnded
	} = useCrashStore();

	const { openCrashBetModal } = useUIStore();
	const { user } = useAuthStore();

	// Auto-start demo games
	useEffect(() => {
		if (!isRunning && !isGameEnded) {
			const timer = setTimeout(() => {
				startDemoGame();
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isRunning, isGameEnded, startDemoGame]);

	// Draw crash graph
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Set canvas size
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * window.devicePixelRatio;
		canvas.height = rect.height * window.devicePixelRatio;
		ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

		// Clear canvas
		ctx.clearRect(0, 0, rect.width, rect.height);

		// Draw grid
		ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
		ctx.lineWidth = 1;

		// Vertical lines
		for (let i = 0; i <= 10; i++) {
			const x = (i / 10) * rect.width;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, rect.height);
			ctx.stroke();
		}

		// Horizontal lines
		for (let i = 0; i <= 10; i++) {
			const y = (i / 10) * rect.height;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(rect.width, y);
			ctx.stroke();
		}

		// Draw crash curve if game is running
		if (isRunning && multiplier > 1) {
			const points = [];
			const maxMultiplier = Math.max(multiplier, 5);

			for (let x = 0; x <= rect.width; x += 2) {
				const progress = x / rect.width;
				const mult = 1 + (progress * (multiplier - 1));
				const y = rect.height - ((mult - 1) / (maxMultiplier - 1)) * rect.height * 0.8;
				points.push({ x, y });
			}

			// Draw curve
			ctx.strokeStyle = '#10b981';
			ctx.lineWidth = 3;
			ctx.beginPath();

			if (points.length > 0) {
				ctx.moveTo(points[0].x, points[0].y);
				for (let i = 1; i < points.length; i++) {
					ctx.lineTo(points[i].x, points[i].y);
				}
			}

			ctx.stroke();

			// Add glow effect
			ctx.shadowColor = '#10b981';
			ctx.shadowBlur = 10;
			ctx.stroke();
			ctx.shadowBlur = 0;
		}

		// Draw multiplier text
		if (multiplier > 1) {
			ctx.fillStyle = isGameEnded ? '#ef4444' : '#10b981';
			ctx.font = 'bold 48px Inter';
			ctx.textAlign = 'center';
			ctx.fillText(
				`${multiplier.toFixed(2)}x`,
				rect.width / 2,
				rect.height / 2
			);
		}

	}, [multiplier, isRunning, isGameEnded]);

	const handlePlaceBet = () => {
		telegramService.impactOccurred('light');
		openCrashBetModal();
	};

	const handleCashOut = () => {
		if (myBet && !myBet.cashedOut && isRunning) {
			telegramService.impactOccurred('heavy');
			cashOut();
		}
	};

	return (
		<div className="flex-1 pb-20">
			<div className="p-4 space-y-6">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold text-foreground">Crash</h1>
					<p className="text-muted-foreground text-sm">
						{isRunning ? 'Игра идет...' : isGameEnded ? 'Игра завершена' : 'Ожидание...'}
					</p>
				</div>

				{/* Crash Graph */}
				<Card className="card-elevated">
					<CardContent className="p-0">
						<div className="relative">
							<canvas
								ref={canvasRef}
								className="w-full h-64 rounded-lg"
							/>

							{/* Waiting overlay */}
							{!isRunning && !isGameEnded && (
								<div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
									<div className="text-center space-y-2">
										<div className="text-lg">⏳</div>
										<p className="text-sm text-muted-foreground">
											Ожидание...
										</p>
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Current Bet Info */}
				{myBet && (
					<Card className="card-elevated">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Ваша ставка</p>
									<p className="font-semibold">
										{myBet.currency === 'gifts' ? '💎' : 'TON'} {myBet.amount}
									</p>
								</div>
								<div className="text-right">
									{myBet.cashedOut ? (
										<div>
											<p className="text-sm text-success">Выведено!</p>
											<p className="font-semibold text-success">
												{myBet.cashOutMultiplier?.toFixed(2)}x
											</p>
										</div>
									) : isRunning ? (
										<Button
											onClick={handleCashOut}
											variant="outline"
											className="btn-secondary"
										>
											Cash Out {multiplier.toFixed(2)}x
										</Button>
									) : (
										<div>
											<p className="text-sm text-destructive">Не успели!</p>
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Place Bet Button */}
				<Button
					onClick={handlePlaceBet}
					disabled={isRunning && !!myBet}
					className="w-full py-4 text-base font-semibold btn-primary"
				>
					{isRunning && myBet ? 'Ставка сделана' : 'Сделать ставку'}
				</Button>

				{/* Game History */}
				<div className="space-y-3">
					<h3 className="font-semibold text-foreground">Последние результаты</h3>
					<div className="flex gap-2 overflow-x-auto pb-2">
						{history.map((game, index) => (
							<Badge
								key={index}
								variant="outline"
								className={cn(
									"flex-shrink-0 font-mono",
									game.multiplier >= 2
										? "text-success border-success/20 bg-success/10"
										: "text-muted-foreground"
								)}
							>
								{game.multiplier.toFixed(2)}x
							</Badge>
						))}
					</div>
				</div>

				{/* Demo Players */}
				<div className="space-y-3">
					<h3 className="font-semibold text-foreground">Игроки</h3>
					<div className="space-y-2">
						{/* Mock players */}
						<div className="flex items-center justify-between p-3 bg-card rounded-lg">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
									🎮
								</div>
								<div>
									<p className="font-medium text-sm">Player 1</p>
									<p className="text-xs text-muted-foreground">💎 5.09</p>
								</div>
							</div>
							<Badge variant="outline" className="text-success">
								x1.55
							</Badge>
						</div>

						<div className="flex items-center justify-between p-3 bg-card rounded-lg">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-sm">
									🎯
								</div>
								<div>
									<p className="font-medium text-sm">Demca</p>
									<p className="text-xs text-muted-foreground">💎 3.05</p>
								</div>
							</div>
							<Badge variant="outline" className="text-warning">
								x1.77
							</Badge>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface LoaderScreenProps {
	onComplete?: () => void;
}

export const LoaderScreen = ({ onComplete }: LoaderScreenProps) => {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setProgress(prev => {
				if (prev >= 100) {
					clearInterval(interval);
					setTimeout(() => onComplete?.(), 500);
					return 100;
				}
				return prev + Math.random() * 15 + 5;
			});
		}, 200);

		return () => clearInterval(interval);
	}, [onComplete]);

	return (
		<div className="fixed inset-0 bg-background flex items-center justify-center z-50">
			<div className="text-center space-y-8 px-8 max-w-sm mx-auto">
				{/* Animated Rocket */}
				<div className="relative mx-auto w-32 h-32">
					<div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse" />
					<div className="relative flex items-center justify-center w-full h-full animate-float">
						<div className="text-6xl">🚀</div>
					</div>
				</div>

				{/* Title */}
				<div className="space-y-2">
					<h1 className="text-2xl font-bold text-gradient-primary">
						Gift Roulette
					</h1>
					<p className="text-muted-foreground text-sm">
						Загружаем игру...
					</p>
				</div>

				{/* Progress Bar */}
				<div className="space-y-3">
					<Progress
						value={progress}
						className="h-2 bg-muted/30"
					/>
					<p className="text-xs text-muted-foreground">
						{Math.round(progress)}%
					</p>
				</div>
			</div>
		</div>
	);
};
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CaseSummary } from '@/types/cases.ts';
import telegramService from '@/lib/telegram';

interface CaseCardProps {
	case: CaseSummary;
	onClick?: (caseId: string) => void;
}

export const CaseCard = ({ case: caseItem, onClick }: CaseCardProps) => {
	const navigate = useNavigate();

	const handleClick = () => {
		telegramService.impactOccurred('light');

		if (onClick) {
			onClick(caseItem.id);
		} else {
			navigate(`/cases/${caseItem.id}`);
		}
	};

	return (
		<Card
			className={cn(
				"cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-border bg-gradient-to-br",
				"card-elevated hover:card-glow"
			)}
			onClick={handleClick}
		>
			<CardContent className="p-4 space-y-3">
				{/* Case Image */}
				<div className="relative aspect-square rounded-lg overflow-hidden bg-muted/20">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
					<div className="relative flex items-center justify-center h-full">
						{caseItem.imageUrl ? (
							<img
								src={caseItem.imageUrl}
								alt={caseItem.name}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="text-4xl opacity-60">📦</div>
						)}
					</div>

					{/* Item count badge */}
					{caseItem.itemCount > 0 && (
						<div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
							<span className="text-xs font-medium">{caseItem.itemCount} предметов</span>
						</div>
					)}
				</div>

				{/* Case Info */}
				<div className="space-y-2">
					<h3 className="font-semibold text-foreground text-sm line-clamp-2">
						{caseItem.name}
					</h3>

					{caseItem.description && (
						<p className="text-xs text-muted-foreground line-clamp-1">
							{caseItem.description}
						</p>
					)}

					<Badge
						variant="outline"
						className="w-fit font-medium border"
					>
						<span className="mr-1">💎</span>
						{caseItem.price}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
};
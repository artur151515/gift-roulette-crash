import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BalanceChipProps {
	balance: number;
	onAddFunds: () => void;
	className?: string;
}

export const BalanceChip = ({ balance, onAddFunds, className }: BalanceChipProps) => {
	return (
		<div className={cn(
			"flex items-center gap-2 bg-card rounded-full px-3 py-1.5 border border-border",
			className
		)}>
			<div className="flex items-center gap-2">
				<span className="text-lg">💎</span>
				<span className="font-semibold text-foreground">
          {balance.toFixed(2)}
        </span>
			</div>

			<Button
				variant="ghost"
				size="sm"
				onClick={onAddFunds}
				className="h-6 w-6 p-0 rounded-full bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary"
			>
				<Plus className="h-3 w-3" />
			</Button>
		</div>
	);
};
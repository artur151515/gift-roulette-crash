import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BalanceChip } from './BalanceChip';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import telegramService from '@/lib/telegram';

export const TopBar = () => {
	const { user } = useAuthStore();
	const { openDepositModal } = useUIStore();

	const handleClose = () => {
		telegramService.close();
	};

	const handleAddFunds = () => {
		telegramService.impactOccurred('light');
		openDepositModal();
	};

	return (
		<header className="flex items-center justify-end p-4 safe-area-top bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
			{/*<Button*/}
			{/*	variant="ghost"*/}
			{/*	size="sm"*/}
			{/*	onClick={handleClose}*/}
			{/*	className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"*/}
			{/*>*/}
			{/*	<X className="h-5 w-5" />*/}
			{/*</Button>*/}

			<div className="flex items-center gap-3">
				<BalanceChip
					balance={user?.balance || 0}
					onAddFunds={handleAddFunds}
				/>
			</div>
		</header>
	);
};
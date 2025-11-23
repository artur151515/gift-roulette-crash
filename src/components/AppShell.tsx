import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { TopBar } from './TopBar';
import { BottomTabBar } from './BottomTabBar';
import { DepositModal } from './DepositModal';
import { CrashBetModal } from './CrashBetModal';
import { Toaster } from '@/components/ui/toaster';
import { useGiftsFeedStore } from '@/store/giftsFeedStore';
import { getAllItems } from '@/api/cases';

export const AppShell = () => {
	const { setAllItems } = useGiftsFeedStore();

	// Загружаем все подарки при запуске приложения
	useEffect(() => {
		const loadAllItems = async () => {
			try {
				const items = await getAllItems();
				if (items.length > 0) {
					setAllItems(items);
				}
			} catch (error) {
				console.error('Failed to load all items for feed:', error);
			}
		};

		loadAllItems();
	}, [setAllItems]);

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col">
			{/* Top Bar */}
			<TopBar />

			{/* Main Content */}
			<main className="flex-1 overflow-auto">
				<Outlet />
			</main>

			{/* Bottom Navigation */}
			<BottomTabBar />

			{/* Modals */}
			<DepositModal />
			<CrashBetModal />

			{/* Toast Notifications */}
			<Toaster />
		</div>
	);
};
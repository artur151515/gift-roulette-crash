import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomTabBar } from './BottomTabBar';
import { DepositModal } from './DepositModal';
import { CrashBetModal } from './CrashBetModal';
import { Toaster } from '@/components/ui/toaster';

export const AppShell = () => {
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
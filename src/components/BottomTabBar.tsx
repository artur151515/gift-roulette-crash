import { Package, TrendingUp, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import telegramService from '@/lib/telegram';

const tabs = [
	{
		id: 'cases',
		label: 'Cases',
		icon: Package,
		path: '/cases',
	},
	{
		id: 'crash',
		label: 'Crash',
		icon: TrendingUp,
		path: '/crash',
	},
	{
		id: 'profile',
		label: 'Profile',
		icon: User,
		path: '/profile',
	},
];

export const BottomTabBar = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const handleTabClick = (path: string) => {
		telegramService.selectionChanged();
		navigate(path);
	};

	return (
		<nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom z-50">
			<div className="flex items-center justify-around px-4 py-2">
				{tabs.map((tab) => {
					const isActive = location.pathname === tab.path ||
						(tab.path === '/cases' && location.pathname.startsWith('/cases'));
					const Icon = tab.icon;

					return (
						<Button
							key={tab.id}
							variant="ghost"
							onClick={() => handleTabClick(tab.path)}
							className={cn(
								"flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs font-medium transition-colors",
								isActive
									? "text-primary"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							<Icon className={cn(
								"h-5 w-5 transition-all",
								isActive && "text-primary"
							)} />
							<span className={cn(
								"transition-colors",
								isActive && "text-primary"
							)}>
                {tab.label}
              </span>
						</Button>
					);
				})}
			</div>
		</nav>
	);
};
export interface CrashGame {
	isRunning: boolean;
	multiplier: number;
	myBet?: {
		amount: number;
		currency: 'gifts' | 'ton';
		cashedOut?: boolean;
		cashOutMultiplier?: number;
	};
}

// Telegram WebApp types
export interface TelegramWebApp {
	ready(): void;
	close(): void;
	expand(): void;
	initData: string;
	initDataUnsafe: {
		user?: {
			id: number;
			first_name: string;
			last_name?: string;
			username?: string;
			photo_url?: string;
		};
	};
	version: string;
	platform: string;
	colorScheme: 'light' | 'dark';
	themeParams: {
		bg_color?: string;
		text_color?: string;
		hint_color?: string;
		link_color?: string;
		button_color?: string;
		button_text_color?: string;
	};
	isExpanded: boolean;
	viewportHeight: number;
	viewportStableHeight: number;
	openInvoice(url: string, callback?: (status: string) => void): void;
	HapticFeedback?: {
		impactOccurred(style: 'light' | 'medium' | 'heavy'): void;
		notificationOccurred(type: 'error' | 'success' | 'warning'): void;
		selectionChanged(): void;
	};
}

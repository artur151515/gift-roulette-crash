// import { User } from "@/types/new/auth.ts";

// export interface Case {
//     id: string;
//     name: string;
//     price: number;
//     imageUrl: string;
//     rarity?: 'common' | 'rare' | 'epic' | 'legendary';
// }

export interface CaseItem {
	id: string;
	name: string;
	imageUrl: string;
	price: number;
	rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// export interface CaseDetails extends Case {
//     items: CaseItem[];
// }

// export interface OpenCaseResult {
//     result: {
//         itemId: string;
//         name: string;
//         imageUrl: string;
//         price: number;
//     };
//     serverSeedHash: string;
// }

// export interface InventoryItem {
//   id: string;
//   name: string;
//   imageUrl: string;
//   price: number;
//   quantity?: number;
// }

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
//
// export interface DepositInvoice {
//     invoiceId: string;
//     payUrl: string;
// }

// export type CurrencyType = 'gifts' | 'ton';
// export type CaseType = 'paid' | 'free';

// // API Response types
// export interface ApiResponse<T> {
//     data: T;
//     success: boolean;
//     message?: string;
// }
//
// export interface AuthResponse {
//     accessToken: string;
//     refreshToken: string;
//     user: User;
// }

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
}

// declare global {
//     interface Window {
//         Telegram?: {
//             WebApp: TelegramWebApp;
//         };
//     }
// }

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CrashGame } from '@/types';

interface CrashState extends CrashGame {
	// Game history
	history: Array<{ multiplier: number; timestamp: number }>;

	// Demo game state
	gameStartTime: number | null;
	targetMultiplier: number;
	isGameEnded: boolean;

	// Actions
	startDemoGame: () => void;
	endGame: (finalMultiplier: number) => void;
	placeBet: (amount: number, currency: 'gifts' | 'ton') => void;
	cashOut: () => void;
	updateMultiplier: (multiplier: number) => void;
	resetGame: () => void;
}

// Demo crash game logic
function generateRandomMultiplier(): number {
	// Weighted random for realistic crash multipliers
	const rand = Math.random();
	if (rand < 0.5) return 1 + Math.random() * 2; // 1.0x - 3.0x (50%)
	if (rand < 0.8) return 3 + Math.random() * 7; // 3.0x - 10.0x (30%)
	if (rand < 0.95) return 10 + Math.random() * 40; // 10.0x - 50.0x (15%)
	return 50 + Math.random() * 450; // 50.0x - 500.0x (5%)
}

export const useCrashStore = create<CrashState>()(
	devtools(
		(set, get) => ({
			// Initial state
			isRunning: false,
			multiplier: 1.0,
			myBet: undefined,
			history: [],
			gameStartTime: null,
			targetMultiplier: 1.0,
			isGameEnded: false,

			startDemoGame: () => {
				const targetMultiplier = generateRandomMultiplier();
				set({
					isRunning: true,
					multiplier: 1.0,
					gameStartTime: Date.now(),
					targetMultiplier,
					isGameEnded: false,
				});

				// Simulate multiplier growth
				const gameInterval = setInterval(() => {
					const { isRunning, gameStartTime, targetMultiplier } = get();

					if (!isRunning || !gameStartTime) {
						clearInterval(gameInterval);
						return;
					}

					const elapsed = (Date.now() - gameStartTime) / 1000;
					const currentMultiplier = 1 + (elapsed * 0.5); // Grows by 0.5x per second

					if (currentMultiplier >= targetMultiplier) {
						// Game crashed!
						clearInterval(gameInterval);
						get().endGame(targetMultiplier);
					} else {
						set({ multiplier: currentMultiplier });
					}
				}, 100); // Update every 100ms for smooth animation
			},

			endGame: (finalMultiplier: number) => {
				const { myBet, history } = get();

				// Check if player won
				let updatedBet = myBet;
				if (myBet && !myBet.cashedOut) {
					// Player didn't cash out in time - they lose
					updatedBet = undefined;
				}

				// Add to history
				const newHistory = [
					{ multiplier: finalMultiplier, timestamp: Date.now() },
					...history.slice(0, 9) // Keep last 10 games
				];

				set({
					isRunning: false,
					multiplier: finalMultiplier,
					myBet: updatedBet,
					history: newHistory,
					isGameEnded: true,
					gameStartTime: null,
				});

				// Auto-start next game after 3 seconds
				setTimeout(() => {
					get().resetGame();
				}, 3000);
			},

			placeBet: (amount: number, currency: 'gifts' | 'ton') => {
				set({
					myBet: {
						amount,
						currency,
						cashedOut: false,
					}
				});
			},

			cashOut: () => {
				const { myBet, multiplier } = get();
				if (myBet && !myBet.cashedOut) {
					set({
						myBet: {
							...myBet,
							cashedOut: true,
							cashOutMultiplier: multiplier,
						}
					});
				}
			},

			updateMultiplier: (multiplier: number) => {
				set({ multiplier });
			},

			resetGame: () => {
				set({
					isRunning: false,
					multiplier: 1.0,
					myBet: undefined,
					gameStartTime: null,
					isGameEnded: false,
				});
			},
		}),
		{
			name: 'crash-store',
		}
	)
);
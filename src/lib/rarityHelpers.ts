import type { CaseItem } from '@/types';

export const getRarityColor = (rarity: CaseItem['rarity']) => {
  switch (rarity) {
    case 'common':
      return {
        background: 'bg-muted/10',
        border: 'border-muted',
        text: 'text-muted-foreground',
        gradient: 'from-muted/20 to-muted/5',
        glow: 'shadow-muted/20',
      };
    case 'rare':
      return {
        background: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        gradient: 'from-blue-500/20 to-blue-600/5',
        glow: 'shadow-blue-500/20',
      };
    case 'epic':
      return {
        background: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
        gradient: 'from-purple-500/20 to-purple-600/5',
        glow: 'shadow-purple-500/20',
      };
    case 'legendary':
      return {
        background: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-400',
        gradient: 'from-yellow-500/20 to-yellow-600/5',
        glow: 'shadow-yellow-500/20',
      };
    default:
      return {
        background: 'bg-muted/10',
        border: 'border-muted',
        text: 'text-muted-foreground',
        gradient: 'from-muted/20 to-muted/5',
        glow: 'shadow-muted/20',
      };
  }
};

export const getRarityIcon = (rarity: CaseItem['rarity']) => {
  switch (rarity) {
    case 'common':
      return '⚪';
    case 'rare':
      return '🔵';
    case 'epic':
      return '🟣';
    case 'legendary':
      return '🟡';
    default:
      return '⚪';
  }
};

export const getRarityName = (rarity: CaseItem['rarity']) => {
  switch (rarity) {
    case 'common':
      return 'Обычный';
    case 'rare':
      return 'Редкий';
    case 'epic':
      return 'Эпический';
    case 'legendary':
      return 'Легендарный';
    default:
      return 'Обычный';
  }
};

export const formatPrice = (price: number, currency: 'gems' | 'ton' = 'gems') => {
  const symbol = currency === 'gems' ? '💎' : 'TON';
  return `${symbol} ${price.toFixed(currency === 'gems' ? 1 : 2)}`;
};
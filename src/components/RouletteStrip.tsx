import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CaseItem } from '@/types';
import telegramService from '@/lib/telegram';

interface RouletteStripProps {
  items: CaseItem[];
  onSpin?: (result: CaseItem) => void;
  disabled?: boolean;
}

const ITEM_WIDTH = 104; // Width of each item in pixels
const VISIBLE_ITEMS = 7; // Number of visible items
const CONTAINER_WIDTH = VISIBLE_ITEMS * ITEM_WIDTH;

export const RouletteStrip = ({ items, onSpin, disabled = false }: RouletteStripProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<CaseItem | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Create extended items array for smooth scrolling
  const extendedItems = [...items, ...items, ...items, ...items, ...items];

  const handleDemoSpin = async () => {
    if (isSpinning || disabled) return;

    telegramService.impactOccurred('medium');
    setIsSpinning(true);
    setSpinResult(null);

    // Random result from original items
    const resultIndex = Math.floor(Math.random() * items.length);
    const result = items[resultIndex];

    // Calculate final position to center the winning item
    const middleIndex = Math.floor(extendedItems.length / 2);
    const targetIndex = middleIndex + resultIndex;
    const finalPosition = -(targetIndex * ITEM_WIDTH - CONTAINER_WIDTH / 2 + ITEM_WIDTH / 2);

    if (stripRef.current) {
      stripRef.current.style.transform = `translateX(${finalPosition}px)`;
      stripRef.current.style.transition = 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }

    // Wait for animation to complete
    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(result);
      onSpin?.(result);
      telegramService.notificationOccurred('success');
    }, 3000);
  };

  // Reset position when not spinning
  useEffect(() => {
    if (!isSpinning && stripRef.current) {
      setTimeout(() => {
        if (stripRef.current) {
          stripRef.current.style.transition = 'none';
          stripRef.current.style.transform = 'translateX(0px)';
        }
      }, 100);
    }
  }, [isSpinning]);

  const rarityColors = {
    common: 'border-muted bg-muted/10',
    rare: 'border-blue-500/50 bg-blue-500/10',
    epic: 'border-purple-500/50 bg-purple-500/10',
    legendary: 'border-yellow-500/50 bg-yellow-500/10',
  };

  return (
    <div className="space-y-6">
      {/* Roulette Container */}
      <div className="relative">
        {/* Container with overflow hidden */}
        <div 
          className="relative mx-auto overflow-hidden rounded-lg bg-card/50 border border-border"
          style={{ width: CONTAINER_WIDTH, height: 120 }}
        >
          {/* Center indicator line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary z-10 transform -translate-x-0.5" />
          <div className="absolute left-1/2 top-2 w-3 h-3 bg-primary rounded-full z-10 transform -translate-x-1.5" />

          {/* Items strip */}
          <div
            ref={stripRef}
            className="flex items-center h-full"
            style={{ width: extendedItems.length * ITEM_WIDTH }}
          >
            {extendedItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className={cn(
                  "flex-shrink-0 p-2 border-r border-border/30 last:border-r-0",
                  rarityColors[item.rarity]
                )}
                style={{ width: ITEM_WIDTH }}
              >
                <div className="text-center space-y-1">
                  {/* Item image placeholder */}
                  <div className="w-12 h-12 mx-auto rounded-lg bg-background/50 flex items-center justify-center text-xl">
                    🎁
                  </div>
                  
                  {/* Item name */}
                  <p className="text-xs font-medium text-foreground line-clamp-1">
                    {item.name}
                  </p>
                  
                  {/* Item price */}
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    💎{item.price}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Spinning overlay */}
          {isSpinning && (
            <div className="absolute inset-0 bg-background/20 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="text-2xl animate-spin">🎰</div>
            </div>
          )}
        </div>

        {/* Grid background effect */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      </div>

      {/* Demo Spin Button */}
      <div className="text-center space-y-3">
        <Button
          onClick={handleDemoSpin}
          disabled={isSpinning || disabled}
          className="btn-primary px-8 py-3 text-base font-semibold"
        >
          {isSpinning ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Крутим...
            </>
          ) : (
            'Демо прокрут 🚀'
          )}
        </Button>

        {/* Result Display */}
        {spinResult && !isSpinning && (
          <div className="animate-scale-in bg-card/80 backdrop-blur-md rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-2">Поздравляем!</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                🎁
              </div>
              <div>
                <p className="font-semibold text-foreground">{spinResult.name}</p>
                <Badge variant="outline" className="text-xs">
                  💎{spinResult.price}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
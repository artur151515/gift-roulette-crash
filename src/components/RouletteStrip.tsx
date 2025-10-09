import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CaseItemDto } from '@/types/new/cases';
import telegramService from '@/lib/telegram';

interface RouletteStripProps {
    items: CaseItemDto[];
    onSpin?: (result: CaseItemDto) => void;
    disabled?: boolean;
    isSpinning?: boolean;
    wonItem?: CaseItemDto | null;
    // Optional props to make component configurable / responsive
    itemWidth?: number;
    visibleItems?: number;
    height?: number;
}

export const RouletteStrip = ({
                                  items,
                                  onSpin,
                                  disabled = false,
                                  isSpinning: externalSpinning = false,
                                  wonItem = null,
                                  itemWidth = 104,
                                  visibleItems = 7,
                                  height = 120,
                              }: RouletteStripProps) => {
    const [isAnimating, setIsAnimating] = useState(false); // when transform transition is running
    const [spinResult, setSpinResult] = useState<CaseItemDto | null>(null);
    const stripRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const animationCleanupRef = useRef<() => void>(() => {});
    const [containerWidth, setContainerWidth] = useState<number>(0);

    // Respect reduced-motion preference
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    useEffect(() => {
        // ResizeObserver to track container size (more reliable than window.resize)
        const ro = new ResizeObserver(() => {
            if (!containerRef.current) return;
            const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
            const maxWidth = itemWidth * visibleItems;
            setContainerWidth(Math.min(parentWidth - 32, maxWidth)); // -32 for padding space
        });

        if (containerRef.current) ro.observe(containerRef.current);

        // initial run
        if (containerRef.current) {
            const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
            const maxWidth = itemWidth * visibleItems;
            setContainerWidth(Math.min(parentWidth - 32, maxWidth));
        }

        return () => ro.disconnect();
    }, [itemWidth, visibleItems]);

    // Compute minimal repeats to ensure we can move to a middle area without rendering too many elements
    const extendedItems = React.useMemo(() => {
        if (!items || items.length === 0) return [] as CaseItemDto[];

        // Determine how many items we need at minimum so that middle region exists and visible items fill space
        const minDistanceInItems = visibleItems * 3; // allow enough room to land near center
        const repeats = Math.max(3, Math.ceil((minDistanceInItems + visibleItems) / items.length));

        const arr: CaseItemDto[] = [];
        for (let i = 0; i < repeats; i++) arr.push(...items);
        return arr;
    }, [items, visibleItems]);

    // Cleanup on unmount: remove listeners and cancel any pending state changes
    useEffect(() => {
        return () => {
            // call cleanup if set
            animationCleanupRef.current();
            animationCleanupRef.current = () => {};
        };
    }, []);

    const finishSpin = useCallback((result: CaseItemDto) => {
        setIsAnimating(false);
        setSpinResult(result);
        onSpin?.(result);
        telegramService.notificationOccurred('success');
    }, [onSpin]);
    
    // Handle external spinning control
    useEffect(() => {
        if (externalSpinning && wonItem) {
            setIsAnimating(true);
            setSpinResult(null);
            
            // Find the won item index in the original items array
            const resultIndex = items.findIndex(item => item.id === wonItem.id);
            
            if (resultIndex === -1) return;
            
            // Choose a central target within the extended array
            const middleIndex = Math.floor(extendedItems.length / 2);
            const targetIndex = middleIndex + resultIndex;
            
            const finalPosition = -(targetIndex * itemWidth - containerWidth / 2 + itemWidth / 2);
            
            if (!stripRef.current) return;
            
            // Set transition & translate
            stripRef.current.style.willChange = 'transform';
            stripRef.current.style.transition = 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            stripRef.current.style.transform = `translate3d(${finalPosition}px, 0, 0)`;
            
            // Set timeout to finish the spin
            const timeoutId = setTimeout(() => {
                if (stripRef.current) {
                    stripRef.current.style.transition = 'none';
                    stripRef.current.style.transform = 'translate3d(0,0,0)';
                }
                finishSpin(wonItem);
            }, 3000);
            
            return () => clearTimeout(timeoutId);
        }
    }, [externalSpinning, wonItem, items, extendedItems, itemWidth, containerWidth, finishSpin]);

    const handleDemoSpin = useCallback(() => {
        if (isAnimating || disabled || items.length === 0) return;

        telegramService.impactOccurred('medium');
        setIsAnimating(true);
        setSpinResult(null);

        const resultIndex = Math.floor(Math.random() * items.length);
        const result = items[resultIndex];

        // Choose a central target within the extended array
        const middleIndex = Math.floor(extendedItems.length / 2);
        const targetIndex = middleIndex + resultIndex;

        const finalPosition = -(targetIndex * itemWidth - containerWidth / 2 + itemWidth / 2);

        // If user prefers reduced motion, skip animation and immediately show result
        if (prefersReducedMotion) {
            // reset transform cleanly
            if (stripRef.current) {
                stripRef.current.style.transition = 'none';
                stripRef.current.style.transform = 'translate3d(0,0,0)';
            }
            finishSpin(result);
            return;
        }

        if (!stripRef.current) return;

        // Remove any previous transitionend listener
        animationCleanupRef.current();

        const onTransitionEnd = (e: TransitionEvent) => {
            if (e.propertyName !== 'transform') return;
            // remove listener
            stripRef.current?.removeEventListener('transitionend', onTransitionEnd);

            // Give the browser a tick, then snap back to the non-animated zero offset while keeping visual
            // We temporarily disable transition to avoid visible jump when resetting transform
            window.requestAnimationFrame(() => {
                // During reset we set transition:none then transform to 0
                if (!stripRef.current) return;
                stripRef.current.style.transition = 'none';
                stripRef.current.style.transform = 'translate3d(0,0,0)';

                // Force reflow then clear inline styles related to animation (so subsequent spins work predictably)
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                stripRef.current.offsetHeight;

                // Cleanup: restore will-change (kept in css/class)
            });

            finishSpin(result);
        };

        // attach listener
        stripRef.current.addEventListener('transitionend', onTransitionEnd);

        // provide a cleanup handler in case component unmounts or another spin starts before transitionend
        animationCleanupRef.current = () => {
            if (stripRef.current) {
                stripRef.current.removeEventListener('transitionend', onTransitionEnd);
            }
        };

        // Set transition & translate
        // Use translate3d and will-change for GPU acceleration
        stripRef.current.style.willChange = 'transform';
        stripRef.current.style.transition = 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        stripRef.current.style.transform = `translate3d(${finalPosition}px, 0, 0)`;
    }, [isAnimating, disabled, items, extendedItems, itemWidth, containerWidth, finishSpin, prefersReducedMotion]);

    // Accessibility: announce result to screen readers
    // A small offscreen live region

    const getItemImage = (item: CaseItemDto) => {
        if (item.imageUrl) {
            return (
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 mx-auto rounded-lg object-cover"
                />
            );
        }
        return (
            <div className="w-12 h-12 mx-auto rounded-lg bg-background/50 flex items-center justify-center text-xl">
                🎁
            </div>
        );
    };

    // Key handlers: allow Space/Enter to spin
    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleDemoSpin();
        }
    };

    // Render
    return (
        <div className="space-y-6">
            {/* Roulette Container */}
            <div className="relative">
                {/* Container with overflow hidden */}
                <div
                    ref={containerRef}
                    className="relative mx-auto overflow-hidden rounded-lg bg-card/50 border border-border"
                    style={{ width: containerWidth || itemWidth * Math.min(visibleItems, Math.max(1, items.length)), height }}
                    aria-busy={isAnimating}
                >
                    {/* Center indicator line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary z-10 transform -translate-x-0.5" />
                    <div className="absolute left-1/2 top-2 w-3 h-3 bg-primary rounded-full z-10 transform -translate-x-1.5" />

                    {/* Items strip */}
                    <div
                        ref={stripRef}
                        className="flex items-center h-full"
                        // width may be large; leave to inline style for performance
                        style={{ width: extendedItems.length * itemWidth }}
                        // Prevent pointer events during animation
                        aria-hidden={isAnimating}
                    >
                        {extendedItems.length === 0 ? (
                            <div className="flex items-center justify-center w-full h-full">
                                <p className="text-sm text-muted-foreground">Нет предметов для отображения</p>
                            </div>
                        ) : (
                            extendedItems.map((item, index) => (
                                <div
                                    key={`${item.id}-${index}`}
                                    className={cn(
                                        'flex-shrink-0 p-2 border-r border-border/30 last:border-r-0 bg-card/50'
                                    )}
                                    style={{ width: itemWidth }}
                                >
                                    <div className="text-center space-y-1">
                                        {/* Item image */}
                                        {getItemImage(item)}

                                        {/* Item name */}
                                        <p className="text-xs font-medium text-foreground line-clamp-1">{item.name}</p>

                                        {/* Item price */}
                                        <Badge variant="outline" className="text-xs px-1 py-0">
                                            💎{item.price}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Spinning overlay */}
                    {isAnimating && (
                        <div className="absolute inset-0 bg-background/20 backdrop-blur-sm flex items-center justify-center z-20 pointer-events-none">
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
                    onKeyDown={onKeyDown}
                    disabled={isAnimating || disabled}
                    className="btn-primary px-8 py-3 text-base font-semibold"
                    aria-pressed={isAnimating}
                >
                    {isAnimating ? (
                        <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            Крутим...
                        </>
                    ) : (
                        'Демо прокрут 🚀'
                    )}
                </Button>

                {/* Result Display */}
                {spinResult && !isAnimating && (
                    <div className="animate-scale-in bg-card/80 backdrop-blur-md rounded-lg p-4 border border-border">
                        <p className="text-sm text-muted-foreground mb-2">Поздравляем!</p>
                        <div className="flex items-center justify-center gap-3">
                            {spinResult.imageUrl ? (
                                <img
                                    src={spinResult.imageUrl}
                                    alt={spinResult.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🎁</div>
                            )}
                            <div>
                                <p className="font-semibold text-foreground">{spinResult.name}</p>
                                <Badge variant="outline" className="text-xs">
                                    💎{spinResult.price}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}

                {/* Screen reader live region */}
                <div aria-live="polite" className="sr-only">
                    {spinResult ? `Вы выиграли ${spinResult.name}` : ''}
                </div>
            </div>
        </div>
    );
};

import { useEffect, useState, useRef } from 'react';
import { ItemDto } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface GiftFeedItem {
    id: string;
    item: ItemDto;
    timestamp: number;
    username?: string;
}

interface GiftsFeedProps {
    items: ItemDto[];
    userWonItem?: ItemDto | null;
    onItemAppear?: (item: ItemDto) => void;
}

const VISIBILITY = {
    MIN_DELTA: 16,     // игнорируем мелкие колебания
    HIDE_AFTER: 80,    // нужно прокрутить вниз от якоря на 80px, чтобы скрыть
    SHOW_AFTER: 40,    // нужно прокрутить вверх от якоря на 40px, чтобы показать (гистерезис)
    NEAR_TOP: 64,      // всегда показываем около верха страницы
    NEAR_BOTTOM: 64,   // всегда показываем около низа страницы
    COOLDOWN_MS: 300,  // минимальная пауза между переключениями
};

export const GiftsFeed = ({ items, userWonItem, onItemAppear }: GiftsFeedProps) => {
    const [feedItems, setFeedItems] = useState<GiftFeedItem[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    const visibleRef = useRef(true);
    useEffect(() => { visibleRef.current = isVisible; }, [isVisible]);

    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // --- НОВАЯ ЛОГИКА ВИДИМОСТИ ---
    useEffect(() => {
        const scrollEl = document.scrollingElement || document.documentElement;

        const state = {
            lastY: (typeof window !== 'undefined' ? (window.scrollY || window.pageYOffset || 0) : 0),
            anchorY: (typeof window !== 'undefined' ? (window.scrollY || window.pageYOffset || 0) : 0),
            dir: 0 as -1 | 0 | 1, // -1 вверх, 1 вниз, 0 нет
            lastToggleTs: 0,
            ticking: false,
            scrollEndTimer: null as number | null,
        };

        const setVisibleSafe = (v: boolean) => {
            setIsVisible(prev => {
                if (prev === v) return prev;
                visibleRef.current = v;
                return v;
            });
            state.lastToggleTs = performance.now();
        };

        const handleScrollRAF = () => {
            const rawY = window.scrollY || window.pageYOffset || 0;
            const maxY = Math.max(0, (scrollEl.scrollHeight - window.innerHeight));
            const y = Math.max(0, Math.min(rawY, maxY)); // кламп от «пружинки» на iOS
            const dy = y - state.lastY;

            // Всегда показываем около верха/низа — убирает мерцание на «упоре»
            // const nearTop = y <= VISIBILITY.NEAR_TOP;
            // const nearBottom = (maxY - y) <= VISIBILITY.NEAR_BOTTOM;
            // if (nearTop || nearBottom) {
            //     if (!visibleRef.current) setVisibleSafe(true);
            //     state.anchorY = y;
            //     state.lastY = y;
            //     state.ticking = false;
            //     return;
            // }

            // Игнор мелких дельт
            if (Math.abs(dy) >= VISIBILITY.MIN_DELTA) {
                const nowDir: -1 | 1 = dy > 0 ? 1 : -1;

                // При смене направления — переякоримся
                if (nowDir !== state.dir) {
                    state.dir = nowDir;
                    state.anchorY = y;
                }

                const now = performance.now();
                const cooldownOk = (now - state.lastToggleTs) > VISIBILITY.COOLDOWN_MS;

                if (state.dir === 1) {
                    // Скроллим вниз — скрывать после порога
                    if (y - state.anchorY > VISIBILITY.HIDE_AFTER && visibleRef.current && cooldownOk) {
                        setVisibleSafe(false);
                    }
                } else if (state.dir === -1) {
                    // Скроллим вверх — показывать после меньшего порога
                    if (state.anchorY - y > VISIBILITY.SHOW_AFTER && !visibleRef.current && cooldownOk) {
                        setVisibleSafe(true);
                    }
                }
            }

            state.lastY = y;
            state.ticking = false;
        };

        const onScroll = () => {
            if (!state.ticking) {
                state.ticking = true;
                requestAnimationFrame(handleScrollRAF);
            }

            // Детектор окончания скролла — мягкая коррекция вблизи краёв
            if (state.scrollEndTimer) window.clearTimeout(state.scrollEndTimer);
            state.scrollEndTimer = window.setTimeout(() => {
                const y = window.scrollY || window.pageYOffset || 0;
                const maxY = Math.max(0, (scrollEl.scrollHeight - window.innerHeight));
                if (y <= VISIBILITY.NEAR_TOP || (maxY - y) <= VISIBILITY.NEAR_BOTTOM) {
                    if (!visibleRef.current) setVisibleSafe(true);
                }
            }, 250);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (state.scrollEndTimer) window.clearTimeout(state.scrollEndTimer);
        };
    }, []);
    // --- КОНЕЦ НОВОЙ ЛОГИКИ ---

    // Добавить случайный подарок в ленту
    const addRandomGift = () => {
        if (items.length === 0) return;

        const randomItem = items[Math.floor(Math.random() * items.length)];
        const newFeedItem: GiftFeedItem = {
            id: `${Date.now()}-${Math.random()}`,
            item: randomItem,
            timestamp: Date.now(),
            username: generateRandomUsername(),
        };

        setFeedItems(prev => {
            const updated = [newFeedItem, ...prev];
            return updated.slice(0, 20);
        });

        onItemAppear?.(randomItem);

        if (containerRef.current) {
            containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    };

    // Добавить подарок пользователя
    useEffect(() => {
        if (userWonItem) {
            const userFeedItem: GiftFeedItem = {
                id: `user-${Date.now()}`,
                item: userWonItem,
                timestamp: Date.now(),
                username: 'Вы',
            };

            setFeedItems(prev => {
                const updated = [userFeedItem, ...prev];
                return updated.slice(0, 20);
            });

            setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                }
            }, 100);
        }
    }, [userWonItem]);

    // Запуск генерации случайных подарков
    useEffect(() => {
        const scheduleNext = () => {
            const delay = Math.random() * (120000 - 15000) + 15000; // 15–120 c
            timeoutRef.current = setTimeout(() => {
                addRandomGift();
                scheduleNext();
            }, delay);
        };

        const initialTimeout = setTimeout(() => {
            addRandomGift();
            scheduleNext();
        }, 2000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            clearTimeout(initialTimeout);
        };
    }, [items]);

    if (feedItems.length === 0) return null;

    return (
        <div
            className={cn(
                'w-full overflow-hidden',
                'transition-all duration-300 ease-in-out',
                isVisible ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
            )}
            style={{ willChange: 'max-height, opacity' }}
        >
            <div
                ref={containerRef}
                className="flex gap-2 p-2 pb-1 overflow-x-auto scroll-smooth"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {feedItems.map((feedItem, index) => (
                    <div
                        key={feedItem.id}
                        className={cn(
                            'flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden relative group',
                            'bg-gradient-to-br from-primary/30 via-accent/20 to-primary/20',
                            'transition-all duration-300',
                            'hover:scale-110 hover:shadow-lg',
                            'animate-in fade-in slide-in-from-left-4',
                            'p-1.5',
                            feedItem.username === 'Вы' && 'ring-2 ring-primary/50'
                        )}
                        style={{ animationDelay: `${index * 50}ms`, animationDuration: '500ms' }}
                    >
                        {feedItem.item.imageUrl ? (
                            <img
                                src={feedItem.item.imageUrl}
                                alt={feedItem.item.name}
                                className="w-full h-full object-contain rounded-sm"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🎁</div>
                        )}

                        {feedItem.username === 'Вы' && (
                            <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Генерация случайных имен пользователей
const generateRandomUsername = (): string => {
    const usernames = [
        'Player', 'Gamer', 'Winner', 'Lucky', 'Pro',
        'Star', 'Champion', 'Master', 'Legend', 'Hero',
        'Expert', 'Sniper', 'Wizard', 'Hunter', 'Racer'
    ];
    const numbers = Math.floor(Math.random() * 9999) + 1;
    const username = usernames[Math.floor(Math.random() * usernames.length)];
    return `${username}${numbers}`;
};

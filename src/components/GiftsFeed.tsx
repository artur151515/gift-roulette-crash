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

export const GiftsFeed = ({ items, userWonItem, onItemAppear }: GiftsFeedProps) => {
    const [feedItems, setFeedItems] = useState<GiftFeedItem[]>([]);
    const [isVisible, setIsVisible] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastScrollY = useRef(0);

    // Отслеживание направления скролла для скрытия/показа ленты
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY || window.pageYOffset;
            
            // Игнорируем очень маленькие изменения (менее 5px)
            if (Math.abs(currentScrollY - lastScrollY.current) < 5) {
                return;
            }

            // Показываем при скролле вверх, скрываем при скролле вниз
            if (currentScrollY < lastScrollY.current) {
                // Скролл вверх
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
                // Скролл вниз (только если прошли больше 10px от начала)
                setIsVisible(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            // Ограничиваем количество элементов в ленте
            return updated.slice(0, 20);
        });

        onItemAppear?.(randomItem);

        // Плавная прокрутка к началу
        if (containerRef.current) {
            containerRef.current.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
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

            // Прокрутка к началу
            setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTo({
                        left: 0,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }, [userWonItem]);

    // Запуск генерации случайных подарков
    useEffect(() => {
        const scheduleNext = () => {
            // Случайный интервал от 15 до 120 секунд
            const delay = Math.random() * (120000 - 15000) + 15000;

            timeoutRef.current = setTimeout(() => {
                addRandomGift();
                scheduleNext();
            }, delay);
        };

        // Добавить первый подарок через 2 секунды
        const initialTimeout = setTimeout(() => {
            addRandomGift();
            scheduleNext();
        }, 2000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            clearTimeout(initialTimeout);
        };
    }, [items]);

    if (feedItems.length === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                "w-full overflow-hidden",
                "transition-all duration-300 ease-in-out",
                isVisible ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
            )}
        >
            <div
                ref={containerRef}
                className="flex gap-2 p-2 pb-0 overflow-x-auto scroll-smooth"
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
                            "flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden relative group",
                            "bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20",
                            "border border-border/50 hover:border-primary/50 transition-all duration-300",
                            "hover:scale-110 hover:shadow-lg",
                            "animate-in fade-in slide-in-from-left-4",
                            "p-1.5",
                            feedItem.username === 'Вы' && "ring-2 ring-primary/50"
                        )}
                        style={{
                            animationDelay: `${index * 50}ms`,
                            animationDuration: '500ms',
                        }}
                    >
                        {feedItem.item.imageUrl ? (
                            <img
                                src={feedItem.item.imageUrl}
                                alt={feedItem.item.name}
                                className="w-full h-full object-contain rounded-sm"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">
                                🎁
                            </div>
                        )}

                        {/*/!* Username overlay *!/*/}
                        {/*<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">*/}
                        {/*    <p className="text-[7px] text-white font-medium truncate text-center">*/}
                        {/*        {feedItem.username}*/}
                        {/*    </p>*/}
                        {/*</div>*/}

                        {/* "You" indicator */}
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
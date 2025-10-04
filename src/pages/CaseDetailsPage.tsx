import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RouletteStrip } from '@/components/RouletteStrip';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import type { CaseItem } from '@/types';
import telegramService from '@/lib/telegram';

// Demo case details
const DEMO_CASE_ITEMS: CaseItem[] = [
    { id: '1', name: 'Common Item', imageUrl: '', price: 10, rarity: 'common' },
    { id: '2', name: 'Rare Prize', imageUrl: '', price: 50, rarity: 'rare' },
    { id: '3', name: 'Epic Reward', imageUrl: '', price: 150, rarity: 'epic' },
    { id: '4', name: 'Legendary Gift', imageUrl: '', price: 500, rarity: 'legendary' },
    { id: '5', name: 'Silver Star', imageUrl: '', price: 75, rarity: 'rare' },
    { id: '6', name: 'Gold Crown', imageUrl: '', price: 200, rarity: 'epic' },
];

export const CaseDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { openCaseOpenModal } = useUIStore();

    // For demo, we'll use mock data
    const caseDetails = {
        id: id || '1',
        name: `Case #${id}`,
        price: parseFloat(id || '1'),
        imageUrl: '',
        rarity: 'rare' as const,
        items: DEMO_CASE_ITEMS
    };

    const handleBack = () => {
        navigate('/cases');
    };

    const handleOpenCase = () => {
        if (!user || user.balance < caseDetails.price) {
            telegramService.notificationOccurred('error');
            return;
        }

        telegramService.impactOccurred('medium');
        openCaseOpenModal(caseDetails.id);
    };

    const handleRouletteResult = (result: CaseItem) => {
        console.log('Demo roulette result:', result);
    };

    const rarityColors = {
        common: 'bg-muted/10 text-muted-foreground border-muted',
        rare: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        epic: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        legendary: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };

    const canAfford = user && user.balance >= caseDetails.price;

    return (
        <div className="flex-1 pb-20">
            {/* Header */}
            <div className="sticky bg-background/95 backdrop-blur-md border-b border-border z-40">
                <div className="flex items-center gap-4 p-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="h-8 w-8 p-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <div className="flex-1">
                        <h1 className="font-bold text-lg text-foreground">
                            {caseDetails.id}
                        </h1>
                    </div>

                    <Badge
                        variant="outline"
                        className={cn("font-semibold", rarityColors[caseDetails.rarity])}
                    >
                        💎 {caseDetails.price}
                    </Badge>
                </div>
            </div>

            <div className="p-4 space-y-8">
                {/* Roulette Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">
                        Демо рулетка
                    </h2>
                    <RouletteStrip
                        items={caseDetails.items}
                        onSpin={handleRouletteResult}
                    />
                </div>

                {/* What's Inside Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">
                        Что внутри?
                    </h2>

                    <div className="grid grid-cols-3 gap-3">
                        {caseDetails.items.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "p-3 rounded-lg border text-center space-y-2",
                                    rarityColors[item.rarity]
                                )}
                            >
                                <div className="w-12 h-12 mx-auto rounded-lg bg-background/50 flex items-center justify-center text-xl">
                                    🎁
                                </div>
                                <div>
                                    <p className="text-xs font-medium line-clamp-1">
                                        {item.name}
                                    </p>
                                    <Badge variant="outline" className="text-xs mt-1">
                                        💎{item.price}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Open Case Button */}
                <div className="sticky bottom-20 bg-background/95 backdrop-blur-md p-4 -mx-4 border-t border-border">
                    <Button
                        onClick={handleOpenCase}
                        disabled={!canAfford}
                        className={cn(
                            "w-full py-4 text-base font-semibold",
                            canAfford ? "btn-primary" : "btn-secondary"
                        )}
                    >
                        {!canAfford ? (
                            <>Недостаточно средств</>
                        ) : (
                            <>Демо прокрут 🚀</>
                        )}
                    </Button>

                    {!canAfford && user && (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            Нужно еще 💎{(caseDetails.price - user.balance).toFixed(2)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
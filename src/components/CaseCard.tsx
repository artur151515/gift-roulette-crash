import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Case } from '@/types';
import telegramService from '@/lib/telegram';

interface CaseCardProps {
    case: Case;
    onClick?: (caseId: string) => void;
}

// const rarityColors = {
//     common: 'bg-muted text-muted-foreground',
//     rare: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
//     epic: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
//     legendary: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
// };
//
// const rarityGradients = {
//     common: 'from-muted/50 to-muted/20',
//     rare: 'from-blue-500/20 to-blue-600/5',
//     epic: 'from-purple-500/20 to-purple-600/5',
//     legendary: 'from-yellow-500/20 to-yellow-600/5',
// };

export const CaseCard = ({ case: caseItem, onClick }: CaseCardProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        telegramService.impactOccurred('light');

        if (onClick) {
            onClick(caseItem.id);
        } else {
            navigate(`/cases/${caseItem.id}`);
        }
    };

    return (
        <Card
            className={cn(
                "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-border bg-gradient-to-br",
                // rarityGradients[caseItem.rarity],
                "card-elevated hover:card-glow"
            )}
            onClick={handleClick}
        >
            <CardContent className="p-4 space-y-3">
                {/* Case Image */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                    <div className="relative flex items-center justify-center h-full">
                        {/* Placeholder icon for now - in real app would be actual case image */}
                        <div className="text-4xl opacity-60">📦</div>
                    </div>

                    {/* Rarity indicator */}
                    {/*<div className={cn(*/}
                    {/*    "absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-background",*/}
                    {/*    rarityColors[caseItem.rarity].includes('bg-muted') ? 'bg-muted' :*/}
                    {/*        caseItem.rarity === 'rare' ? 'bg-blue-500' :*/}
                    {/*            caseItem.rarity === 'epic' ? 'bg-purple-500' : 'bg-yellow-500'*/}
                    {/*)} />*/}
                </div>

                {/* Case Info */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                        {caseItem.name}
                    </h3>

                    <Badge
                        variant="outline"
                        className={cn(
                            "w-fit font-medium border",
                            // rarityColors[caseItem.rarity]
                        )}
                    >
                        <span className="mr-1">💎</span>
                        {caseItem.price}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};
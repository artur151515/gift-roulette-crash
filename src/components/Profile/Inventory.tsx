import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import {
    useUserInventory,
    useClaimInventoryItem,
    useSellInventoryItem
} from '@/hooks/useUserInventory';
import { InventoryStatus, InventoryItemDto } from '@/types/new/inventory';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu.tsx';
import { MoreVertical, Gift, DollarSign } from 'lucide-react';
import telegramService from '@/lib/telegram';

const getStatusColor = (status: InventoryStatus) => {
    switch (status) {
        case 'AVAILABLE':
            return 'bg-green-500/20 text-green-600 border-green-500/30';
        case 'RECEIVED':
            return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
        case 'SOLD':
            return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
        case 'PENDING_FOR_RECEIVAL':
            return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
        default:
            return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
};

const getStatusLabel = (status: InventoryStatus) => {
    switch (status) {
        case 'AVAILABLE':
            return 'Доступен';
        case 'RECEIVED':
            return 'Получен';
        case 'SOLD':
            return 'Продан';
        case 'PENDING_FOR_RECEIVAL':
            return 'Ожидает';
        default:
            return status;
    }
};

interface InventoryItemProps {
    item: InventoryItemDto;
    onClaim: (id: string) => void;
    onSell: (id: string) => void;
    isClaiming: boolean;
    isSelling: boolean;
}

const InventoryItemCard: React.FC<InventoryItemProps> = ({
                                                             item,
                                                             onClaim,
                                                             onSell,
                                                             isClaiming,
                                                             isSelling
                                                         }) => {
    const canClaim = item.status === 'AVAILABLE';
    const canSell = item.status === 'AVAILABLE';

    return (
        <div className="relative bg-card/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors group overflow-hidden">
            {/* Лента NFT */}
            {item.item.isRandomNFT && (
                <div className="absolute top-2 right-[-40px] w-[120px] rotate-45 bg-purple-600 text-white text-[10px] font-bold py-1 text-center shadow-md">
                    NFT
                </div>
            )}

            <div className="flex items-center justify-center mb-2">
                <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(item.status)}`}
                >
                    {getStatusLabel(item.status)}
                </Badge>
                <DropdownMenu>
                    <DropdownMenuContent align="end">
                        {canClaim && (
                            <DropdownMenuItem
                                onClick={() => onClaim(item.id)}
                                disabled={isClaiming}
                                className="text-green-600"
                            >
                                <Gift className="h-4 w-4 mr-2" />
                                {isClaiming ? 'Получение...' : 'Получить'}
                            </DropdownMenuItem>
                        )}
                        {canSell && (
                            <DropdownMenuItem
                                onClick={() => onSell(item.id)}
                                disabled={isSelling}
                                className="text-blue-600"
                            >
                                <DollarSign className="h-4 w-4 mr-2" />
                                {isSelling ? 'Продажа...' : 'Продать'}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="aspect-square rounded-lg bg-primary/10 flex items-center justify-center text-2xl mb-2">
                {item.item.imageUrl ? (
                    <img
                        src={item.item.imageUrl}
                        alt={item.item.name}
                        className="w-full h-full object-cover rounded-lg"
                    />
                ) : (
                    '🎁'
                )}
            </div>

            <div className="text-center space-y-1">
                <p className="text-xs font-medium line-clamp-1 text-foreground mt-3 mb-2">
                    {item.item.name}
                </p>
                <Badge variant="outline" className="text-xs">
                    💎{item.item.price}
                </Badge>
            </div>
        </div>
    );
};


const Inventory: React.FC = () => {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<InventoryStatus | undefined>(undefined);
    const limit = 12;

    const { data, isLoading, error } = useUserInventory(page, limit, statusFilter);
    const claimMutation = useClaimInventoryItem();
    const sellMutation = useSellInventoryItem();

    const handleClaim = (id: string) => {
        telegramService.impactOccurred('light');
        claimMutation.mutate(id);
    };

    const handleSell = (id: string) => {
        telegramService.impactOccurred('light');
        sellMutation.mutate(id);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status === 'all' ? undefined : (status as InventoryStatus));
        setPage(1);
    };

    const totalItems = data?.pagination?.total || 0;
    const totalPages = data?.pagination?.totalPages || 1;

    if (error) {
        return (
            <Card className="card-elevated">
                <CardContent className="p-6">
                    <div className="text-center py-8 space-y-3">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="font-semibold text-foreground">Ошибка загрузки</h3>
                        <p className="text-muted-foreground text-sm">
                            Не удалось загрузить инвентарь. Попробуйте позже.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="card-elevated">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Инвентарь ({totalItems})</span>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter || 'all'} onValueChange={handleStatusFilter}>
                            <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все</SelectItem>
                                <SelectItem value="AVAILABLE">Доступны</SelectItem>
                                <SelectItem value="RECEIVED">Получены</SelectItem>
                                <SelectItem value="SOLD">Проданы</SelectItem>
                                <SelectItem value="PENDING_FOR_RECEIVAL">Ожидают</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                {isLoading ? (
                    <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-lg" />
                        ))}
                    </div>
                ) : data?.items?.length ? (
                    <>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {data.items.map((item) => (
                                <InventoryItemCard
                                    key={item.id}
                                    item={item}
                                    onClaim={handleClaim}
                                    onSell={handleSell}
                                    isClaiming={claimMutation.isPending}
                                    isSelling={sellMutation.isPending}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || isLoading}
                                >
                                    Назад
                                </Button>
                                <span className="text-sm text-muted-foreground">
                  {page} из {totalPages}
                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || isLoading}
                                >
                                    Вперёд
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 space-y-3">
                        <div className="text-4xl mb-4">📦</div>
                        <h3 className="font-semibold text-foreground">Инвентарь пуст</h3>
                        <p className="text-muted-foreground text-sm">
                            {statusFilter
                                ? `Нет предметов со статусом "${getStatusLabel(statusFilter)}"`
                                : "Откройте кейсы, чтобы получить предметы!"
                            }
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Inventory;

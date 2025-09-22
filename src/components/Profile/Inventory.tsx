import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

const Inventory: React.FC<{ inventory: any[]; isLoading: boolean }> = ({ inventory, isLoading }) => (
    <Card className="card-elevated">
        <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>Инвентарь ({inventory?.length || 0})</span>
                <Button variant="ghost" size="sm" className="text-primary">Продать все</Button>
            </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
            {isLoading ? (
                <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                </div>
            ) : inventory?.length ? (
                <div className="grid grid-cols-3 gap-3">
                    {inventory.map((item) => (
                        <div key={item.id} className="relative bg-card/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-colors">
                            {item.quantity > 1 && (
                                <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 min-w-5 text-xs">
                                    {item.quantity}
                                </Badge>
                            )}
                            <div className="aspect-square rounded-lg bg-primary/10 flex items-center justify-center text-2xl mb-2">
                                🎁
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-xs font-medium line-clamp-1 text-foreground">{item.name}</p>
                                <Badge variant="outline" className="text-xs">💎{item.price}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 space-y-3">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="font-semibold text-foreground">Инвентарь пуст</h3>
                    <p className="text-muted-foreground text-sm">Откройте кейсы, чтобы получить предметы!</p>
                </div>
            )}
        </CardContent>
    </Card>
);

export default Inventory;

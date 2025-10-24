import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import {Button} from "@/components/ui/button.tsx";
import {Copy} from "lucide-react";

const ReferralSystem: React.FC<{ referralLink: string; onCopyReferralLink: () => void }> = ({ referralLink, onCopyReferralLink }) => (
    <Card className="card-elevated">
        <CardHeader>
            <CardTitle>Зарабатывайте 10% от депозитов ваших друзей</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
            {/*<p className="text-muted-foreground text-sm">Приглашайте друзей и получайте 10% от их депозитов в виде бонуса!</p>*/}
            <div className="flex gap-3">
                <Button onClick={onCopyReferralLink} className="flex-1 btn-primary flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Пригласить
                </Button>
            </div>
            <div className="bg-muted/20 rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground">Условия</p>
                <p className="text-xs text-muted-foreground mt-1">Получайте 10% от каждого депозита ваших рефералов</p>
            </div>
        </CardContent>
    </Card>
);

export default ReferralSystem;

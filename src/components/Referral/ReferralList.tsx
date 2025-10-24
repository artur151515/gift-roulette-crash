import { ReferralUser } from "@/types/referral.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users } from "lucide-react";

interface ReferralListProps {
    referrals: ReferralUser[];
    isLoading: boolean;
}

export const ReferralList: React.FC<ReferralListProps> = ({ referrals, isLoading }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getInitials = (firstName: string, lastName?: string) => {
        return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
    };

    if (isLoading) {
        return (
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Мои рефералы
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (referrals.length === 0) {
        return (
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Мои рефералы
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">Пока нет рефералов</p>
                        <p className="text-sm text-muted-foreground">
                            Поделитесь своей ссылкой с друзьями, чтобы они стали вашими рефералами
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="card-elevated">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Мои рефералы ({referrals.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={referral.photoUrl} alt={referral.firstName} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(referral.firstName, referral.lastName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                                {referral.firstName} {referral.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                                @{referral.username || 'без username'}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(referral.createdAt)}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

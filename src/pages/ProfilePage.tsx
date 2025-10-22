import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';
import ProfileHeader from "@/components/Profile/ProfileHeader.tsx";
import {Inventory} from "@/components/Profile/inventory";

export const ProfilePage = () => {
    const { user } = useAuthStore();

    const tg = (window as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: Record<string, unknown> } } } })?.Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;

    const displayFirstName = user?.firstName ?? (tgUser?.first_name as string) ?? 'Гость';
    const displayLastName = user?.lastName ?? (tgUser?.last_name as string) ?? '';
    const displayUsername = user?.username ?? (tgUser?.username as string);
    const displayLanguage = tgUser?.language_code as string;
    const displayId = user?.telegramId ? parseInt(user.telegramId) : (tgUser?.id as number);
    const balance = user?.balance ?? 0;
    const avatar = user?.photoUrl ?? (tgUser?.photo_url as string);

    if (!tgUser && !user) {
        return (
            <div className="flex-1 pb-20 p-4">
                <div className="space-y-6">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-40 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 pb-20">
            <div className="p-4 space-y-6">
                <ProfileHeader
                    firstName={displayFirstName}
                    lastName={displayLastName}
                    username={displayUsername}
                    displayId={displayId}
                    displayLanguage={displayLanguage}
                    balance={balance}
                    avatar={avatar}
                />
                <Inventory />
            </div>
        </div>
    );
};

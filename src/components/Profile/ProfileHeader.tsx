import { Badge } from '@/components/ui/badge';
import ProfileAvatar from "@/components/Profile/ProfileAvatar.tsx";

const ProfileHeader: React.FC<{
	firstName: string;
	lastName: string;
	username?: string;
	displayId?: number;
	displayLanguage?: string;
	balance: number;
	avatar?: string;
}> = ({ firstName, lastName, username, displayId, displayLanguage, balance, avatar }) => (
	<div className="flex items-center gap-4">
		<ProfileAvatar firstName={firstName} photoUrl={avatar}/>

		<div className="flex-1">
			<h2 className="text-lg font-semibold text-foreground">
				{firstName} {lastName}
			</h2>
			{username && <p className="text-muted-foreground text-sm">@{username}</p>}

			<div className="flex items-center gap-2 mt-2 flex-wrap">
				{displayId && (
					<Badge variant="outline" className="text-xs">
						Telegram ID: {displayId}
					</Badge>
				)}
				{displayLanguage && (
					<Badge variant="secondary" className="text-xs">
						Язык: {displayLanguage.toUpperCase()}
					</Badge>
				)}
			</div>

			<div className="flex items-center gap-2 mt-3">
				<span className="text-lg">💎</span>
				<span className="font-bold text-lg text-foreground">
          {balance.toFixed(2)}
        </span>
			</div>
		</div>
	</div>
);

export default ProfileHeader;

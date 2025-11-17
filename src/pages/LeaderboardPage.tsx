import { Trophy, Medal, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '@/api/leaderboard';
import type { LeaderboardResponse, LeaderboardEntry } from '@/types/leaderboard';

const getRankIcon = (rank: number) => {
	switch (rank) {
		case 1:
			return <Crown className="h-6 w-6 text-yellow-500" />;
		case 2:
			return <Medal className="h-6 w-6 text-gray-400" />;
		case 3:
			return <Medal className="h-6 w-6 text-amber-600" />;
		default:
			return null;
	}
};

const getRankBadgeColor = (rank: number) => {
	switch (rank) {
		case 1:
			return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
		case 2:
			return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
		case 3:
			return 'bg-gradient-to-br from-amber-500 to-amber-700 text-white';
		default:
			return 'bg-muted text-muted-foreground';
	}
};

const getDisplayName = (entry: LeaderboardEntry): string => {
	if (entry.username) {
		return entry.username;
	}
	if (entry.firstName && entry.lastName) {
		return `${entry.firstName} ${entry.lastName}`;
	}
	if (entry.firstName) {
		return entry.firstName;
	}
	return 'Игрок';
};

const getAvatarFallback = (entry: LeaderboardEntry): string => {
	if (entry.username) {
		return entry.username.slice(0, 2).toUpperCase();
	}
	if (entry.firstName && entry.lastName) {
		return `${entry.firstName[0]}${entry.lastName[0]}`.toUpperCase();
	}
	if (entry.firstName) {
		return entry.firstName.slice(0, 2).toUpperCase();
	}
	return '??';
};

export const LeaderboardPage = () => {
	const { data, isLoading, isError } = useQuery<LeaderboardResponse, Error>({
		queryKey: ['leaderboard'],
		queryFn: () => getLeaderboard(),
	});

	if (isLoading) {
		return (
			<div className="flex-1 pb-20">
				<div className="p-4 space-y-4">
					{/* Header */}
					<div className="text-center space-y-2 py-4">
						<div className="flex items-center justify-center gap-2">
							<Trophy className="h-8 w-8 text-primary" />
							<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								Рейтинг
							</h1>
						</div>
						<p className="text-sm text-muted-foreground">
							Топ игроков по заработку
						</p>
					</div>

					{/* Top 3 Skeleton */}
					<div className="grid grid-cols-3 gap-2 mb-6">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="flex flex-col items-center justify-end">
								<Skeleton className="h-16 w-16 rounded-full mb-2" />
								<Skeleton className={cn(
									"w-full rounded-t-lg",
									i === 1 ? "h-36" : i === 0 ? "h-32" : "h-28"
								)} />
							</div>
						))}
					</div>

					{/* Rest skeleton */}
					<div className="space-y-2">
						{Array.from({ length: 7 }).map((_, i) => (
							<Skeleton key={i} className="h-20 rounded-lg" />
						))}
					</div>
				</div>
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="flex-1 pb-20">
				<div className="p-4">
					<div className="text-center py-12 space-y-3">
						<div className="text-4xl mb-4">⚠️</div>
						<h3 className="text-lg font-semibold text-foreground">
							Ошибка загрузки
						</h3>
						<p className="text-muted-foreground">
							Не удалось загрузить рейтинг. Попробуйте позже.
						</p>
					</div>
				</div>
			</div>
		);
	}

	const leaderboard = data.leaderboard || [];
	const userRating = data.userRating;
	const top3 = leaderboard.slice(0, 3);
	const rest = leaderboard.slice(3);
	
	// Проверяем, находится ли текущий пользователь в топ-15
	const isUserInTop15 = userRating && leaderboard.some(entry => entry.id === userRating.id);

	return (
		<div className="flex-1 pb-20">
			<div className="p-4 space-y-4">
				{/* Header */}
				<div className="text-center space-y-2 py-4">
					<div className="flex items-center justify-center gap-2">
						<Trophy className="h-8 w-8 text-primary" />
						<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
							Рейтинг
						</h1>
					</div>
					<p className="text-sm text-muted-foreground">
						Топ игроков по заработку
					</p>
				</div>

				{/* Top 3 Players - Featured */}
				{top3.length > 0 && (
					<div className="grid grid-cols-3 gap-2 mb-6">
						{top3.map((player, index) => {
							const positions = [1, 0, 2]; // Middle, Left, Right
							const actualPlayer = top3[positions[index]];
							const heightClasses = ['h-32', 'h-36', 'h-28'];
							
							return (
								<div
									key={actualPlayer.id}
									className={cn(
										"flex flex-col items-center justify-end",
										index === 1 && "order-first"
									)}
								>
									<div className="relative mb-2">
										<Avatar className={cn(
											"border-4",
											actualPlayer.position === 1 && "border-yellow-500 h-20 w-20",
											actualPlayer.position === 2 && "border-gray-400 h-16 w-16",
											actualPlayer.position === 3 && "border-amber-600 h-16 w-16"
										)}>
											<AvatarImage src={actualPlayer.photoUrl || undefined} alt={getDisplayName(actualPlayer)} />
											<AvatarFallback>
												{getAvatarFallback(actualPlayer)}
											</AvatarFallback>
										</Avatar>
										<div className="absolute -top-2 -right-2">
											{getRankIcon(actualPlayer.position)}
										</div>
									</div>
									<div className={cn(
										"w-full rounded-t-lg p-3 flex flex-col items-center justify-center",
										heightClasses[index],
										getRankBadgeColor(actualPlayer.position)
									)}>
										<div className="text-2xl font-bold mb-1">#{actualPlayer.position}</div>
										<div className="text-xs font-medium text-center truncate w-full px-1">
											{getDisplayName(actualPlayer)}
										</div>
										<div className="text-xs font-bold mt-1">
											₽{(actualPlayer.earnings / 1000).toFixed(1)}K
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* Rest of the leaderboard */}
				{rest.length > 0 && (
					<div className="space-y-2">
						{rest.map((player) => (
							<Card key={player.id} className="p-4">
								<div className="flex items-center gap-4">
									{/* Rank */}
									<div className={cn(
										"flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
										getRankBadgeColor(player.position)
									)}>
										#{player.position}
									</div>

									{/* Avatar */}
									<Avatar className="h-12 w-12 border-2 border-border">
										<AvatarImage src={player.photoUrl || undefined} alt={getDisplayName(player)} />
										<AvatarFallback>
											{getAvatarFallback(player)}
										</AvatarFallback>
									</Avatar>

									{/* User Info */}
									<div className="flex-1 min-w-0">
										<div className="font-semibold text-sm truncate">
											{getDisplayName(player)}
										</div>
										{player.username && (
											<div className="text-xs text-muted-foreground truncate">
												@{player.username}
											</div>
										)}
									</div>

									{/* Earnings */}
									<div className="flex-shrink-0 text-right">
										<div className="font-bold text-primary">
											₽{player.earnings.toLocaleString()}
										</div>
										<div className="text-xs text-muted-foreground">
											заработано
										</div>
									</div>
								</div>
							</Card>
						))}
					</div>
				)}

				{/* Current user rating if not in top 15 */}
				{userRating && !isUserInTop15 && (
					<div className="mt-6 pt-6 border-t border-border">
						<div className="text-sm font-semibold text-muted-foreground mb-3">
							Ваша позиция
						</div>
						<Card className="p-4 border-2 border-primary/20">
							<div className="flex items-center gap-4">
								{/* Rank */}
								<div className={cn(
									"flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
									getRankBadgeColor(userRating.position)
								)}>
									#{userRating.position}
								</div>

								{/* Avatar */}
								<Avatar className="h-12 w-12 border-2 border-primary">
									<AvatarImage src={userRating.photoUrl || undefined} alt={getDisplayName(userRating)} />
									<AvatarFallback>
										{getAvatarFallback(userRating)}
									</AvatarFallback>
								</Avatar>

								{/* User Info */}
								<div className="flex-1 min-w-0">
									<div className="font-semibold text-sm truncate">
										{getDisplayName(userRating)}
									</div>
									{userRating.username && (
										<div className="text-xs text-muted-foreground truncate">
											@{userRating.username}
										</div>
									)}
								</div>

								{/* Earnings */}
								<div className="flex-shrink-0 text-right">
									<div className="font-bold text-primary">
										₽{userRating.earnings.toLocaleString()}
									</div>
									<div className="text-xs text-muted-foreground">
										заработано
									</div>
								</div>
							</div>
						</Card>
					</div>
				)}

				{/* Empty state */}
				{leaderboard.length === 0 && (
					<div className="text-center py-12 space-y-3">
						<div className="text-4xl mb-4">🏆</div>
						<h3 className="text-lg font-semibold text-foreground">
							Рейтинг пуст
						</h3>
						<p className="text-muted-foreground">
							Пока нет игроков в рейтинге
						</p>
					</div>
				)}

				{/* Bottom spacing for tab bar */}
				<div className="h-4" />
			</div>
		</div>
	);
};




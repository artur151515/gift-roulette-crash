import { Trophy, Medal, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Фейковые данные для рейтинга
const mockLeaderboard = [
	{
		id: 1,
		rank: 1,
		username: 'CryptoKing',
		firstName: 'Alex',
		lastName: 'Johnson',
		photoUrl: 'https://i.pravatar.cc/150?img=33',
		earned: 125009,
		caseCount: 2451,
	},
	{
		id: 2,
		rank: 2,
		username: 'LuckyPlayer',
		firstName: 'Sarah',
		lastName: 'Williams',
		photoUrl: 'https://i.pravatar.cc/150?img=45',
		earned: 98533,
		caseCount: 3411,
	},
	{
		id: 3,
		rank: 3,
		username: 'ProGamer',
		firstName: 'Mike',
		lastName: 'Brown',
		photoUrl: 'https://i.pravatar.cc/150?img=12',
		earned: 87292,
		caseCount: 2036,
	},
	{
		id: 4,
		rank: 4,
		username: 'WinnerChamp',
		firstName: 'Emma',
		lastName: 'Davis',
		photoUrl: 'https://i.pravatar.cc/150?img=23',
		earned: 76303,
		caseCount: 1783,
	},
	{
		id: 5,
		rank: 5,
		username: 'FortuneSeeker',
		firstName: 'James',
		lastName: 'Wilson',
		photoUrl: 'https://i.pravatar.cc/150?img=56',
		earned: 65476,
		caseCount: 1538,
	},
	{
		id: 6,
		rank: 6,
		username: 'RichPlayer',
		firstName: 'Olivia',
		lastName: 'Martinez',
		photoUrl: 'https://i.pravatar.cc/150?img=27',
		earned: 54899,
		caseCount: 1784,
	},
	{
		id: 7,
		rank: 7,
		username: 'SpinMaster',
		firstName: 'Daniel',
		lastName: 'Garcia',
		photoUrl: 'https://i.pravatar.cc/150?img=68',
		earned: 48904,
		caseCount: 1094,
	},
	{
		id: 8,
		rank: 8,
		username: 'JackpotHunter',
		firstName: 'Sophia',
		lastName: 'Rodriguez',
		photoUrl: 'https://i.pravatar.cc/150?img=38',
		earned: 42153,
		caseCount: 1423,
	},
	{
		id: 9,
		rank: 9,
		username: 'MoneyMaker',
		firstName: 'William',
		lastName: 'Taylor',
		photoUrl: 'https://i.pravatar.cc/150?img=51',
		earned: 38552,
		caseCount: 1007,
	},
	{
		id: 10,
		rank: 10,
		username: 'BigWinner',
		firstName: 'Isabella',
		lastName: 'Anderson',
		photoUrl: 'https://i.pravatar.cc/150?img=16',
		earned: 35294,
		caseCount: 957,
	},
];

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

export const LeaderboardPage = () => {
	return (
		<div className="flex-1 pb-20">
			<div className="p-4 space-y-4">
				{/* Header */}
				<div className="text-center space-y-2 py-4">
					<div className="flex items-center justify-center gap-2">
						<Trophy className="h-8 w-8 text-primary" />
						<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
							Leaderboard
						</h1>
					</div>
					<p className="text-sm text-muted-foreground">
						Top earners of all time
					</p>
				</div>

				{/* Top 3 Players - Featured */}
				<div className="grid grid-cols-3 gap-2 mb-6">
					{mockLeaderboard.slice(0, 3).map((player, index) => {
						const positions = [1, 0, 2]; // Middle, Left, Right
						const actualPlayer = mockLeaderboard[positions[index]];
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
										actualPlayer.rank === 1 && "border-yellow-500 h-20 w-20",
										actualPlayer.rank === 2 && "border-gray-400 h-16 w-16",
										actualPlayer.rank === 3 && "border-amber-600 h-16 w-16"
									)}>
										<AvatarImage src={actualPlayer.photoUrl} alt={actualPlayer.username} />
										<AvatarFallback>
											{/*{actualPlayer.firstName[0]}{actualPlayer.lastName[0]}*/}
											{player.username.slice(0, 2)}
										</AvatarFallback>
									</Avatar>
									<div className="absolute -top-2 -right-2">
										{getRankIcon(actualPlayer.rank)}
									</div>
								</div>
								<div className={cn(
									"w-full rounded-t-lg p-3 flex flex-col items-center justify-center",
									heightClasses[index],
									getRankBadgeColor(actualPlayer.rank)
								)}>
									<div className="text-2xl font-bold mb-1">#{actualPlayer.rank}</div>
									<div className="text-xs font-medium text-center truncate w-full px-1">
										{actualPlayer.username}
									</div>
									<div className="text-xs font-bold mt-1">
										₽{(actualPlayer.earned / 1000).toFixed(1)}K
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Rest of the leaderboard */}
				<div className="space-y-2">
					{mockLeaderboard.slice(3).map((player) => (
						<Card key={player.id} className="p-4">
							<div className="flex items-center gap-4">
								{/* Rank */}
								<div className={cn(
									"flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
									getRankBadgeColor(player.rank)
								)}>
									#{player.rank}
								</div>

								{/* Avatar */}
								<Avatar className="h-12 w-12 border-2 border-border">
									<AvatarImage src={player.photoUrl} alt={player.username} />
									<AvatarFallback>
										{/*{player.firstName[0]}{player.lastName[0]}*/}
										{player.username.slice(0, 2)}
									</AvatarFallback>
								</Avatar>

								{/* User Info */}
								<div className="flex-1 min-w-0">
									<div className="font-semibold text-sm truncate">
										{player.username}
									</div>
									<div className="text-xs text-muted-foreground truncate">
										Открыто {player.caseCount} кейсов
									</div>
								</div>

								{/* Earnings */}
								<div className="flex-shrink-0 text-right">
									<div className="font-bold text-primary">
										₽{player.earned.toLocaleString()}
									</div>
									<div className="text-xs text-muted-foreground">
										заработано
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>

				{/* Bottom spacing for tab bar */}
				<div className="h-4" />
			</div>
		</div>
	);
};


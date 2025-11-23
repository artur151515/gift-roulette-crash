export interface LeaderboardEntry {
	position: number;
	id: string;
	username: string | null;
	firstName: string | null;
	lastName: string | null;
	photoUrl: string | null;
	earnings: number;
}

export interface LeaderboardResponse {
	leaderboard: LeaderboardEntry[];
	userRating: LeaderboardEntry | null;
}


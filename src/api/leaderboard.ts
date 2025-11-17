import { apiClient } from "./apiClient.ts";
import { LeaderboardResponse } from "@/types/leaderboard.ts";

export const getLeaderboard = async (): Promise<LeaderboardResponse> => {
	const { data } = await apiClient.get<LeaderboardResponse>("/api/leaderboard");
	return data;
};


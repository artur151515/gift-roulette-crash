import { PaginationResponse } from "@/types/pagination.ts";

export interface ReferralLinkResponse {
    referralCode: string;
    referralLink: string;
}

export interface ReferralUser {
    id: string;
    telegramId: string;
    username: string;
    firstName: string;
    lastName?: string;
    photoUrl?: string;
    createdAt: string;
}

export interface ReferralsResponse {
    referrals: ReferralUser[];
    pagination: PaginationResponse;
}

export interface ReferralStats {
    totalReferrals: number;
    totalEarnings: number;
    recentReferrals: ReferralUser[];
}

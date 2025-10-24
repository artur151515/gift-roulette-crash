import { apiClient } from "./apiClient.ts";
import { ReferralLinkResponse, ReferralsResponse } from "@/types/referral.ts";

export const getReferralLink = async (): Promise<ReferralLinkResponse> => {
    const { data } = await apiClient.get<{ success: boolean; data: ReferralLinkResponse }>("/api/referral/link");
    return data.data;
};

export const getMyReferrals = async (
    page?: number,
    limit?: number
): Promise<ReferralsResponse> => {
    const { data } = await apiClient.get<{ success: boolean; data: ReferralsResponse }>("/api/referral/my-referrals", {
        params: { 
            pageNumber: page, 
            limitNumber: limit 
        },
    });
    return data.data;
};

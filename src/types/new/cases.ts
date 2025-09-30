export type CaseSummary = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    createdAt: string;
    updatedAt: string;
    rtpRequested: number;
    rtpAchieved: number;
};

export interface CreateCaseDto {
    name: string;
    description: string;
    imageUrl?: string;
    price: number;
    rtp: number;
    itemIds: string[];
}

export type CaseDetails = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    createdAt: string;
    updatedAt: string;
    items: Array<{
        itemId: string;
        name: string;
        weight: number;
        probability: number;
    }>;
    totalWeight: number;
    itemCount: number;
};

export interface CasesResponse {
    cases: CaseSummary[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
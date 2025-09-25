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
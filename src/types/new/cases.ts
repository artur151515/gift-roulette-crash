import {PaginationResponse} from "@/types/new/pagination.ts";

export interface CaseSummary {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    createdAt: string;
    itemCount: number;
}

export interface CasesResponse {
    cases: CaseSummary[];
    pagination: PaginationResponse;
}

export interface CaseItemDto {
    id: string;
    name: string;
    imageUrl: string | null;
    price: number;
    giftId: string | null;
    isRandomNFT: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CaseItemWithWeight {
    item: CaseItemDto;
    weight: number;
    probability: number;
}

export interface CaseDetailsDto {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    createdAt: string;
    updatedAt: string;
    items: CaseItemWithWeight[];
    totalWeight: number;
    itemCount: number;
}

export interface OpenCaseResultDto {
    result: {
        itemId: string;
        name: string;
        imageUrl: string | null;
        price: number;
    };
    serverSeedHash: string;
}

export interface CreateCaseDto {
    name: string;
    description: string;
    imageUrl?: string;
    price: number;
    rtp: number;
    itemIds: string[];
}
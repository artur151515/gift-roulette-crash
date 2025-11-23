import {PaginationResponse} from "@/types/pagination.ts";
import {ItemDto} from "@/types/inventory.ts";

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

export interface CaseItemWithWeight {
    item: ItemDto;
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

export interface RollDetails {
    probability: number;
    weight: number;
    totalWeight: number;
    timestamp: string;
}

export interface CaseInfo {
    id: string;
    name: string;
    price: number;
}

export interface OpenCaseResultDto {
    inventoryItem: {
        id: string;
        userId: string;
        itemId: string;
        status: string;
        receivedAt: string | null;
        soldAt: string | null;
        soldPrice: number | null;
        createdAt: string;
        updatedAt: string;
        item: ItemDto;
    };
    caseInfo: CaseInfo;
    rollDetails: RollDetails;
}

export interface CreateCaseDto {
    name: string;
    description: string;
    imageUrl?: string;
    price: number;
    rtp: number;
    itemIds: string[];
}
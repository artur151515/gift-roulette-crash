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
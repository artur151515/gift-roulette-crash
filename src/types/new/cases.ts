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

export interface CreateCaseDto {
    name: string;
    description: string;
    imageUrl?: string;
    price: number;
    rtp: number;
    itemIds: string[];
}
import {PaginationResponse} from "@/types/new/pagination.ts";

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
}

export interface ApiPaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: PaginationResponse;
}

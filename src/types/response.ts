import {PaginationResponse} from "@/types/pagination.ts";

export interface ApiPaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: PaginationResponse;
}

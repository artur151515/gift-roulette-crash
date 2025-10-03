import {Item} from "@/types/new/cases.ts";
import {PaginationResponse} from "@/types/new/pagination.ts";

export type InventoryStatus =
    | 'AVAILABLE'
    | 'RECEIVED'
    | 'SOLD'
    | 'PENDING_FOR_RECEIVAL';

export interface InventoryItem {
    id: string;                // UUID предмета в инвентаре
    status: InventoryStatus;   // Текущий статус
    receivedAt: string | null; // Когда получен
    soldAt: string | null;     // Когда продан
    item: Item;                // Сам предмет
}

export interface GetInventoryResponse {
    items: InventoryItem[];
    pagination: PaginationResponse;
}
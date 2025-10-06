import {PaginationResponse} from "@/types/new/pagination.ts";

export type InventoryStatus =
    | 'AVAILABLE'
    | 'RECEIVED'
    | 'SOLD'
    | 'PENDING_FOR_RECEIVAL';

export interface ItemDto {
    id: string;
    name: string;
    imageUrl: string | null;
    price: number;
    giftId: string | null;
    isRandomNFT: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface InventoryItemDto {
    id: string;
    userId: string;
    itemId: string;
    status: InventoryStatus;
    receivedAt: string | null;
    soldAt: string | null;
    soldPrice: number | null;
    createdAt: string;
    updatedAt: string;
    item: ItemDto;
}

export interface GetInventoryResponseDto {
    items: InventoryItemDto[];
    pagination: PaginationResponse;
}

export interface Transaction {
    id: string;
    amount: number;
    type: string;
    userId: string;
    metadata: {
        itemId: string;
        itemName: string;
        sellPrice: number;
        originalPrice: number;
        inventoryItemId: string;
    };
    createdAt: string;
}

export interface SellItemResponse {
    inventoryItem: InventoryItemDto;
    transaction: Transaction;
}
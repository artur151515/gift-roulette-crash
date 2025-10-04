import {apiClient} from "./apiClient";
import { GetInventoryResponseDto, InventoryItemDto, SellItemResponse } from "@/types/new/inventory";
import { InventoryStatus } from "@/types/new/inventory";

export const getUserInventory = async (
    page?: number,
    limit?: number,
    status?: InventoryStatus
): Promise<GetInventoryResponseDto> => {
    const { data } = await apiClient.get("/api/user-inventory", {
        params: { page, limit, status },
    });
    return data.data; // Extract the nested data from the API response
};

export const claimInventoryItem = async (id: string): Promise<InventoryItemDto> => {
    const { data } = await apiClient.post(`/api/user-inventory/${id}/claim`);
    return data.data || data; // Handle both wrapped and direct responses
};

export const sellInventoryItem = async (id: string): Promise<SellItemResponse> => {
    const { data } = await apiClient.post(`/api/user-inventory/${id}/sell`);
    return data.data || data; // Handle both wrapped and direct responses
};
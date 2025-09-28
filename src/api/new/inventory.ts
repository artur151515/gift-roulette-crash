import {apiClient} from "./apiClient";

export const getUserInventory = async (
    page?: number,
    limit?: number,
    status?: string
) => {
    const { data } = await apiClient.get("/api/user-inventory", {
        params: { page, limit, status },
    });
    return data;
};

export const claimInventoryItem = async (id: string) => {
    const { data } = await apiClient.post(`/api/user-inventory/${id}/claim`);
    return data;
};

export const sellInventoryItem = async (id: string) => {
    const { data } = await apiClient.post(`/api/user-inventory/${id}/sell`);
    return data;
};
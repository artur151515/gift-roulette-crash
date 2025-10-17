import { apiClient } from "./apiClient.ts";
import { CreateInvoiceResponse, DepositStatus, CreateInvoiceDto } from "@/types/deposits.ts";

export const createInvoice = async (
    payload: CreateInvoiceDto
): Promise<CreateInvoiceResponse> => {
    const { data } = await apiClient.post<CreateInvoiceResponse>(
        "/deposits/create-invoice",
        payload
    );
    return data;
};

export const getDepositStatus = async (
    id: string
): Promise<DepositStatus> => {
    const { data } = await apiClient.get<DepositStatus>(`/deposits/${id}/status`);
    return data;
};
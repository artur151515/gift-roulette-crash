import apiClient from "./apiClient";
import { CreateInvoiceResponse, DepositStatus } from "@/types/new/deposits.ts";

export const createInvoice = async (
    amount: number
): Promise<CreateInvoiceResponse> => {
    const { data } = await apiClient.post<CreateInvoiceResponse>(
        "/deposits/create-invoice",
        { amount }
    );
    return data;
};

export const getDepositStatus = async (
    id: string
): Promise<DepositStatus> => {
    const { data } = await apiClient.get<DepositStatus>(`/deposits/${id}/status`);
    return data;
};
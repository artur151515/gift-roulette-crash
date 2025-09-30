import {apiClient} from "./apiClient";
import { CaseDetails } from "@/types";
import {CasesResponse, CaseSummary, CreateCaseDto} from "@/types/new/cases.ts";

export const getCases = async (
    page?: number,
    limit?: number
): Promise<CasesResponse> => {
    const { data } = await apiClient.get<CasesResponse>("/api/cases", {
        params: { page, limit },
    });
    return data;
};

export const getCaseDetails = async (id: string): Promise<CaseDetails> => {
    const { data } = await apiClient.get<CaseDetails>(`/api/cases/${id}`);
    return data;
};

export const openCase = async (id: string): Promise<void> => {
    await apiClient.post(`/api/cases/${id}/open`);
};

export const createCase = async (data: CreateCaseDto) => {
    const { data: response } = await apiClient.post('/api/cases', data);
    return response;
};
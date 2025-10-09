import {apiClient} from "./apiClient.ts";
import {
	CasesResponse,
	CreateCaseDto,
	CaseDetailsDto,
	OpenCaseResultDto
} from "@/types/new/cases.ts";

export const getCases = async (
	page?: number,
	limit?: number
): Promise<CasesResponse> => {
	const { data } = await apiClient.get<CasesResponse>("/api/cases", {
		params: { page, limit },
	});
	return data;
};

export const getCaseDetails = async (id: string): Promise<CaseDetailsDto> => {
	const { data } = await apiClient.get<CaseDetailsDto>(`/api/cases/${id}`);
	return data;
};

export const openCase = async (id: string): Promise<OpenCaseResultDto> => {
	const { data } = await apiClient.post<OpenCaseResultDto>(`/api/cases/${id}/open`);
	return data;
};

export const createCase = async (data: CreateCaseDto) => {
	const { data: response } = await apiClient.post('/api/cases', data);
	return response;
};
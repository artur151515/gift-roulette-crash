import {apiClient} from "./apiClient.ts";
import {
	CasesResponse,
	CreateCaseDto,
	CaseDetailsDto,
	OpenCaseResultDto
} from "@/types/cases.ts";
import { ItemDto } from "@/types/inventory.ts";

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
	const { data } = await apiClient.post<{ success: boolean; data: OpenCaseResultDto }>(`/api/cases/${id}/open`);
	return data.data; // Extract nested data from API response
};

export const createCase = async (data: CreateCaseDto) => {
	const { data: response } = await apiClient.post('/api/cases', data);
	return response;
};

// Получить все доступные подарки из всех кейсов
export const getAllItems = async (): Promise<ItemDto[]> => {
	try {
		// Получаем все кейсы
		const casesResponse = await getCases(1, 100); // Получаем до 100 кейсов
		
		// Собираем все уникальные подарки из всех кейсов
		const allItemsMap = new Map<string, ItemDto>();
		
		// Загружаем детали каждого кейса и собираем подарки
		const caseDetailsPromises = casesResponse.cases.map(caseItem => 
			getCaseDetails(caseItem.id).catch(() => null)
		);
		
		const allCaseDetails = await Promise.all(caseDetailsPromises);
		
		allCaseDetails.forEach(caseDetails => {
			if (caseDetails && caseDetails.items) {
				caseDetails.items.forEach(itemData => {
					// Добавляем только уникальные подарки
					if (!allItemsMap.has(itemData.item.id)) {
						allItemsMap.set(itemData.item.id, itemData.item);
					}
				});
			}
		});
		
		return Array.from(allItemsMap.values());
	} catch (error) {
		console.error('Error loading all items:', error);
		return [];
	}
};
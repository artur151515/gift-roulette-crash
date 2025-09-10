import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type { Case, CaseDetails, OpenCaseResult, CaseType } from '@/types';

// Cases API calls
export const casesApi = {
  getCases: async (type: CaseType = 'paid'): Promise<Case[]> => {
    const response = await apiClient.get(`/cases?type=${type}`);
    return response.data;
  },

  getCaseDetails: async (id: string): Promise<CaseDetails> => {
    const response = await apiClient.get(`/cases/${id}`);
    return response.data;
  },

  openCase: async (id: string, count: number = 1): Promise<OpenCaseResult> => {
    const response = await apiClient.post(`/cases/${id}/open`, { count });
    return response.data;
  },
};

// Demo data for cases
export const DEMO_CASES: Case[] = [
  {
    id: '1',
    name: 'Starter Pack',
    price: 1.5,
    imageUrl: '/api/placeholder/200/200',
    rarity: 'common'
  },
  {
    id: '2',
    name: 'Premium Box',
    price: 2,
    imageUrl: '/api/placeholder/200/200',
    rarity: 'rare'
  },
  {
    id: '3',
    name: 'Gold Collection',
    price: 3,
    imageUrl: '/api/placeholder/200/200',
    rarity: 'epic'
  },
  {
    id: '5',
    name: 'VIP Bundle',
    price: 5,
    imageUrl: '/api/placeholder/200/200',
    rarity: 'legendary'
  },
  {
    id: '7',
    name: 'Elite Case',
    price: 7,
    imageUrl: '/api/placeholder/200/200',
    rarity: 'legendary'
  },
  {
    id: '10',
    name: 'Ultimate Pack',
    price: 10,
    imageUrl: '/api/placeholder/200/200',
    rarity: 'legendary'
  },
  {
    id: '15',
    name: 'Legendary Box',
    price: 15,
    imageUrl: '/api/placeholder/200/200',
    rarity: 'legendary'
  },
  {
    id: '25',
    name: 'Supreme Collection',
    price: 25,
    imageUrl: '/api/placeholder/200/200',
    rarity: 'legendary'
  },
];

export const DEMO_FREE_CASES: Case[] = [
  {
    id: 'free1',
    name: 'Daily Bonus',
    price: 0.5,
    imageUrl: '/api/placeholder/200/200',
    rarity: 'common'
  },
  {
    id: 'free2',
    name: 'Welcome Gift',
    price: 1,
    imageUrl: '/api/placeholder/200/200',
    rarity: 'rare'
  },
];

// React Query hooks
export const useCases = (type: CaseType = 'paid') => {
  return useQuery({
    queryKey: ['cases', type],
    queryFn: () => casesApi.getCases(type),
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Fallback to demo data in demo mode
    placeholderData: type === 'paid' ? DEMO_CASES : DEMO_FREE_CASES,
  });
};

export const useCaseDetails = (id: string) => {
  return useQuery({
    queryKey: ['cases', id],
    queryFn: () => casesApi.getCaseDetails(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useOpenCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, count }: { id: string; count?: number }) => 
      casesApi.openCase(id, count),
    onSuccess: () => {
      // Invalidate user data to update balance
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'inventory'] });
    },
  });
};
import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import type { InventoryItem } from '@/types';

// User API calls
export const userApi = {
  getInventory: async (): Promise<InventoryItem[]> => {
    const response = await apiClient.get('/user/inventory');
    return response.data;
  },
};

// Demo inventory data
export const DEMO_INVENTORY: InventoryItem[] = [
  {
    id: 'item1',
    name: 'Golden Star',
    imageUrl: '/api/placeholder/100/100',
    price: 5190,
    quantity: 1
  },
  {
    id: 'item2',
    name: 'Silver Medal',
    imageUrl: '/api/placeholder/100/100',
    price: 777,
    quantity: 2
  },
  {
    id: 'item3',
    name: 'Bronze Trophy',
    imageUrl: '/api/placeholder/100/100',
    price: 335,
    quantity: 1
  },
];

// React Query hooks
export const useInventory = () => {
  return useQuery({
    queryKey: ['user', 'inventory'],
    queryFn: userApi.getInventory,
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: DEMO_INVENTORY,
  });
};
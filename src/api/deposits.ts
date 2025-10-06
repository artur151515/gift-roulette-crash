import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type { DepositInvoice, CurrencyType } from '@/types';

export const depositsApi = {
  createInvoice: async (amount: number, currency: CurrencyType): Promise<DepositInvoice> => {
    const response = await apiClient.post('/deposits/create-invoice', {
      amount,
      currency
    });
    return response.data;
  },
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount, currency }: { amount: number; currency: CurrencyType }) =>
      depositsApi.createInvoice(amount, currency),
    onSuccess: () => {
      // Invalidate user data to update balance after successful deposit
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};
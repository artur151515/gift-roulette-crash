import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { getUserInventory, claimInventoryItem, sellInventoryItem } from '@/api/new/inventory';
import { InventoryStatus } from '@/types/new/inventory';
import { useAuthStore } from '@/store/authStore';

export const useUserInventory = (page: number = 1, limit: number = 20, status?: InventoryStatus) => {
    const { accessToken } = useAuthStore();

    return useQuery({
        queryKey: ['user-inventory', page, limit, status],
        queryFn: () => getUserInventory(page, limit, status),
        enabled: !!accessToken,
        staleTime: 30 * 1000, // 30 seconds
    });
};

export const useClaimInventoryItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: claimInventoryItem,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['user-inventory'] });
            
            // Different messages based on item type and status
            let title = "Предмет получен!";
            let description = `Вы успешно получили ${data.item.name}`;
            
            if (data.item.isRandomNFT && data.status === 'PENDING_FOR_RECEIVAL') {
                title = "NFT отправлен на обработку!";
                description = `${data.item.name} будет отправлен вручную администратором`;
            } else if (data.item.giftId && data.status === 'RECEIVED') {
                title = "Подарок отправлен!";
                description = `${data.item.name} отправлен через Telegram`;
            }
            
            toast({
                title,
                description,
            });
        },
        onError: (error: any) => {
            toast({
                title: "Ошибка",
                description: error.response?.data?.message || "Не удалось получить предмет",
                variant: "destructive",
            });
        },
    });
};

export const useSellInventoryItem = () => {
    const queryClient = useQueryClient();
    const { updateBalance } = useAuthStore();

    return useMutation({
        mutationFn: sellInventoryItem,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['user-inventory'] });
            // Update balance based on transaction amount
            updateBalance(data.transaction.amount);
            toast({
                title: "Предмет продан!",
                description: `Получено ${data.transaction.amount} 💎`,
            });
        },
        onError: (error: any) => {
            toast({
                title: "Ошибка",
                description: error.response?.data?.message || "Не удалось продать предмет",
                variant: "destructive",
            });
        },
    });
};

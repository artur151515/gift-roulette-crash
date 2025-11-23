import { create } from 'zustand';
import { ItemDto } from '@/types/inventory';

interface GiftsFeedStore {
    allItems: ItemDto[];
    userWonItem: ItemDto | null;
    
    setAllItems: (items: ItemDto[]) => void;
    setUserWonItem: (item: ItemDto | null) => void;
    clearUserWonItem: () => void;
}

export const useGiftsFeedStore = create<GiftsFeedStore>((set) => ({
    allItems: [],
    userWonItem: null,
    
    setAllItems: (items) => set({ allItems: items }),
    
    setUserWonItem: (item) => set({ userWonItem: item }),
    
    clearUserWonItem: () => set({ userWonItem: null }),
}));


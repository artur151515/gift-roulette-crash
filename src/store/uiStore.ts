import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // Modals
  isDepositModalOpen: boolean;
  isCaseOpenModalOpen: boolean;
  selectedCaseId: string | null;
  
  // Loading states
  isOpeningCase: boolean;
  isMakingDeposit: boolean;
  
  // Crash game
  crashBetModalOpen: boolean;
  selectedCurrency: 'gifts' | 'ton';
  
  // Actions
  openDepositModal: () => void;
  closeDepositModal: () => void;
  openCaseOpenModal: (caseId: string) => void;
  closeCaseOpenModal: () => void;
  setOpeningCase: (opening: boolean) => void;
  setMakingDeposit: (depositing: boolean) => void;
  
  // Crash actions
  openCrashBetModal: () => void;
  closeCrashBetModal: () => void;
  setCurrency: (currency: 'gifts' | 'ton') => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Initial state
      isDepositModalOpen: false,
      isCaseOpenModalOpen: false,
      selectedCaseId: null,
      isOpeningCase: false,
      isMakingDeposit: false,
      crashBetModalOpen: false,
      selectedCurrency: 'gifts',

      // Modal actions
      openDepositModal: () => set({ isDepositModalOpen: true }),
      closeDepositModal: () => set({ isDepositModalOpen: false }),
      
      openCaseOpenModal: (caseId: string) => set({ 
        isCaseOpenModalOpen: true, 
        selectedCaseId: caseId 
      }),
      closeCaseOpenModal: () => set({ 
        isCaseOpenModalOpen: false, 
        selectedCaseId: null 
      }),

      // Loading states
      setOpeningCase: (opening: boolean) => set({ isOpeningCase: opening }),
      setMakingDeposit: (depositing: boolean) => set({ isMakingDeposit: depositing }),

      // Crash game
      openCrashBetModal: () => set({ crashBetModalOpen: true }),
      closeCrashBetModal: () => set({ crashBetModalOpen: false }),
      setCurrency: (currency: 'gifts' | 'ton') => set({ selectedCurrency: currency }),
    }),
    {
      name: 'ui-store',
    }
  )
);
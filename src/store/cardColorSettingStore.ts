import { create } from 'zustand';

interface CardColorSettingState {
  isCategoryColorEnabled: boolean;
  setIsCategoryColorEnabled: (value: boolean) => void;
}

export const useCardColorSettingStore = create<CardColorSettingState>((set) => ({
  isCategoryColorEnabled: false,
  setIsCategoryColorEnabled: (value) => set({ isCategoryColorEnabled: value }),
}));

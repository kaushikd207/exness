import { create } from "zustand";

export const useBalanceStore = create((set) => ({
  bal: 1000000,
  currBtcPrice: 0,
  updateBalance: (balance: Number) => set({ bal: balance }),
  updateBtcPrice: (price: Number) => set({ currBtcPrice: price }),
}));

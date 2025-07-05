import { create } from 'zustand';

export type Trade = {
  id: string;
  timestamp: number;
  optionSymbol: string;
  profitUsd: number;
  buyOn: string;
  hedgeOn: string;
  bridgeTo?: string;
  status: 'executed' | 'failed';
};

interface TradesState {
  trades: Trade[];
  addTrade: (trade: Trade) => void;
  clearTrades: () => void;
}

export const useTradesStore = create<TradesState>((set) => ({
  trades: [],
  addTrade: (trade) => set((state) => ({ trades: [trade, ...state.trades] })),
  clearTrades: () => set({ trades: [] }),
}));

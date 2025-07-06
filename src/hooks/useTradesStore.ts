import { create } from 'zustand';

export interface Trade {
  id: string;
  owner: string; // Address of the trade creator
  from: {
    asset: string;
    chain: string;
  };
  to: {
    asset: string;
    chain: string;
  };
  amount: number;
  profit: number; // in percentage
  expiry: number; // timestamp
  status: 'open' | 'filled' | 'expired' | 'purchased';
  purchaser?: string;
}

interface TradesStore {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'status'>) => void;
  purchaseTrade: (tradeId: string, purchaser: string) => void;
  setTrades: (trades: Trade[]) => void;
}

export const useTradesStore = create<TradesStore>((set) => ({
  trades: [], // Start with an empty array
  addTrade: (trade) =>
    set((state) => ({
      trades: [
        ...state.trades,
        { ...trade, id: (state.trades.length + 1).toString(), status: 'open' },
      ],
    })),
  purchaseTrade: (tradeId, purchaser) =>
    set((state) => ({
      trades: state.trades.map((trade) =>
        trade.id === tradeId ? { ...trade, status: 'purchased', purchaser } : trade
      ),
    })),
  setTrades: (newTrades) => set({ trades: newTrades }),
}));

import { create } from 'zustand';

// Represents one side of a trade (e.g., what you give or what you get).
export interface TradeEntity {
  asset: string;
  chain: string;
  amount: number;
}

// The core Trade object, matching the data structure from our Flow script.
export interface Trade {
  id: string;
  owner: string; // Address of the trade creator
  from: TradeEntity;
  to: TradeEntity;
  status: 'open' | 'purchased' | 'cancelled'; // Simplified status based on contract state
  purchaser?: string | null;
  expiry: number; // Timestamp when the trade expires
  amount: number; // Total amount (from.amount)
}

interface TradesStore {
  trades: Trade[];
  setTrades: (trades: Trade[]) => void;
}

// This store now simply holds the state. All logic for fetching and updating
// trades is handled in the useFlow hook.
export const useTradesStore = create<TradesStore>((set) => ({
  trades: [],
  setTrades: (newTrades) => set({ trades: newTrades }),
}));

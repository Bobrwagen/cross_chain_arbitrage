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
}

const initialTrades: Trade[] = [
  {
    id: '1',
    owner: '0xCreatorOne',
    from: { asset: 'WETH', chain: 'Arbitrum' },
    to: { asset: 'WETH', chain: 'Optimism' },
    amount: 10,
    profit: 1.5,
    expiry: new Date().getTime() + 24 * 60 * 60 * 1000, // 1 day from now
    status: 'open',
  },
  {
    id: '2',
    owner: '0xCreatorTwo',
    from: { asset: 'USDC', chain: 'Polygon' },
    to: { asset: 'USDC', chain: 'Avalanche' },
    amount: 5000,
    profit: 0.8,
    expiry: new Date().getTime() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
    status: 'open',
  },
  {
    id: '3',
    owner: '0xCreatorOne',
    from: { asset: 'WBTC', chain: 'Base' },
    to: { asset: 'WBTC', chain: 'Arbitrum' },
    amount: 1,
    profit: 2.2,
    expiry: new Date().getTime() - 24 * 60 * 60 * 1000, // 1 day ago
    status: 'expired',
  },
  {
    id: '4',
    owner: '0xCreatorThree',
    from: { asset: 'DAI', chain: 'Ethereum' },
    to: { asset: 'DAI', chain: 'Polygon' },
    amount: 10000,
    profit: 0.5,
    expiry: new Date().getTime() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
    status: 'purchased',
    purchaser: '0xPurchaserOne',
  },
];

export const useTradesStore = create<TradesStore>((set) => ({
  trades: initialTrades,
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
}));

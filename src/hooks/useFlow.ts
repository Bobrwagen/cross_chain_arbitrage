import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { useEffect, useState } from 'react';
import { useTradesStore, Trade } from './useTradesStore';

// Import Cadence scripts and transactions as raw text
// Note: This is a simplified approach. In a larger app, you might use a loader for .cdc files.
import createTradeTransaction from '../../flow/transactions/create_trade.cdc?raw';
import purchaseTradeTransaction from '../../flow/transactions/purchase_trade.cdc?raw';
import getOpenTradesScript from '../../flow/scripts/get_open_trades.cdc?raw';

// Configure FCL
import '../../flow/config.js';

export interface FlowUser {
  addr: string;
  cid: string;
  expiresAt: number;
  f_type: string;
  f_vsn: string;
  loggedIn: boolean;
  services: any[];
}

export function useFlow() {
  const [user, setUser] = useState<FlowUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const setTrades = useTradesStore((state) => state.setTrades);

  // Subscribe to user state changes
  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);

  const logIn = () => {
    fcl.logIn();
  };

  const logOut = () => {
    fcl.unauthenticate();
  };

  const refreshTrades = async () => {
    try {
      console.log('Refreshing trades...');
      const result = await fcl.query({
        cadence: getOpenTradesScript,
      });
      // Transform the result to match the Zustand Trade interface
      const trades: Trade[] = result.map((t: any) => ({
        id: t.id.toString(),
        owner: t.owner,
        from: { asset: t.fromAsset, chain: t.fromChain },
        to: { asset: t.toAsset, chain: t.toChain },
        amount: parseFloat(t.amount),
        profit: parseFloat(t.profit),
        expiry: new Date(parseFloat(t.expiry) * 1000).getTime(),
        status: t.status,
        purchaser: t.purchaser,
      }));
      setTrades(trades);
    } catch (error) {
      console.error('Error fetching open trades:', error);
    }
  };

  const createTrade = async (trade: Omit<Trade, 'id' | 'status' | 'owner'>) => {
    setIsProcessing(true);
    try {
      const transactionId = await fcl.mutate({
        cadence: createTradeTransaction,
        args: (
          arg: (value: any, type: any) => any, // eslint-disable-line @typescript-eslint/no-explicit-any
          types: typeof t
        ) => [
          arg(trade.from.asset, types.String),
          arg(trade.from.chain, types.String),
          arg(trade.to.asset, types.String),
          arg(trade.to.chain, types.String),
          arg(trade.amount.toFixed(8), types.UFix64),
          arg(trade.profit.toFixed(8), types.UFix64),
          arg((trade.expiry / 1000).toFixed(8), types.UFix64),
        ],
        limit: 999,
      });

      console.log('Transaction sent:', transactionId);
      await fcl.tx(transactionId).onceSealed();
      console.log('Transaction sealed!');
      await refreshTrades(); // Refresh trades after creation
    } catch (error) {
      console.error('Error creating trade:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const purchaseTrade = async (tradeId: string) => {
    setIsProcessing(true);
    try {
      const transactionId = await fcl.mutate({
        cadence: purchaseTradeTransaction,
        args: (arg: (value: any, type: any) => any, types: typeof t) => [
          arg(parseInt(tradeId), types.UInt64),
        ],
        limit: 999,
      });

      console.log('Purchase transaction sent:', transactionId);
      await fcl.tx(transactionId).onceSealed();
      console.log('Purchase transaction sealed!');
      await refreshTrades(); // Refresh trades after purchase
    } catch (error) {
      console.error('Error purchasing trade:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return { user, logIn, logOut, createTrade, purchaseTrade, refreshTrades, isProcessing };
}

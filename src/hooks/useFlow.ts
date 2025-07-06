import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { useEffect, useState, useCallback } from 'react';
import { useTradesStore, Trade } from './useTradesStore';
import toast from 'react-hot-toast';

// Import Cadence scripts and transactions
import createTradeTransaction from '../../flow/transactions/create_trade.cdc?raw';
import purchaseTradeTransaction from '../../flow/transactions/purchase_trade.cdc?raw';
import purchaseTradeWithTokensTransaction from '../../flow/transactions/purchase_trade_with_tokens.cdc?raw';
import getOpenTradesScript from '../../flow/scripts/get_open_trades.cdc?raw';

// Configure FCL
import '../../flow/config.js';

export interface FlowUser {
  addr: string;
  loggedIn: boolean;
}

interface FlowTradeData {
  id: string;
  owner: string;
  fromToken: string;
  fromAmount: string;
  toToken: string;
  toAmount: string;
  created: string;
}

function parseTokenFromIdentifier(identifier: string): string {
  if (!identifier) return 'Unknown';
  const parts = identifier.split('.');
  // Handles identifiers like A.f8d6e0586b0a20c7.FlowToken.Vault
  if (parts.length >= 3) {
    return parts[2].replace('Token', '');
  }
  return identifier; // Fallback
}

export function useFlow() {
  const [user, setUser] = useState<FlowUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const setTrades = useTradesStore((state) => state.setTrades);

  useEffect(() => {
    // The subscribe method returns an unsubscribe function that we can use for cleanup.
    const unsubscribe = fcl.currentUser.subscribe(setUser);
    return () => unsubscribe();
  }, []);

  const logIn = useCallback(() => fcl.logIn(), []);
  const logOut = useCallback(() => fcl.unauthenticate(), []);

  const refreshTrades = useCallback(async () => {
    setIsProcessing(true);
    console.log('Refreshing trades...');
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - Flow network may be slow')), 15000)
      );
      
      const queryPromise = fcl.query({
        cadence: getOpenTradesScript,
      });

      const result: FlowTradeData[] = await Promise.race([queryPromise, timeoutPromise]) as FlowTradeData[];

      const trades: Trade[] = result.map((t) => {
        const fromAmount = parseFloat(t.fromAmount);
        const toAmount = parseFloat(t.toAmount);
        
        return {
          id: t.id,
          owner: t.owner,
          from: {
            asset: parseTokenFromIdentifier(t.fromToken),
            chain: 'Flow',
            amount: fromAmount,
          },
          to: {
            asset: parseTokenFromIdentifier(t.toToken),
            chain: 'Flow',
            amount: toAmount,
          },
          status: 'open',
          purchaser: null,
          expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
          amount: fromAmount,
        };
      });

      setTrades(trades);
      console.log(`Found ${trades.length} open trades.`);
    } catch (error) {
      console.error('Error fetching open trades:', error);
      toast.error('Failed to refresh trades. See console for details.');
    } finally {
      setIsProcessing(false);
    }
  }, [setTrades]);

  const createTrade = useCallback(async (trade: { fromToken: string; fromAmount: string; toToken: string; toAmount: string }) => {
    if (!user?.loggedIn) throw new Error('User must be logged in to create a trade.');
    setIsProcessing(true);
    toast.loading('Sending transaction to create trade...');

    try {
      // Add timeout for transaction
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout')), 30000)
      );

      const transactionPromise = fcl.mutate({
        cadence: createTradeTransaction,
        args: (arg, t) => [
          arg(trade.fromToken, t.String),
          arg(trade.fromAmount, t.UFix64),
          arg(trade.toToken, t.String),
          arg(trade.toAmount, t.UFix64),
        ],
        limit: 9999,
      });

      const transactionId = await Promise.race([transactionPromise, timeoutPromise]) as string;

      toast.dismiss();
      toast.loading(`Transaction sent (${transactionId}). Waiting for confirmation...`);

      await fcl.tx(transactionId).onceSealed();
      
      toast.dismiss();
      toast.success('Trade created successfully!');
      await refreshTrades();
    } catch (error) {
      toast.dismiss();
      console.error('Error creating trade:', error);
      toast.error('Failed to create trade. See console for details.');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [user, refreshTrades]);

  const purchaseTrade = useCallback(async (trade: Trade, useUsdcGas: boolean = false) => {
    if (!user?.loggedIn) throw new Error('User must be logged in to purchase a trade.');
    setIsProcessing(true);
    
    const gasMessage = useUsdcGas ? 'Sending transaction with USDC gas fees (multi-chain)...' : 'Sending transaction to purchase trade...';
    toast.loading(gasMessage);

    try {
      // Debug: Log the trade object to see what we're working with
      console.log('Trade object:', trade);
      console.log('Trade ID type:', typeof trade.id, 'Value:', trade.id);
      
      const { id, to, from } = trade;
      
      // Validate that we have the required properties
      if (!to || !from) {
        console.error('Missing properties - to:', to, 'from:', from);
        throw new Error('Trade object is missing required properties (to/from)');
      }
      
      if (!to.asset || !from.asset) {
        console.error('Missing assets - to.asset:', to.asset, 'from.asset:', from.asset);
        throw new Error('Trade assets are undefined');
      }
      
      // Parse the ID safely
      const tradeId = typeof id === 'string' ? parseInt(id) : id;
      if (isNaN(tradeId)) {
        throw new Error(`Invalid trade ID: ${id}`);
      }
      
      // Add timeout for transaction
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout')), 30000)
      );

      console.log('About to send transaction with args:', {
        tradeId,
        toAsset: to.asset.toUpperCase(),
        paymentAmount: from.amount.toFixed(8),
        fromAsset: from.asset.toUpperCase()
      });
      
      // Use the transaction that transfers real tokens
      const transactionPromise = fcl.mutate({
        cadence: purchaseTradeWithTokensTransaction,
        args: (arg, t) => [
          arg(tradeId, t.UInt64),
          arg(to.asset.toUpperCase(), t.String),
          arg(from.amount.toFixed(8), t.UFix64), // Payment amount (what the buyer pays)
          arg(from.asset.toUpperCase(), t.String),
        ],
        limit: 9999,
        // For USDC gas fees, we could add additional configuration here
        // This is a placeholder for Flow's future USDC gas fee support
        ...(useUsdcGas && { gasToken: 'USDC' })
      });

      const transactionId = await Promise.race([transactionPromise, timeoutPromise]) as string;

      toast.dismiss();
      toast.loading(`Transaction sent (${transactionId}). Waiting for confirmation...`);

      await fcl.tx(transactionId).onceSealed();

      toast.dismiss();
      toast.success('Trade purchased successfully!');
      await refreshTrades();
    } catch (error) {
      toast.dismiss();
      console.error('Error purchasing trade:', error);
      toast.error('Failed to purchase trade. See console for details.');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [user, refreshTrades]);

  return { user, isProcessing, logIn, logOut, createTrade, purchaseTrade, refreshTrades };
}

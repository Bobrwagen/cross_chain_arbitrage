import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTradesStore, Trade } from '../hooks/useTradesStore';
import { useFlow } from '../hooks/useFlow';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import TradeCard from '../components/TradeCard';

// --- Arbitrage Page ---
export default function Arbitrage() {
  const { trades } = useTradesStore();
  const { user, purchaseTrade, isProcessing, refreshTrades } = useFlow();

  const [assetFilter, setAssetFilter] = useState('');
  const [chainFilter, setChainFilter] = useState('');
  const [sortBy, setSortBy] = useState('amount-desc');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [usdcGasEnabled, setUsdcGasEnabled] = useState(false);

  // Auto-refresh trades on component mount
  useEffect(() => {
    const loadTrades = async () => {
      try {
        await refreshTrades();
      } catch (error) {
        console.error('Failed to load trades:', error);
        toast.error('Failed to load trades. Using cached data.');
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadTrades();
  }, [refreshTrades]);

  const handlePurchase = useCallback(async (trade: Trade) => {
    if (isProcessing) return;
    setPurchasingId(trade.id);
    try {
      await purchaseTrade(trade, usdcGasEnabled);
      const gasMessage = usdcGasEnabled ? 'Trade purchased successfully with USDC gas fees across chains!' : 'Trade purchased successfully!';
      toast.success(`${gasMessage} Trade #${trade.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to purchase trade #${trade.id}.`;
      toast.error(message);
      console.error(error);
    } finally {
      setPurchasingId(null);
    }
  }, [isProcessing, purchaseTrade, usdcGasEnabled]);

  const openTrades = useMemo(() => {
    let filtered = trades.filter(trade => trade.status === 'open');

    if (assetFilter) {
      const lowerAssetFilter = assetFilter.toLowerCase();
      filtered = filtered.filter(trade => 
        trade.from.asset.toLowerCase().includes(lowerAssetFilter) || 
        trade.to.asset.toLowerCase().includes(lowerAssetFilter)
      );
    }

    if (chainFilter) {
      const lowerChainFilter = chainFilter.toLowerCase();
      filtered = filtered.filter(trade => 
        trade.from.chain.toLowerCase().includes(lowerChainFilter) || 
        trade.to.chain.toLowerCase().includes(lowerChainFilter)
      );
    }

    switch (sortBy) {
      case 'amount-desc':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'expiry-asc':
        filtered.sort((a, b) => a.expiry - b.expiry);
        break;
    }

    return filtered;
  }, [trades, assetFilter, chainFilter, sortBy]);

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6 bg-secondary-900 border-secondary-700 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filter & Sort Opportunities</CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={() => setUsdcGasEnabled(!usdcGasEnabled)}
              variant={usdcGasEnabled ? "primary" : "outline"}
              className={usdcGasEnabled ? "bg-green-600 hover:bg-green-700 text-white font-bold" : "border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"}
            >
              {usdcGasEnabled ? '✓ USDC Gas Active' : '� Use USDC for Gas Fees'}
            </Button>
            <Button onClick={refreshTrades} disabled={isProcessing}>
              {isProcessing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {usdcGasEnabled && (
            <div className="md:col-span-full mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400">
                � USDC Gas Fees Active: Transaction fees will be paid using USDC stablecoin instead of native cryptocurrencies (FLOW, ETH, etc.) across all supported chains.
              </p>
            </div>
          )}
          <Input
            placeholder="Filter by asset (e.g., FLOW)"
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            className="bg-secondary-800 text-white placeholder-secondary-400"
          />
          <Input
            placeholder="Filter by chain (e.g., Flow)"
            value={chainFilter}
            onChange={(e) => setChainFilter(e.target.value)}
            className="bg-secondary-800 text-white placeholder-secondary-400"
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="amount-desc">Largest Amount</option>
            <option value="expiry-asc">Nearest Expiry</option>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isInitialLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-secondary-400 mt-4">Loading arbitrage opportunities...</p>
          </div>
        ) : openTrades.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-secondary-400 text-lg">No arbitrage opportunities found.</p>
            <Button onClick={refreshTrades} className="mt-4" disabled={isProcessing}>
              {isProcessing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        ) : (
          openTrades.map((trade) => (
            <TradeCard 
              key={trade.id} 
              trade={trade} 
              onPurchase={handlePurchase} 
              currentUserAddr={user?.addr}
              isPurchasing={purchasingId === trade.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

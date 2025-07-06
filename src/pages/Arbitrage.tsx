import React, { useState, useMemo } from 'react';
import { useTradesStore, Trade } from '../hooks/useTradesStore';
import { useFlow } from '../hooks/useFlow';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';

// --- Trade Card Component ---
const TradeCard: React.FC<{ trade: Trade; onPurchase: (tradeId: string) => void; currentUserAddr: string | undefined; isPurchasing: boolean }> = ({ trade, onPurchase, currentUserAddr, isPurchasing }) => {
  const handlePurchase = () => {
    if (!currentUserAddr) {
      toast.error('Please connect your Flow wallet to purchase a trade.');
      return;
    }
    if (trade.owner.toLowerCase() === currentUserAddr.toLowerCase()) {
        toast.error("You cannot purchase your own trade.");
        return;
    }
    onPurchase(trade.id);
  };

  const isOwner = currentUserAddr && trade.owner.toLowerCase() === currentUserAddr.toLowerCase();

  return (
    <Card className="flex flex-col justify-between h-full bg-secondary-800 border-secondary-700 text-white shadow-lg rounded-lg transition-transform hover:scale-105">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="font-bold text-xl">Trade #{trade.id}</span>
          <Badge variant={trade.status === 'open' ? 'success' : 'destructive'}>{trade.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-secondary-400">From</p>
          <p className="font-semibold text-lg">{trade.from.asset} on {trade.from.chain}</p>
        </div>
        <div>
          <p className="text-sm text-secondary-400">To</p>
          <p className="font-semibold text-lg">{trade.to.asset} on {trade.to.chain}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-secondary-400">Amount</p>
            <p className="font-semibold text-lg">{trade.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-400">Profit</p>
            <p className="font-semibold text-lg text-green-400">{trade.profit}%</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-secondary-400">Expires</p>
          <p className="font-semibold">{new Date(trade.expiry).toLocaleString()}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handlePurchase} disabled={trade.status !== 'open' || isOwner || isPurchasing} className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-secondary-600">
          {isOwner ? 'Your Listing' : isPurchasing ? 'Processing...' : 'Purchase Trade'}
        </Button>
      </CardFooter>
    </Card>
  );
};

// --- Arbitrage Page ---
export default function Arbitrage() {
  const { trades } = useTradesStore();
  const { user, purchaseTrade, isProcessing, refreshTrades } = useFlow();

  const [assetFilter, setAssetFilter] = useState('');
  const [chainFilter, setChainFilter] = useState('');
  const [minProfit, setMinProfit] = useState('');
  const [sortBy, setSortBy] = useState('profit-desc');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handlePurchase = async (tradeId: string) => {
    if (isProcessing) return;
    setPurchasingId(tradeId);
    try {
      await purchaseTrade(tradeId);
      toast.success(`Trade #${tradeId} purchased successfully!`);
    } catch (error) {
      toast.error(`Failed to purchase trade #${tradeId}.`);
      console.error(error);
    } finally {
      setPurchasingId(null);
    }
  };

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

    if (minProfit) {
      filtered = filtered.filter(trade => trade.profit >= parseFloat(minProfit));
    }

    switch (sortBy) {
      case 'profit-desc':
        filtered.sort((a, b) => b.profit - a.profit);
        break;
      case 'amount-desc':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'expiry-asc':
        filtered.sort((a, b) => a.expiry - b.expiry);
        break;
    }

    return filtered;
  }, [trades, assetFilter, chainFilter, minProfit, sortBy]);

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6 bg-secondary-900 border-secondary-700 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filter & Sort Opportunities</CardTitle>
          <Button onClick={refreshTrades} disabled={isProcessing}>
            {isProcessing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <Input
            placeholder="Min profit percentage (e.g., 1.5)"
            type="number"
            value={minProfit}
            onChange={(e) => setMinProfit(e.target.value)}
            className="bg-secondary-800 text-white placeholder-secondary-400"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-secondary-800 text-white border-secondary-600 rounded-md p-2"
          >
            <option value="profit-desc">Highest Profit</option>
            <option value="amount-desc">Largest Amount</option>
            <option value="expiry-asc">Nearest Expiry</option>
          </select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {openTrades.map((trade) => (
          <TradeCard 
            key={trade.id} 
            trade={trade} 
            onPurchase={handlePurchase} 
            currentUserAddr={user?.addr}
            isPurchasing={purchasingId === trade.id}
          />
        ))}
      </div>
    </div>
  );
}

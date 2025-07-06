import React, { useState, useMemo } from 'react';
import { useTradesStore, Trade } from '../hooks/useTradesStore';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';

// --- Trade Card Component ---
const TradeCard: React.FC<{ trade: Trade; onPurchase: (tradeId: string, purchaser: string) => void; currentAccount: string | undefined }> = ({ trade, onPurchase, currentAccount }) => {
  const handlePurchase = () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet to purchase a trade.');
      return;
    }
    if (trade.owner.toLowerCase() === currentAccount.toLowerCase()) {
        toast.error("You cannot purchase your own trade.");
        return;
    }
    onPurchase(trade.id, currentAccount);
    toast.success(`Successfully purchased trade #${trade.id}`);
  };

  const isOwner = currentAccount && trade.owner.toLowerCase() === currentAccount.toLowerCase();

  return (
    <Card className="flex flex-col justify-between h-full bg-white shadow-md rounded-lg">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="font-bold text-lg">Trade #{trade.id}</span>
          <Badge variant={trade.status === 'open' ? 'default' : 'secondary'}>{trade.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">From</p>
          <p className="font-semibold">{trade.from.asset} on {trade.from.chain}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">To</p>
          <p className="font-semibold">{trade.to.asset} on {trade.to.chain}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-semibold">{trade.amount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Profit</p>
          <p className="font-semibold text-green-600">{trade.profit}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Expires</p>
          <p className="font-semibold">{new Date(trade.expiry).toLocaleString()}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handlePurchase} disabled={trade.status !== 'open' || isOwner} className="w-full">
          {isOwner ? 'Your Listing' : 'Purchase Trade'}
        </Button>
      </CardFooter>
    </Card>
  );
};

// --- Arbitrage Page ---
export default function Arbitrage() {
  const { trades, purchaseTrade } = useTradesStore();
  const { address } = useAccount();

  const [assetFilter, setAssetFilter] = useState('');
  const [chainFilter, setChainFilter] = useState('');
  const [minProfit, setMinProfit] = useState('');
  const [sortBy, setSortBy] = useState('profit-desc');

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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Arbitrage Marketplace</h1>

      {/* Filter and Sort Controls */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex-grow">
            <label htmlFor="assetFilter" className="text-sm font-medium">Filter by Asset</label>
            <Input id="assetFilter" placeholder="e.g., WETH" value={assetFilter} onChange={e => setAssetFilter(e.target.value)} />
          </div>
          <div className="flex-grow">
            <label htmlFor="chainFilter" className="text-sm font-medium">Filter by Chain</label>
            <Input id="chainFilter" placeholder="e.g., Arbitrum" value={chainFilter} onChange={e => setChainFilter(e.target.value)} />
          </div>
          <div className="flex-grow">
            <label htmlFor="minProfit" className="text-sm font-medium">Min Profit (%)</label>
            <Input id="minProfit" type="number" placeholder="e.g., 1.5" value={minProfit} onChange={e => setMinProfit(e.target.value)} />
          </div>
          <div className="flex-grow">
            <label htmlFor="sortBy" className="text-sm font-medium">Sort By</label>
            <select id="sortBy" value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="profit-desc">Highest Profit</option>
              <option value="amount-desc">Largest Amount</option>
              <option value="expiry-asc">Nearest Expiry</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {openTrades.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {openTrades.map(trade => (
            <TradeCard key={trade.id} trade={trade} onPurchase={purchaseTrade} currentAccount={address as string | undefined} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No open trades available at the moment.</p>
          <p className="text-sm text-gray-400">Check back later or create a new trade!</p>
        </div>
      )}
    </div>
  );
}

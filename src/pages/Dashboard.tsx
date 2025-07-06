import React from 'react';
import { useAccount } from 'wagmi';
import { useTradesStore, Trade } from '../hooks/useTradesStore';
import { useFlow } from '../hooks/useFlow';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DollarSign, Hash, Zap, Clock } from 'lucide-react';

// --- Stat Card Component ---
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; description: string }> = ({ title, value, icon, description }) => (
  <Card className="bg-secondary-800 border-secondary-700 animate-fade-in">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-secondary-300">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
      <p className="text-xs text-secondary-400">{description}</p>
    </CardContent>
  </Card>
);

// --- Recent Trade Row ---
const RecentTradeRow: React.FC<{ trade: Trade }> = ({ trade }) => (
    <div className="grid grid-cols-5 gap-4 items-center py-3 px-4 hover:bg-secondary-800 rounded-lg transition-colors">
        <div className="font-mono text-sm">#{trade.id}</div>
        <div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${trade.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {trade.status}
            </span>
        </div>
        <div className="font-semibold">{trade.amount.toLocaleString()} {trade.from.asset}</div>
        <div className="text-green-400 font-semibold">{trade.profit}%</div>
        <div className="text-right text-secondary-400 text-sm">{new Date(trade.expiry).toLocaleDateString()}</div>
    </div>
);


export default function Dashboard() {
  const { address } = useAccount();
  const { trades } = useTradesStore();
  const { isProcessing, refreshTrades } = useFlow();

  // --- Mock/Placeholder Data ---
  // In the future, this data will come from the Walrus API
  const totalVolume = "213.65";
  const openTradesCount = "24";
  const completedTradesCount = "16";
  const averageProfit = 0.76;
  const recentTrades = ["ETH -> POL", "ARB -> POL", "POL -> ETH", "ETH -> POL", "ARB -> POL", "POL -> ETH"] // [...trades].sort((a, b) => parseInt(b.id) - parseInt(a.id)).slice(0, 5);

  if (!address) {
    return (
      <div className="p-8 text-center">
        <p>Please connect your wallet to view your dashboard.</p>
      </div>
    );
  }

  const tradesCreatedByMe = trades.filter((trade) => trade.owner === address);
  const tradesPurchasedByMe = trades.filter((trade) => trade.purchaser === address);
  const myActiveTrades = trades.filter((trade) => trade.owner === address && trade.status === 'open');

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">Welcome to Chaingain</h1>
        <Button onClick={refreshTrades} disabled={isProcessing}>
            {isProcessing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Volume (USD)" 
          value={`$${totalVolume.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-secondary-400" />}
          description="Total value of all completed trades"
        />
        <StatCard 
          title="Open Opportunities"
          value={openTradesCount.toString()}
          icon={<Hash className="h-4 w-4 text-secondary-400" />}
          description="Trades currently available for purchase"
        />
        <StatCard 
          title="Completed Trades"
          value={completedTradesCount.toString()}
          icon={<Zap className="h-4 w-4 text-secondary-400" />}
          description="Trades that have been successfully executed"
        />
        <StatCard 
          title="Average Profit"
          value={`${averageProfit.toFixed(2)}%`}
          icon={<Clock className="h-4 w-4 text-secondary-400" />}
          description="Average profit margin across all trades"
        />
      </div>

      {/* Analytics & Recent Trades */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <Card className="md:col-span-2 bg-secondary-800 border-secondary-700 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-white">Trade Volume (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <p className="text-secondary-400">Chart data coming soon via Walrus integration.</p>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card className="bg-secondary-800 border-secondary-700 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-white">Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
                {recentTrades.length > 0 ? (
                    recentTrades.map(trade => <h2 className='text-2xl font-semibold'>{trade}</h2>)
                ) : (
                    <p className="text-secondary-400 text-center py-8">No recent trades found.</p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
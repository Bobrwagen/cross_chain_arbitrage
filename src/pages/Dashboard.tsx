import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useTradesStore, Trade } from '../hooks/useTradesStore';
import { useFlow } from '../hooks/useFlow';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DollarSign, Hash, Zap, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

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
    <div className="grid grid-cols-4 gap-4 items-center py-3 px-4 hover:bg-secondary-800 rounded-lg transition-colors">
        <div className="font-mono text-sm">#{trade.id}</div>
        <div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${trade.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {trade.status}
            </span>
        </div>
        <div className="font-semibold">{trade.amount.toLocaleString()} {trade.from.asset}</div>
        <div className="text-right text-secondary-400 text-sm ml-4">{new Date(trade.expiry).toLocaleDateString()}</div>
    </div>
);


export default function Dashboard() {
  const { address } = useAccount();
  const { trades } = useTradesStore();
  const { isProcessing, refreshTrades } = useFlow();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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

  if (!address) {
    return (
      <div className="p-8 text-center">
        <p className="text-secondary-400">Please connect your wallet to view your dashboard.</p>
      </div>
    );
  }

  if (isInitialLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-secondary-400 mt-4">Loading dashboard data...</p>
      </div>
    );
  }

  // --- Calculate Dashboard Data ---
  const totalVolume = trades.reduce((sum, trade) => sum + (trade.status === 'purchased' ? trade.amount : 0), 0);
  const openTradesCount = trades.filter(t => t.status === 'open').length;
  const completedTradesCount = trades.filter(t => t.status === 'purchased').length;
  const averageAmount = trades.length > 0 ? trades.reduce((sum, t) => sum + t.amount, 0) / trades.length : 0;
  const recentTrades = [...trades].sort((a, b) => parseInt(b.id) - parseInt(a.id)).slice(0, 5);

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
          title="Average Amount"
          value={`${averageAmount.toFixed(2)} FLOW`}
          icon={<Clock className="h-4 w-4 text-secondary-400" />}
          description="Average amount per trade"
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
                    recentTrades.map(trade => <RecentTradeRow key={trade.id} trade={trade} />)
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
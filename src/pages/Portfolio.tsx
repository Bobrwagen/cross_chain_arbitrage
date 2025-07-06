import { useAccount } from 'wagmi';
import { DollarSign, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { useTradesStore } from '../hooks/useTradesStore';
import { useBalances, Balance } from '../hooks/useBalances';
import { CHAINS } from '../lib/tokens';
import { ReactNode } from 'react';

const StatCard = ({ title, value, icon }: { title: string; value: ReactNode; icon: ReactNode }) => (
  <div className="rounded-lg bg-secondary-800 p-6 border border-secondary-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-secondary-400">{title}</p>
        <div className="text-2xl font-bold text-white">{value}</div>
      </div>
      <div className="p-2 rounded-lg bg-primary-500/10">{icon}</div>
    </div>
  </div>
);

const ChainBalanceCard = ({ chainId, balances }: { chainId: number; balances: Balance[] }) => {
  const chain = CHAINS[chainId];
  if (!chain) return null;

  return (
    <div className="rounded-lg bg-secondary-800 p-6 border border-secondary-700 space-y-4">
      <div className="flex items-center space-x-3">
        <img src={chain.logoURI} alt={chain.name} className="h-8 w-8 rounded-full" />
        <h3 className="text-xl font-bold text-white">{chain.name}</h3>
      </div>
      <div className="space-y-2">
        {balances.map((b) => (
          <div key={b.symbol} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <img src={b.logoURI} alt={b.name} className="h-5 w-5 rounded-full" />
              <span className="text-secondary-300">{b.symbol}</span>
            </div>
            <span className="font-mono text-white">{parseFloat(b.formatted).toFixed(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Portfolio() {
  const { address, isConnected } = useAccount();
  const { balances, loading } = useBalances();
  const trades = useTradesStore((state) => state.trades);

  const userTrades = trades.filter((t) => t.owner === address);
  const purchasedTrades = trades.filter((t) => t.purchaser === address);

  const balancesByChain = balances.reduce((acc, balance) => {
    const chainId = balance.chain.id;
    if (!acc[chainId]) {
      acc[chainId] = [];
    }
    acc[chainId].push(balance);
    return acc;
  }, {} as Record<number, Balance[]>);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h2>
          <p className="text-secondary-400 mb-4">
            Connect your wallet to view your portfolio
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Portfolio</h1>
        <p className="text-secondary-400 mt-1">
          Overview of your assets and trading activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          title="Total Trades Created"
          value={userTrades.length}
          icon={<Activity className="h-6 w-6 text-primary-500" />}
        />
        <StatCard
          title="Total Trades Purchased"
          value={purchasedTrades.length}
          icon={<DollarSign className="h-6 w-6 text-green-500" />}
        />
        <StatCard
          title="Connected Wallet"
          value={`${address?.slice(0, 6)}...${address?.slice(-4)}`}
          icon={<AlertCircle className="h-6 w-6 text-yellow-500" />}
        />
      </div>

      {/* Balances */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Your Balances</h2>
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px] bg-secondary-800 rounded-lg border border-secondary-700">
            <Loader2 className="h-12 w-12 text-primary-500 animate-spin" />
            <p className="ml-4 text-lg text-secondary-300">Fetching all your balances...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {Object.entries(balancesByChain).map(([chainId, chainBalances]) => (
              <ChainBalanceCard key={chainId} chainId={Number(chainId)} balances={chainBalances} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { useAccount, useBalance } from 'wagmi';
import { useEffect, useState } from 'react';
import { DollarSign, Activity } from 'lucide-react';

// Etherscan API Key should be stored in .env as VITE_ETHERSCAN_API_KEY
const ETHERSCAN_API_KEY = (import.meta as any).env.VITE_ETHERSCAN_API_KEY;

type Transaction = {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  chain: 'Ethereum' | 'Sui' | 'Solana';
  explorerUrl: string;
};
// ...existing code...
// ...existing code...
export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const suiAddress = address;
  const solanaAddress = address;
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address: address,
    chainId: 1, // Ethereum mainnet
  });
  const { data: arbitrumBalance, isLoading: arbLoading } = useBalance({
    address: address,
    chainId: 42161, // Arbitrum One
  });

  // For Sui and Solana, we'll show placeholder since they need different SDKs
  const suiBalance = isConnected ? "0.0 SUI" : "Connect wallet to display amount";
  const solanaBalance = isConnected ? "0.0 SOL" : "Connect wallet to display amount";

  const chainBalances = [
    {
      name: 'Ethereum',
      balance: !isConnected
        ? 'Connect wallet to display amount'
        : ethLoading
          ? 'Loading...'
          : ethBalance
            ? `${ethBalance.formatted} ${ethBalance.symbol}`
            : '0.0 ETH',
      chainId: 1,
    },
    {
      name: 'Arbitrum',
      balance: !isConnected
        ? 'Connect wallet to display amount'
        : arbLoading
          ? 'Loading...'
          : arbitrumBalance
            ? `${arbitrumBalance.formatted} ${arbitrumBalance.symbol}`
            : '0.0 ETH',
      chainId: 42161,
    },
    {
      name: 'Sui',
      balance: suiBalance,
      chainId: 'sui',
    },
    {
      name: 'Solana',
      balance: solanaBalance,
      chainId: 'solana',
    },
  ];

  const totalValue = isConnected && ethBalance && arbitrumBalance 
    ? (Number(ethBalance.formatted || 0) + Number(arbitrumBalance.formatted || 0)) * 2000 // Approximate ETH price
    : 0;

  useEffect(() => {
    const fetchAllTxs = async () => {
      if (!isConnected || !address) {
        setTransactions(null);
        return;
      }
      setTxLoading(true);
      setTxError(null);
      try {
        // ETHERSCAN
        const ethUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
        const ethRes = await fetch(ethUrl);
        const ethData = await ethRes.json();
        let ethTxs: Transaction[] = [];
        if (ethData.status === "1" && Array.isArray(ethData.result)) {
          ethTxs = ethData.result.slice(0, 10).map((tx: any) => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            timeStamp: tx.timeStamp,
            chain: 'Ethereum',
            explorerUrl: `https://etherscan.io/tx/${tx.hash}`,
          }));
        }

        // SUISCAN
        let suiTxs: Transaction[] = [];
        try {
          const suiUrl = `https://api.suiscan.xyz/mainnet/account/${suiAddress}/transactions?limit=10`;
          const suiRes = await fetch(suiUrl);
          const suiData = await suiRes.json();
          if (Array.isArray(suiData)) {
            suiTxs = suiData.map((tx: any) => ({
              hash: tx.digest,
              from: tx.sender || '-',
              to: tx.recipient || '-',
              value: tx.amount || '0',
              timeStamp: tx.timestampMs ? String(Math.floor(Number(tx.timestampMs) / 1000)) : '',
              chain: 'Sui',
              explorerUrl: `https://suiscan.xyz/mainnet/tx/${tx.digest}`,
            }));
          }
        } catch (e) { /* ignore Sui errors */ }

        // SOLSCAN
        let solTxs: Transaction[] = [];
        try {
          const solUrl = `https://public-api.solscan.io/account/transactions?address=${solanaAddress}&limit=10`;
          const solRes = await fetch(solUrl);
          const solData = await solRes.json();
          if (Array.isArray(solData)) {
            solTxs = solData.map((tx: any) => ({
              hash: tx.txHash,
              from: tx.src || '-',
              to: tx.dst || '-',
              value: tx.lamport ? String(tx.lamport) : '0',
              timeStamp: tx.blockTime ? String(tx.blockTime) : '',
              chain: 'Solana',
              explorerUrl: `https://solscan.io/tx/${tx.txHash}`,
            }));
          }
        } catch (e) { /* ignore Solana errors */ }

        // Merge and sort all txs by timeStamp desc
        const allTxs = [...ethTxs, ...suiTxs, ...solTxs].sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp));
        setTransactions(allTxs);
      } catch (e) {
        setTxError("Error fetching transactions");
      }
      setTxLoading(false);
    };
    fetchAllTxs();
  }, [isConnected, address, suiAddress, solanaAddress]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-secondary-400">
            {isConnected 
              ? `Welcome back! Your wallet: ${address?.slice(0, 6)}...${address?.slice(-4)}`
              : 'Connect your wallet to start trading'
            }
          </p>
        </div>
        {isConnected && (
          <div className="text-right">
            <p className="text-sm text-secondary-400">Total Portfolio Value</p>
            <p className="text-xl font-bold text-white">
              ${totalValue.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Chain Balances */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {chainBalances.map((chain) => (
          <div
            key={chain.name}
            className="rounded-lg bg-secondary-800 p-6 border border-secondary-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-400">{chain.name}</p>
                <p className="text-2xl font-bold text-white">{chain.balance}</p>
              </div>
              <div className="p-2 rounded-lg bg-primary-500/10">
                <DollarSign className="h-6 w-6 text-primary-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trading Status */}
      <div className="rounded-lg bg-secondary-800 border border-secondary-700">
        <div className="px-6 py-4 border-b border-secondary-700">
          <h2 className="text-lg font-semibold text-white">Trading Status</h2>
        </div>
        <div className="p-6">
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-white">Wallet Connected</p>
                    <p className="text-sm text-secondary-400">Ready to execute arbitrage trades</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="text-center p-4 rounded-lg bg-secondary-700">
                  <p className="text-sm text-secondary-400">Active Opportunities</p>
                  <p className="text-xl font-bold text-white">0</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary-700">
                  <p className="text-sm text-secondary-400">Total Trades</p>
                  <p className="text-xl font-bold text-white">0</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary-700">
                  <p className="text-sm text-secondary-400">Success Rate</p>
                  <p className="text-xl font-bold text-white">0%</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-secondary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Trading Activity</h3>
              <p className="text-secondary-400">
                Connect your wallet to start monitoring arbitrage opportunities
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="rounded-lg bg-secondary-800 border border-secondary-700 mt-6">
        <div className="px-6 py-4 border-b border-secondary-700">
          <h2 className="text-lg font-semibold text-white">Transactions</h2>
          <p className="text-secondary-400 text-sm">Live feed from Etherscan, Suiscan, Solscan</p>
        </div>
        <div className="overflow-x-auto p-6">
          {txLoading ? (
            <div className="text-secondary-400">Loading transactions...</div>
          ) : txError ? (
            <div className="text-red-500">{txError}</div>
          ) : !isConnected ? (
            <div className="text-secondary-400">Connect your wallet to see your transactions.</div>
          ) : transactions && transactions.length === 0 ? (
            <div className="text-secondary-400">No transactions found for this wallet.</div>
          ) : transactions && transactions.length > 0 ? (
            <table className="min-w-full divide-y divide-secondary-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">Hash</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">Chain</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">From</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">To</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-700">
                {transactions.map((tx) => (
                  <tr key={tx.hash + tx.chain}>
                    <td className="px-4 py-2 text-white">
                      <a
                        href={tx.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:underline"
                      >
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                      </a>
                    </td>
                    <td className="px-4 py-2 text-white">{tx.chain}</td>
                    <td className="px-4 py-2 text-white">{tx.from && tx.from.length > 10 ? tx.from.slice(0, 6) + '...' + tx.from.slice(-4) : tx.from}</td>
                    <td className="px-4 py-2 text-white">{tx.to && tx.to.length > 10 ? tx.to.slice(0, 6) + '...' + tx.to.slice(-4) : tx.to}</td>
                    <td className="px-4 py-2 text-white">
                      {tx.chain === 'Ethereum' ? `${(Number(tx.value) / 1e18).toFixed(4)} ETH` :
                       tx.chain === 'Solana' ? `${(Number(tx.value) / 1e9).toFixed(4)} SOL` :
                       tx.chain === 'Sui' ? `${(Number(tx.value) / 1e9).toFixed(4)} SUI` : tx.value}
                    </td>
                    <td className="px-4 py-2 text-white">{tx.timeStamp ? new Date(Number(tx.timeStamp) * 1000).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>
    </div>
  );
}
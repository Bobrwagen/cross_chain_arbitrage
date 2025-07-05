import { useAccount, useBalance } from 'wagmi';
import { useEffect, useState } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui';
import { Connection, PublicKey } from '@solana/web3.js';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

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

  // Sui balance
  const [suiBalance, setSuiBalance] = useState<string>(isConnected ? 'Loading...' : 'Connect wallet to display amount');
  // Solana balance
  const [solanaBalance, setSolanaBalance] = useState<string>(isConnected ? 'Loading...' : 'Connect wallet to display amount');

  useEffect(() => {
    const fetchSuiBalance = async () => {
      if (!isConnected || !suiAddress) {
        setSuiBalance('Connect wallet to display amount');
        return;
      }
      try {
        const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });
        const coins = await suiClient.getAllBalances({ owner: suiAddress });
        const suiCoin = coins.find((c: any) => c.coinType.includes('sui')); // SUI coin type
        const suiAmount = suiCoin ? Number(suiCoin.totalBalance) / 1e9 : 0;
        setSuiBalance(`${suiAmount.toFixed(4)} SUI`);
      } catch (e) {
        setSuiBalance('0.0 SUI');
      }
    };
    fetchSuiBalance();
  }, [isConnected, suiAddress]);

  useEffect(() => {
    const fetchSolanaBalance = async () => {
      if (!isConnected || !solanaAddress) {
        setSolanaBalance('Connect wallet to display amount');
        return;
      }
      try {
        const connection = new Connection('https://api.mainnet-beta.solana.com');
        const pubkey = new PublicKey(solanaAddress);
        const lamports = await connection.getBalance(pubkey);
        setSolanaBalance(`${(lamports / 1e9).toFixed(4)} SOL`);
      } catch (e) {
        setSolanaBalance('0.0 SOL');
      }
    };
    fetchSolanaBalance();
  }, [isConnected, solanaAddress]);

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

  // Calculate total value using live prices (ETH, SUI, SOL)
  const [prices, setPrices] = useState<{ eth: number; sui: number; sol: number }>({ eth: 0, sui: 0, sol: 0 });
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // 1inch for ETH, CoinGecko for SUI/SOL
        const ethRes = await fetch('https://api.1inch.dev/price/v1.1/1/ETH');
        const ethData = await ethRes.json();
        const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=sui,solana&vs_currencies=usd');
        const cgData = await cgRes.json();
        setPrices({
          eth: ethData.price || 0,
          sui: cgData.sui?.usd || 0,
          sol: cgData.solana?.usd || 0,
        });
      } catch (e) {
        setPrices({ eth: 0, sui: 0, sol: 0 });
      }
    };
    fetchPrices();
  }, []);

  const totalValue = isConnected && ethBalance && arbitrumBalance && suiBalance && solanaBalance
    ? (Number(ethBalance.formatted || 0) * prices.eth
      + Number(arbitrumBalance.formatted || 0) * prices.eth
      + (parseFloat(suiBalance) || 0) * prices.sui
      + (parseFloat(solanaBalance) || 0) * prices.sol)
    : 0;

  // TODO: Replace with real invested value from backend or user input
  const investedUSD = undefined; // No dummy value
  const performance = investedUSD ? ((totalValue - investedUSD) / investedUSD) * 100 : undefined;
  const isPositive = performance !== undefined ? performance >= 0 : true;

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
      <div className="mb-2 flex flex-col lg:flex-row lg:items-end lg:justify-between">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg tracking-tight">Dashboard</h1>
        {isConnected && (
          <div className="mt-2 lg:mt-0 lg:text-right">
            <p className="text-lg font-semibold text-white drop-shadow-lg">Total Balance</p>
            <p className="text-3xl font-extrabold text-primary-400 drop-shadow-lg">${totalValue.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Performance & Chain Balances (side by side, straight) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Block (left) */}
        {investedUSD !== undefined && (
          <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700 flex flex-col justify-between shadow-2xl h-full min-h-[240px] max-h-[320px]">
            <div className="flex flex-col items-center justify-center mb-6 w-full h-full">
              {isPositive ? (
                <TrendingUp className="w-2/3 h-40 md:h-56 text-green-500 drop-shadow-[0_2px_16px_rgba(34,197,94,0.7)] mx-auto" style={{maxWidth:'240px', minWidth:'100px'}} />
              ) : (
                <TrendingDown className="w-2/3 h-40 md:h-56 text-red-500 drop-shadow-[0_2px_16px_rgba(239,68,68,0.7)] mx-auto" style={{maxWidth:'240px', minWidth:'100px'}} />
              )}
              <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mt-3 text-center">Performance</h2>
              <div className="flex flex-col items-center gap-2 mt-2">
                <span className={`text-5xl md:text-6xl font-extrabold drop-shadow-lg ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{performance?.toFixed(2)}%</span>
                <span className="text-secondary-400 text-xl font-semibold">{isPositive ? 'Profit' : 'Loss'}</span>
              </div>
              <p className="text-secondary-400 text-base mt-2 text-center">since initial investment ({investedUSD !== undefined ? `$${Number(investedUSD).toFixed(2)}` : '-'})</p>
            </div>
            <div className="flex gap-1 mb-2 justify-center">
              {['1D', '1W', '1M', '1Y'].map((label) => (
                <button
                  key={label}
                  className="px-4 py-1 rounded-full border border-primary-400 text-primary-400 text-sm font-semibold bg-secondary-900 hover:bg-primary-400 hover:text-white transition drop-shadow"
                  // TODO: Add onClick logic to update performance range
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Chain Balances (right) */}
        <div className="flex flex-col justify-between h-full min-h-[240px] max-h-[320px]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 h-full">
            {chainBalances.map((chain) => (
              <div
                key={chain.name}
                className="rounded-lg bg-secondary-800 p-4 border border-secondary-700 flex flex-row items-center justify-between shadow-lg h-full min-h-[60px] max-h-[80px]"
              >
                {/* Left: Chain name */}
                <div className="flex flex-col items-start min-w-[90px]">
                  <span className="text-base font-medium text-secondary-300 drop-shadow-lg">{chain.name}</span>
                </div>
                {/* Center: Value (vertically centered) */}
                <span className="text-lg font-bold text-white drop-shadow-lg text-center flex-1">{chain.balance}</span>
              </div>
            ))}
          </div>
        </div>
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
          ) : Array.isArray(transactions) && transactions.length === 0 ? (
            <div className="text-secondary-400">No transactions found for this wallet.</div>
          ) : Array.isArray(transactions) && transactions.length > 0 ? (
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
                {Array.isArray(transactions) && transactions.map((tx) => (
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
import React from 'react'
import { useAccount, useBalance } from 'wagmi'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const { data: ethBalance } = useBalance({
    address: address,
    chainId: 1, // Ethereum mainnet
  })
  const { data: arbitrumBalance } = useBalance({
    address: address,
    chainId: 42161, // Arbitrum One
  })

  // For Sui and Solana, we'll show placeholder since they need different SDKs
  const suiBalance = isConnected ? "0.0 SUI" : "Connect wallet to display amount"
  const solanaBalance = isConnected ? "0.0 SOL" : "Connect wallet to display amount"

  const chainBalances = [
    {
      name: 'Ethereum',
      balance: isConnected ? `${ethBalance?.formatted || '0.0'} ${ethBalance?.symbol || 'ETH'}` : 'Connect wallet to display amount',
      chainId: 1,
    },
    {
      name: 'Arbitrum',
      balance: isConnected ? `${arbitrumBalance?.formatted || '0.0'} ${arbitrumBalance?.symbol || 'ETH'}` : 'Connect wallet to display amount',
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
  ]

  const totalValue = isConnected && ethBalance && arbitrumBalance 
    ? (Number(ethBalance.formatted || 0) + Number(arbitrumBalance.formatted || 0)) * 2000 // Approximate ETH price
    : 0

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
    </div>
  )
} 
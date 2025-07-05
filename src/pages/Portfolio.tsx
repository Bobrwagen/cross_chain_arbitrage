import React from 'react'
import { useAccount, useBalance } from 'wagmi'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react'

export default function Portfolio() {
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
      value: isConnected ? `$${(Number(ethBalance?.formatted || 0) * 2000).toFixed(2)}` : 'Connect wallet to display amount',
      chainId: 1,
    },
    {
      name: 'Arbitrum',
      balance: isConnected ? `${arbitrumBalance?.formatted || '0.0'} ${arbitrumBalance?.symbol || 'ETH'}` : 'Connect wallet to display amount',
      value: isConnected ? `$${(Number(arbitrumBalance?.formatted || 0) * 2000).toFixed(2)}` : 'Connect wallet to display amount',
      chainId: 42161,
    },
    {
      name: 'Sui',
      balance: suiBalance,
      value: 'Connect wallet to display amount',
      chainId: 'sui',
    },
    {
      name: 'Solana',
      balance: solanaBalance,
      value: 'Connect wallet to display amount',
      chainId: 'solana',
    },
  ]

  const totalValue = isConnected && ethBalance && arbitrumBalance 
    ? (Number(ethBalance.formatted || 0) + Number(arbitrumBalance.formatted || 0)) * 2000 // Approximate ETH price
    : 0

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
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-secondary-400">
            Your wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-secondary-400">Total Portfolio Value</p>
          <p className="text-xl font-bold text-white">
            ${totalValue.toFixed(2)}
          </p>
        </div>
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
                <p className="text-sm text-secondary-400">{chain.value}</p>
              </div>
              <div className="p-2 rounded-lg bg-primary-500/10">
                <DollarSign className="h-6 w-6 text-primary-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Holdings Summary */}
        <div className="rounded-lg bg-secondary-800 border border-secondary-700">
          <div className="px-6 py-4 border-b border-secondary-700">
            <h2 className="text-lg font-semibold text-white">Holdings Summary</h2>
          </div>
          <div className="p-6">
            {isConnected ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-400">Total Value</span>
                  <span className="text-white font-medium">${totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-400">Connected Chains</span>
                  <span className="text-white font-medium">2/4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-400">Active Balances</span>
                  <span className="text-white font-medium">
                    {[ethBalance, arbitrumBalance].filter(Boolean).length}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-secondary-400">Connect wallet to view holdings</p>
              </div>
            )}
          </div>
        </div>

        {/* Trading Activity */}
        <div className="rounded-lg bg-secondary-800 border border-secondary-700">
          <div className="px-6 py-4 border-b border-secondary-700">
            <h2 className="text-lg font-semibold text-white">Trading Activity</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-secondary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Trading History</h3>
              <p className="text-secondary-400">
                Start arbitrage trading to see your activity here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
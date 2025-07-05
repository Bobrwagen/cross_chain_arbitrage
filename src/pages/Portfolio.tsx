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
  const { data: balance } = useBalance({
    address: address,
  })

  const portfolioStats = [
    {
      name: 'Total Value',
      value: isConnected ? `$${(Number(balance?.formatted || 0) * 2000).toFixed(2)}` : '$0.00',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      name: '24h Change',
      value: isConnected ? '+$1,234.56' : '$0.00',
      change: '+8.2%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Total Trades',
      value: '156',
      change: '+23',
      changeType: 'positive',
      icon: Activity,
    },
    {
      name: 'Success Rate',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
    },
  ]

  const holdings = [
    {
      token: 'ETH',
      amount: '2.5',
      value: '$6,125.00',
      change: '+5.2%',
      changeType: 'positive',
    },
    {
      token: 'USDC',
      amount: '10,000',
      value: '$10,000.00',
      change: '0.0%',
      changeType: 'neutral',
    },
    {
      token: 'MATIC',
      amount: '5,000',
      value: '$3,250.00',
      change: '-2.1%',
      changeType: 'negative',
    },
  ]

  const transactions = [
    {
      id: 1,
      type: 'buy',
      token: 'ETH',
      amount: '2.5 ETH',
      value: '$6,125.00',
      time: '2 hours ago',
      txHash: '0x1234...5678',
    },
    {
      id: 2,
      type: 'sell',
      token: 'USDC',
      amount: '5,000 USDC',
      value: '$5,000.00',
      time: '1 day ago',
      txHash: '0x8765...4321',
    },
    {
      id: 3,
      type: 'buy',
      token: 'MATIC',
      amount: '5,000 MATIC',
      value: '$3,250.00',
      time: '3 days ago',
      txHash: '0xabcd...efgh',
    },
  ]

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
          <p className="text-sm text-secondary-400">Wallet Balance</p>
          <p className="text-xl font-bold text-white">
            {balance?.formatted} {balance?.symbol}
          </p>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {portfolioStats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg bg-secondary-800 p-6 border border-secondary-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-400">{stat.name}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${
                stat.changeType === 'positive' ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                }`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'positive' ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={`ml-1 text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
              <span className="ml-2 text-sm text-secondary-400">from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Holdings */}
        <div className="rounded-lg bg-secondary-800 border border-secondary-700">
          <div className="px-6 py-4 border-b border-secondary-700">
            <h2 className="text-lg font-semibold text-white">Holdings</h2>
          </div>
          <div className="divide-y divide-secondary-700">
            {holdings.map((holding) => (
              <div key={holding.token} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{holding.token}</p>
                    <p className="text-sm text-secondary-400">{holding.amount} {holding.token}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{holding.value}</p>
                    <p className={`text-sm font-medium ${
                      holding.changeType === 'positive' ? 'text-green-500' : 
                      holding.changeType === 'negative' ? 'text-red-500' : 'text-secondary-400'
                    }`}>
                      {holding.change}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-lg bg-secondary-800 border border-secondary-700">
          <div className="px-6 py-4 border-b border-secondary-700">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-secondary-700">
            {transactions.map((tx) => (
              <div key={tx.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      tx.type === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {tx.type === 'buy' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{tx.token}</p>
                      <p className="text-sm text-secondary-400">{tx.amount}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{tx.value}</p>
                    <p className="text-sm text-secondary-400">{tx.time}</p>
                    <p className="text-xs text-secondary-500">{tx.txHash}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
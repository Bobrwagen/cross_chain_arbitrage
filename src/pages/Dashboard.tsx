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
  const { data: balance } = useBalance({
    address: address,
  })

  const stats = [
    {
      name: 'Total Portfolio Value',
      value: isConnected ? `$${(Number(balance?.formatted || 0) * 2000).toFixed(2)}` : '$0.00',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      name: '24h P&L',
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

  const recentTrades = [
    {
      id: 1,
      token: 'ETH/USDC',
      type: 'buy',
      amount: '2.5 ETH',
      price: '$2,450.00',
      profit: '+$125.00',
      time: '2 min ago',
    },
    {
      id: 2,
      token: 'USDC/ETH',
      type: 'sell',
      amount: '6,125 USDC',
      price: '$2,450.00',
      profit: '+$89.50',
      time: '5 min ago',
    },
    {
      id: 3,
      token: 'ETH/USDC',
      type: 'buy',
      amount: '1.8 ETH',
      price: '$2,448.00',
      profit: '+$67.20',
      time: '12 min ago',
    },
  ]

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
            <p className="text-sm text-secondary-400">Wallet Balance</p>
            <p className="text-xl font-bold text-white">
              {balance?.formatted} {balance?.symbol}
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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

      {/* Recent Trades */}
      <div className="rounded-lg bg-secondary-800 border border-secondary-700">
        <div className="px-6 py-4 border-b border-secondary-700">
          <h2 className="text-lg font-semibold text-white">Recent Trades</h2>
        </div>
        <div className="divide-y divide-secondary-700">
          {recentTrades.map((trade) => (
            <div key={trade.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    trade.type === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {trade.type === 'buy' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{trade.token}</p>
                    <p className="text-sm text-secondary-400">{trade.amount} @ {trade.price}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-500">{trade.profit}</p>
                  <p className="text-sm text-secondary-400">{trade.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react'
import { useState } from 'react'

export default function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const stats = [
    {
      name: 'Total Profit',
      value: '$2,847.32',
      change: '+12.5%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Active Positions',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: Activity,
    },
    {
      name: 'Portfolio Value',
      value: '$45,231.89',
      change: '-2.3%',
      changeType: 'negative',
      icon: DollarSign,
    },
  ]

  const recentTrades = [
    {
      id: 1,
      token: 'ETH/USDC',
      chain: 'Ethereum',
      profit: '+$234.56',
      time: '2 min ago',
    },
    {
      id: 2,
      token: 'MATIC/USDT',
      chain: 'Polygon',
      profit: '+$89.12',
      time: '5 min ago',
    },
    {
      id: 3,
      token: 'ARB/ETH',
      chain: 'Arbitrum',
      profit: '-$45.78',
      time: '8 min ago',
    },
  ]

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-secondary-400">Monitor your arbitrage performance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-400">{stat.name}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className="rounded-lg bg-secondary-700 p-3">
                <stat.icon size={24} className="text-primary-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'positive' ? (
                <ArrowUpRight size={16} className="text-success-500" />
              ) : (
                <ArrowDownRight size={16} className="text-error-500" />
              )}
              <span
                className={`ml-1 text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-success-500' : 'text-error-500'
                }`}
              >
                {stat.change}
              </span>
              <span className="ml-2 text-sm text-secondary-400">from last hour</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Trades */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Recent Trades</h2>
          <button className="text-sm text-primary-400 hover:text-primary-300">
            View all
          </button>
        </div>
        <div className="space-y-4">
          {recentTrades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary-700"
            >
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium text-white">{trade.token}</p>
                  <p className="text-sm text-secondary-400">{trade.chain}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">{trade.profit}</p>
                <p className="text-sm text-secondary-400">{trade.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary">
              Start New Arbitrage
            </button>
            <button className="w-full btn-outline">
              View Opportunities
            </button>
            <button className="w-full btn-outline">
              Manage Positions
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Market Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-secondary-400">Gas Price (ETH)</span>
              <span className="text-white font-medium">23 Gwei</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-400">Active Opportunities</span>
              <span className="text-success-500 font-medium">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-400">Best Profit Margin</span>
              <span className="text-success-500 font-medium">3.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
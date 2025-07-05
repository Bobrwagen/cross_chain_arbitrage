import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  RefreshCw,
  ExternalLink,
  Download
} from 'lucide-react'

export default function Portfolio() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock portfolio data
  const portfolioData = {
    totalValue: '$45,231.89',
    totalChange: '+12.5%',
    totalChangeValue: '+$5,123.45',
    tokens: [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: '2.45',
        value: '$4,890.00',
        change: '+8.2%',
        changeValue: '+$370.50',
        icon: '🔵',
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '15,000.00',
        value: '$15,000.00',
        change: '+0.1%',
        changeValue: '+$15.00',
        icon: '🔵',
      },
      {
        symbol: 'MATIC',
        name: 'Polygon',
        balance: '12,500.00',
        value: '$8,750.00',
        change: '+15.3%',
        changeValue: '+$1,160.25',
        icon: '🟣',
      },
      {
        symbol: 'ARB',
        name: 'Arbitrum',
        balance: '2,000.00',
        value: '$2,400.00',
        change: '-2.1%',
        changeValue: '-$51.45',
        icon: '🔵',
      },
    ],
  }

  const transactions = [
    {
      id: 1,
      type: 'swap',
      token: 'ETH/USDC',
      amount: '+1,500 USDC',
      value: '$1,500.00',
      time: '2 hours ago',
      status: 'completed',
      txHash: '0x1234...5678',
    },
    {
      id: 2,
      type: 'arbitrage',
      token: 'MATIC/ETH',
      amount: '+0.5 ETH',
      value: '+$1,000.00',
      time: '5 hours ago',
      status: 'completed',
      txHash: '0x8765...4321',
    },
    {
      id: 3,
      type: 'swap',
      token: 'USDC/ARB',
      amount: '-500 USDC',
      value: '-$500.00',
      time: '1 day ago',
      status: 'completed',
      txHash: '0xabcd...efgh',
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
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-secondary-400">
            Ethereum • Demo Wallet
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="btn-outline flex items-center space-x-2">
            <Download size={16} />
            <span>Export</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-400">Total Value</p>
              <p className="text-2xl font-bold text-white">{portfolioData.totalValue}</p>
            </div>
            <div className="rounded-lg bg-primary-600 p-3">
              <DollarSign size={24} className="text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp size={16} className="text-success-500" />
            <span className="ml-1 text-sm font-medium text-success-500">
              {portfolioData.totalChange}
            </span>
            <span className="ml-2 text-sm text-secondary-400">
              ({portfolioData.totalChangeValue})
            </span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-400">24h Change</p>
              <p className="text-2xl font-bold text-success-500">+$1,234.56</p>
            </div>
            <div className="rounded-lg bg-success-600 p-3">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-secondary-400">+2.8% from yesterday</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-400">Active Positions</p>
              <p className="text-2xl font-bold text-white">8</p>
            </div>
            <div className="rounded-lg bg-secondary-700 p-3">
              <TrendingUp size={24} className="text-primary-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-secondary-400">3 profitable, 2 neutral</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Holdings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">Token Holdings</h2>
          <div className="space-y-4">
            {portfolioData.tokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{token.icon}</div>
                  <div>
                    <p className="font-medium text-white">{token.symbol}</p>
                    <p className="text-sm text-secondary-400">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{token.balance}</p>
                  <p className="text-sm text-secondary-400">{token.value}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    token.change.startsWith('+') ? 'text-success-500' : 'text-error-500'
                  }`}>
                    {token.change}
                  </p>
                  <p className={`text-xs ${
                    token.change.startsWith('+') ? 'text-success-500' : 'text-error-500'
                  }`}>
                    {token.changeValue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            <button className="text-sm text-primary-400 hover:text-primary-300">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary-700"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    tx.type === 'arbitrage' ? 'bg-success-500' : 'bg-primary-500'
                  }`} />
                  <div>
                    <p className="font-medium text-white">{tx.token}</p>
                    <p className="text-sm text-secondary-400">{tx.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{tx.amount}</p>
                  <p className="text-sm text-secondary-400">{tx.value}</p>
                </div>
                <button className="text-secondary-400 hover:text-white">
                  <ExternalLink size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-6">Performance Over Time</h2>
        <div className="h-64 bg-secondary-700 rounded-lg flex items-center justify-center">
          <p className="text-secondary-400">Chart component would go here</p>
        </div>
      </div>
    </div>
  )
} 
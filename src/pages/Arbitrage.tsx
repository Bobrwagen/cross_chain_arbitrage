import React, { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Search,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH' },
  { id: 137, name: 'Polygon', symbol: 'MATIC' },
  { id: 42161, name: 'Arbitrum', symbol: 'ARB' },
  { id: 10, name: 'Optimism', symbol: 'OP' },
]

const COMMON_TOKENS = [
  { symbol: 'USDC', address: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C' },
  { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
]

export default function Arbitrage() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })
  const [fromToken, setFromToken] = useState('USDC')
  const [toToken, setToToken] = useState('WETH')
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [quote, setQuote] = useState<any>(null)
  const [selectedChain, setSelectedChain] = useState(1)
  const [selectedOpportunity, setSelectedOpportunity] = useState<number | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const opportunities = [
    {
      id: 1,
      token: 'ETH/USDC',
      fromChain: 'Ethereum',
      toChain: 'Polygon',
      profit: '+2.8%',
      amount: '$1,000',
      gasEstimate: '$12.50',
      netProfit: '+$15.50',
      risk: 'Low',
    },
    {
      id: 2,
      token: 'USDC/ETH',
      fromChain: 'Polygon',
      toChain: 'Arbitrum',
      profit: '+1.9%',
      amount: '$500',
      gasEstimate: '$8.20',
      netProfit: '+$1.30',
      risk: 'Medium',
    },
    {
      id: 3,
      token: 'MATIC/USDT',
      fromChain: 'Polygon',
      toChain: 'Ethereum',
      profit: '+3.2%',
      amount: '$2,000',
      gasEstimate: '$18.75',
      netProfit: '+$45.25',
      risk: 'Low',
    },
  ]

  const handleGetQuote = async () => {
    if (!amount || !fromToken || !toToken) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      // Simulate quote calculation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockQuote = {
        toTokenAmount: (parseFloat(amount) * 0.0004).toFixed(6),
        gasCost: `$${(Math.random() * 50 + 5).toFixed(2)}`,
        priceImpact: parseFloat((Math.random() * 2).toFixed(2)),
        protocols: [
          {
            name: 'Uniswap V3',
            part: 100,
            fromTokenAddress: '0x' + '0'.repeat(40),
            toTokenAddress: '0x' + '0'.repeat(40),
          },
        ],
      }
      
      setQuote(mockQuote)
      toast.success('Quote received!')
    } catch (error) {
      toast.error('Failed to get quote')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwap = async () => {
    if (!amount || !fromToken || !toToken) {
      toast.error('Please fill in all fields')
      return
    }

    if (!quote) {
      toast.error('Please get a quote first')
      return
    }

    setIsLoading(true)
    try {
      // Simulate swap execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Swap executed successfully!')
      setQuote(null)
      setAmount('')
    } catch (error) {
      toast.error('Swap failed. Please try again.')
      console.error('Swap error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecute = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }
    
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setIsExecuting(true)
    // Simulate transaction
    setTimeout(() => {
      setIsExecuting(false)
      alert('Arbitrage executed successfully!')
      setAmount('')
      setSelectedOpportunity(null)
    }, 2000)
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h2>
          <p className="text-secondary-400 mb-4">
            Connect your wallet to start arbitrage trading
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
          <h1 className="text-2xl font-bold text-white">Arbitrage Trading</h1>
          <p className="text-secondary-400">
            Execute cross-chain arbitrage opportunities
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-secondary-400">Available Balance</p>
          <p className="text-xl font-bold text-white">
            {balance?.formatted} {balance?.symbol}
          </p>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Available Opportunities</h2>
          <div className="space-y-3">
            {opportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedOpportunity === opportunity.id
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-secondary-700 bg-secondary-800 hover:border-secondary-600'
                }`}
                onClick={() => setSelectedOpportunity(opportunity.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{opportunity.token}</h3>
                      <p className="text-sm text-secondary-400">
                        {opportunity.fromChain} <ArrowRight className="inline h-3 w-3" /> {opportunity.toChain}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-500">{opportunity.profit}</p>
                    <p className="text-sm text-secondary-400">{opportunity.risk} Risk</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-secondary-400">Amount</p>
                    <p className="text-white font-medium">{opportunity.amount}</p>
                  </div>
                  <div>
                    <p className="text-secondary-400">Gas Estimate</p>
                    <p className="text-white font-medium">{opportunity.gasEstimate}</p>
                  </div>
                  <div>
                    <p className="text-secondary-400">Net Profit</p>
                    <p className="text-green-500 font-medium">{opportunity.netProfit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Execute Trade</h2>
          <div className="p-6 rounded-lg bg-secondary-800 border border-secondary-700">
            {selectedOpportunity ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-white font-medium">
                    {opportunities.find(o => o.id === selectedOpportunity)?.token}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-400 mb-2">
                    Amount to Trade
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-400">Expected Profit:</span>
                    <span className="text-green-500 font-medium">+2.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-400">Gas Fee:</span>
                    <span className="text-white">~$12.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-400">Net Profit:</span>
                    <span className="text-green-500 font-medium">+$15.50</span>
                  </div>
                </div>

                <button
                  onClick={handleExecute}
                  disabled={isExecuting || !amount}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExecuting ? 'Executing...' : 'Execute Arbitrage'}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-400">
                  Select an opportunity to execute
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
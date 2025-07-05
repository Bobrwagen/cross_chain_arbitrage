import { useState } from 'react'
import { 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings
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
  const [fromToken, setFromToken] = useState('USDC')
  const [toToken, setToToken] = useState('WETH')
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [quote, setQuote] = useState<any>(null)
  const [selectedChain, setSelectedChain] = useState(1)

  const arbitrageOpportunities = [
    {
      id: 1,
      fromChain: 'Ethereum',
      toChain: 'Polygon',
      token: 'USDC/WETH',
      profit: '+2.3%',
      amount: '$1,000',
      gasEstimate: '$15',
    },
    {
      id: 2,
      fromChain: 'Arbitrum',
      toChain: 'Optimism',
      token: 'USDT/DAI',
      profit: '+1.8%',
      amount: '$500',
      gasEstimate: '$8',
    },
    {
      id: 3,
      fromChain: 'Polygon',
      toChain: 'Ethereum',
      token: 'MATIC/USDC',
      profit: '+3.1%',
      amount: '$2,000',
      gasEstimate: '$25',
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

  const executeArbitrage = async (opportunity: any) => {
    setIsLoading(true)
    try {
      // Simulate arbitrage execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(`Arbitrage executed! Profit: ${opportunity.profit}`)
    } catch (error) {
      toast.error('Arbitrage failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Arbitrage Trading</h1>
          <p className="text-secondary-400">Execute cross-chain arbitrage with wallet integration</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="btn-outline flex items-center space-x-2">
            <Settings size={16} />
            <span>Settings</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Swap */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Manual Swap</h2>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoMode"
                checked={isAutoMode}
                onChange={(e) => setIsAutoMode(e.target.checked)}
                className="rounded border-secondary-600 bg-secondary-700"
              />
              <label htmlFor="autoMode" className="text-sm text-secondary-300">
                Auto Mode
              </label>
            </div>
          </div>

          {/* Chain Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Network
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_CHAINS.map((network) => (
                <button
                  key={network.id}
                  onClick={() => setSelectedChain(network.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedChain === network.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                  }`}
                >
                  {network.name}
                </button>
              ))}
            </div>
          </div>

          {/* Token Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                From Token
              </label>
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                className="input"
              >
                {COMMON_TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <button className="p-2 rounded-full bg-secondary-700 hover:bg-secondary-600">
                <ArrowRight size={16} className="text-secondary-300" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                To Token
              </label>
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                className="input"
              >
                {COMMON_TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Slippage Tolerance (%)
              </label>
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(Number(e.target.value))}
                step="0.1"
                min="0.1"
                max="50"
                className="input"
              />
            </div>

            {/* Get Quote Button */}
            <button
              onClick={handleGetQuote}
              disabled={isLoading || !amount}
              className="w-full btn-secondary"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Getting Quote...</span>
                </div>
              ) : (
                'Get Quote'
              )}
            </button>

            {/* Quote Display */}
            {quote && (
              <div className="p-4 rounded-lg bg-secondary-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-secondary-400">Rate</span>
                  <span className="text-sm text-white">1 {fromToken} = {quote.toTokenAmount} {toToken}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-secondary-400">Gas Estimate</span>
                  <span className="text-sm text-white">{quote.gasCost}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-400">Price Impact</span>
                  <span className={`text-sm ${quote.priceImpact > 1 ? 'text-error-500' : 'text-success-500'}`}>
                    {quote.priceImpact}%
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleSwap}
              disabled={isLoading || !amount || !quote}
              className="w-full btn-primary"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Executing...</span>
                </div>
              ) : (
                'Execute Swap'
              )}
            </button>
          </div>
        </div>

        {/* Arbitrage Opportunities */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">Arbitrage Opportunities</h2>
          
          <div className="space-y-4">
            {arbitrageOpportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="p-4 rounded-lg bg-secondary-700 border border-secondary-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={16} className="text-success-500" />
                    <span className="font-medium text-white">{opportunity.token}</span>
                  </div>
                  <span className="text-success-500 font-semibold">{opportunity.profit}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-secondary-400">From:</span>
                    <span className="text-white ml-2">{opportunity.fromChain}</span>
                  </div>
                  <div>
                    <span className="text-secondary-400">To:</span>
                    <span className="text-white ml-2">{opportunity.toChain}</span>
                  </div>
                  <div>
                    <span className="text-secondary-400">Amount:</span>
                    <span className="text-white ml-2">{opportunity.amount}</span>
                  </div>
                  <div>
                    <span className="text-secondary-400">Gas:</span>
                    <span className="text-white ml-2">{opportunity.gasEstimate}</span>
                  </div>
                </div>

                <button
                  onClick={() => executeArbitrage(opportunity)}
                  disabled={isLoading}
                  className="w-full btn-primary"
                >
                  {isLoading ? 'Executing...' : 'Execute Arbitrage'}
                </button>
              </div>
            ))}
          </div>

          {arbitrageOpportunities.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle size={48} className="text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-400">No arbitrage opportunities found</p>
              <p className="text-sm text-secondary-500 mt-2">
                Check back later or try different token pairs
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
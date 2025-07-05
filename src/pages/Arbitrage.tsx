import React, { useState } from 'react'
import { useSpotPrice } from '../hooks/useprices'
import { useAccount, useBalance } from 'wagmi'
import { 
  Search, 
  TrendingUp, 
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function Arbitrage() {
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

  const [selectedOpportunity, setSelectedOpportunity] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [fromToken, setFromToken] = useState('0xEeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') // ETH default
  const [toToken, setToToken] = useState('0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') // USDC default
  const [isExecuting, setIsExecuting] = useState(false)

  // Convert amount to Wei (if ETH, else just pass as is for demo)
  const amountInWei = amount ? (BigInt(Math.floor(Number(amount) * 1e18)).toString()) : ''
  const { data: spotPrice, isLoading: priceLoading, error: priceError } = useSpotPrice({
    fromToken,
    toToken,
    amount: amountInWei,
    chainId: 1,
  })

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
                <TrendingUp className="h-6 w-6 text-primary-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arbitrage Price Interface */}
      <div className="rounded-lg bg-secondary-800 border border-secondary-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">Live Price (1inch API)</h2>
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex flex-col">
            <label className="text-secondary-400 text-sm mb-1">From Token (Address)</label>
            <input
              className="rounded border border-secondary-700 bg-secondary-900 text-white px-3 py-2 text-sm"
              value={fromToken}
              onChange={e => setFromToken(e.target.value)}
              placeholder="From Token Address"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-secondary-400 text-sm mb-1">To Token (Address)</label>
            <input
              className="rounded border border-secondary-700 bg-secondary-900 text-white px-3 py-2 text-sm"
              value={toToken}
              onChange={e => setToToken(e.target.value)}
              placeholder="To Token Address"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-secondary-400 text-sm mb-1">Amount (ETH)</label>
            <input
              className="rounded border border-secondary-700 bg-secondary-900 text-white px-3 py-2 text-sm"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount in ETH"
              type="number"
              min="0"
            />
          </div>
        </div>
        <div className="mt-4">
          {priceLoading ? (
            <span className="text-secondary-400">Loading price...</span>
          ) : priceError ? (
            <span className="text-red-500">Error: {priceError.message}</span>
          ) : spotPrice ? (
            <div className="text-white text-lg">
              1 {spotPrice.fromToken.symbol || 'Token'} ≈ {(Number(spotPrice.toTokenAmount) / 10 ** (spotPrice.toToken.decimals || 6)).toPrecision(6)} {spotPrice.toToken.symbol || 'Token'}
            </div>
          ) : (
            <span className="text-secondary-400">Enter amount and tokens to get price.</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Available Opportunities */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Available Opportunities</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-secondary-700 bg-secondary-800">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-secondary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Opportunities Found</h3>
                <p className="text-secondary-400">
                  Monitor the market for arbitrage opportunities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Execution Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Execute Trade</h2>
          <div className="p-6 rounded-lg bg-secondary-800 border border-secondary-700">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-secondary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Trade Selected</h3>
              <p className="text-secondary-400">
                Select an arbitrage opportunity to execute
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
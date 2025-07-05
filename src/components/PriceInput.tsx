import { useState } from 'react';
import { useSpotPrice } from '../hooks/useprices';

export function PriceInput() {
  const [fromToken, setFromToken] = useState('0xEeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');
  const [toToken, setToToken] = useState('0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
  const [amount, setAmount] = useState('');
  const amountInWei = amount ? (BigInt(Math.floor(Number(amount) * 1e18)).toString()) : '';
  const { data: spotPrice, isLoading, error } = useSpotPrice({
    fromToken,
    toToken,
    amount: amountInWei,
    chainId: 1,
  });

  return (
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
        {isLoading ? (
          <span className="text-secondary-400">Loading price...</span>
        ) : error ? (
          <span className="text-red-500">Error: {error.message}</span>
        ) : spotPrice ? (
          <div className="text-white text-lg">
            1 {spotPrice.fromToken.symbol || 'Token'} ≈ {(Number(spotPrice.toTokenAmount) / 10 ** (spotPrice.toToken.decimals || 6)).toPrecision(6)} {spotPrice.toToken.symbol || 'Token'}
          </div>
        ) : (
          <span className="text-secondary-400">Enter amount and tokens to get price.</span>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';

export function TradeForm({ onTrade }: { onTrade: (params: { fromToken: string; toToken: string; amount: string; chain: string }) => void }) {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [chain, setChain] = useState('Ethereum');

  return (
    <form
      className="flex flex-col md:flex-row gap-4 items-end mb-6"
      onSubmit={e => {
        e.preventDefault();
        onTrade({ fromToken, toToken, amount, chain });
      }}
    >
      <input
        className="rounded border border-secondary-700 bg-secondary-900 text-white px-3 py-2 w-32 text-center"
        value={fromToken}
        onChange={e => setFromToken(e.target.value)}
        placeholder="From Token"
        required
      />
      <input
        className="rounded border border-secondary-700 bg-secondary-900 text-white px-3 py-2 w-32 text-center"
        value={toToken}
        onChange={e => setToToken(e.target.value)}
        placeholder="To Token"
        required
      />
      <input
        className="rounded border border-secondary-700 bg-secondary-900 text-white px-3 py-2 w-32 text-center"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Amount"
        type="number"
        min="0"
        required
      />
      <select
        className="rounded border border-secondary-700 bg-secondary-900 text-white px-3 py-2 w-36 text-center"
        value={chain}
        onChange={e => setChain(e.target.value)}
        required
      >
        <option value="Ethereum">Ethereum</option>
        <option value="Arbitrum">Arbitrum</option>
        <option value="Sui">Sui</option>
        <option value="Solana">Solana</option>
      </select>
      <button
        type="submit"
        className="px-6 py-2 rounded-lg bg-primary-400 text-white font-bold hover:bg-primary-500 transition drop-shadow"
      >
        Trade
      </button>
    </form>
  );
}

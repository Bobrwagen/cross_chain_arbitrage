import React, { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useTradesStore } from '../hooks/useTradesStore';
import { Trade } from '../hooks/useTradesStore';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';

const CreateTrade: React.FC = () => {
  const { addTrade } = useTradesStore();
  const { address } = useAccount();
  const [fromAsset, setFromAsset] = useState('');
  const [fromChain, setFromChain] = useState('');
  const [toAsset, setToAsset] = useState('');
  const [toChain, setToChain] = useState('');
  const [amount, setAmount] = useState('');
  const [expectedProfit, setExpectedProfit] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error('Please connect your wallet to create a trade.');
      return;
    }

    const newTrade: Omit<Trade, 'id' | 'status'> = {
      owner: address,
      from: {
        asset: fromAsset,
        chain: fromChain,
      },
      to: {
        asset: toAsset,
        chain: toChain,
      },
      amount: parseFloat(amount),
      profit: parseFloat(expectedProfit),
      expiry: new Date(expiry).getTime(),
    };

    addTrade(newTrade);

    // Reset form
    setFromAsset('');
    setFromChain('');
    setToAsset('');
    setToChain('');
    setAmount('');
    setExpectedProfit('');
    setExpiry('');

    toast.success('Trade created successfully!');
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Arbitrage Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fromAsset" className="block text-sm font-medium text-gray-700">From Asset</label>
                <Input id="fromAsset" value={fromAsset} onChange={(e) => setFromAsset(e.target.value)} placeholder="e.g., ETH" />
              </div>
              <div>
                <label htmlFor="fromChain" className="block text-sm font-medium text-gray-700">From Chain</label>
                <Input id="fromChain" value={fromChain} onChange={(e) => setFromChain(e.target.value)} placeholder="e.g., Arbitrum" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="toAsset" className="block text-sm font-medium text-gray-700">To Asset</label>
                <Input id="toAsset" value={toAsset} onChange={(e) => setToAsset(e.target.value)} placeholder="e.g., USDC" />
              </div>
              <div>
                <label htmlFor="toChain" className="block text-sm font-medium text-gray-700">To Chain</label>
                <Input id="toChain" value={toChain} onChange={(e) => setToChain(e.target.value)} placeholder="e.g., Polygon" />
              </div>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount to Execute</label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 10.5" />
            </div>

            <div>
              <label htmlFor="expectedProfit" className="block text-sm font-medium text-gray-700">Expected Profit (%)</label>
              <Input id="expectedProfit" type="number" value={expectedProfit} onChange={(e) => setExpectedProfit(e.target.value)} placeholder="e.g., 5" />
            </div>

            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">Expiry Time</label>
              <Input id="expiry" type="datetime-local" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>

            <Button type="submit" className="w-full">Create Trade</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTrade;

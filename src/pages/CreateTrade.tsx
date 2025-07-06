import React, { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useFlow } from '../hooks/useFlow';
import toast from 'react-hot-toast';

const CreateTrade: React.FC = () => {
  const { user, createTrade, isProcessing } = useFlow();
  const [fromAsset, setFromAsset] = useState('');
  const [fromChain, setFromChain] = useState('Flow');
  const [toAsset, setToAsset] = useState('');
  const [toChain, setToChain] = useState('Flow');
  const [amount, setAmount] = useState('');
  const [expectedProfit, setExpectedProfit] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.loggedIn) {
      toast.error('Please connect your Flow wallet to create a trade.');
      return;
    }

    const tradeData = {
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

    try {
      await createTrade(tradeData);
      toast.success('Trade creation transaction sent!');
      // Reset form
      setFromAsset('');
      setFromChain('Flow');
      setToAsset('');
      setToChain('Flow');
      setAmount('');
      setExpectedProfit('');
      setExpiry('');
    } catch (error) {
      toast.error('Failed to send trade creation transaction.');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto bg-secondary-900 border-secondary-700 text-white">
        <CardHeader>
          <CardTitle>Create a New Arbitrage Trade on Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fromAsset" className="block text-sm font-medium text-secondary-300">From Asset</label>
                <Input id="fromAsset" value={fromAsset} onChange={(e) => setFromAsset(e.target.value)} placeholder="e.g., FLOW" />
              </div>
              <div>
                <label htmlFor="fromChain" className="block text-sm font-medium text-secondary-300">From Chain</label>
                <Input id="fromChain" value={fromChain} onChange={(e) => setFromChain(e.target.value)} placeholder="e.g., Flow" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="toAsset" className="block text-sm font-medium text-secondary-300">To Asset</label>
                <Input id="toAsset" value={toAsset} onChange={(e) => setToAsset(e.target.value)} placeholder="e.g., FUSD" />
              </div>
              <div>
                <label htmlFor="toChain" className="block text-sm font-medium text-secondary-300">To Chain</label>
                <Input id="toChain" value={toChain} onChange={(e) => setToChain(e.target.value)} placeholder="e.g., Flow" />
              </div>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-secondary-300">Amount to Execute</label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 100.0" />
            </div>

            <div>
              <label htmlFor="expectedProfit" className="block text-sm font-medium text-secondary-300">Expected Profit (%)</label>
              <Input id="expectedProfit" type="number" value={expectedProfit} onChange={(e) => setExpectedProfit(e.target.value)} placeholder="e.g., 1.5" />
            </div>

            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-secondary-300">Expiry Time</label>
              <Input id="expiry" type="datetime-local" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>

            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Create Trade'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTrade;

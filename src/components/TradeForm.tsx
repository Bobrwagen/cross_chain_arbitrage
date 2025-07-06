import { useState } from 'react';
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

const supportedAssets = ["FLOW", "ETH", "BTC", "USDC", "USDT"];
const supportedChains = ["Flow", "Ethereum"];

export interface TradeFormState {
  fromAsset: string;
  fromChain: string;
  toAsset: string;
  toChain: string;
  amount: string;
  expiry: string;
}

interface TradeFormProps {
  onSubmit: (trade: TradeFormState) => void;
  isProcessing: boolean;
}

export function TradeForm({ onSubmit, isProcessing }: TradeFormProps) {
  const [trade, setTrade] = useState<TradeFormState>({
    fromAsset: 'FLOW',
    fromChain: 'Flow',
    toAsset: 'ETH',
    toChain: 'Ethereum',
    amount: '0.0',
    expiry: new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16), // Default to 1 hour from now
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTrade(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(trade);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-center text-2xl text-white">Create a New Arbitrage Trade on Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="fromAsset" className="text-sm font-medium text-gray-300">From Asset</label>
              <Select name="fromAsset" value={trade.fromAsset} onChange={handleChange}>
                {supportedAssets.map(asset => <option key={asset} value={asset} className="bg-gray-800 text-white">{asset}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="fromChain" className="text-sm font-medium text-gray-300">From Chain</label>
              <Select name="fromChain" value={trade.fromChain} onChange={handleChange}>
                {supportedChains.map(chain => <option key={chain} value={chain} className="bg-gray-800 text-white">{chain}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="toAsset" className="text-sm font-medium text-gray-300">To Asset</label>
              <Select name="toAsset" value={trade.toAsset} onChange={handleChange}>
                {supportedAssets.map(asset => <option key={asset} value={asset} className="bg-gray-800 text-white">{asset}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="toChain" className="text-sm font-medium text-gray-300">To Chain</label>
              <Select name="toChain" value={trade.toChain} onChange={handleChange}>
                {supportedChains.map(chain => <option key={chain} value={chain} className="bg-gray-800 text-white">{chain}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-gray-300">Amount to Execute</label>
              <Input name="amount" type="number" value={trade.amount} onChange={handleChange} placeholder="e.g., 10.5" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="expiry" className="text-sm font-medium text-gray-300">Expiry Time</label>
              <Input name="expiry" type="datetime-local" value={trade.expiry} onChange={handleChange} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Create Trade'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

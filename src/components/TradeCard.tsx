import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import toast from 'react-hot-toast';
import { Trade } from '../hooks/useTradesStore';

interface TradeCardProps {
  trade: Trade;
  onPurchase: (trade: Trade) => void;
  currentUserAddr: string | undefined;
  isPurchasing: boolean;
}

const TradeCard: React.FC<TradeCardProps> = ({ trade, onPurchase, currentUserAddr, isPurchasing }) => {
  const handlePurchase = () => {
    if (!currentUserAddr) {
      toast.error('Please connect your Flow wallet to purchase a trade.');
      return;
    }
    if (trade.owner.toLowerCase() === currentUserAddr.toLowerCase()) {
      toast.error("You cannot purchase your own trade.");
      return;
    }
    onPurchase(trade);
  };

  const isOwner = currentUserAddr && trade.owner.toLowerCase() === currentUserAddr.toLowerCase();

  return (
    <Card className="flex flex-col justify-between h-full bg-secondary-800 border-secondary-700 text-white shadow-lg rounded-lg transition-transform hover:scale-105">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="font-bold text-xl">Trade #{trade.id}</span>
          <Badge variant={trade.status === 'open' ? 'success' : 'destructive'}>{trade.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-secondary-400">From</p>
          <p className="font-semibold text-lg">{trade.from.asset} on {trade.from.chain}</p>
        </div>
        <div>
          <p className="text-sm text-secondary-400">To</p>
          <p className="font-semibold text-lg">{trade.to.asset} on {trade.to.chain}</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-sm text-secondary-400">Amount</p>
            <p className="font-semibold text-lg">{trade.amount.toLocaleString()}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-secondary-400">Expires</p>
          <p className="font-semibold">{new Date(trade.expiry).toLocaleString()}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handlePurchase} disabled={trade.status !== 'open' || isOwner || isPurchasing} className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-secondary-600">
          {isOwner ? 'Your Listing' : isPurchasing ? 'Processing...' : 'Purchase Trade'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TradeCard;

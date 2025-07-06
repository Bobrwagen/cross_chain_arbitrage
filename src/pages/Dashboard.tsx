import { useAccount } from 'wagmi';
import { useTradesStore, Trade } from '../hooks/useTradesStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const TradeList: React.FC<{ trades: Trade[]; title: string }> = ({ trades, title }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {trades.length > 0 ? (
        <ul className="space-y-4">
          {trades.map((trade) => (
            <li key={trade.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  {trade.from.asset} → {trade.to.asset}
                </p>
                <p className="text-sm text-gray-500">
                  {trade.from.chain} to {trade.to.chain}
                </p>
                <p className="text-sm">
                  Amount: {trade.amount} | Profit: {trade.profit}%
                </p>
              </div>
              <Badge
                variant={
                  trade.status === 'open'
                    ? 'default'
                    : trade.status === 'purchased'
                    ? 'secondary'
                    : 'destructive'
                }
              >
                {trade.status}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p>No trades found.</p>
      )}
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { address } = useAccount();
  const { trades } = useTradesStore();

  if (!address) {
    return (
      <div className="p-8 text-center">
        <p>Please connect your wallet to view your dashboard.</p>
      </div>
    );
  }

  const tradesCreatedByMe = trades.filter((trade) => trade.owner === address);
  const tradesPurchasedByMe = trades.filter((trade) => trade.purchaser === address);
  const myActiveTrades = trades.filter((trade) => trade.owner === address && trade.status === 'open');

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">My Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <TradeList trades={myActiveTrades} title="My Active Listings" />
          <TradeList trades={tradesCreatedByMe} title="All Trades I Created" />
        </div>
        <TradeList trades={tradesPurchasedByMe} title="Trades I Purchased" />
      </div>
    </div>
  );
}
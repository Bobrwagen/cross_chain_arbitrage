import React from 'react';
import { TradeForm, TradeFormState } from '../components/TradeForm';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useFlow } from '../hooks/useFlow';

const CreateTrade: React.FC = () => {
  const { createTrade, isProcessing } = useFlow();

  const handleSubmit = async (trade: TradeFormState) => {
    try {
      // Convert the UI form to the format expected by the Flow contract
      // Since we removed profit, we'll use a 1:1 ratio for now (toAmount = fromAmount)
      const calculatedToAmount = parseFloat(trade.amount).toFixed(8);
      
      await createTrade({
        fromToken: trade.fromAsset,
        fromAmount: trade.amount,
        toToken: trade.toAsset,
        toAmount: calculatedToAmount,
      });
    } catch (error) {
      console.error('Failed to create trade:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto bg-secondary-900 border-secondary-700 text-white">
        <CardHeader>
          <CardTitle>Create a New Arbitrage Trade on Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <TradeForm onSubmit={handleSubmit} isProcessing={isProcessing} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTrade;

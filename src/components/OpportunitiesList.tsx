import { Opportunity } from '../hooks/useSocketEvents';

export function OpportunitiesList({
  opportunities,
  onExecute,
  isExecuting,
  executedIdx,
}: {
  opportunities: Opportunity[];
  onExecute: (idx: number) => void;
  isExecuting: boolean;
  executedIdx: number | null;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Available Opportunities</h2>
      {opportunities.length === 0 ? (
        <div className="p-4 rounded-lg border border-secondary-700 bg-secondary-800 text-center text-secondary-400">
          No Opportunities Found
        </div>
      ) : (
        <ul className="space-y-3">
          {opportunities.map((opp, i) => (
            <li
              key={i}
              className={`flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-secondary-800 border rounded-lg`}
            >
              <div className="flex-1">
                <div className="font-bold text-white">{opp.buyOn} → {opp.sellOn}</div>
                <div className="text-secondary-400 text-sm">Profit: ${opp.expectedProfitUsd?.toFixed(2)}</div>
                <div className="text-secondary-400 text-xs">Latency: {opp.latencyMs} ms</div>
              </div>
              <button
                className="mt-3 md:mt-0 px-4 py-2 rounded bg-primary-500 text-white font-semibold disabled:opacity-50"
                disabled={isExecuting && executedIdx === i}
                onClick={() => onExecute(i)}
              >
                {isExecuting && executedIdx === i ? 'Executing...' : 'Execute'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

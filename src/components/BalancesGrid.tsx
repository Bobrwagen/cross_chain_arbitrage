import { useBalances } from '../hooks/useBalances';

export function BalancesGrid() {
  const balances = useBalances();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {balances.map((chain) => (
        <div key={chain.name} className="rounded-lg bg-secondary-800 p-6 border border-secondary-700 flex flex-col items-center">
          <span className="text-base font-medium text-secondary-300 mb-2">{chain.name}</span>
          <span className="text-2xl font-bold text-white">{chain.balance}</span>
        </div>
      ))}
    </div>
  );
}

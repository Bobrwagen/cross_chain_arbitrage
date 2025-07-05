import React, { useState, useCallback } from 'react';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { useTradesStore } from '../hooks/useTradesStore';
import { BalancesGrid } from '../components/BalancesGrid';

// --- Arbitrage Page ---
export default function Arbitrage() {

// --- Types ---
type Opportunity = {
  id: string;
  optionSymbol: string;
  strike: number;
  expiry: string;
  iv: number;
  delta: number;
  gamma: number;
  buyOn: string;
  buyChain: string;
  hedgeOn: string;
  hedgeChain: string;
  bridgeNeeded: boolean;
  bridgeTo?: string;
  bridgeToChain?: string;
  expectedProfitUsd: number;
};

// --- Stepper ---
const Stepper = ({ steps, currentStep }: { steps: string[]; currentStep: number }) => (
  <ol className="flex flex-col gap-2 my-4">
    {steps.map((step, idx) => (
      <li key={idx} className={`flex items-center gap-2 ${idx === currentStep ? 'font-bold text-primary-400' : idx < currentStep ? 'text-green-400' : 'text-secondary-400'}`}> 
        <span className={`w-6 h-6 flex items-center justify-center rounded-full border-2 ${idx < currentStep ? 'border-green-400 bg-green-400 text-white' : idx === currentStep ? 'border-primary-400 bg-primary-400 text-white' : 'border-secondary-400 bg-secondary-900 text-secondary-400'}`}>{idx + 1}</span>
        <span>{step}</span>
      </li>
    ))}
  </ol>
);

// --- Execution Modal ---
const ExecutionModal = ({
  open,
  onClose,
  opportunity,
  steps,
  currentStep,
  beforeAfter,
  logs,
  onExecute,
  executing
}: {
  open: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  steps: string[];
  currentStep: number;
  beforeAfter: { before: string; after: string };
  logs: string[];
  onExecute: () => void;
  executing: boolean;
}) => {
  if (!open || !opportunity) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-secondary-900 rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-secondary-400 hover:text-white" onClick={onClose} disabled={executing}>&times;</button>
        <h2 className="text-xl font-bold text-white mb-2">Execute Arbitrage</h2>
        <Stepper steps={steps} currentStep={currentStep} />
        <div className="bg-secondary-800 rounded p-3 mb-2">
          <div className="text-sm text-secondary-400">Before:</div>
          <div className="text-white font-mono">{beforeAfter.before}</div>
          <div className="text-sm text-secondary-400 mt-2">After:</div>
          <div className="text-white font-mono">{beforeAfter.after}</div>
        </div>
        <div className="text-xs text-secondary-400 mb-2">Logs:</div>
        <div className="bg-secondary-950 rounded p-2 mb-2 max-h-24 overflow-y-auto text-xs text-secondary-300">
          {logs.length === 0 ? <div>No logs yet.</div> : logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
        <button
          className={`w-full py-2 rounded bg-primary-500 text-white font-bold mt-2 ${executing ? 'opacity-60 cursor-not-allowed' : ''}`}
          onClick={onExecute}
          disabled={executing}
        >
          {executing ? 'Executing...' : 'Start Execution'}
        </button>
      </div>
    </div>
  );
};

// ...existing code...
  // Opportunities state (dummy + user-created)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: '1',
      optionSymbol: 'ETH-2025-07-25-2000C',
      strike: 2000,
      expiry: '2025-07-25',
      iv: 0.45,
      delta: 0.55,
      gamma: 0.02,
      buyOn: 'Lyra',
      buyChain: 'Sepolia',
      hedgeOn: 'Uniswap',
      hedgeChain: 'Arbitrum',
      bridgeNeeded: true,
      bridgeTo: 'Ethereum',
      bridgeToChain: 'Sui',
      expectedProfitUsd: 75,
    },
    {
      id: '2',
      optionSymbol: 'ETH-2025-07-25-1800P',
      strike: 1800,
      expiry: '2025-07-25',
      iv: 0.48,
      delta: -0.35,
      gamma: 0.03,
      buyOn: 'Lyra',
      buyChain: 'Sepolia',
      hedgeOn: 'Uniswap',
      hedgeChain: 'Arbitrum',
      bridgeNeeded: false,
      expectedProfitUsd: 42,
    },
  ]);

  // Socket.IO: Merge live opportunities
  const handleSocketOpportunity = useCallback((data: any) => {
    // Accept both array and single object
    const newOpps = Array.isArray(data) ? data : [data];
    setOpportunities(prev => {
      // Only add if not already present (by id or optionSymbol)
      const existingIds = new Set(prev.map(o => o.id || o.optionSymbol));
      const merged = [...prev];
      newOpps.forEach(opp => {
        // Robust mapping for backend events
        const mapped = {
          id: opp.id || opp.optionSymbol || Math.random().toString(36).slice(2),
          optionSymbol: opp.optionSymbol || opp.buyOn + '-' + (opp.strike || '') + '-' + (opp.expiry || ''),
          strike: opp.strike ?? 2000,
          expiry: opp.expiry ?? '2025-07-25',
          iv: opp.iv ?? 0.4,
          delta: opp.delta ?? 0.5,
          gamma: opp.gamma ?? 0.02,
          buyOn: opp.buyOn || 'Lyra',
          buyChain: opp.buyChain || 'Sepolia',
          hedgeOn: opp.hedgeOn || opp.sellOn || 'Uniswap',
          hedgeChain: opp.hedgeChain || 'Arbitrum',
          bridgeNeeded: opp.bridgeNeeded ?? false,
          bridgeTo: opp.bridgeTo || '',
          bridgeToChain: opp.bridgeToChain || '',
          expectedProfitUsd: opp.expectedProfitUsd ?? 42,
        };
        if (!existingIds.has(mapped.id)) {
          merged.unshift(mapped);
        }
      });
      return merged;
    });
  }, []);

  const handleSocketLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, msg]);
  }, []);

  useSocketEvents(handleSocketOpportunity, handleSocketLog);

  // State for new custom opportunity form
  const [showCreate, setShowCreate] = useState(false);
  const chainOptions = ['Sepolia', 'Arbitrum', 'Sui', 'Solana'];
  const [newOpp, setNewOpp] = useState<Omit<Opportunity, 'id' | 'expectedProfitUsd'>>({
    optionSymbol: '',
    strike: 2000,
    expiry: '',
    iv: 0.4,
    delta: 0,
    gamma: 0.02,
    buyOn: '',
    buyChain: chainOptions[0],
    hedgeOn: '',
    hedgeChain: chainOptions[1],
    bridgeNeeded: false,
    bridgeTo: '',
    bridgeToChain: chainOptions[2],
  });

  function calculateProfit(strike: number, iv: number, delta: number, fees = 2): number {
    // Simple placeholder formula
    return Math.max(0, Math.round((strike * iv * Math.abs(delta) * 0.01 - fees) * 100) / 100);
  }

  function handleCreateOpportunity(e: React.FormEvent) {
    e.preventDefault();
    const profit = calculateProfit(newOpp.strike, newOpp.iv, newOpp.delta);
    setOpportunities((prev) => [
      {
        id: `${Date.now()}`,
        ...newOpp,
        bridgeTo: newOpp.bridgeNeeded ? newOpp.bridgeTo : undefined,
        bridgeToChain: newOpp.bridgeNeeded ? newOpp.bridgeToChain : undefined,
        expectedProfitUsd: profit,
      },
      ...prev,
    ]);
    setShowCreate(false);
    setNewOpp({
      optionSymbol: '',
      strike: 2000,
      expiry: '',
      iv: 0.4,
      delta: 0,
      gamma: 0.02,
      buyOn: '',
      buyChain: chainOptions[0],
      hedgeOn: '',
      hedgeChain: chainOptions[1],
      bridgeNeeded: false,
      bridgeTo: '',
      bridgeToChain: chainOptions[2],
    });
  }

  // Execution modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpportunity, setModalOpportunity] = useState<Opportunity | null>(null);
  const [execStepIdx, setExecStepIdx] = useState(0);
  const [execRunning, setExecRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Steps for modal
  const stepsForModal = modalOpportunity
    ? [
        `Buy option on ${modalOpportunity.buyOn}`,
        `Hedge spot on ${modalOpportunity.hedgeOn}`,
        ...(modalOpportunity.bridgeNeeded ? [`Bridge profit to ${modalOpportunity.bridgeTo || 'target chain'}`] : []),
      ]
    : [];

  // Dummy before/after balances
  const beforeAfter = { before: 'ETH: 1.00 | USDC: 0.00', after: 'ETH: 0.90 | USDC: 5.00 (profit)' };

  // Simulate step-by-step execution and add trade to global store
  const addTrade = useTradesStore((s) => s.addTrade);
  const handleExecute = () => {
    if (!modalOpportunity) return;
    setExecRunning(true);
    setLogs([]);
    let i = 0;
    function nextStep() {
      if (!modalOpportunity) return;
      setExecStepIdx(i);
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Starting: ${stepsForModal[i]}`]);
      setTimeout(() => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Success: ${stepsForModal[i]}`]);
        i++;
        if (i < stepsForModal.length) {
          nextStep();
        } else {
          setExecRunning(false);
          setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Arbitrage complete!`]);
          // Add trade to global store
          addTrade({
            id: `${modalOpportunity.id}-${Date.now()}`,
            timestamp: Date.now(),
            optionSymbol: modalOpportunity.optionSymbol,
            profitUsd: modalOpportunity.expectedProfitUsd,
            buyOn: modalOpportunity.buyOn,
            hedgeOn: modalOpportunity.hedgeOn,
            bridgeTo: modalOpportunity.bridgeNeeded ? modalOpportunity.bridgeTo : undefined,
            status: 'executed',
          });
          setTimeout(() => setModalOpen(false), 1000);
        }
      }, 1000);
    }
    nextStep();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">Arbitrage Dashboard</h1>
      {/* Show ETH balance (Sepolia as ETH) */}
      <BalancesGrid />
      {/* Opportunities Block */}
      <div className="w-full max-w-3xl mx-auto mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Opportunities</h2>
          <button
            className="px-4 py-2 rounded bg-primary-500 text-white font-semibold hover:bg-primary-600"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? 'Cancel' : 'Create Opportunity'}
          </button>
        </div>
        {showCreate && (
          <form className="bg-secondary-800 border border-secondary-700 rounded-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateOpportunity}>
            <div>
              <label className="block text-secondary-400 text-xs mb-1">Option Symbol</label>
              <input className="w-full rounded bg-secondary-900 text-white p-2 mb-2" required value={newOpp.optionSymbol} onChange={e => setNewOpp(o => ({ ...o, optionSymbol: e.target.value }))} />
              <label className="block text-secondary-400 text-xs mb-1">Strike</label>
              <input className="w-full rounded bg-secondary-900 text-white p-2 mb-2" type="number" required value={newOpp.strike} onChange={e => setNewOpp(o => ({ ...o, strike: Number(e.target.value) }))} />
              <label className="block text-secondary-400 text-xs mb-1">Expiry</label>
              <input className="w-full rounded bg-secondary-900 text-white p-2 mb-2" type="date" required value={newOpp.expiry} onChange={e => setNewOpp(o => ({ ...o, expiry: e.target.value }))} />
              <label className="block text-secondary-400 text-xs mb-1">IV</label>
              <input className="w-full rounded bg-secondary-900 text-white p-2 mb-2" type="number" step="0.01" required value={newOpp.iv} onChange={e => setNewOpp(o => ({ ...o, iv: Number(e.target.value) }))} />
              <label className="block text-secondary-400 text-xs mb-1">Delta</label>
              <input className="w-full rounded bg-secondary-900 text-white p-2 mb-2" type="number" step="0.01" required value={newOpp.delta} onChange={e => setNewOpp(o => ({ ...o, delta: Number(e.target.value) }))} />
              <label className="block text-secondary-400 text-xs mb-1">Gamma</label>
              <input className="w-full rounded bg-secondary-900 text-white p-2 mb-2" type="number" step="0.01" required value={newOpp.gamma} onChange={e => setNewOpp(o => ({ ...o, gamma: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-secondary-400 text-xs mb-1">Buy On</label>
              <input className="w-full rounded bg-secondary-900 text-white p-2 mb-2" required value={newOpp.buyOn} onChange={e => setNewOpp(o => ({ ...o, buyOn: e.target.value }))} />
              <label className="block text-secondary-400 text-xs mb-1">Buy Chain</label>
              <select className="w-full rounded bg-secondary-900 text-white p-2 mb-2" value={newOpp.buyChain} onChange={e => setNewOpp(o => ({ ...o, buyChain: e.target.value }))}>
                {chainOptions.map(chain => <option key={chain} value={chain}>{chain}</option>)}
              </select>
              <label className="block text-secondary-400 text-xs mb-1">Hedge On</label>
              <input className="w-full rounded bg-secondary-900 text-white p-2 mb-2" required value={newOpp.hedgeOn} onChange={e => setNewOpp(o => ({ ...o, hedgeOn: e.target.value }))} />
              <label className="block text-secondary-400 text-xs mb-1">Hedge Chain</label>
              <select className="w-full rounded bg-secondary-900 text-white p-2 mb-2" value={newOpp.hedgeChain} onChange={e => setNewOpp(o => ({ ...o, hedgeChain: e.target.value }))}>
                {chainOptions.map(chain => <option key={chain} value={chain}>{chain}</option>)}
              </select>
              <label className="block text-secondary-400 text-xs mb-1">Bridge Needed</label>
              <input type="checkbox" className="mr-2" checked={newOpp.bridgeNeeded} onChange={e => setNewOpp(o => ({ ...o, bridgeNeeded: e.target.checked }))} />
              <span className="text-secondary-400 text-xs">If checked, specify Bridge To</span>
              {newOpp.bridgeNeeded && (
                <>
                  <input className="w-full rounded bg-secondary-900 text-white p-2 mb-2 mt-2" placeholder="Bridge To" value={newOpp.bridgeTo} onChange={e => setNewOpp(o => ({ ...o, bridgeTo: e.target.value }))} />
                  <label className="block text-secondary-400 text-xs mb-1">Bridge To Chain</label>
                  <select className="w-full rounded bg-secondary-900 text-white p-2 mb-2" value={newOpp.bridgeToChain} onChange={e => setNewOpp(o => ({ ...o, bridgeToChain: e.target.value }))}>
                    {chainOptions.map(chain => <option key={chain} value={chain}>{chain}</option>)}
                  </select>
                </>
              )}
              <div className="mt-4 text-secondary-400 text-xs">Expected profit will be calculated automatically.</div>
              <button type="submit" className="mt-4 w-full py-2 rounded bg-green-600 text-white font-bold">Add Opportunity</button>
            </div>
          </form>
        )}
        <div className="grid gap-6">
          {opportunities.map((opp) => (
            <div key={opp.id} className="bg-secondary-800 border border-secondary-700 rounded-lg p-6 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="text-lg font-bold text-white">Profit Potential: <span className="text-green-400">${opp.expectedProfitUsd}</span> USD</div>
                  <div className="text-secondary-300 text-sm mt-1">Option: <span className="font-semibold">{opp.optionSymbol}</span> | Strike: {opp.strike} | Expiry: {opp.expiry}</div>
                  <div className="text-secondary-300 text-sm">IV: {opp.iv} | Delta: {opp.delta} | Gamma: {opp.gamma}</div>
                </div>
                <button
                  className="px-6 py-2 rounded bg-primary-500 text-white font-bold text-lg hover:bg-primary-600 mt-2 md:mt-0"
                  onClick={() => {
                    setModalOpportunity(opp);
                    setModalOpen(true);
                    setExecStepIdx(0);
                    setLogs([]);
                  }}
                >
                  Execute Arbitrage
                </button>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-secondary-400 text-sm">Step 1: Buy option on {opp.buyOn}</span>
                <span className="text-secondary-400 text-sm">Step 2: Hedge spot on {opp.hedgeOn}</span>
                {opp.bridgeNeeded && (
                  <span className="text-secondary-400 text-sm">Step 3: Bridge profit to {opp.bridgeTo || 'target chain'}</span>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-4 mt-2">
                <div className="flex-1">
                  <div className="text-secondary-400 text-xs mb-1">Funds Impact</div>
                  <table className="w-full text-xs text-left bg-secondary-900 rounded">
                    <thead>
                      <tr className="text-secondary-400">
                        <th></th>
                        <th>ETH</th>
                        <th>USDC</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-secondary-400">Before</td>
                        <td>1.00</td>
                        <td>0.00</td>
                      </tr>
                      <tr>
                        <td className="text-secondary-400">After</td>
                        <td>0.90</td>
                        <td>5.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex-1">
                  <div className="text-secondary-400 text-xs mb-1">Execution Details</div>
                  <div className="text-secondary-400 text-xs">Risk: Placeholder</div>
                  <div className="text-secondary-400 text-xs">Latency: 1.2s</div>
                  <div className="text-secondary-400 text-xs">Fees: $2.00</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Execution Modal */}
      <ExecutionModal
        open={modalOpen && !!modalOpportunity}
        onClose={() => { if (!execRunning) setModalOpen(false); }}
        opportunity={modalOpportunity}
        onExecute={handleExecute}
        executing={execRunning}
        currentStep={execStepIdx}
        steps={stepsForModal}
        beforeAfter={beforeAfter}
        logs={logs}
      />
      {/* Logs Panel */}
      <div className="w-full max-w-3xl mx-auto mt-8">
        <h2 className="text-lg font-semibold text-white mb-2">Logs</h2>
        <div className="rounded-lg bg-secondary-800 border border-secondary-700 p-4 max-h-64 overflow-y-auto text-sm text-secondary-400 space-y-1">
          {logs.length === 0 ? (
            <div className="text-center text-secondary-500">No logs yet.</div>
          ) : (
            logs.map((log, idx) => <div key={idx}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
}

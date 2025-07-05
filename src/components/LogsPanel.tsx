import React from 'react';

export function LogsPanel({ logs }: { logs: string[] }) {
  return (
    <div className="rounded-lg bg-secondary-800 border border-secondary-700 p-4 max-h-64 overflow-y-auto text-sm text-secondary-400 space-y-1">
      {logs.length === 0 ? (
        <div className="text-center text-secondary-500">No logs yet.</div>
      ) : (
        logs.map((log, idx) => <div key={idx}>{log}</div>)
      )}
    </div>
  );
}

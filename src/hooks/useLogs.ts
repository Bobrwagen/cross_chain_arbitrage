import { useState } from 'react';

export function useLogs(limit = 50) {
  const [logs, setLogs] = useState<string[]>([]);

  function addLog(log: string) {
    setLogs(prev => {
      const next = [log, ...prev];
      return next.length > limit ? next.slice(0, limit) : next;
    });
  }

  return { logs, addLog };
}

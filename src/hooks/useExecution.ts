import { useState } from 'react';

export function useExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executedIdx, setExecutedIdx] = useState<number | null>(null);

  function execute(idx: number, cb?: () => void) {
    setIsExecuting(true);
    setExecutedIdx(idx);
    setTimeout(() => {
      setIsExecuting(false);
      setExecutedIdx(null);
      if (cb) cb();
    }, 1500);
  }

  return { isExecuting, executedIdx, execute };
}

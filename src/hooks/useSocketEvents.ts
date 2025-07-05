import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export type Opportunity = {
  buyOn: string;
  sellOn: string;
  expectedProfitUsd: number;
  latencyMs: number;
};

export function useSocketEvents(onOpportunity: (data: Opportunity[] | Opportunity) => void, onLog: (msg: string) => void) {
  useEffect(() => {
    const socket: Socket = io('http://localhost:3000');
    socket.on('arb-opportunity', (data: Opportunity[] | Opportunity) => {
      onLog(`[${new Date().toLocaleTimeString()}] Received opportunity`);
      onOpportunity(data);
    });
    return () => { socket.disconnect(); };
  }, [onOpportunity, onLog]);
}

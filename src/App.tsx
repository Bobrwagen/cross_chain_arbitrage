import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CreateTrade from './pages/CreateTrade';
import Arbitrage from './pages/Arbitrage'
import Portfolio from './pages/Portfolio'
import Settings from './pages/Settings'
import { useFlow } from './hooks/useFlow';

export default function App() {
  const { user, logIn, logOut, refreshTrades } = useFlow();

  // Fetch trades on initial load
  useEffect(() => {
    refreshTrades();
  }, []);

  // Poll for new trades every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('Polling for trades...');
      refreshTrades();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [refreshTrades]);


  return (
    <Layout>
      <div className="flex justify-end p-4 items-center space-x-4">
        <ConnectButton />
        {user?.loggedIn ? (
          <div className="flex items-center space-x-2">
            <span className="text-white font-mono bg-secondary-700 px-3 py-1 rounded-md">
              {user.addr}
            </span>
            <button
              onClick={logOut}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Log Out
            </button>
          </div>
        ) : (
          <button
            onClick={logIn}
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Connect Flow Wallet
          </button>
        )}
      </div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateTrade />} />
        <Route path="/arbitrage" element={<Arbitrage />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}
import { Routes, Route } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CreateTrade from './pages/CreateTrade';
import Arbitrage from './pages/Arbitrage'
import Portfolio from './pages/Portfolio'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Layout>
      <div className="flex justify-end p-4">
        <ConnectButton />
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
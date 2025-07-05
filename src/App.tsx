import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { WagmiConfig, createConfig, mainnet } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Arbitrage from './pages/Arbitrage'
import Portfolio from './pages/Portfolio'
import Settings from './pages/Settings'

// Define Arbitrum chain manually since it's not exported
const arbitrum = {
  id: 42161,
  name: 'Arbitrum One',
  network: 'arbitrum',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://arb1.arbitrum.io/rpc'] },
    public: { http: ['https://arb1.arbitrum.io/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Arbiscan', url: 'https://arbiscan.io' },
  },
} as const;

const { wallets } = getDefaultWallets({
  appName: 'Cross Chain Arbitrage',
  projectId: 'demo-project-id', // This is a demo ID - replace with real one for production
  chains: [mainnet, arbitrum],
});

const connectors = connectorsForWallets([...wallets]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

function App() {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={[mainnet, arbitrum]}>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/arbitrage" element={<Arbitrage />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default App 
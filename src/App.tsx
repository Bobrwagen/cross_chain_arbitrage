import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { WagmiConfig, createConfig, configureChains, sepolia } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Arbitrage from './pages/Arbitrage'
import Portfolio from './pages/Portfolio'
import Settings from './pages/Settings'

// Define Arbitrum and Sepolia chains
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

const sepoliaChain = {
  ...sepolia,
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.org'] },
    public: { http: ['https://rpc.sepolia.org'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
};

const { chains, publicClient } = configureChains(
  [sepoliaChain, arbitrum],
  [publicProvider()]
);
const { wallets } = getDefaultWallets({
  appName: 'Cross Chain Arbitrage',
  projectId: 'demo-project-id',
  chains,
});

const connectors = connectorsForWallets([...wallets]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function App() {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains}>
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
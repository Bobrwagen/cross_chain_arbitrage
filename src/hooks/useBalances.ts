import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { createPublicClient, http, formatEther } from 'viem';

const sepoliaClient = createPublicClient({
  chain: {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://rpc.sepolia.org'] },
      public: { http: ['https://rpc.sepolia.org'] },
    },
  },
  transport: http(),
});
const arbitrumClient = createPublicClient({
  chain: {
    id: 42161,
    name: 'Arbitrum One',
    network: 'arbitrum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://arb1.arbitrum.io/rpc'] },
      public: { http: ['https://arb1.arbitrum.io/rpc'] },
    },
  },
  transport: http(),
});

export function useBalances() {
  const { address, isConnected } = useAccount();
  const [ethBalance, setEthBalance] = useState<string>('0.0');
  const [arbBalance, setArbBalance] = useState<string>('0.0');

  useEffect(() => {
    if (isConnected && address) {
      sepoliaClient.getBalance({ address }).then((bal) => setEthBalance(formatEther(bal)));
      arbitrumClient.getBalance({ address }).then((bal) => setArbBalance(formatEther(bal)));
    } else {
      setEthBalance('0.0');
      setArbBalance('0.0');
    }
  }, [isConnected, address]);

  const suiBalance = isConnected ? '0.0 SUI' : 'Connect wallet to display amount';
  const solanaBalance = isConnected ? '0.0 SOL' : 'Connect wallet to display amount';

  return [
    { name: 'Ethereum', balance: isConnected ? `${ethBalance} ETH` : 'Connect wallet to display amount' },
    { name: 'Arbitrum', balance: isConnected ? `${arbBalance} ETH` : 'Connect wallet to display amount' },
    { name: 'Sui', balance: suiBalance },
    { name: 'Solana', balance: solanaBalance },
  ];
}

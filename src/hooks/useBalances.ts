import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { createPublicClient, http, formatUnits, erc20Abi, Address } from 'viem';
import { CHAINS, Chain, Token } from '../lib/tokens';

export interface Balance extends Token {
  balance: string;
  formatted: string;
  chain: Chain;
}

export function useBalances() {
  const { address, isConnected } = useAccount();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !address) {
        setBalances([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const allBalances: Balance[] = [];

      for (const chain of Object.values(CHAINS)) {
        try {
          const client = createPublicClient({
            chain: chain.wagmiChain,
            transport: http(),
          });

          // Fetch native balance
          const nativeBalance = await client.getBalance({ address });
          allBalances.push({
            name: chain.wagmiChain.nativeCurrency.name,
            symbol: chain.wagmiChain.nativeCurrency.symbol,
            decimals: chain.wagmiChain.nativeCurrency.decimals,
            logoURI: chain.logoURI,
            balance: nativeBalance.toString(),
            formatted: `${formatUnits(nativeBalance, chain.wagmiChain.nativeCurrency.decimals)} ${
              chain.wagmiChain.nativeCurrency.symbol
            }`,
            chain,
          });

          // Fetch token balances
          const tokenContracts = Object.values(chain.tokens).map((token) => ({
            address: token.address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address as Address],
          }));

          if (tokenContracts.length > 0) {
            const results = await client.multicall({ contracts: tokenContracts, allowFailure: true });

            Object.values(chain.tokens).forEach((token, i) => {
              const result = results[i];
              if (result.status === 'success') {
                const balance = result.result as bigint;
                if (balance > 0) {
                  allBalances.push({
                    ...token,
                    balance: balance.toString(),
                    formatted: `${formatUnits(balance, token.decimals)} ${token.symbol}`,
                    chain,
                  });
                }
              }
            });
          }
        } catch (error) {
          console.error(`Failed to fetch balances for ${chain.name}`, error);
        }
      }

      setBalances(allBalances);
      setLoading(false);
    };

    fetchBalances();
  }, [isConnected, address]);

  return { balances, loading };
}

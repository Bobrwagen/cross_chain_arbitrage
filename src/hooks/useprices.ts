import { useQuery } from '@tanstack/react-query'

interface OneInchQuoteResponse {
  fromToken: any
  toToken: any
  fromTokenAmount: string
  toTokenAmount: string
  protocols: any[]
}

export const useSpotPrice = ({
  fromToken,
  toToken,
  amount,
  chainId = 1,
}: {
  fromToken: string
  toToken: string
  amount: string
  chainId?: number
}) =>
  useQuery<OneInchQuoteResponse>({
    queryKey: ['spot-price', fromToken, toToken, amount, chainId],
    queryFn: async () => {
      const url = `https://api.1inch.io/v5.2/${chainId}/quote?fromTokenAddress=${fromToken}&toTokenAddress=${toToken}&amount=${amount}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch price');
      return res.json();
    },
    enabled: !!fromToken && !!toToken && !!amount,
  })


import { arbitrum, mainnet, optimism, polygon, base, avalanche } from 'wagmi/chains';

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

export interface Chain {
  id: number;
  name: string;
  logoURI: string;
  wagmiChain: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  tokens: Record<string, Token & { address: `0x${string}` }>;
}

export const TOKENS: Record<string, Token> = {
  WETH: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    logoURI: 'https://token-icons.s3.amazonaws.com/eth.svg',
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    logoURI: 'https://token-icons.s3.amazonaws.com/usdc.svg',
  },
  WBTC: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    decimals: 8,
    logoURI: 'https://token-icons.s3.amazonaws.com/wbtc.svg',
  },
  DAI: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    logoURI: 'https://token-icons.s3.amazonaws.com/dai.svg',
  },
};

export const CHAINS: Record<string, Chain> = {
  [mainnet.id]: {
    id: mainnet.id,
    name: 'Ethereum',
    logoURI: 'https://token-icons.s3.amazonaws.com/eth.svg',
    wagmiChain: mainnet,
    tokens: {
      WETH: { ...TOKENS.WETH, address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
      USDC: { ...TOKENS.USDC, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
      WBTC: { ...TOKENS.WBTC, address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
      DAI: { ...TOKENS.DAI, address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
    },
  },
  [arbitrum.id]: {
    id: arbitrum.id,
    name: 'Arbitrum',
    logoURI: 'https://token-icons.s3.amazonaws.com/arbitrum.svg',
    wagmiChain: arbitrum,
    tokens: {
      WETH: { ...TOKENS.WETH, address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' },
      USDC: { ...TOKENS.USDC, address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
      WBTC: { ...TOKENS.WBTC, address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefc5B0f' },
      DAI: { ...TOKENS.DAI, address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' },
    },
  },
  [optimism.id]: {
    id: optimism.id,
    name: 'Optimism',
    logoURI: 'https://token-icons.s3.amazonaws.com/optimism.svg',
    wagmiChain: optimism,
    tokens: {
      WETH: { ...TOKENS.WETH, address: '0x4200000000000000000000000000000000000006' },
      USDC: { ...TOKENS.USDC, address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' },
      WBTC: { ...TOKENS.WBTC, address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095' },
      DAI: { ...TOKENS.DAI, address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' },
    },
  },
  [polygon.id]: {
    id: polygon.id,
    name: 'Polygon',
    logoURI: 'https://token-icons.s3.amazonaws.com/polygon.svg',
    wagmiChain: polygon,
    tokens: {
      WETH: { ...TOKENS.WETH, address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619' },
      USDC: { ...TOKENS.USDC, address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
      WBTC: { ...TOKENS.WBTC, address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6' },
      DAI: { ...TOKENS.DAI, address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' },
    },
  },
  [base.id]: {
    id: base.id,
    name: 'Base',
    logoURI: 'https://token-icons.s3.amazonaws.com/base.svg',
    wagmiChain: base,
    tokens: {
      WETH: { ...TOKENS.WETH, address: '0x4200000000000000000000000000000000000006' },
      USDC: { ...TOKENS.USDC, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
      // WBTC not officially available on Base, using a bridged version
      WBTC: { ...TOKENS.WBTC, address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefc5B0f' }, // This is Arbitrum's WBTC, for demo
      DAI: { ...TOKENS.DAI, address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' },
    },
  },
  [avalanche.id]: {
    id: avalanche.id,
    name: 'Avalanche',
    logoURI: 'https://token-icons.s3.amazonaws.com/avalanche.svg',
    wagmiChain: avalanche,
    tokens: {
      WETH: { ...TOKENS.WETH, address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB' },
      USDC: { ...TOKENS.USDC, address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E' },
      WBTC: { ...TOKENS.WBTC, address: '0x50b7545627a5162F82A992c33b87aDc75187B218' },
      DAI: { ...TOKENS.DAI, address: '0xd586E7F844cEa2F87f50152665BCbc2C27d8d7B1' },
    },
  },
};

export const getChains = () => Object.values(CHAINS);
export const getTokens = (chainId: number) => Object.values(CHAINS[chainId]?.tokens ?? {});

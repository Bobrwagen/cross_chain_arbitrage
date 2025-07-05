// ------------------------------------------------------------
// Cross‑Chain Arbitrage Bot
// ------------------------------------------------------------
// • Express‑JS API + background price‑scanner
// • Compares token prices on four chains via 1inch Price API
// • Emits JSON endpoints: /prices  and  /opportunities
// • ENV required:
//    ONEINCH_KEY   – production key from https://portal.1inch.dev
// ------------------------------------------------------------

import express from "express";
import dotenv from "dotenv";
import axios from "axios";

// ---------- 0.  Bootstrap ----------
dotenv.config();
const app = express();
const PORT: number = 3000;
const THRESHOLD: string = "0.5"; // %

// ---------- 1.  Chain & token table ----------
// For demo we track WETH/ETH on four chains; addresses per chain if needed.
// 1inch price endpoint will accept the alias "ETH" for WETH‑wrapped assets.
const CHAINS = [
  { chain: 1, label: "ethereum" },
  { chain: 137, label: "polygon" },
  { chain: 42161, label: "arbitrum" },
];

// ---------- 2.  State ----------
const state = {
  lastPricesUSD: {}, // { chainId: Number }
  lastUpdated: 0,
  opportunities: [], // [{ ts, buyChain, sellChain, spreadPct }]
};

// ---------- 3.  Helpers ----------
const headers = {
  Authorization: "Bearer " + process.env.INCH_API_KEY,
};

const amount = 50.0; // for each single chain

const fromToMap = {
  // === ETHEREUM ===
  ethereum: {
    weth_to_weth_arbitrum: {
      from: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH on Ethereum
      to: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH on Arbitrum
    },
    weth_to_weth_polygon: {
      from: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH on Ethereum
      to: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH on Polygon
    },
  },

  // === ARBITRUM ===
  arbitrum: {
    weth_to_weth_eth: {
      from: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH on Arbitrum
      to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH on Ethereum
    },
    weth_to_weth_polygon: {
      from: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH on Arbitrum
      to: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH on Polygon
    },
  },

  // === POLYGON ===
  polygon: {
    weth_to_weth_eth: {
      from: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH on Polygon
      to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH on Ethereum
    },
    weth_to_weth_arbitrum: {
      from: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH on Polygon
      to: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH on Arbitrum
    },
  },
};

async function getWethPrice(): Promise<string> {
  const res = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
    params: { ids: "weth", vs_currencies: "usd" },
  });

  let wethAmount: number = await res.data.weth.usd;
  wethAmount = (amount / 3) * wethAmount;
  return BigInt(wethAmount * 1e18).toString();
}

async function fetchExchangeRates(chain: number, src: string, dst: string) {
  const url = `https://api.1inch.dev/swap/v6.1/${chain.toString()}/quote`;
  const price: string = await getWethPrice();
  const config = {
    headers,
    params: {
      src: src,
      dst: dst,
      amount: price,
      includeGas: "true",
    },

    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log(response.data);
    return [response.data.dstAmount, response.data.gas];
  } catch (error) {
    console.error(error);
  }
}

async function runExchanges() {
  const exchanges : any = [];
  for (const { chain: chainId, label } of CHAINS) {
    const pairs = fromToMap[label];

    if (!pairs) continue;

    for (const pairName in pairs) {
      const { from, to } = pairs[pairName];

      console.log(`🔁 ${label.toUpperCase()} | ${pairName}`);
      const result = await fetchExchangeRates(chainId, from, to);

      if (result) {
        const [dstAmount, gas] = result;
        exchanges.push(result);
        console.log(`→ dstAmount: ${dstAmount}`);
        console.log(`→ gas: ${gas}`);
      }
    }
  }
  return exchanges;
}

async function determineArbitrage(exchanges) {
  const res = [];
}



// ---------- 4.  Express routes ----------
app.get("/prices", (_req, res) => {
  res.json({ updated: state.lastUpdated, prices: state.lastPricesUSD });
});

app.get("/opportunities", (_req, res) => {
  res.json({ threshold: THRESHOLD, list: state.opportunities.slice(0, 20) });
});

// health‑check
app.get("/", (_req, res) => res.send("Cross‑chain arb bot online"));

// ---------- 5.  Start ----------
app.listen(PORT, () => {
  console.log(`✔️  Express listening on :${PORT}`);
  scanLoop();
});

// ------------------------------------------------------------
// HOW IT WORKS (read‑me quick‑note)
// ------------------------------------------------------------
// 1. Every 15 seconds `scanLoop()` pulls the USD spot price of ETH on
//    each of the four chains via the 1inch Price API (needs key).
// 2. After updating `state.lastPricesUSD`, we compute the cheapest chain
//    (bestBuy) and the most expensive (bestSell).
// 3. If the percentage difference ≥ ARB_THRESHOLD, we log and push an
//    entry into `state.opportunities`.
// 4. The Express API exposes two JSON endpoints so your front‑end or
//    CLI can read live data:
//       • /prices          – latest price per chain
//       • /opportunities   – recent arb events (spread ≥ threshold)
// 5. In real trading you’d swap the console.log for a call to your
//    trade‑executor that:
//       a) buys ETH on buyChain (1inch swap or native DEX)
//       b) signs & broadcasts the synthetic‑put order (predicate addr)
//       c) bridges & sells ETH on sellChain
// ------------------------------------------------------------

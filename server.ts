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
const CHAINS: { chain: number; label: ChainLabel }[] = [
  { chain: 1, label: "ethereum" },
  { chain: 137, label: "polygon" },
  { chain: 42161, label: "arbitrum" },
];


// ---------- 2.  State ----------
const state: {
  lastPricesUSD: Record<number, any>;
  lastUpdated: number;
  opportunities: {
    ts: number;
    buyOn: string;
    sellOn: string;
    risky: boolean;
    expectedProfit: bigint;
    latencyDeltaSec: string;
  }[];
} = {
  lastPricesUSD: {},
  lastUpdated: 0,
  opportunities: [],
};

// ---------- 3.  Helpers ----------
const headers = {
  Authorization: "Bearer " + process.env.INCH_API_KEY,
};

const amount = 60_000; // for each single chain
// const MD_THRESHOLD: number = 0.05;
// const TIME_THRESHOLD: number = 60;

type ChainLabel = 'ethereum' | 'polygon' | 'arbitrum';

const fromToMap: Record<ChainLabel, Record<string, { from: string; to: string }>> = {
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

async function fetchExchangeRates(
  chain: number,
  src: string,
  dst: string,
  amount: string
) {
  const url = `https://api.1inch.dev/swap/v6.1/${chain}/quote`;

  const config = {
    headers,
    params: {
      src: src,
      dst: dst,
      amount: amount,
      includeGas: "true",
    },
    paramsSerializer: {
      indexes: null,
    },
  };

  const start = Date.now();
  try {
    const response = await axios.get(url, config);
    const end = Date.now();
    const latencyMs = end - start;

    return {
      dstAmountWei: BigInt(response.data.dstAmount),
      gasWei: BigInt(response.data.gas),
      latencyMs,
      quoteTime: end,
    };
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(
      `[Quote Error] ${chain}: ${src.slice(0, 6)} → ${dst.slice(0, 6)}`,
      error.message
    );
  } else {
    console.error(`[Quote Error] Unknown error`);
  }
}
}

async function runExchanges() {
  const priceWei = await getWethPrice();
  const quotes: any[] = [];

  for (const { chain: chainId, label } of CHAINS) {
    const pairs = fromToMap[label];
    if (!pairs) continue;

    for (const pairKey in pairs) {
      const { from, to } = pairs[pairKey];
      const toLabel = pairKey.split("_").pop();

      const result = await fetchExchangeRates(chainId, from, to, priceWei);
      if (!result) continue;

      quotes.push({
        fromChain: label,
        toChain: toLabel,
        inputWei: BigInt(priceWei),
        ...result,
      });
    }
  }

  return quotes;
}

/*
function marginalDifference(q, rev) : number  {
  const qIn = Number(q.inputWei);
  const qOut = Number(q.dstAmountWei);
  const revIn = Number(rev.inputWei);
  const revOut = Number(rev.dstAmountWei);

  const term1 = Math.abs(qIn - revOut) / revOut;
  const term2 = Math.abs(revIn - qOut) / qOut;

  return Math.min(term1, term2);
}
*/
function profit_P(q: any, rev: any, cost: bigint): bigint {
  const out_m = BigInt(q.dstAmountWei);
  const in_n = BigInt(rev.inputWei);
  return out_m - in_n - BigInt(cost);
}

/* -----------------------------------------------------------
   2️⃣  determineArbitrage – paper-style delta_ / lambda filtering
   ----------------------------------------------------------- */
function determineArbitrage(quotes: any[]) {
  const opportunities: any[] = [];

  const book: Record<string, any> = {};
  const key = (a: string, b: string) => `${a}->${b}`;

  for (const q of quotes) {
    book[key(q.fromChain, q.toChain)] = q;
  }

  for (const q of quotes) {
    const rev = book[key(q.toChain, q.fromChain)];
    if (!rev) continue;

    const now = Date.now();
    const latencyDeltaSec = Math.abs(q.latencyMs - rev.latencyMs) / 1000;

    //MD
    // const md = marginalDifference(q, rev);
    const gas_cost = q.gasWei + rev.gasWei;
    const profit = profit_P(q, rev, gas_cost);
    if (profit > BigInt(0) ) {
      opportunities.push({
        ts: now,
        buyOn: q.fromChain,
        sellOn: q.toChain,
        risky : false,
        expectedProfit: profit,
        latencyDeltaSec: latencyDeltaSec.toFixed(3),
      });
    }
  }

  return opportunities;
}

async function runDetection() {
 while (true) {
    try {
      const quotes = await runExchanges();
      const found  : Array<any> = determineArbitrage(quotes);

      if (found.length > 0) {
        console.log(`🚨 Found ${found.length} arbitrage opportunity(ies):`);
        found.forEach((opp) => {
          console.log(`🔁 Buy on ${opp.buyOn}, Sell on ${opp.sellOn} → Profit: ${Number(opp.expectedProfit) / 1e18} ETH`);
        });

        // Prepend to state
        state.opportunities.unshift(...found);
        state.opportunities = state.opportunities.slice(0, 100); // cap history
      } else {
        console.log("⏳ No arbitrage found this round.");
      }

      state.lastUpdated = Date.now();
    } catch (err: unknown) {
  if (err instanceof Error) {
    console.error("❌ Error in runDetection:", err.message);
  } else {
    console.error("❌ Unknown error in runDetection");
  }
}


    await new Promise((r) => setTimeout(r, 15000)); // wait 15 sec
  }
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
  runDetection();
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

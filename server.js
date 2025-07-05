/* ----------------------------------------------------------
   Cross-Chain Arbitrage Bot  –  server.js (CommonJS)
   ----------------------------------------------------------
   • Express API + background scanner
   • Compares WETH prices on Ethereum, Arbitrum, Polygon
   • Exposes   /prices   /opportunities
   ---------------------------------------------------------- */

require("dotenv").config();
const express = require("express");
const axios   = require("axios");

const app   = express();
const PORT  = 3000;
const SCAN_INTERVAL_MS = 15_000;          // 15 s

/* ---------- chains we support ----------------------------- */
const CHAINS = [
  { chain: 1,     label: "ethereum" },
  { chain: 137,   label: "polygon"  },
  { chain: 42161, label: "arbitrum" }
];



/* ---------- per-chain WETH ⇄ USDC routes ----------------- */
const fromToMap = {
  ethereum: {
    // Mainnet (chainId 1)
    weth_to_usdc: {
      from: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
      to:   "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"  // USDC
    },
    usdc_to_weth: {
      from: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      to:   "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    }
  },

  polygon: {
    // Polygon PoS (chainId 137)
    weth_to_usdc: {
      from: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH (bridged)
      to:   "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"  // USDC (bridged)
    },
    usdc_to_weth: {
      from: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      to:   "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"
    }
  },

  arbitrum: {
    // Arbitrum One (chainId 42161)
    weth_to_usdc: {
      from: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH
      to:   "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"  // USDC.e
    },
    usdc_to_weth: {
      from: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
      to:   "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
    }
  }
};




/* ---------- runtime state --------------------------------- */
const state = {
  lastUpdated: 0,
  opportunities: []        // recent arb opportunities
};

/* ---------- helpers --------------------------------------- */
const axiosCfg = {
  headers: { Authorization: `Bearer ${process.env.INCH_API_KEY}` }
};

const USD_BUDGET = 60_000;            // “all-in” budget
async function wethAmountWei() {
  try {
    const url = "https://min-api.cryptocompare.com/data/price";
    const params = { fsym: "WETH", tsyms: "USD" };

    const { data } = await axios.get(url, { params });

    const priceUsd = data?.USD;
    if (!priceUsd || typeof priceUsd !== "number") {
      throw new Error("Invalid WETH/USD price from CryptoCompare");
    }

    const wethAmount = USD_BUDGET / priceUsd;
    return BigInt(Math.floor(wethAmount * 1e18)).toString(); // return as wei string
  } catch (err) {
    console.error("❌ Failed to fetch WETH price from CryptoCompare:", err.message);
    throw err;
  }
}

/* --------------------------------------------------------
   1inch swap/quote helper
   -------------------------------------------------------- */
async function quote(chainId, src, dst, amountWei) {
  const url   = `https://api.1inch.dev/swap/v6.1/${chainId}/quote`;
  const start = Date.now();

  try {
    const { data } = await axios.get(url, {
      ...axiosCfg,
      params: { src, dst, amount: amountWei, includeGas: true }
    });

    /* ------------ convert native gas cost to USD-wei ------ */
    // cache the USD price for this scan loop (15 s) to avoid extra calls
    if (!quote._priceCache) quote._priceCache = {};
    let nativeUsd = quote._priceCache[chainId];
    if (!nativeUsd) {
      nativeUsd = await nativeUsdPrice(chainId);       // float USD
      quote._priceCache[chainId] = nativeUsd;
    }
    const gasWei     = BigInt(data.gas);
    const gasUsdWei  = BigInt(Math.round(nativeUsd * 1e6)) * gasWei /
                       1_000_000_000_000_000_000n;     // 1 e6 for 6-dec USD

    return {
      ok:        true,
      srcWei:    BigInt(amountWei),
      dstWei:    BigInt(data.dstAmount),
      gasWei,                        // native-coin wei
      gasUsdWei,                     // already valued in USD-wei
      latencyMs: Date.now() - start,
      time:      Date.now()
    };

  } catch (e) {
    const msg = e?.response?.data
      ? JSON.stringify(e.response.data)
      : e.message || "unknown";

    console.error(`Quote error ${chainId}: ${msg}`);
    return { ok: false };
  }
}

/* --------------------------------------------------------
   Get native-coin price in USD  –  cached 30 s
   Uses CryptoCompare (no API key needed for this endpoint)
   -------------------------------------------------------- */
const PRICE_TTL_MS = 30_000;          // 30-second cache

const symbolByChain = {
  1:     "ETH",   // Ethereum mainnet
  42161: "ETH",   // Arbitrum One (still ETH)
  137:   "MATIC"  // Polygon PoS
};

const _priceCache = {};               // { chainId: { price, ts } }

async function nativeUsdPrice(chainId) {
  const entry = _priceCache[chainId];
  if (entry && Date.now() - entry.ts < PRICE_TTL_MS) {
    return entry.price;               // serve cached
  }

  const symbol = symbolByChain[chainId];
  if (!symbol) throw new Error(`No native-coin symbol for chainId ${chainId}`);

  const url    = "https://min-api.cryptocompare.com/data/price";
  const params = { fsym: symbol, tsyms: "USD" };

  const { data } = await axios.get(url, { params });
  const priceUsd = data?.USD;

  if (!priceUsd || typeof priceUsd !== "number") {
    throw new Error(`Invalid ${symbol}/USD price from CryptoCompare`);
  }

  // update cache and return
  _priceCache[chainId] = { price: priceUsd, ts: Date.now() };
  return priceUsd;                    // float USD
}


/* run all forward quotes */
async function gatherQuotes (amountWei) {
  const quotes = [];

  for (const { chain, label } of CHAINS) {
    for (const pairKey in fromToMap[label]) {
      const { from, to } = fromToMap[label][pairKey];
      const res = await quote(chain, from, to, amountWei);
      if (!res.ok) continue;
      quotes.push({
        fromChain: label,
        toChain:   pairKey.split("_").pop(),
        inputWei:  BigInt(amountWei),
        ...res
      });
    }
  }
  return quotes;
}

/* compute profit = dst(sm) − src(sn) − gas */
/* compute profit in USDC-wei: dst(usdc) − src(usdc) − gas(usdc)          */
function netProfit(forward, reverse) {
  // forward : WETH -> USDC      (dstWei is USDC-wei)
  // reverse : USDC -> WETH      (dstWei is WETH-wei)

  // USDC you got when you sold 1 WETH
  const usdOut = forward.dstWei;                   // USDC-wei

  // Value of the WETH you buy back, *using the forward price*
  // forward.srcWei is exactly 1 WETH in wei (1e18) if you quoted that way.
  const wethBackUsdWei = (reverse.dstWei * usdOut) / forward.srcWei;

  const totalGasUsdWei = forward.gasUsdWei + reverse.gasUsdWei;

  return wethBackUsdWei - usdOut - totalGasUsdWei; // usually ≤ 0
}



/* ----------------------------------------------------------
   Find opportunities on each chain
   ---------------------------------------------------------- */
function findArb(quotes) {
  const book = {};                               // "eth:weth_to_usdc" -> quote
  quotes.forEach(q => { book[`${q.chain}:${q.leg}`] = q; });

  const out = [];

  ["eth", "pol", "arb"].forEach(chain => {
    const fwd = book[`${chain}:weth_to_usdc`];
    const rev = book[`${chain}:usdc_to_weth`];
    if (!fwd || !rev) return;                    // missing leg

    const profit = netProfit(fwd, rev);          // USD-wei
    if (profit > 0n) {
      out.push({
        ts: Date.now(),
        chain,
        expectedProfitUsd: Number(profit) / 1e6, // convert to float USD
        latencyMs: fwd.latencyMs + rev.latencyMs
      });
    }
  });

  return out;
}


/* ---------- background detector --------------------------- */
async function detectorLoop () {
  while (true) {
    try {
      const amountWei = await wethAmountWei();
      const quotes = await gatherQuotes(amountWei);
      const opps   = findArb(quotes);

      if (opps.length) {
        console.log(`🚨 ${opps.length} arb opp(s):`);
        opps.forEach(o =>
          console.log(`🔁 Buy on ${o.buyOn} / Sell on ${o.sellOn} → +${Number(o.expectedProfitWei)/1e18} ETH`)
        );
        state.opportunities.unshift(...opps);
        state.opportunities = state.opportunities.slice(0, 100);
      } else {
        console.log("⏳ No arb this round.");
      }

      state.lastUpdated = Date.now();
    } catch (e) {
      console.error("Scanner error:", e);
    }
    await new Promise(r => setTimeout(r, SCAN_INTERVAL_MS));
  }
}

/* ---------- express api ----------------------------------- */
app.get("/", (_req, res) => res.send("Cross-chain arb bot online"));
app.get("/opportunities", (_req, res) =>
  res.json(state.opportunities.slice(0, 20))
);

/* ---------- start ----------------------------------------- */
app.listen(PORT, () => {
  console.log(`✔️  Server listening on :${PORT}`);
  detectorLoop();
});

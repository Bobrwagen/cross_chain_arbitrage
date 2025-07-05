/* ----------------------------------------------------------
   Cross-Chain Arbitrage Bot  –  server.js (CommonJS)
   ----------------------------------------------------------
   • Express API + background scanner
   • Compares WETH prices on Ethereum, Arbitrum, Polygon
   • Exposes   /prices   /opportunities
   • Now prints clear progress + error messages
   ---------------------------------------------------------- */

require("dotenv").config();
const express = require("express");
const axios   = require("axios");
const http    = require('http');
const { Server } = require('socket.io');


// --- INIT ---
const app  = express();
const PORT = 3000;
const SCAN_INTERVAL_MS = 15_000;                     // 15 s
const io = new Server(http.createServer(app), {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`🔌  Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    clearInterval(timer);
    console.log(`❌  Client disconnected: ${socket.id}`);
  });
});


/* ---------- chains we support ---------------------------- */
const CHAINS = [
  { chain: 1,     label: "ethereum" },
  { chain: 137,   label: "polygon"  },
  { chain: 42161, label: "arbitrum" }
];

/* ---------- per-chain WETH ⇄ USDC routes ----------------- */
const fromToMap = {
  /* Ethereum mainnet (chainId 1) */
  ethereum: {
    weth_to_usdc: { from: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                    to:   "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
    usdc_to_weth: { from: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                    to:   "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" }
  },
  /* Polygon PoS (chainId 137) */
  polygon:  {
    weth_to_usdc: { from: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
                    to:   "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" },
    usdc_to_weth: { from: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
                    to:   "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619" }
  },
  /* Arbitrum One (chainId 42161) */
  arbitrum: {
    weth_to_usdc: { from: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
                    to:   "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8" },
    usdc_to_weth: { from: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
                    to:   "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" }
  }
};

/* ---------- runtime state -------------------------------- */
const state = {
  lastUpdated  : 0,
  opportunities: []                // recent arb opps (front = newest)
};

/* ----------------------------------------------------------
   1) fetch WETH/USD once per scan – decides trade size
   ---------------------------------------------------------- */
const USD_BUDGET = 60_000;         // your “all-in” capital
async function wethAmountWei() {
  const url = "https://min-api.cryptocompare.com/data/price";
  try {
    const { data } = await axios.get(url, { params: { fsym: "WETH", tsyms: "USD" } });
    const price = data?.USD;
    if (!price) throw new Error("No WETH/USD price from CryptoCompare");

    console.log(`[PRICE]  WETH = $${price.toFixed(2)}`);

    const weth  = USD_BUDGET / price;                    // budget in WETH
    const wei   = BigInt(Math.floor(weth * 1e18)).toString();
    console.log(`[SIZE ]  Using ${weth.toFixed(4)} WETH   (${wei} wei)`);
    return wei;
  } catch (err) {
    console.error(`[PRICE ❌]  ${err.message}`);
    throw err;
  }
}

/* ----------------------------------------------------------
   2) native-coin USD cache  (ETH / MATIC)
   ---------------------------------------------------------- */
const PRICE_TTL_MS = 30_000;              // 30 s
const symbolByChain = { 1: "ETH", 42161: "ETH", 137: "MATIC" };
const _priceCache   = {};

async function nativeUsdPrice(chainId) {
  const c = _priceCache[chainId];
  if (c && Date.now() - c.ts < PRICE_TTL_MS) return c.price;

  const sym = symbolByChain[chainId];
  const url = "https://min-api.cryptocompare.com/data/price";
  const { data } = await axios.get(url, { params: { fsym: sym, tsyms: "USD" } });
  const usd = data?.USD;
  if (!usd) throw new Error(`Missing ${sym}/USD`);

  _priceCache[chainId] = { price: usd, ts: Date.now() };
  console.log(`[GAS$]  ${sym} = $${usd.toFixed(2)}  (chain ${chainId})`);
  return usd;
}

/* ----------------------------------------------------------
   3) 1inch quote helper  (both legs)
   ---------------------------------------------------------- */
const axiosCfg = { headers: { Authorization: `Bearer ${process.env.INCH_API_KEY}` } };

/* --------------------------------------------------------
   gatherQuotes – forward + reverse on every chain
   -------------------------------------------------------- */
async function gatherQuotes(amountWei) {
  const quotes = [];

  for (const { chain, label } of CHAINS) {
    /* ---------- forward leg : WETH → USDC ---------------- */
    const fwdCfg = fromToMap[label].weth_to_usdc;
    const fwd    = await quote(chain, fwdCfg.from, fwdCfg.to, amountWei);
    if (!fwd.ok) continue;

    /* ---------- reverse leg : sell the USDC we just got -- */
    const revCfg = fromToMap[label].usdc_to_weth;
    const rev    = await quote(chain, revCfg.from, revCfg.to, fwd.dstWei.toString());
    if (!rev.ok) continue;

    /* store both legs, keyed by chain + leg */
    quotes.push({ chain: label, leg: "weth_to_usdc", ...fwd });
    quotes.push({ chain: label, leg: "usdc_to_weth", ...rev });
  }

  console.log(`[GATHER] success=${quotes.length}`);
  return quotes;
}


async function quote(chainId, src, dst, amountWei) {
  const url = `https://api.1inch.dev/swap/v6.1/${chainId}/quote`;
  const t0  = Date.now();

  try {
    const { data } = await axios.get(url, {
      ...axiosCfg,
      params: { src, dst, amount: amountWei, includeGas: true }
    });

    /* gas → USD-wei */
    if (!quote._cache) quote._cache = {};
    let usd = quote._cache[chainId];
    if (!usd) {
      usd = await nativeUsdPrice(chainId);
      quote._cache[chainId] = usd;
    }
    const gasWei    = BigInt(data.gas);
    const gasUsdWei = BigInt(Math.round(usd * 1e6)) * gasWei / 1_000_000_000_000_000_000n;

    console.log(
      `[QUOTE ✅] chain=${chainId}  ${src.slice(0,6)}…→${dst.slice(0,6)}…  ` +
      `dstWei=${data.dstAmount}  gasWei=${data.gas}  ${Date.now()-t0} ms`
    );

    return {
      ok: true, dstWei: BigInt(data.dstAmount), gasWei, gasUsdWei,
      srcWei: BigInt(amountWei), latencyMs: Date.now() - t0, time: Date.now()
    };
  } catch (e) {
    const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message;
    console.error(
      `[QUOTE ❌] chain=${chainId}  ${src.slice(0,6)}…→${dst.slice(0,6)}…  ${msg}`
    );
    return { ok:false };
  }
}


/* ----------------------------------------------------------
   5) round-trip P&L  (single chain, USD-wei)
   ---------------------------------------------------------- */
/* --------------------------------------------------------
   netProfit – round-trip on one chain (USD-wei)
   -------------------------------------------------------- */
function netProfit(forward, reverse) {
  const usdSold   = forward.dstWei;                // USDC-wei you received
  const usdBought = reverse.srcWei;                // USDC-wei spent to buy back
  const totalGas  = forward.gasUsdWei + reverse.gasUsdWei;

  /* positive only if you exit with more USDC than you started */
  return usdBought - usdSold - totalGas;
}


/* ----------------------------------------------------------
   6) pair legs and flag positive loops
   ---------------------------------------------------------- */
function findArb(quotes) {
  const book = {};                                // key: "chain:leg"
  quotes.forEach(q => { book[`${q.chain}:${q.leg}`] = q; });

  const out = [];
  ["ethereum","polygon","arbitrum"].forEach(chain => {
    const f = book[`${chain}:weth_to_usdc`];
    const r = book[`${chain}:usdc_to_weth`];
    if (!f || !r) return;

    const pnl = netProfit(f, r);                  // bigint USD-wei
    console.log(`[P&L ] ${chain.padEnd(9)}  ${ (Number(pnl)/1e6).toFixed(2) } USD`);
    if (pnl > 0n) out.push({
      ts: Date.now(),
      buyOn: chain, sellOn: chain,
      expectedProfitUsd: Number(pnl) / 1e6,        // float USD
      latencyMs: f.latencyMs + r.latencyMs
    });
  });
  return out;
}

/* ----------------------------------------------------------
   7) scanner loop
   ---------------------------------------------------------- */
async function detectorLoop() {
  while (true) {
    try {
      console.log("\n─────────── SCAN START ───────────");
      const wei    = await wethAmountWei();
      const quotes = await gatherQuotes(wei);
      const opps   = findArb(quotes);

      if (opps.length) {
        console.log(`🚨  ${opps.length} profitable loop(s)`);
        opps.forEach(o =>
          console.log(
            `   • ${o.buyOn.padEnd(9)} +$${o.expectedProfitUsd.toFixed(2)}  latency=${o.latencyMs} ms`
          )
        );
        state.opportunities.unshift(...opps);
        state.opportunities = state.opportunities.slice(0, 100);
        io.emit("arb-opportunity", opps);
      } else {
        console.log("⏳  Nothing profitable this round.");
      }

      state.lastUpdated = Date.now();
    } catch (e) {
      console.error(`[SCAN 💥] ${e.message || e}`);
    }
    await new Promise(r => setTimeout(r, SCAN_INTERVAL_MS));
  }
}

/* ---------- express API ---------------------------------- */
app.get("/", (_req,res)=>res.send("Cross-chain arb bot online"));
app.get("/opportunities", (_req,res)=>
  res.json(state.opportunities.slice(0, 20))
);

/* ---------- start server & loop -------------------------- */
app.listen(PORT, () => {
  console.log(`🚀  Bot listening on http://localhost:${PORT}`);
  detectorLoop();
});

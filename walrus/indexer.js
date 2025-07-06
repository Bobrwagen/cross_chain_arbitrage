require('dotenv').config();
const express = require('express');
const fcl = require('@onflow/fcl');
// const { Walrus } = require('walrus.js'); // Placeholder for the correct Walrus SDK package

// --- Configuration ---
const PORT = process.env.PORT || 3001;
const FLOW_ACCESS_NODE = 'https://rest-testnet.onflow.org';
const CONTRACT_ADDRESS = '0x92ba57e829911039';
const WALRUS_API_KEY = process.env.WALRUS_API_KEY;
const WALRUS_COLLECTION_NAME = 'arbitrage_trades';

const TRADE_CREATED_EVENT = `A.${CONTRACT_ADDRESS}.Arbitrage.TradeCreated`;
const TRADE_PURCHASED_EVENT = `A.${CONTRACT_ADDRESS}.Arbitrage.TradePurchased`;

// --- Initialization ---
const app = express();
fcl.config().put('accessNode.api', FLOW_ACCESS_NODE);
// const walrus = new Walrus(WALRUS_API_KEY); // Placeholder

// --- Event Listening Logic ---
async function listenForEvents() {
  console.log('Starting event listeners...');

  fcl.events(TRADE_CREATED_EVENT).subscribe((eventData) => {
    console.log('Trade Created Event Received:', eventData);
    recordTradeCreation(eventData);
  });

  fcl.events(TRADE_PURCHASED_EVENT).subscribe((eventData) => {
    console.log('Trade Purchased Event Received:', eventData);
    recordTradePurchase(eventData);
  });

  console.log(`Listening for ${TRADE_CREATED_EVENT}`);
  console.log(`Listening for ${TRADE_PURCHASED_EVENT}`);
}

// --- Walrus Integration (with placeholders) ---
async function recordTradeCreation(eventData) {
  console.log(`Recording new trade ${eventData.id} to Walrus...`);
  try {
    // const collection = walrus.getCollection(WALRUS_COLLECTION_NAME);
    // const result = await collection.add({
    //   tradeId: eventData.id,
    //   owner: eventData.owner,
    //   fromAsset: eventData.fromAsset,
    //   fromChain: eventData.fromChain,
    //   toAsset: eventData.toAsset,
    //   toChain: eventData.toChain,
    //   amount: parseFloat(eventData.amount),
    //   profit: parseFloat(eventData.profit),
    //   expiry: new Date(parseFloat(eventData.expiry) * 1000).toISOString(),
    //   status: 'open',
    //   createdAt: new Date().toISOString()
    // });
    // console.log('Walrus record created:', result);
    console.log('--- WALRUS INTEGRATION PLACEHOLDER ---');

  } catch (error) {
    console.error('Error recording trade creation to Walrus:', error);
  }
}

async function recordTradePurchase(eventData) {
  console.log(`Updating trade ${eventData.id} in Walrus...`);
    try {
    // const collection = walrus.getCollection(WALRUS_COLLECTION_NAME);
    // const result = await collection.update({
    //   where: { tradeId: eventData.id },
    //   data: {
    //     status: 'purchased',
    //     purchaser: eventData.purchaser,
    //     purchasedAt: new Date().toISOString()
    //   }
    // });
    // console.log('Walrus record updated:', result);
    console.log('--- WALRUS INTEGRATION PLACEHOLDER ---');
  } catch (error) {
    console.error('Error updating trade purchase in Walrus:', error);
  }
}


// --- API Endpoints (for later) ---
app.get('/api/analytics/summary', async (req, res) => {
    // TODO: Query Walrus for analytics data
    // e.g., total volume, trade counts, etc.
    res.json({ message: 'Analytics summary coming soon!' });
});


// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Indexer server running on port ${PORT}`);
  listenForEvents().catch(console.error);
});


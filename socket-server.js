const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const express = require('express');

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomBool() {
  return Math.random() < 0.5;
}

function generateOpportunity() {
  const call = randomBool();
  const strike = randomFloat(1700, 2300, 0);
  const expiry = '2025-07-25';
  return {
    id: Math.random().toString(36).substring(2, 10),
    optionSymbol: `ETH-2025-07-25-${strike}${call ? 'C' : 'P'}`,
    strike,
    expiry,
    iv: randomFloat(0.3, 0.7, 2),
    delta: randomFloat(-1, 1, 2),
    gamma: randomFloat(0.01, 0.05, 2),
    buyOn: 'Lyra',
    hedgeOn: 'Uniswap',
    bridgeNeeded: randomBool(),
    bridgeTo: 'Ethereum',
    expectedProfitUsd: randomFloat(20, 120, 0)
  };
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  // Emit immediately on connect
  socket.emit('arb-opportunity', generateOpportunity());
  // Set up interval
  const interval = setInterval(() => {
    io.emit('arb-opportunity', generateOpportunity());
  }, 15000);
  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});

import Arbitrage from 0xArbitrage

pub fun main(): [Arbitrage.Trade] {
    return Arbitrage.getOpenTrades()
}

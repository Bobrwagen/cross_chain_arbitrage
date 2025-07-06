import Arbitrage from 0xc4ba79aaa382dc54

pub fun main(): [Arbitrage.Trade] {
    return Arbitrage.getOpenTrades()
}

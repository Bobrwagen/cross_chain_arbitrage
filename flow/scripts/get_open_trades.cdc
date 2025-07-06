import FungibleToken from 0xf233dcee88fe0abe
import Arbitrage from 0x68b5645abcff1008

access(all) fun main(): [Arbitrage.TradeInfo] {
    let allTrades = Arbitrage.getAllTrades()
    let tradeList: [Arbitrage.TradeInfo] = []
    
    for tradeId in allTrades.keys {
        if let trade = allTrades[tradeId] {
            tradeList.append(trade)
        }
    }
    
    return tradeList
}

import FungibleToken from 0xf233dcee88fe0abe

access(all) contract Arbitrage {

    // --- Events ---
    access(all) event TradeCreated(id: UInt64, owner: Address, fromToken: String, toToken: String, fromAmount: UFix64, toAmount: UFix64)
    access(all) event TradeCompleted(id: UInt64, purchaser: Address)
    access(all) event TradeCancelled(id: UInt64)

    // --- Data Structures ---
    access(all) struct TradeInfo {
        access(all) let id: UInt64
        access(all) let owner: Address
        access(all) let fromToken: String
        access(all) let toToken: String
        access(all) let fromAmount: UFix64
        access(all) let toAmount: UFix64
        access(all) let created: UFix64

        init(id: UInt64, owner: Address, fromToken: String, toToken: String, fromAmount: UFix64, toAmount: UFix64) {
            self.id = id
            self.owner = owner
            self.fromToken = fromToken
            self.toToken = toToken
            self.fromAmount = fromAmount
            self.toAmount = toAmount
            self.created = getCurrentBlock().timestamp
        }
    }

    // --- Contract State ---
    access(all) var trades: {UInt64: TradeInfo}
    access(all) var nextTradeId: UInt64

    // --- Core Functions ---

    access(all) fun createTrade(fromToken: String, toToken: String, fromAmount: UFix64, toAmount: UFix64, creator: Address) {
        let tradeId = self.nextTradeId
        
        let tradeInfo = TradeInfo(
            id: tradeId,
            owner: creator,
            fromToken: fromToken,
            toToken: toToken,
            fromAmount: fromAmount,
            toAmount: toAmount
        )

        self.trades[tradeId] = tradeInfo
        self.nextTradeId = self.nextTradeId + 1

        emit TradeCreated(id: tradeId, owner: creator, fromToken: fromToken, toToken: toToken, fromAmount: fromAmount, toAmount: toAmount)
    }

    access(all) fun completeTrade(tradeId: UInt64, purchaser: Address) {
        pre {
            self.trades[tradeId] != nil: "Trade not found"
        }
        
        self.trades.remove(key: tradeId)
        emit TradeCompleted(id: tradeId, purchaser: purchaser)
    }

    access(all) fun cancelTrade(tradeId: UInt64) {
        pre {
            self.trades[tradeId] != nil: "Trade not found"
        }
        
        self.trades.remove(key: tradeId)
        emit TradeCancelled(id: tradeId)
    }

    // --- Public Getters ---
    access(all) view fun getTrade(id: UInt64): TradeInfo? {
        return self.trades[id]
    }

    access(all) view fun getOpenTradeIDs(): [UInt64] {
        return self.trades.keys
    }

    access(all) view fun getAllTrades(): {UInt64: TradeInfo} {
        return self.trades
    }

    init() {
        self.trades = {}
        self.nextTradeId = 0
    }
}

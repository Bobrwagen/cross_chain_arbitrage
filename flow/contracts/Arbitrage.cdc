pub contract Arbitrage {

    pub event TradeCreated(id: UInt64, owner: Address, fromAsset: String, fromChain: String, toAsset: String, toChain: String, amount: UFix64, profit: UFix64, expiry: UFix64)
    pub event TradePurchased(id: UInt64, purchaser: Address)

    pub struct Trade {
        pub let id: UInt64
        pub let owner: Address
        pub let fromAsset: String
        pub let fromChain: String
        pub let toAsset: String
        pub let toChain: String
        pub let amount: UFix64
        pub let profit: UFix64 // Percentage
        pub let expiry: UFix64 // Timestamp
        pub var status: String
        pub var purchaser: Address?

        init(id: UInt64, owner: Address, fromAsset: String, fromChain: String, toAsset: String, toChain: String, amount: UFix64, profit: UFix64, expiry: UFix64) {
            self.id = id
            self.owner = owner
            self.fromAsset = fromAsset
            self.fromChain = fromChain
            self.toAsset = toAsset
            self.toChain = toChain
            self.amount = amount
            self.profit = profit
            self.expiry = expiry
            self.status = "open"
            self.purchaser = nil
        }
    }

    pub var trades: {UInt64: Trade}
    pub var nextTradeId: UInt64

    init() {
        self.trades = {}
        self.nextTradeId = 1
    }

    pub fun createTrade(fromAsset: String, fromChain: String, toAsset: String, toChain: String, amount: UFix64, profit: UFix64, expiry: UFix64): UInt64 {
        let newTrade = Trade(
            id: self.nextTradeId,
            owner: self.account.address,
            fromAsset: fromAsset,
            fromChain: fromChain,
            toAsset: toAsset,
            toChain: toChain,
            amount: amount,
            profit: profit,
            expiry: expiry
        )
        self.trades[newTrade.id] = newTrade
        self.nextTradeId = self.nextTradeId + 1

        emit TradeCreated(
            id: newTrade.id,
            owner: newTrade.owner,
            fromAsset: newTrade.fromAsset,
            fromChain: newTrade.fromChain,
            toAsset: newTrade.toAsset,
            toChain: newTrade.toChain,
            amount: newTrade.amount,
            profit: newTrade.profit,
            expiry: newTrade.expiry
        )

        return newTrade.id
    }

    pub fun purchaseTrade(tradeId: UInt64, purchaser: Address) {
        pre {
            self.trades[tradeId] != nil: "Trade does not exist"
            self.trades[tradeId]!.status == "open": "Trade is not open"
        }
        self.trades[tradeId]!.status = "purchased"
        self.trades[tradeId]!.purchaser = purchaser

        emit TradePurchased(id: tradeId, purchaser: purchaser)
    }

    pub fun getTrade(tradeId: UInt64): Trade? {
        return self.trades[tradeId]
    }

    pub fun getOpenTrades(): [Trade] {
        let openTrades: [Trade] = []
        for id in self.trades.keys {
            let trade = self.trades[id]!
            if trade.status == "open" {
                openTrades.append(trade)
            }
        }
        return openTrades
    }
}

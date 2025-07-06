import Arbitrage from 0xArbitrage

transaction(tradeId: UInt64) {

    prepare(signer: AuthAccount) {
    }

    execute {
        Arbitrage.purchaseTrade(tradeId: tradeId, purchaser: signer.address)
    }
}

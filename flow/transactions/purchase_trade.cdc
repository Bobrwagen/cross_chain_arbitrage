import Arbitrage from 0xc4ba79aaa382dc54

transaction(tradeId: UInt64) {

    prepare(signer: AuthAccount) {
    }

    execute {
        Arbitrage.purchaseTrade(tradeId: tradeId, purchaser: signer.address)
    }
}

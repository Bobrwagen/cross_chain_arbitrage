import Arbitrage from 0xc4ba79aaa382dc54

transaction(fromAsset: String, fromChain: String, toAsset: String, toChain: String, amount: UFix64, profit: UFix64, expiry: UFix64) {

    prepare(signer: AuthAccount) {
    }

    execute {
        Arbitrage.createTrade(
            fromAsset: fromAsset,
            fromChain: fromChain,
            toAsset: toAsset,
            toChain: toChain,
            amount: amount,
            profit: profit,
            expiry: expiry
        )
    }
}

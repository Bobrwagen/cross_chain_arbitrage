import Arbitrage from 0x68b5645abcff1008

// Purchases an open trade - simplified version for demo
transaction(tradeId: UInt64, paymentTokenName: String, paymentAmount: UFix64, receiverTokenName: String) {
    
    let signerAddress: Address

    prepare(signer: auth(Storage) &Account) {
        // Store the signer's address for use in execute
        self.signerAddress = signer.address
    }

    execute {
        // Call the contract to complete the trade
        Arbitrage.completeTrade(
            tradeId: tradeId,
            purchaser: self.signerAddress
        )
    }
}

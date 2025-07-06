import FungibleToken from 0xf233dcee88fe0abe
import Arbitrage from 0x68b5645abcff1008

// Creates a new trade entry in the contract
transaction(fromTokenName: String, fromAmount: UFix64, toTokenName: String, toAmount: UFix64) {
    
    let signerAddress: Address

    prepare(signer: auth(Storage) &Account) {
        // Store the signer's address for use in execute
        self.signerAddress = signer.address
    }

    execute {
        // Call the contract to create the trade
        Arbitrage.createTrade(
            fromToken: fromTokenName,
            toToken: toTokenName,
            fromAmount: fromAmount,
            toAmount: toAmount,
            creator: self.signerAddress
        )
    }
}

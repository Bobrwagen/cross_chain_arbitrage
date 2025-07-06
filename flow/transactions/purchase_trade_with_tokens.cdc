import Arbitrage from 0x68b5645abcff1008
import FungibleToken from 0xf233dcee88fe0abe
import FlowToken from 0x1654653399040a61

// Purchases an open trade and transfers real FLOW tokens
transaction(tradeId: UInt64, paymentTokenName: String, paymentAmount: UFix64, receiverTokenName: String) {
    
    let signerAddress: Address
    let payment: @FlowToken.Vault
    let receiverVault: &{FungibleToken.Receiver}
    let tradeInfo: Arbitrage.TradeInfo?

    prepare(signer: auth(Storage) &Account) {
        // Store the signer's address for use in execute
        self.signerAddress = signer.address
        
        // Get the trade information first
        self.tradeInfo = Arbitrage.getTrade(id: tradeId)
        
        // Ensure trade exists
        if self.tradeInfo == nil {
            panic("Trade not found")
        }
        
        // Get the FlowToken vault from the signer's account
        let vaultRef = signer.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the owner's Vault!")
        
        // Withdraw payment amount from the signer
        self.payment <- vaultRef.withdraw(amount: paymentAmount)
        
        // Get the receiver's vault capability
        let receiverAccount = getAccount(self.tradeInfo!.owner)
        self.receiverVault = receiverAccount.capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            ?? panic("Could not borrow receiver reference to the recipient's Vault")
    }

    execute {
        // Transfer the payment to the trade owner
        self.receiverVault.deposit(from: <-self.payment)
        
        // Complete the trade in the contract
        Arbitrage.completeTrade(
            tradeId: tradeId,
            purchaser: self.signerAddress
        )
        
        log("Trade completed successfully with real token transfer")
    }
}

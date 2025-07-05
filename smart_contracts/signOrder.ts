import { ethers,Contract } from "ethers";
import {
  LimitOrder,
  MakerTraits,
  Address,
  getLimitOrderV4Domain,
  Api,
  FetchProviderConnector,
} from "@1inch/limit-order-sdk";


// **** ENV **** --------------------------------------------------
async function process(RPC : any, PRIV_KEY : any, LOP : any, HOOK : any, CHAIN_ID : any, eth: string, principalToken : any
    , marginToken : any, makerAsset: any, takerAsset: any, makingAmount : any, takingAmount: any, key : any
) {

           // EOA that lends & signs
 // v4 mainnet
             // Deployed OptionLoanHook
                                // mainnet ( change for L2 )

  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet   = new ethers.Wallet(PRIV_KEY, provider);

  /** 1)  Loan + hedge parameters ( customise ) */
  const principal    = ethers.parseEther(eth);         // 10 WETH
  const marginUSDC   = ethers.parseUnits((2500 * Number(eth)).toString(), 6);    // 33 000 USDC
  const strikeUsd    = 30_000 * 1e8;                           // $30 000 (8‑dec)
  const expiryTs     = Math.floor(Date.now() / 1e3) + 3600;    // +1 hour
  const gasRefundWei = ethers.parseEther("0.005");      // refund cap, make interchangable

  /** 2)  ABI‑encode parameters for postInteraction */

  const hookData = ethers.AbiCoder.defaultAbiCoder().encode(
    [
      "address",  // lender
      "address",  // borrower placeholder (0) – hook will read tx.origin
      "address",  // principal token (WETH)
      "uint256",  // principal amount
      "address",  // margin token (USDC)
      "uint256",  // marginRequired
      "uint256",  // strikeUsd (8‑dec)
      "uint256",  // expiryTs
      "uint256"   // gasRefundCapWei
    ],
    [wallet.address,
     ethers.ZeroAddress,
     principalToken,
     principal,
     marginToken,
     marginUSDC,
     strikeUsd,
     expiryTs,
     gasRefundWei]
  );

  const makerTraits : MakerTraits = new MakerTraits(BigInt(expiryTs)).withExpiration(BigInt(expiryTs));
  const order = new LimitOrder({
    makerAsset: new Address(makerAsset),
    takerAsset: new Address(takerAsset),
    makingAmount,
    takingAmount,
    maker: new Address(wallet.address),
    receiver: new Address(wallet.address),
    salt: BigInt(Math.floor(Math.random() * 1e8)), // must be unique for each order
    },makerTraits
);
  const domain = getLimitOrderV4Domain(CHAIN_ID);
  const limitOrderContractAddress = domain.verifyingContract;
  const erc20AbiFragment = ["function approve(address,uint256) external returns (bool)","function allowance(address,address) view returns (uint256)"];
  const makerAssetContract = new Contract(makerAsset, erc20AbiFragment, wallet);
  
  const currentAllowance = await makerAssetContract.allowance(wallet.address, limitOrderContractAddress);
  
  if (currentAllowance < makingAmount) {
    // Approve just the necessary amount or the full MaxUint256 to avoid repeated approvals
    const approveTx = await makerAssetContract.approve(limitOrderContractAddress, makingAmount);
    await approveTx.wait();
  }

  const typedData = order.getTypedData(domain.chainId);

  

// Adapt domain format for signTypedData
const domainForSignature = {
  ...typedData.domain,
  chainId: CHAIN_ID
};

const signature = await wallet.signTypedData(domainForSignature, { Order: typedData.types.Order }, typedData.message);

const api = new Api({
  networkId: CHAIN_ID, // 1 = Ethereum Mainnet
  authKey: key,
  httpConnector: new FetchProviderConnector(),
});

try {
  const result = await api.submitOrder(order, signature);
  console.log("Order submitted successfully:", result);
} catch (error) {
  console.error("Failed to submit order:", error);
}
}

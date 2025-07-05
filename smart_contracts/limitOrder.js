import { Wallet, JsonRpcProvider, Contract } from "ethers";
import { LimitOrder, MakerTraits, Address, Api, getLimitOrderV4Domain } from "@1inch/limit-order-sdk";
import { AxiosProviderConnector } from "@1inch/limit-order-sdk";

// Standard ERC-20 ABI fragment (used for token approval)
const erc20AbiFragment = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

async function defineData(chainId, makerAsset, takerAsset, makingAmount, takingAmount, expiresIn) {
// Use environment variables to manage private keys securely
const privKey = process.env.PRIVATE_KEY;

const provider = new JsonRpcProvider("https://cloudflare-eth.com/");
const wallet = new Wallet(privKey, provider);
const expiration = BigInt(Math.floor(Date.now() / 1000)) + expiresIn;
const domain = await approveTx(chainId,makerAsset,wallet,makingAmount);
const makerTraits = new MakerTraits().withExpiration(expiration);
const order = new LimitOrder({
  makerAsset: new Address(makerAsset),
  takerAsset: new Address(takerAsset),
  makingAmount,
  takingAmount,
  maker: new Address(wallet.address),
  receiver: new Address(wallet.address),
  salt: BigInt(Math.floor(Math.random() * 1e8)), // must be unique for each order
  makerTraits
});

const typedData = order.getTypedData(domain);

// Adapt domain format for signTypedData
const domainForSignature = {
  ...typedData.domain,
  chainId: chainId
};

const signature = await wallet.signTypedData(domainForSignature, { Order: typedData.types.Order }, typedData.message);


const api = new Api({
  networkId: chainId, // 1 = Ethereum Mainnet
  authKey: process.env["1INCH_API_KEY"], // Load API key securely
  httpConnector: new AxiosProviderConnector()
});

try {
  const result = await api.submitOrder(order, signature);
  console.log("Order submitted successfully:", result);
} catch (error) {
  console.error("Failed to submit order:", error);
}
}


async function approveTx(chainId, makerAsset, wallet, makingAmount) {
const domain = getLimitOrderV4Domain(chainId);
const limitOrderContractAddress = domain.verifyingContract;

const makerAssetContract = new Contract(makerAsset, erc20AbiFragment, wallet);

const currentAllowance = await makerAssetContract.allowance(wallet.address, limitOrderContractAddress);

if (currentAllowance < makingAmount) {
  // Approve just the necessary amount or the full MaxUint256 to avoid repeated approvals
  const approveTx = await makerAssetContract.approve(limitOrderContractAddress, makingAmount);
  await approveTx.wait();
}
return domain;
}
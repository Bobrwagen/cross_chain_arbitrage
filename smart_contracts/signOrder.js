const { ethers, Contract } = require("ethers");
const {
  LimitOrder,
  MakerTraits,
  Address,
  getLimitOrderV4Domain,
  Api,
  FetchProviderConnector,
} = require("@1inch/limit-order-sdk");

// **** ENV **** --------------------------------------------------
async function signAndOrderFromServer({
  rpc,
  privKey,
  lop,
  hook,
  chainId,
  eth,
  principalToken,
  marginToken,
  makerAsset,
  takerAsset,
  wei: makingAmount,
  apiKey,
}) {
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privKey, provider);

  const principal = ethers.parseEther(eth); // Not used in the logic below
  const marginUSDC = ethers.parseUnits((2500 * Number(eth)).toString(), 6);
  const strikeUsd = 30_000 * 1e8;
  const expiryTs = Math.floor(Date.now() / 1e3) + 3600;
  const gasRefundWei = ethers.parseEther("0.005");

  const hookData = ethers.AbiCoder.defaultAbiCoder().encode(
    [
      "address", "address", "address", "uint256",
      "address", "uint256", "uint256", "uint256", "uint256"
    ],
    [
      wallet.address,
      ethers.ZeroAddress,
      principalToken,
      principal,
      marginToken,
      marginUSDC,
      strikeUsd,
      expiryTs,
      gasRefundWei,
    ]
  );

  const makerTraits = new MakerTraits(BigInt(expiryTs)).withExpiration(BigInt(expiryTs));

  const order = new LimitOrder({
    makerAsset: new Address(makerAsset),
    takerAsset: new Address(takerAsset),
    makingAmount,
    takingAmount: makingAmount, // Assuming same as makingAmount
    maker: new Address(wallet.address),
    receiver: new Address(wallet.address),
    salt: BigInt(Math.floor(Math.random() * 1e8)),
  }, makerTraits);

  const domain = getLimitOrderV4Domain(chainId);
  const limitOrderContractAddress = domain.verifyingContract;

  const erc20Abi = [
    "function approve(address,uint256) external returns (bool)",
    "function allowance(address,address) view returns (uint256)"
  ];
  const makerToken = new Contract(makerAsset, erc20Abi, wallet);

  const currentAllowance = await makerToken.allowance(wallet.address, limitOrderContractAddress);

  if (currentAllowance < makingAmount) {
    const tx = await makerToken.approve(limitOrderContractAddress, makingAmount);
    await tx.wait();
  }

  const typedData = order.getTypedData(domain.chainId);
  const domainForSignature = {
    ...typedData.domain,
    chainId,
  };

  const signature = await wallet.signTypedData(domainForSignature, { Order: typedData.types.Order }, typedData.message);

  const api = new Api({
    networkId: chainId,
    authKey: apiKey,
    httpConnector: new FetchProviderConnector(),
  });

  try {
    const result = await api.submitOrder(order, signature);
    console.log("✅ Order submitted:", result);
  } catch (err) {
    console.error("❌ Order submission failed:", err);
  }
}

module.exports = {
  signAndOrderFromServer,
};

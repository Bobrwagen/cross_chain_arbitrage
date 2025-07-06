const { ethers, Contract } = require("ethers");
const {
  LimitOrder,
  MakerTraits,
  Address,
  getLimitOrderV4Domain,
} = require("@1inch/limit-order-sdk");

const LIMIT_ORDER_ABI = [
  "function fillOrder(tuple(address makerAsset,address takerAsset,address maker,address receiver,uint256 makingAmount,uint256 takingAmount,uint256 salt,uint256 expiration,uint256 predicate,uint256 permit,bytes interaction), bytes signature, uint256 makingAmount, uint256 takingAmount, uint256 thresholdAmount) external payable returns (uint256, uint256)",
];

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
  makingAmount,
}) {
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privKey, provider);

  const principal = ethers.parseEther(eth.toString());
  const marginUSDC = ethers.parseUnits("0.10", 6); // 10 cents in 6-decimals
  console.log(marginUSDC);
  const strikeUsd = 30_000 * 1e8;
  const expiryTs = Math.floor(Date.now() / 1e3) + 3600;
  const gasRefundWei = ethers.parseEther("0.005");
  const hookData = ethers.AbiCoder.defaultAbiCoder().encode(
  [
    "address",          // lender
    "address",          // principal token (WETH)
    "uint256",          // principal amount
    "address",          // margin token (USDC)
    "uint256",          // marginRequired
    "uint256",          // strikeUsd (8-dec)
    "uint256",          // expiryTs
    "uint256"           // gasRefundCapWei
  ],
  [
    wallet.address,     // lender
    principalToken,
    principal,
    marginToken,
    marginUSDC,
    strikeUsd,
    expiryTs,
    gasRefundWei,
  ]
);


  const makerTraits = new MakerTraits(BigInt(expiryTs)).withExpiration(
    BigInt(expiryTs)
  );
  const order = new LimitOrder(
    {
      makerAsset: new Address(makerAsset),
      takerAsset: new Address(takerAsset),
      makingAmount: makingAmount,
      takingAmount: makingAmount,
      maker: new Address(wallet.address),
      receiver: new Address(wallet.address),
      salt: BigInt(Math.floor(Math.random() * 1e8)),
    },
    makerTraits
  );


  const domain = getLimitOrderV4Domain(chainId);
  const limitOrderContractAddress = domain.verifyingContract;

  // Approve if needed
  const erc20Abi = [
    "function approve(address,uint256) external returns (bool)",
    "function allowance(address,address) view returns (uint256)",
  ];
  const token = new Contract(makerAsset, erc20Abi, wallet);
  const currentAllowance = await token.allowance(
    wallet.address,
    limitOrderContractAddress
  );
  if (currentAllowance < makingAmount) {
    const tx = await token.approve(limitOrderContractAddress, makingAmount);
    await tx.wait();
  }

  const typedData = order.getTypedData(domain.chainId);
  const domainForSignature = {
    ...typedData.domain,
    chainId,
  };
  const signature = await wallet.signTypedData(
    domainForSignature,
    { Order: typedData.types.Order },
    typedData.message
  );

  const orderStruct = {
    makerAsset: order.makerAsset.val,
    takerAsset: order.takerAsset.val,
    maker: order.maker?.val,
    receiver: order.receiver?.val ?? wallet.address, // fallback
    makingAmount: order.makingAmount,
    takingAmount: order.takingAmount,
    salt: order.salt,
    expiration: BigInt(expiryTs),
    predicate: 0n,
    permit: 0n,
    interaction: hookData,
  };


  // inject your hook logic

  // Fill the order directly on-chain
  const limitOrderContract = new Contract(
    limitOrderContractAddress,
    LIMIT_ORDER_ABI,
    wallet
  );
  
  //const usdc = new Contract(marginToken, erc20Abi, wallet);

  const USDC_ADDRESS = ethers.getAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");

const usdc = new ethers.Contract(
  USDC_ADDRESS,
  [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
  ],
  wallet
);

const bal = await usdc.balanceOf(wallet.address);
console.log("📦 USDC BALANCE:", ethers.formatUnits(bal, 6));

if (bal < 100000n) {
  console.warn("❌ You do NOT have 0.10 USDC in your wallet.");
}

const usdcAllowance = await usdc.allowance(wallet.address, hook);

if (usdcAllowance < marginUSDC) {
  const tx = await usdc.approve(hook, marginUSDC);
  await tx.wait();
  console.log("✅ Approved margin to hook");
}




console.log("🧩 hookData:", hookData);

  const tx = await limitOrderContract.fillOrder(
    orderStruct,
    signature,
    makingAmount,
    makingAmount,
    1 // thresholdAmount
  );

  console.log("⛽ TX sent:", tx.hash);
  await tx.wait();
  console.log("✅ Order filled on-chain");
}

module.exports = {
  signAndOrderFromServer,
};

const hre = require("hardhat");

async function main() {
  const oracle = process.env.ORACLE_ETHEREUM;
  const lop = process.env.LOP_ADDRESS;

  const Hook = await hre.ethers.getContractFactory("OptionLoanHook");
  const hook = await Hook.deploy(oracle, lop);

  await hook.waitForDeployment();

  console.log("✅ Hook deployed to:", await hook.getAddress());
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});

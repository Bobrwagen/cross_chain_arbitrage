import { ethers } from "ethers";
import fs from "fs";
import path from "path";

import artifact from "./OptionLoanHook.json";

async function deployHook(chain, rpcUrl, privKey, oracleAddress, lopAddress) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privKey, provider);

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy(oracleAddress, lopAddress);
  await contract.waitForDeployment();

  const deployedAddress = await contract.getAddress();
  console.log(`✅ Deployed OptionLoanHook on ${chain}: ${deployedAddress}`);

  return deployedAddress;
}

export { deployHook };

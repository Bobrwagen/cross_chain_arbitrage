require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    mainnet: {
      url: process.env.RPC_ETHEREUM || "",
      accounts: process.env.PRIV_KEY ? [process.env.PRIV_KEY] : [],
    },
  },
};

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  "ts-node": {
    transpileOnly: true,
    compilerOptions: {
      module: "commonjs",
      moduleResolution: "node",
      esModuleInterop: true,
      allowSyntheticDefaultImports: true
    }
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "opbnb-testnet": {
      url: "https://opbnb-testnet-rpc.bnbchain.org",
      chainId: 5611,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./contracts/cache",
    artifacts: "./contracts/artifacts",
  },
};

const hre = require("hardhat");

async function main() {
  console.log("Deploying TipOracle to opBNB testnet...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // For testnet, we'll use a mock tUSDC address or deploy a mock ERC20
  // In production, use the actual tUSDC contract address
  const mockTokenAddress = "0x0000000000000000000000000000000000000000"; // Replace with actual tUSDC

  const TipOracle = await hre.ethers.getContractFactory("TipOracle");
  const tipOracle = await TipOracle.deploy(mockTokenAddress);

  await tipOracle.waitForDeployment();

  const address = await tipOracle.getAddress();
  console.log("TipOracle deployed to:", address);
  console.log("\nAdd this to your .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network opbnb-testnet ${address} ${mockTokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

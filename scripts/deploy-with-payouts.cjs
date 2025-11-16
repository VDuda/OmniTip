const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying TipOracle with Mock USDC for payouts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "wei\n");

  // Step 1: Deploy Mock USDC
  console.log("1️⃣  Deploying Mock USDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const usdcAddress = await mockUSDC.getAddress();
  console.log("✅ Mock USDC deployed to:", usdcAddress);
  
  // Check deployer balance
  const deployerBalance = await mockUSDC.balanceOf(deployer.address);
  console.log("💵 Deployer USDC balance:", hre.ethers.formatUnits(deployerBalance, 6), "USDC\n");

  // Step 2: Deploy TipOracle
  console.log("2️⃣  Deploying TipOracle...");
  const TipOracle = await hre.ethers.getContractFactory("TipOracle");
  const tipOracle = await TipOracle.deploy(usdcAddress);
  await tipOracle.waitForDeployment();
  const oracleAddress = await tipOracle.getAddress();
  console.log("✅ TipOracle deployed to:", oracleAddress, "\n");

  // Step 3: Fund TipOracle with USDC for payouts
  console.log("3️⃣  Funding TipOracle with USDC...");
  const fundAmount = hre.ethers.parseUnits("10000", 6); // 10,000 USDC
  const transferTx = await mockUSDC.transfer(oracleAddress, fundAmount);
  await transferTx.wait();
  
  const oracleBalance = await mockUSDC.balanceOf(oracleAddress);
  console.log("✅ TipOracle funded with:", hre.ethers.formatUnits(oracleBalance, 6), "USDC\n");

  // Summary
  console.log("=" .repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=" .repeat(60));
  console.log("Mock USDC:  ", usdcAddress);
  console.log("TipOracle:  ", oracleAddress);
  console.log("Oracle Fund:", hre.ethers.formatUnits(oracleBalance, 6), "USDC");
  console.log("Reward/Tip: ", "5 USDC");
  console.log("Max Payouts:", Math.floor(Number(hre.ethers.formatUnits(oracleBalance, 6)) / 5));
  console.log("=" .repeat(60));
  
  console.log("\n📝 Add these to your .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${oracleAddress}`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
  
  console.log("\n🔍 Verify contracts:");
  console.log(`npx hardhat verify --network opbnb-testnet ${usdcAddress}`);
  console.log(`npx hardhat verify --network opbnb-testnet ${oracleAddress} ${usdcAddress}`);
  
  console.log("\n🌐 View on explorer:");
  console.log(`Mock USDC:  https://opbnb-testnet.bscscan.com/address/${usdcAddress}`);
  console.log(`TipOracle:  https://opbnb-testnet.bscscan.com/address/${oracleAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

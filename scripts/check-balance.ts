import { ethers } from 'ethers';
import { getAdminWallet } from '../lib/particle';
import { RPC_URL } from '../lib/contract';

async function main() {
  console.log('🔍 Checking admin wallet balance...\n');

  try {
    const wallet = getAdminWallet();
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    console.log(`📍 Network: opBNB Testnet`);
    console.log(`🔗 RPC: ${RPC_URL}`);
    console.log(`👤 Admin Address: ${wallet.address}\n`);

    // Get balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInBNB = ethers.formatEther(balance);

    console.log(`💰 Balance: ${balanceInBNB} BNB`);
    
    // Estimate how many tips we can submit
    const gasPrice = await provider.getFeeData();
    const estimatedGasPerTip = 100000n; // ~100k gas per tip
    const costPerTip = estimatedGasPerTip * (gasPrice.gasPrice || 1n);
    const tipsAffordable = balance / costPerTip;

    console.log(`⛽ Gas Price: ${ethers.formatUnits(gasPrice.gasPrice || 0n, 'gwei')} gwei`);
    console.log(`📊 Estimated tips affordable: ~${tipsAffordable.toString()}\n`);

    if (balance === 0n) {
      console.log('⚠️  WARNING: Wallet has no funds!');
      console.log('📝 Get testnet BNB from: https://www.bnbchain.org/en/testnet-faucet');
      console.log(`📋 Send to: ${wallet.address}\n`);
      process.exit(1);
    } else if (balance < ethers.parseEther('0.01')) {
      console.log('⚠️  WARNING: Low balance! Consider refilling soon.');
      console.log('📝 Get more from: https://www.bnbchain.org/en/testnet-faucet\n');
    } else {
      console.log('✅ Wallet is funded and ready to go!\n');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

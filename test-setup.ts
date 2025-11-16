#!/usr/bin/env bun
import { getProvider, getContract, CONTRACT_ADDRESS } from './lib/contract';
import { getWalletForPhone } from './lib/particle';

console.log('🔍 OmniTip Setup Test\n');

// Test 1: Check environment
console.log('1️⃣ Checking environment variables...');
const hasContractAddress = !!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const hasPrivateKey = !!process.env.PRIVATE_KEY;
console.log(`   Contract Address: ${hasContractAddress ? '✅' : '❌'}`);
console.log(`   Private Key: ${hasPrivateKey ? '✅' : '❌'}`);

if (!hasContractAddress) {
  console.log('\n⚠️  Deploy contract first: bun run deploy:contract');
  process.exit(1);
}

// Test 2: Check RPC connection
console.log('\n2️⃣ Testing opBNB testnet connection...');
try {
  const provider = getProvider();
  const blockNumber = await provider.getBlockNumber();
  console.log(`   ✅ Connected! Latest block: ${blockNumber}`);
} catch (e: any) {
  console.log(`   ❌ Failed: ${e.message}`);
  process.exit(1);
}

// Test 3: Check contract
console.log('\n3️⃣ Testing smart contract...');
try {
  const provider = getProvider();
  const contract = getContract(provider);
  const [engGoals, argGoals] = await Promise.all([
    contract.engGoals(),
    contract.argGoals(),
  ]);
  console.log(`   ✅ Contract found! Score: England ${engGoals} - ${argGoals} Argentina`);
} catch (e: any) {
  console.log(`   ❌ Failed: ${e.message}`);
  process.exit(1);
}

// Test 4: Generate test wallet
console.log('\n4️⃣ Testing wallet generation...');
try {
  const wallet = getWalletForPhone('+1234567890');
  console.log(`   ✅ Wallet generated: ${wallet.address}`);
} catch (e: any) {
  console.log(`   ❌ Failed: ${e.message}`);
  process.exit(1);
}

// Test 5: Check admin wallet balance
if (hasPrivateKey) {
  console.log('\n5️⃣ Checking admin wallet balance...');
  try {
    const { getAdminWallet } = await import('./lib/particle');
    const adminWallet = getAdminWallet();
    const balance = await adminWallet.provider.getBalance(adminWallet.address);
    const balanceInBNB = Number(balance) / 1e18;
    console.log(`   Admin: ${adminWallet.address}`);
    console.log(`   Balance: ${balanceInBNB.toFixed(6)} BNB ${balanceInBNB > 0 ? '✅' : '❌'}`);
    
    if (balanceInBNB === 0) {
      console.log('\n   ⚠️  Get testnet BNB: https://www.bnbchain.org/en/testnet-faucet');
    }
  } catch (e: any) {
    console.log(`   ❌ Failed: ${e.message}`);
  }
}

console.log('\n✅ Setup test complete! Run: bun run dev');

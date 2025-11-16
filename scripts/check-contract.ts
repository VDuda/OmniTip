/**
 * Check TipOracle contract state and recent transactions
 */
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const RPC_URL = 'https://opbnb-testnet-rpc.bnbchain.org';

if (!CONTRACT_ADDRESS) {
  console.error('❌ NEXT_PUBLIC_CONTRACT_ADDRESS not set in .env.local');
  process.exit(1);
}

const TIP_ORACLE_ABI = [
  "function tip(bool predictsEnglandNext) external",
  "function getSentimentBias() external view returns (uint256 engTips, uint256 argTips, uint256 total)",
  "function engGoals() external view returns (uint256)",
  "function argGoals() external view returns (uint256)",
  "event NewTip(address indexed wallet, bool predictsEnglandNext, uint256 timestamp)",
  "event GoalScored(string team, uint256 newScore)",
];

async function main() {
  console.log('🔍 Checking TipOracle contract...\n');
  console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`🔗 Network: opBNB Testnet`);
  console.log(`🌐 Explorer: https://opbnb-testnet.bscscan.com/address/${CONTRACT_ADDRESS}\n`);

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, TIP_ORACLE_ABI, provider);

  try {
    // Get current scores
    const [engGoals, argGoals] = await Promise.all([
      contract.engGoals(),
      contract.argGoals(),
    ]);

    console.log('⚽ Current Scores:');
    console.log(`   England: ${engGoals}`);
    console.log(`   Argentina: ${argGoals}\n`);

    // Get sentiment bias
    const sentiment = await contract.getSentimentBias();
    console.log('📊 Sentiment Bias:');
    console.log(`   England tips: ${sentiment.engTips}`);
    console.log(`   Argentina tips: ${sentiment.argTips}`);
    console.log(`   Total tips: ${sentiment.total}\n`);

    // Get recent NewTip events
    console.log('📝 Recent Tips (last 100 blocks):');
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 100);
    
    const tipFilter = contract.filters.NewTip();
    const tipEvents = await contract.queryFilter(tipFilter, fromBlock, currentBlock);

    if (tipEvents.length === 0) {
      console.log('   No tips found in recent blocks\n');
    } else {
      for (const event of tipEvents.slice(-10)) { // Show last 10
        const block = await event.getBlock();
        const date = new Date(block.timestamp * 1000);
        console.log(`   ${event.args?.predictsEnglandNext ? '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England' : '🇦🇷 Argentina'} - ${event.args?.wallet} - ${date.toLocaleString()}`);
      }
      console.log(`   (Showing last 10 of ${tipEvents.length} tips)\n`);
    }

    // Get transaction count
    const txCount = await provider.getTransactionCount(CONTRACT_ADDRESS);
    console.log(`📈 Total transactions: ${txCount}`);

    console.log('\n✅ Contract is live and accessible!');
    console.log(`\n🔗 View on explorer: https://opbnb-testnet.bscscan.com/address/${CONTRACT_ADDRESS}`);
    
  } catch (error: any) {
    console.error('❌ Error querying contract:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

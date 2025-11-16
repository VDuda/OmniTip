/**
 * Trigger Argentina goal and distribute payouts
 */
import { ethers } from 'ethers';
import { getAdminWallet } from '../lib/particle';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '';

const TIP_ORACLE_ABI = [
  "function adminScoreGoal(string calldata team) external",
  "function getSentimentBias() external view returns (uint256 engTips, uint256 argTips, uint256 total)",
  "function engGoals() external view returns (uint256)",
  "function argGoals() external view returns (uint256)",
  "function tips(uint256) external view returns (address wallet, bool predictsEnglandNext, bool claimed)",
  "event GoalScored(string team, uint256 newScore)",
  "event TipClaimed(address indexed wallet, uint256 amount)",
];

const USDC_ABI = [
  "function balanceOf(address) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

async function main() {
  console.log('⚽ Triggering Argentina Goal & Payouts...\n');

  if (!CONTRACT_ADDRESS) {
    console.error('❌ NEXT_PUBLIC_CONTRACT_ADDRESS not set');
    process.exit(1);
  }

  const adminWallet = getAdminWallet();
  console.log('👤 Admin wallet:', adminWallet.address);
  console.log('📍 Contract:', CONTRACT_ADDRESS);
  console.log('💵 USDC:', USDC_ADDRESS, '\n');

  const contract = new ethers.Contract(CONTRACT_ADDRESS, TIP_ORACLE_ABI, adminWallet);
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, adminWallet);

  // Get current state
  console.log('📊 Current State:');
  const [engGoals, argGoals, sentiment] = await Promise.all([
    contract.engGoals(),
    contract.argGoals(),
    contract.getSentimentBias(),
  ]);

  console.log(`   England: ${engGoals} goals`);
  console.log(`   Argentina: ${argGoals} goals`);
  console.log(`   Tips - England: ${sentiment.engTips}, Argentina: ${sentiment.argTips}\n`);

  // Get Argentina predictors before scoring
  console.log('🔍 Argentina Predictors:');
  const argPredictors: string[] = [];
  for (let i = 0; i < Number(sentiment.total); i++) {
    const tip = await contract.tips(i);
    if (!tip.predictsEnglandNext && !tip.claimed) {
      argPredictors.push(tip.wallet);
      const balance = await usdc.balanceOf(tip.wallet);
      console.log(`   ${tip.wallet} - Current USDC: ${ethers.formatUnits(balance, 6)}`);
    }
  }

  if (argPredictors.length === 0) {
    console.log('   ⚠️  No Argentina predictors found!\n');
    console.log('💡 Send a WhatsApp message predicting Argentina first!');
    process.exit(0);
  }

  console.log(`\n🎯 Found ${argPredictors.length} Argentina predictor(s)\n`);

  // Trigger Argentina goal
  console.log('⚽ Scoring Argentina goal...');
  const tx = await contract.adminScoreGoal('Argentina');
  console.log('📤 Transaction sent:', tx.hash);
  
  const receipt = await tx.wait();
  console.log('✅ Transaction confirmed!\n');

  // Parse events
  console.log('📋 Events:');
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });
      
      if (parsed?.name === 'GoalScored') {
        console.log(`   ⚽ Goal: ${parsed.args.team} - New score: ${parsed.args.newScore}`);
      } else if (parsed?.name === 'TipClaimed') {
        console.log(`   💰 Payout: ${parsed.args.wallet} received ${ethers.formatUnits(parsed.args.amount, 6)} USDC`);
      }
    } catch (e) {
      // Skip non-contract events
    }
  }

  // Check new balances
  console.log('\n💵 Updated USDC Balances:');
  for (const predictor of argPredictors) {
    const balance = await usdc.balanceOf(predictor);
    console.log(`   ${predictor} - ${ethers.formatUnits(balance, 6)} USDC`);
  }

  // Get updated scores
  const newArgGoals = await contract.argGoals();
  console.log(`\n🏆 Argentina Score: ${argGoals} → ${newArgGoals}`);
  console.log(`\n🔗 View transaction: https://opbnb-testnet.bscscan.com/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

import { ethers } from 'ethers';

export const TIP_ORACLE_ABI = [
  "function tip(bool predictsEnglandNext) external",
  "function adminScoreGoal(string calldata team) external",
  "function getSentimentBias() external view returns (uint256 engTips, uint256 argTips, uint256 total)",
  "function engGoals() external view returns (uint256)",
  "function argGoals() external view returns (uint256)",
  "event NewTip(address indexed wallet, bool predictsEnglandNext, uint256 timestamp)",
  "event GoalScored(string team, uint256 newScore)",
];

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '5611');

// opBNB Testnet RPC
export const RPC_URL = 'https://opbnb-testnet-rpc.bnbchain.org';

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(CONTRACT_ADDRESS, TIP_ORACLE_ABI, signerOrProvider);
}

export async function submitTip(signer: ethers.Signer, predictsEngland: boolean) {
  const contract = getContract(signer);
  const tx = await contract.tip(predictsEngland);
  await tx.wait();
  return tx.hash;
}

export async function adminScoreGoal(signer: ethers.Signer, team: 'England' | 'Argentina') {
  const contract = getContract(signer);
  const tx = await contract.adminScoreGoal(team);
  await tx.wait();
  return tx.hash;
}

export async function getScores() {
  const provider = getProvider();
  const contract = getContract(provider);
  const [engGoals, argGoals] = await Promise.all([
    contract.engGoals(),
    contract.argGoals(),
  ]);
  return {
    england: Number(engGoals),
    argentina: Number(argGoals),
  };
}

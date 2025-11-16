import { ethers } from 'ethers';
import { RPC_URL } from './contract';

// Simple wallet generation based on phone number for MVP
// In production, use Particle Network SDK for proper AA wallets
export function getWalletForPhone(phone: string): ethers.Wallet {
  // Deterministic wallet from phone hash (NOT SECURE - MVP only)
  const hash = ethers.keccak256(ethers.toUtf8Bytes(phone + process.env.WALLET_SALT || 'omnitip-salt'));
  const wallet = new ethers.Wallet(hash);
  return wallet.connect(new ethers.JsonRpcProvider(RPC_URL));
}

export function getAdminWallet(): ethers.Wallet {
  const privateKey = process.env.ADMIN_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('ADMIN_PRIVATE_KEY or PRIVATE_KEY not set in environment');
  }
  return new ethers.Wallet(privateKey, new ethers.JsonRpcProvider(RPC_URL));
}

import { ethers } from 'ethers';
import { RPC_URL } from './contract';

/**
 * Generate a deterministic wallet address from phone number
 * This creates a consistent address for each phone number
 * 
 * For MVP: We use the admin wallet to submit transactions on behalf of users
 * For Production: Integrate Particle Network AA for gasless transactions
 */
export function getWalletAddressForPhone(phone: string): string {
  // Generate deterministic address from phone hash
  const hash = ethers.keccak256(ethers.toUtf8Bytes(phone + (process.env.WALLET_SALT || 'omnitip-salt')));
  const wallet = new ethers.Wallet(hash);
  return wallet.address;
}

/**
 * Get a wallet that can actually submit transactions
 * For MVP: Returns admin wallet (we pay gas for users)
 * For Production: Use Particle Network AA with paymaster
 */
export function getWalletForPhone(phone: string): ethers.Wallet {
  // For MVP, use admin wallet to submit on behalf of users
  // The user's address is tracked separately
  return getAdminWallet();
}

export function getAdminWallet(): ethers.Wallet {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not set in environment. This wallet pays gas for all user tips.');
  }
  return new ethers.Wallet(privateKey, new ethers.JsonRpcProvider(RPC_URL));
}

# Wallet Strategy for OmniTip

## Problem
Users send WhatsApp messages with their phone numbers, but they don't have crypto wallets or gas tokens to pay for blockchain transactions.

## Solution: Gasless Transactions with Admin Sponsorship

### How It Works

1. **User Identity**: Each phone number gets a deterministic wallet address
   - Generated from: `hash(phone_number + salt)`
   - Same phone = same address (consistent identity)
   - Example: `+5491122334455` → `0x1234...5678`

2. **Transaction Submission**: Admin wallet pays gas for all users
   - User sends WhatsApp message
   - Server generates user's address (for tracking)
   - Server uses admin wallet to submit transaction
   - Admin wallet pays the gas fees

3. **On-Chain Tracking**: Smart contract records user predictions
   - Contract stores: wallet address → prediction
   - Dashboard shows: which addresses predicted what
   - Users can claim rewards later (if implemented)

### Current Implementation (MVP)

```typescript
// Generate user's deterministic address
const userAddress = getWalletAddressForPhone("+5491122334455");
// → 0x1234...5678

// Get admin wallet to pay gas
const signerWallet = getWalletForPhone("+5491122334455");
// → Returns admin wallet (0xABCD...EFGH)

// Submit transaction
await submitTip(signerWallet, predictsEngland);
// Gas paid by: 0xABCD...EFGH
// Recorded for: 0x1234...5678
```

### Production Options

#### Option 1: Particle Network AA (Recommended)
- **Gasless**: Use Particle's paymaster to sponsor gas
- **Smart Accounts**: Each user gets a smart contract wallet
- **No Seed Phrases**: Users authenticate with social login
- **Implementation**:
  ```bash
  bun add @particle-network/aa @particle-network/auth
  ```

#### Option 2: Biconomy AA
- **Gasless**: Use Biconomy paymaster
- **ERC-4337**: Standard account abstraction
- **Implementation**:
  ```bash
  bun add @biconomy/account @biconomy/bundler
  ```

#### Option 3: Custom Paymaster
- **Full Control**: Deploy your own paymaster contract
- **Gas Sponsorship**: Set rules for who gets free transactions
- **Cost**: You pay gas for all users

### Cost Analysis

**Current MVP Approach:**
- Admin wallet pays ~$0.0001 per tip (opBNB testnet)
- 1000 tips = ~$0.10 in gas
- Sustainable for hackathon/demo

**Production with Paymaster:**
- Set daily limits per user
- Require minimum engagement
- Charge premium users
- Sponsor first N transactions

### Security Considerations

1. **Admin Wallet**: Keep private key secure in environment variables
2. **Rate Limiting**: Prevent spam by limiting tips per phone number
3. **Validation**: Parse and validate predictions before submitting
4. **Monitoring**: Track gas costs and set alerts

### Future Enhancements

1. **User Wallet Claiming**: Let users import their deterministic wallet
   - Export private key (derived from phone + salt)
   - Import into MetaMask
   - Claim rewards directly

2. **Hybrid Approach**: 
   - Free tips: Admin pays gas
   - Reward claims: User pays gas
   - Voting: User pays gas

3. **Token Gating**:
   - Hold X tokens → free transactions
   - No tokens → pay gas yourself

### Environment Variables

```bash
# Single wallet for everything (deploys contracts + pays gas for users)
PRIVATE_KEY=0x1234...

# Salt for deterministic user addresses
WALLET_SALT=omnitip-hackathon-2025

# Particle Network (for production AA)
PARTICLE_PROJECT_ID=your_project_id
PARTICLE_CLIENT_KEY=your_client_key
PARTICLE_APP_ID=your_app_id
```

### Testing

```bash
# Check admin wallet balance
bun run scripts/check-balance.ts

# Fund admin wallet (testnet)
# Visit: https://www.bnbchain.org/en/testnet-faucet

# Test tip submission
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{"From": "+5491122334455", "Body": "England next goal"}'
```

### Summary

✅ **MVP**: Admin wallet sponsors all transactions (simple, works now)  
🚀 **Production**: Integrate Particle/Biconomy AA (gasless, scalable)  
💰 **Cost**: ~$0.0001 per tip on opBNB (very affordable)  
🔐 **Security**: Admin key in env vars, rate limiting, validation  

The current approach is perfect for a hackathon demo and can scale to thousands of users with minimal cost!

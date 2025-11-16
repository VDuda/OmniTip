# OmniTip Setup Guide

## Prerequisites

- [Bun](https://bun.sh/) installed (`curl -fsSL https://bun.sh/install | bash`)
- opBNB testnet BNB (get from [faucet](https://www.bnbchain.org/en/testnet-faucet))

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd /home/vovk/hackathons/OmniTip
bun install
```

### 2. Create Environment File

```bash
cp .env.example .env.local
```

### 3. Generate a Wallet (if you don't have one)

```bash
# Using Bun's built-in crypto
bun -e "console.log('Private Key:', require('crypto').randomBytes(32).toString('hex'))"
```

Or use an existing MetaMask wallet's private key.

### 4. Get Testnet BNB

1. Visit https://www.bnbchain.org/en/testnet-faucet
2. Select "opBNB Testnet"
3. Enter your wallet address
4. Request testnet BNB

### 5. Update .env.local

```bash
# Add your private key
PRIVATE_KEY=0x...your_private_key_here
ADMIN_PRIVATE_KEY=0x...same_or_different_key

# These will be filled after contract deployment
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_CHAIN_ID=5611
```

### 6. Deploy Smart Contract

```bash
bun run deploy:contract
```

This will output something like:
```
TipOracle deployed to: 0x1234567890abcdef...
Add this to your .env.local:
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef...
```

Copy the contract address and add it to `.env.local`.

### 7. Start Development Servers

```bash
bun run dev
```

This starts:
- Bun server on `http://localhost:3001`
- Next.js on `http://localhost:3000`

## Testing the Flow

### Test 1: Submit a Tip

1. Open http://localhost:3000
2. Scroll to "WhatsApp Simulator"
3. Type "England next goal" or "Argentina next goal"
4. Click "Send"
5. Check the console for the transaction hash
6. Verify the tip appears in the "Live Tips" feed

### Test 2: Admin Goal Scoring

1. Navigate to http://localhost:3000/admin
2. Enter password: `hack2025`
3. Click "⚽ England Scores!" or "⚽ Argentina Scores!"
4. Wait for blockchain confirmation
5. See the score update on the main dashboard

### Test 3: View On-Chain Data

Check your contract on opBNB testnet explorer:
```
https://testnet.opbnbscan.com/address/YOUR_CONTRACT_ADDRESS
```

## Troubleshooting

### "Cannot find module" errors
Run `bun install` again.

### "Insufficient funds" when deploying
Get more testnet BNB from the faucet.

### Contract calls failing
- Verify `NEXT_PUBLIC_CONTRACT_ADDRESS` is set in `.env.local`
- Check you have testnet BNB for gas
- Ensure you're using the correct private key

### Server won't start
- Check port 3001 isn't already in use
- Try `killall bun` and restart

## Next Steps

- Add real WhatsApp integration with Twilio
- Integrate Particle Network for proper AA wallets
- Add voice transcription with Whisper
- Deploy to production (Vercel + Railway)

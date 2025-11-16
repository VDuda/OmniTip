# OmniTip: Voice Sentiment Oracle for Live Soccer Events

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Built with Bun](https://img.shields.io/badge/Built%20with-Bun-000000)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js)
![opBNB](https://img.shields.io/badge/opBNB-FFC107?logo=binance)

OmniTip lets fans send predictions via WhatsApp and turns the crowd pulse into an on-chain oracle on opBNB testnet.

## Quickstart

```bash
# Install dependencies
bun install

# Deploy contract to opBNB testnet (get some testnet BNB first)
# Add your PRIVATE_KEY to .env.local
bun run deploy:contract

# Copy the contract address to .env.local
# NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Start dev servers
bun run dev
```

Backend listens on http://localhost:3001 and Next.js on http://localhost:3000.

**Database**: Uses SQLite (`omnitip.db`) for local persistence — no external services needed.

## Scripts

- **dev**: start Bun server and Next dev (both run concurrently)
- **build/start**: Next build and start
- **deploy:contract**: deploy TipOracle.sol to opBNB testnet

## Setup

1. **Get testnet BNB**: Visit [opBNB testnet faucet](https://www.bnbchain.org/en/testnet-faucet)
2. **Create wallet**: Generate a private key and add to `.env.local`
3. **Deploy contract**: `bun run deploy:contract`
4. **Update env**: Add contract address to `.env.local`
5. **Run**: `bun run dev`

## Features Working

✅ **Text-based tips** via WhatsApp simulator  
✅ **WhatsApp Cloud API integration** with webhook verification  
✅ **Deterministic wallets** generated from phone numbers  
✅ **On-chain tip submission** to TipOracle contract  
✅ **Admin goal scoring** with blockchain confirmation  
✅ **Live score display** from smart contract  
✅ **SQLite persistence** for tip history

## WhatsApp Integration

To connect real WhatsApp messages, see **[WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)** for detailed instructions on:
- Setting up Meta Business Account
- Configuring webhook with ngrok
- Subscribing to message events
- Testing with real WhatsApp messages

## Folders
- `app/` Next.js App Router
- `components/` UI components
- `server/` Bun + Elysia webhook server
- `contracts/` Solidity
- `lib/` shared utilities
- `public/` assets

# OmniTip: Voice Sentiment Oracle for Live Soccer Events

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Built with Bun](https://img.shields.io/badge/Built%20with-Bun-000000)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js)
![opBNB](https://img.shields.io/badge/opBNB-FFC107?logo=binance)

**OmniTip** transforms fan predictions into an on-chain oracle for live sports betting markets. Send voice notes or text via WhatsApp predicting match outcomes, and watch your sentiment get recorded on opBNB blockchain with automatic payouts for correct predictions.

> **"Voice your gut. Power the odds."**

### 🎯 The Problem

Access to live event sentiment is difficult unless someone literally tells you! This has a massive impact on prediction markets and providing an edge in live betting.

**Market Reality:**
- **74% of sports betting** now takes place on in-play or "live" markets (IBIA)
- Live betting value **far outpaces** pre-game betting value
- Traditional sentiment analysis is too slow for live markets
- Current solutions rely on delayed social media scraping or expert opinions

**OmniTip Solution:**
Real-time voice sentiment oracle that captures the "fan pulse" during live matches, providing bookmakers with instant, verifiable crowd sentiment to dynamically adjust odds.

## 🎯 What It Does

- 📱 **WhatsApp Integration**: Send predictions via text or voice messages
- 🎤 **Voice Transcription**: Groq Whisper AI converts voice notes to text
- 🧠 **AI Prediction Parsing**: Extracts team predictions from natural language
- ⛓️ **Blockchain Oracle**: Records all predictions on opBNB testnet
- 💰 **Automatic Payouts**: Smart contract distributes rewards when goals are scored
- 🎮 **Live Admin Dashboard**: Control match events and trigger payouts in real-time

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

## 🚀 User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    END-TO-END USER FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. 📱 Fan sends WhatsApp message
   "Messi will score next!" → WhatsApp Business Number

2. ☁️ WhatsApp Cloud API forwards to webhook
   POST https://your-server.com/api/webhook
   { "from": "5491122334455", "text": "Messi will score next!" }

3. 🎤 Voice transcription (if voice note)
   Groq Whisper API → "Messi will score next!"

4. 🧠 AI prediction parsing
   Extract: "Messi" → Argentina team

5. 👤 Deterministic wallet generation
   hash(phone + salt) → 0x7CE4...74a8

6. ⛓️ Blockchain transaction
   TipOracle.tip(false) // false = Argentina
   Gas paid by admin wallet (gasless for users)

7. 💾 Database logging
   SQLite stores: phone, text, prediction, wallet, timestamp

8. 🖥️ Dashboard updates
   Real-time display of tips and sentiment

9. ⚽ Admin scores goal (Argentina)
   TipOracle.adminScoreGoal("Argentina")
   
10. 💰 Automatic payout
    Smart contract distributes 5 USDC to all Argentina predictors
    User receives payout at 0x7CE4...74a8
```

## 🏗️ Architecture

### Tech Stack

**Frontend**
- **Next.js 14**: React framework with App Router
- **TailwindCSS**: Utility-first styling
- **shadcn/ui**: Beautiful UI components
- **Recharts**: Data visualization
- **Lucide React**: Icon library

**Backend**
- **Bun**: Fast JavaScript runtime
- **Elysia**: Lightweight web framework
- **SQLite**: Local database (via Bun's built-in support)

**Blockchain**
- **opBNB Testnet**: Layer 2 for low gas fees
- **Ethers.js v6**: Ethereum library
- **Hardhat**: Smart contract development
- **Solidity 0.8.20**: Contract language

**AI/ML**
- **Groq Whisper**: Voice transcription
- **OpenAI Whisper**: Fallback transcription
- **Xenova Transformers**: Local sentiment analysis

**External APIs**
- **WhatsApp Cloud API**: Message handling
- **Meta Business Platform**: WhatsApp integration

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENT DIAGRAM                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   WhatsApp User  │
└────────┬─────────┘
         │ Voice/Text Message
         ↓
┌──────────────────────────┐
│  WhatsApp Cloud API      │
│  (Meta Business)         │
└────────┬─────────────────┘
         │ Webhook POST
         ↓
┌──────────────────────────┐
│  Bun Server (Port 3001)  │
│  ├─ Elysia Framework     │
│  ├─ Webhook Handler      │
│  └─ Audio Transcription  │
└────────┬─────────────────┘
         │
         ├─────────────────────┐
         │                     │
         ↓                     ↓
┌──────────────────┐   ┌──────────────────┐
│  Groq/OpenAI     │   │  SQLite DB       │
│  Whisper API     │   │  (omnitip.db)    │
└──────────────────┘   └──────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Smart Contract Layer    │
│  ├─ TipOracle.sol        │
│  ├─ MockUSDC.sol         │
│  └─ opBNB Testnet        │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Next.js Frontend        │
│  ├─ Admin Dashboard      │
│  ├─ Live Match Control   │
│  ├─ Sentiment Charts     │
│  └─ Event Feed           │
└──────────────────────────┘
```

### Data Flow

**Prediction Submission:**
```
WhatsApp → Webhook → Parse → Generate Wallet → Submit to Chain → Log to DB
```

**Goal Scoring:**
```
Admin Dashboard → API → Smart Contract → Payout Distribution → Event Logs
```

## 📦 Open Source Dependencies

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^14.2.0 | React framework |
| `react` | ^18.2.0 | UI library |
| `ethers` | ^6.9.0 | Ethereum interactions |
| `elysia` | ^1.1.14 | Web server framework |
| `@openzeppelin/contracts` | ^5.0.2 | Secure smart contracts |
| `hardhat` | ^2.19.0 | Smart contract tooling |
| `tailwindcss` | ^3.3.6 | CSS framework |
| `recharts` | ^2.10.4 | Charts and graphs |
| `lucide-react` | ^0.292.0 | Icon components |
| `@xenova/transformers` | ^2.5.5 | ML inference |
| `zod` | ^3.22.4 | Schema validation |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.3.3 | Type safety |
| `@types/node` | ^20.10.5 | Node.js types |
| `@types/react` | ^18.2.42 | React types |
| `eslint` | ^8.55.0 | Code linting |
| `dotenv` | ^16.3.1 | Environment variables |

### External Services

- **Groq API**: Fast voice transcription (free tier)
- **OpenAI API**: Fallback transcription
- **WhatsApp Cloud API**: Message handling (free)
- **opBNB Testnet**: Blockchain network (free testnet)

## 🚢 Deployment

### Prerequisites

1. **Bun Runtime**: Install from [bun.sh](https://bun.sh/)
2. **opBNB Testnet BNB**: Get from [faucet](https://www.bnbchain.org/en/testnet-faucet)
3. **WhatsApp Business Account**: Create at [Meta Business](https://business.facebook.com/)
4. **Groq API Key**: Sign up at [console.groq.com](https://console.groq.com/)

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/VDuda/OmniTip.git
cd OmniTip

# 2. Install dependencies
bun install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# 4. Deploy smart contract
bun run deploy:contract
# Copy the contract address to .env.local

# 5. Start development servers
bun run dev
# Backend: http://localhost:3001
# Frontend: http://localhost:3000
```

### Production Deployment

#### Frontend (Vercel)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import to Vercel
# Visit vercel.com and import your repository

# 3. Add environment variables in Vercel dashboard:
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=5611
```

#### Backend (Railway/Fly.io)

```bash
# Railway
railway login
railway init
railway up

# Or Fly.io
fly launch
fly deploy
```

#### Smart Contract

```bash
# Deploy to opBNB Testnet
bun run deploy:contract

# Deploy with payouts
npx hardhat run scripts/deploy-with-payouts.cjs --network opbnb-testnet

# Verify on explorer
npx hardhat verify --network opbnb-testnet <CONTRACT_ADDRESS>
```

### Environment Variables

Create `.env.local` with:

```bash
# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=5611

# Admin Wallet (pays gas for all transactions)
PRIVATE_KEY=0x...

# Wallet Generation
WALLET_SALT=omnitip-hackathon-2025

# WhatsApp Cloud API
WHATSAPP_VERIFY_TOKEN=your-verify-token
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-id

# Audio Transcription (choose one)
GROQ_API_KEY=gsk_...
# OPENAI_API_KEY=sk-...
```

### Webhook Setup

**Development (ngrok):**
```bash
# Start ngrok tunnel
./start-tunnel.sh
# Or manually: ngrok http 3001

# Copy the HTTPS URL to WhatsApp webhook configuration
# https://abc123.ngrok.io/api/webhook
```

**Production:**
```bash
# Use your production backend URL
# https://api.omnitip.xyz/api/webhook
```

## 📚 Documentation

- **[SETUP.md](./SETUP.md)**: Detailed setup instructions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: System architecture deep dive
- **[AUDIO_TRANSCRIPTION.md](./AUDIO_TRANSCRIPTION.md)**: Voice message handling
- **[PAYOUT_SYSTEM.md](./PAYOUT_SYSTEM.md)**: Automatic reward distribution
- **[NGROK_SETUP.md](./NGROK_SETUP.md)**: Webhook tunneling guide

## 🎮 Usage

### Send Predictions via WhatsApp

**Text Message:**
```
"England will score next"
"Messi next goal"
"Argentina wins"
```

**Voice Note:**
Record and send: "I think England is going to score!"

### Admin Dashboard

1. Open `http://localhost:3000`
2. Click **Play** ▶️ to start match clock
3. Select a player (e.g., Messi)
4. Choose action (⚽ Goal, 🎯 Assist, etc.)
5. Click **Apply Action**
6. Goal automatically submitted to blockchain
7. Payouts distributed to correct predictors

### Check Contract State

```bash
# View tips and scores
bun run check:contract

# Trigger Argentina goal + payouts
bun run argentina:goal

# Check admin wallet balance
bun run check:balance
```

## ✅ Features

- ✅ WhatsApp text message predictions
- ✅ Voice note transcription (Groq/OpenAI)
- ✅ AI-powered prediction parsing
- ✅ Deterministic wallet generation
- ✅ Gasless predictions (admin pays gas)
- ✅ On-chain tip recording
- ✅ Admin goal scoring
- ✅ Automatic payout distribution
- ✅ Live match dashboard
- ✅ Real-time sentiment tracking
- ✅ SQLite persistence
- ✅ Event feed and history

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev servers (backend + frontend) |
| `bun run build` | Build Next.js for production |
| `bun run start` | Start production server |
| `bun run deploy:contract` | Deploy smart contracts |
| `bun run check:contract` | View contract state |
| `bun run check:balance` | Check admin wallet balance |
| `bun run argentina:goal` | Trigger Argentina goal + payouts |
| `bun run tunnel` | Start ngrok tunnel |

## 📁 Project Structure

```
OmniTip/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Admin dashboard (homepage)
│   ├── admin/             # Admin controls
│   └── api/               # API routes
│       ├── webhook/       # WhatsApp webhook
│       ├── scores/        # Fetch scores
│       └── tips/          # Fetch tips
├── components/            # React components
│   ├── MatchScore.tsx    # Live score display
│   ├── SentimentChart.tsx # Sentiment visualization
│   └── TipFeed.tsx       # Recent tips feed
├── contracts/             # Solidity smart contracts
│   ├── TipOracle.sol     # Main oracle contract
│   └── MockUSDC.sol      # Test token
├── lib/                   # Shared utilities
│   ├── contract.ts       # Contract interactions
│   ├── particle.ts       # Wallet generation
│   ├── whatsapp.ts       # WhatsApp API
│   └── db.ts             # SQLite operations
├── scripts/               # Deployment scripts
│   ├── deploy-with-payouts.cjs
│   ├── check-contract.ts
│   └── trigger-argentina-goal.ts
├── server/                # Bun backend
│   └── index.ts          # Webhook server
└── public/                # Static assets
```

## 🔐 Security Notes

- **Admin Wallet**: Pays gas for all user transactions (gasless UX)
- **Deterministic Wallets**: Generated from phone hash (MVP only)
- **Production**: Use proper account abstraction (Particle Network)
- **Private Keys**: Never commit to repository
- **Webhook Verification**: Token-based authentication
- **Admin Access**: Password-protected (replace with OAuth in production)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

## 🙏 Acknowledgments

- **opBNB**: Low-cost Layer 2 blockchain
- **Groq**: Fast voice transcription
- **Meta**: WhatsApp Cloud API
- **OpenZeppelin**: Secure smart contract libraries
- **Bun**: Fast JavaScript runtime
- **Vercel**: Frontend hosting

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/VDuda/OmniTip/issues)
- **Documentation**: See `/docs` folder
- **Demo**: [Live Demo](https://omnitip.vercel.app)

---

Built with ❤️ for BNB Chain Hackathon 2025

# OmniTip Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. Fan sends WhatsApp message
   📱 "Messi next goal" → WhatsApp Business Number

2. WhatsApp Cloud API forwards to webhook
   ☁️  POST https://your-server.com/webhook
   {
     "from": "5491122334455",
     "text": { "body": "Messi next goal" }
   }

3. Server processes message
   🔧 server/index.ts
   ├─ Extract phone: "5491122334455"
   ├─ Parse prediction: "Messi" → Argentina
   ├─ Generate wallet: hash(phone + salt) → 0xabc123...
   └─ Submit to blockchain

4. Blockchain transaction
   ⛓️  opBNB Testnet
   ├─ Call: TipOracle.tip(false)  // false = Argentina
   ├─ Gas paid by user's wallet
   └─ Event emitted: NewTip(0xabc123..., false, timestamp)

5. Database logging
   💾 SQLite (omnitip.db)
   INSERT INTO tips (phone, text, predictsEngland, wallet, timestamp)

6. Dashboard updates
   🖥️  http://localhost:3000
   ├─ Fetch tips from SQLite
   ├─ Fetch scores from contract
   └─ Display real-time feed


┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN GOAL FLOW                             │
└─────────────────────────────────────────────────────────────────┘

1. Admin clicks "⚽ Argentina Scores!"
   🖱️  http://localhost:3000/admin

2. Frontend calls API
   📡 POST /api/admin/goal
   { "team": "Argentina", "password": "hack2025" }

3. API validates and submits
   🔐 Verify password
   🔑 Load admin wallet from PRIVATE_KEY
   ⛓️  Call: TipOracle.adminScoreGoal("Argentina")

4. Contract updates score
   📝 argGoals++
   🔔 Event: GoalScored("Argentina", 1)

5. Dashboard polls and updates
   🔄 Every 5 seconds: GET /api/scores
   📊 Display: England 0 - 1 Argentina


┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT BREAKDOWN                           │
└─────────────────────────────────────────────────────────────────┘

Frontend (Next.js 14 + Bun)
├─ app/page.tsx              → Main dashboard
├─ app/admin/page.tsx        → Admin controls
├─ components/
│  ├─ MatchScore.tsx         → Live score from contract
│  ├─ SentimentChart.tsx     → Bias visualization
│  ├─ TipFeed.tsx            → Recent tips from SQLite
│  ├─ GoalButton.tsx         → Admin goal scoring
│  └─ WhatsAppSim.tsx        → Local testing simulator

Backend (Bun + Elysia)
├─ server/index.ts           → Webhook server
│  ├─ GET /webhook           → WhatsApp verification
│  ├─ POST /webhook          → Message handling
│  └─ GET /                  → Health check

API Routes (Next.js)
├─ app/api/tips/route.ts     → Fetch tips from SQLite
├─ app/api/scores/route.ts   → Fetch scores from contract
└─ app/api/admin/goal/route.ts → Admin goal submission

Smart Contract (Solidity)
└─ contracts/TipOracle.sol
   ├─ tip(bool)              → User prediction
   ├─ adminScoreGoal(string) → Admin only
   ├─ getSentimentBias()     → View function
   └─ engGoals / argGoals    → Score state

Utilities
├─ lib/contract.ts           → ethers.js contract wrapper
├─ lib/particle.ts           → Wallet generation
├─ lib/db.ts                 → SQLite operations
└─ lib/utils.ts              → Helper functions


┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW DIAGRAM                           │
└─────────────────────────────────────────────────────────────────┘

WhatsApp Message
      ↓
[WhatsApp Cloud API]
      ↓
POST /webhook (server:3001)
      ↓
┌─────────────────────┐
│  Parse Message      │
│  - Extract phone    │
│  - Parse prediction │
└─────────────────────┘
      ↓
┌─────────────────────┐
│  Generate Wallet    │
│  hash(phone+salt)   │
└─────────────────────┘
      ↓
┌─────────────────────┐
│  Submit to Chain    │
│  TipOracle.tip()    │
└─────────────────────┘
      ↓
┌─────────────────────┐
│  Log to SQLite      │
│  addTip()           │
└─────────────────────┘
      ↓
Dashboard (localhost:3000)
      ↓
┌─────────────────────┐
│  Display Updates    │
│  - Live tips        │
│  - Sentiment chart  │
│  - Match score      │
└─────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY CONSIDERATIONS                       │
└─────────────────────────────────────────────────────────────────┘

✅ Webhook Verification
   - Verify token check on GET /webhook
   - Prevents unauthorized webhook calls

✅ Admin Password Protection
   - Simple password gate for admin panel
   - TODO: Replace with proper auth in production

⚠️  Wallet Generation (MVP)
   - Deterministic from phone hash
   - NOT SECURE for production
   - Replace with Particle Network AA in production

✅ Environment Variables
   - Private keys in .env.local (gitignored)
   - Never commit secrets to repo

✅ Contract Access Control
   - adminScoreGoal() is onlyOwner
   - Only admin wallet can score goals


┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────┘

Development:
├─ Frontend: localhost:3000 (Next.js dev server)
├─ Backend: localhost:3001 (Bun server)
├─ Database: ./omnitip.db (SQLite file)
└─ Blockchain: opBNB Testnet

Production:
├─ Frontend: Vercel (Next.js)
├─ Backend: Railway/Fly.io (Bun server)
├─ Database: Turso/Cloudflare D1 (SQLite)
└─ Blockchain: opBNB Mainnet

Webhook Exposure:
├─ Dev: ngrok http 3001
└─ Prod: https://api.omnitip.xyz/webhook

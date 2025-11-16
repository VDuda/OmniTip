# 💰 OmniTip Payout System

Automatic reward distribution when goals are scored.

## How It Works

1. **Users send predictions** via WhatsApp (text or voice)
2. **Predictions are recorded** on-chain with their wallet address
3. **Admin scores a goal** for Argentina or England
4. **Smart contract automatically pays out** all correct predictors

## Payout Flow

```
User predicts Argentina → Tip recorded on-chain
                              ↓
Admin scores Argentina goal → adminScoreGoal("Argentina")
                              ↓
Smart contract loops through all tips
                              ↓
Finds Argentina predictors who haven't claimed
                              ↓
Automatically transfers 5 USDC to each winner
                              ↓
Marks tips as claimed
```

## Smart Contract Changes

### Auto-Distribution on Goal

When `adminScoreGoal()` is called:
- Increments the score (England or Argentina)
- Calls `_distributePayouts()` internally
- Loops through all tips
- Transfers 5 USDC to each correct predictor
- Emits `TipClaimed` events

### Mock USDC

For testnet, we deploy a Mock USDC token:
- 6 decimals (like real USDC)
- Faucet function for easy testing
- Pre-funded to TipOracle contract

## Deployment

### Deploy with Payouts

```bash
bun run deploy:contract
```

This will:
1. Deploy Mock USDC token
2. Deploy TipOracle contract
3. Fund TipOracle with 10,000 USDC
4. Display contract addresses

### Update .env.local

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...  # TipOracle address
NEXT_PUBLIC_USDC_ADDRESS=0x...      # Mock USDC address
```

## Testing Payouts

### 1. Send Predictions

Send WhatsApp messages predicting Argentina:
- "Argentina will score next"
- "I think Argentina wins"
- Voice note: "Argentina is going to score"

### 2. Check Contract State

```bash
bun run check:contract
```

You'll see:
```
📊 Sentiment Bias:
   England tips: 0
   Argentina tips: 3
   Total tips: 3
```

### 3. Trigger Argentina Goal

```bash
bun run argentina:goal
```

Output:
```
⚽ Triggering Argentina Goal & Payouts...

📊 Current State:
   England: 0 goals
   Argentina: 0 goals
   Tips - England: 0, Argentina: 3

🔍 Argentina Predictors:
   0x7CE4...74a8 - Current USDC: 0.0
   0x1234...5678 - Current USDC: 0.0
   0xabcd...ef90 - Current USDC: 0.0

🎯 Found 3 Argentina predictor(s)

⚽ Scoring Argentina goal...
✅ Transaction confirmed!

📋 Events:
   ⚽ Goal: Argentina - New score: 1
   💰 Payout: 0x7CE4...74a8 received 5.0 USDC
   💰 Payout: 0x1234...5678 received 5.0 USDC
   💰 Payout: 0xabcd...ef90 received 5.0 USDC

💵 Updated USDC Balances:
   0x7CE4...74a8 - 5.0 USDC
   0x1234...5678 - 5.0 USDC
   0xabcd...ef90 - 5.0 USDC

🏆 Argentina Score: 0 → 1
```

## Contract Details

### Reward Amount

- **5 USDC per correct prediction**
- Configurable in contract: `REWARD = 5 * 10**6`

### Gas Costs

- Admin pays gas for scoring goals
- Users pay no gas (gasless predictions via admin wallet)
- Payouts are included in the `adminScoreGoal()` transaction

### Security

- Only contract owner can score goals
- Payouts can only be claimed once per tip
- Contract must have sufficient USDC balance

## Production Considerations

### Real USDC

For mainnet/production:
1. Use real USDC contract address
2. Fund TipOracle with real USDC
3. Set appropriate reward amounts
4. Consider gas optimization for large batches

### Alternative: Manual Claims

The contract also has a `claim()` function for users to claim manually:
```solidity
function claim() external
```

This could be used if auto-distribution gas costs are too high.

## Scripts Reference

| Command | Description |
|---------|-------------|
| `bun run deploy:contract` | Deploy contracts with USDC |
| `bun run check:contract` | View contract state |
| `bun run argentina:goal` | Score Argentina goal + payouts |
| `bun run check:balance` | Check admin wallet balance |

## Events

### NewTip
```solidity
event NewTip(address indexed wallet, bool predictsEnglandNext, uint256 timestamp)
```

### GoalScored
```solidity
event GoalScored(string team, uint256 newScore)
```

### TipClaimed
```solidity
event TipClaimed(address indexed wallet, uint256 amount)
```

## Example Flow

```bash
# 1. Deploy contracts
bun run deploy:contract

# 2. Update .env.local with addresses

# 3. Restart server
bun run dev

# 4. Send WhatsApp predictions
# "Argentina will score!"

# 5. Check tips
bun run check:contract

# 6. Trigger payout
bun run argentina:goal

# 7. View on explorer
# https://opbnb-testnet.bscscan.com/tx/0x...
```

## Troubleshooting

### "Insufficient USDC balance"
- Fund the TipOracle contract with more USDC
- Use the Mock USDC `mint()` function

### "No Argentina predictors found"
- Send WhatsApp messages predicting Argentina first
- Check contract state with `bun run check:contract`

### "Transaction failed"
- Ensure admin wallet has enough BNB for gas
- Check contract is deployed correctly
- Verify USDC contract address is correct

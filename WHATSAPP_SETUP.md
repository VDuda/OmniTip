# WhatsApp Cloud API Setup Guide

This guide walks you through setting up WhatsApp Business API to receive messages and send them to your OmniTip webhook.

## Prerequisites

- Meta Business Account
- Facebook Developer Account
- A phone number for WhatsApp Business

## Step 1: Create a Meta App

1. Go to https://developers.facebook.com/apps
2. Click **"Create App"**
3. Select **"Business"** as the app type
4. Fill in app details:
   - App name: `OmniTip`
   - Contact email: your email
5. Click **"Create App"**

## Step 2: Add WhatsApp Product

1. In your app dashboard, find **"WhatsApp"** in the products list
2. Click **"Set up"**
3. Select or create a **Business Portfolio**
4. You'll be taken to the WhatsApp setup page

## Step 3: Get Your Credentials

From the WhatsApp setup page, copy these values to your `.env.local`:

```bash
# From "API Setup" section
WHATSAPP_ACCESS_TOKEN=your_temporary_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# Create your own verify token (any random string)
WHATSAPP_VERIFY_TOKEN=omnitip-verify-token-change-me
```

## Step 4: Expose Your Local Server

Since WhatsApp needs a public URL, use ngrok or similar:

```bash
# Install ngrok if you haven't
# Visit https://ngrok.com/download

# Start your server
bun run dev

# In another terminal, expose port 3001
ngrok http 3001
```

You'll get a URL like: `https://abc123.ngrok.io`

## Step 5: Configure Webhook in Meta

1. In the WhatsApp setup page, go to **"Configuration"**
2. Click **"Edit"** next to Webhook
3. Enter your webhook details:
   - **Callback URL**: `https://abc123.ngrok.io/webhook`
   - **Verify Token**: `omnitip-verify-token-change-me` (same as in .env.local)
4. Click **"Verify and Save"**

If successful, you'll see ✅ "Webhook verified!" in your server logs.

## Step 6: Subscribe to Webhook Events

1. Still in Configuration, click **"Manage"** under Webhook fields
2. Subscribe to these events:
   - ✅ **messages** (required)
3. Click **"Done"**

## Step 7: Test the Integration

### Send a Test Message

1. In the WhatsApp setup page, find **"Send and receive messages"**
2. You'll see a test phone number (valid for 24 hours)
3. Send a message to this number from your phone:
   ```
   England next goal
   ```

### Check Your Server Logs

You should see:
```
📱 Message from 1234567890: England next goal
✅ Tip submitted on-chain: 0xabc123...
💾 Tip saved: 0x1234...5678
```

### Verify in Dashboard

1. Open http://localhost:3000
2. Check the "Live Tips" feed
3. You should see your tip with the wallet address

## Step 8: Get a Permanent Access Token (Production)

The temporary token expires in 24 hours. For production:

1. Go to **"System Users"** in Meta Business Settings
2. Create a system user
3. Assign WhatsApp permissions
4. Generate a permanent token
5. Update `WHATSAPP_ACCESS_TOKEN` in `.env.local`

## Webhook Payload Format

The server handles this WhatsApp Cloud API format:

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "1234567890",
          "type": "text",
          "text": {
            "body": "England next goal"
          }
        }]
      }
    }]
  }]
}
```

## How It Works

1. **User sends WhatsApp message** → "Messi next goal"
2. **WhatsApp Cloud API** → Sends webhook POST to your server
3. **Server extracts phone number** → `from: "5491122334455"`
4. **Server generates wallet** → Deterministic wallet from phone hash
5. **Server parses prediction** → "Messi" = Argentina
6. **Server submits to blockchain** → `contract.tip(false)` (false = Argentina)
7. **Server logs to SQLite** → For dashboard display
8. **Dashboard updates** → Shows new tip in feed

## Troubleshooting

### Webhook verification fails
- Check `WHATSAPP_VERIFY_TOKEN` matches in both .env.local and Meta dashboard
- Ensure ngrok is running and URL is correct
- Check server logs for errors

### Messages not received
- Verify webhook subscription includes "messages"
- Check ngrok URL is still active (free tier expires after 2 hours)
- Look for errors in server logs

### "Cannot find module 'elysia'" error
- Run `bun install` first

### Wallet not generating
- Check phone number format (should include country code)
- Verify `WALLET_SALT` is set in .env.local

## Production Deployment

For production, replace ngrok with:

1. **Deploy server to Railway/Fly.io**:
   ```bash
   # Railway
   railway up
   
   # Or Fly.io
   fly deploy
   ```

2. **Update webhook URL** in Meta dashboard to your production URL

3. **Use permanent access token** instead of temporary one

## Next Steps

- Add voice message transcription (Whisper)
- Send confirmation messages back to users
- Add rich message templates
- Implement message rate limiting

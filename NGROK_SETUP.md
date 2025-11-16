# 🌐 Ngrok Setup for WhatsApp Webhook

This guide helps you expose your local development server to the internet so Meta/Facebook can send WhatsApp webhooks to your app.

## 📋 Prerequisites

- [x] Ngrok downloaded (in project root)
- [ ] Ngrok account (free tier is fine)
- [ ] WhatsApp Business API configured in Meta Developer Portal

## 🚀 Quick Start

### 1. **Authenticate Ngrok** (One-time setup)

Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken

```bash
./ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 2. **Start Your Development Server**

```bash
bun run dev
```

This starts:
- **Next.js** on `http://localhost:3000`
- **Elysia webhook server** on `http://localhost:3000` (same port)

### 3. **Start Ngrok Tunnel**

In a **new terminal**:

```bash
cd /home/vovk/hackathons/OmniTip
./ngrok http 3000
```

You'll see output like:
```
Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the `https://abc123.ngrok.io` URL** - this is your public webhook URL!

### 4. **Configure WhatsApp Webhook in Meta Developer Portal**

1. Go to: https://developers.facebook.com/apps
2. Select your app
3. Navigate to: **WhatsApp > Configuration**
4. Click **Edit** next to Webhook

**Webhook Settings:**
- **Callback URL**: `https://YOUR_NGROK_URL/api/webhook`
  - Example: `https://abc123.ngrok.io/api/webhook`
- **Verify Token**: `omnitip-verify-bnb-hack-2025` (from your `.env.local`)

5. Click **Verify and Save**

6. **Subscribe to Webhook Fields**:
   - ✅ `messages` (required for receiving messages)
   - ✅ `message_status` (optional, for delivery status)

### 5. **Test the Webhook**

Send a WhatsApp message to your bot number:

```
"Messi will score 2 goals!"
```

**Check logs in your terminal** where `bun run dev` is running:

```
📱 Received WhatsApp message from +5491122334455
🎤 Processing voice note...
🧠 Sentiment: POSITIVE (0.85)
⛓️  Submitting to blockchain...
✅ Tip recorded! TX: 0x1234...
```

### 6. **View Ngrok Dashboard**

Open in browser: http://127.0.0.1:4040

This shows:
- All incoming webhook requests
- Request/response details
- Useful for debugging!

## 🔧 Troubleshooting

### ❌ "Webhook verification failed"

**Problem**: Meta can't verify your webhook

**Solution**:
1. Check `WHATSAPP_VERIFY_TOKEN` in `.env.local` matches what you entered in Meta
2. Ensure ngrok is running: `./ngrok http 3000`
3. Ensure dev server is running: `bun run dev`
4. Check ngrok dashboard (http://127.0.0.1:4040) for incoming requests

### ❌ "Connection refused"

**Problem**: Ngrok can't connect to your local server

**Solution**:
1. Make sure `bun run dev` is running
2. Check the server is on port 3000: `lsof -i :3000`
3. Try restarting ngrok

### ❌ "Ngrok session expired"

**Problem**: Free tier ngrok URLs expire after 2 hours

**Solution**:
1. Restart ngrok: `./ngrok http 3000`
2. Update webhook URL in Meta Developer Portal with new ngrok URL
3. Consider ngrok paid plan for persistent URLs ($8/month)

### ❌ "No messages received"

**Problem**: WhatsApp messages not reaching your server

**Solution**:
1. Check webhook is subscribed to `messages` field in Meta portal
2. Verify phone number is registered in WhatsApp Business API
3. Check ngrok dashboard for incoming requests
4. Look for errors in `bun run dev` terminal

## 📱 Testing Flow

1. **Start services**:
   ```bash
   # Terminal 1
   bun run dev
   
   # Terminal 2
   ./ngrok http 3000
   ```

2. **Send test message** to your WhatsApp bot number

3. **Check logs**:
   - Terminal 1: Server logs
   - Browser: http://127.0.0.1:4040 (ngrok dashboard)

4. **Verify on blockchain**:
   - Check transaction on [opBNB Testnet Explorer](https://opbnb-testnet.bscscan.com/)
   - Search for your contract address

## 🎯 Production Deployment

For production, **don't use ngrok**. Instead:

1. **Deploy to Vercel/Railway/Render**:
   ```bash
   # Vercel (recommended for Next.js)
   vercel deploy
   ```

2. **Update webhook URL** in Meta to your production URL:
   ```
   https://your-app.vercel.app/api/webhook
   ```

3. **Set environment variables** in your hosting platform

## 🔐 Security Notes

- ✅ Ngrok URLs are HTTPS by default (required by Meta)
- ✅ Webhook verification token prevents unauthorized requests
- ⚠️ Free ngrok URLs are public - anyone with the URL can access
- ⚠️ Don't commit ngrok URLs to git (they change frequently)

## 📚 Useful Links

- [Ngrok Dashboard](https://dashboard.ngrok.com/)
- [Meta WhatsApp Webhooks Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [opBNB Testnet Explorer](https://opbnb-testnet.bscscan.com/)

## 💡 Pro Tips

1. **Keep ngrok running** in a separate terminal/tmux session
2. **Use ngrok dashboard** (http://127.0.0.1:4040) to debug webhook issues
3. **Test with curl** before configuring Meta:
   ```bash
   curl https://YOUR_NGROK_URL/api/webhook?hub.mode=subscribe&hub.verify_token=omnitip-verify-bnb-hack-2025&hub.challenge=test
   ```
4. **Save your ngrok URL** somewhere - you'll need to update Meta if it changes

---

**Ready to test?** Run these commands in order:

```bash
# Terminal 1: Start dev server
bun run dev

# Terminal 2: Start ngrok
./ngrok http 3000

# Then configure webhook in Meta Developer Portal
```

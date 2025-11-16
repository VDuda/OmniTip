import { Elysia } from 'elysia';
import { parseTip, maskPhone } from '../lib/utils';
import { addTip } from '../lib/db';
import { getWalletForPhone } from '../lib/particle';
import { submitTip, CONTRACT_ADDRESS } from '../lib/contract';

const app = new Elysia();

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'omnitip-verify-token';

// WhatsApp webhook verification (GET)
app.get('/webhook', ({ query }) => {
  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified!');
    return new Response(challenge, { status: 200 });
  } else {
    console.log('❌ Webhook verification failed');
    return new Response('Forbidden', { status: 403 });
  }
});

// WhatsApp webhook for incoming messages (POST)
app.post('/webhook', async ({ body }) => {
  try {
    const data = body as any;

    // WhatsApp Cloud API format
    if (data.object === 'whatsapp_business_account') {
      const entry = data.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) {
        return new Response('No messages', { status: 200 });
      }

      const message = messages[0];
      const from = message.from; // Phone number with country code
      const messageType = message.type;
      let text = '';

      // Handle different message types
      if (messageType === 'text') {
        text = message.text?.body || '';
      } else if (messageType === 'audio') {
        // TODO: Download and transcribe audio
        text = '[Voice message - transcription pending]';
      } else {
        console.log(`Unsupported message type: ${messageType}`);
        return new Response('OK', { status: 200 });
      }

      console.log(`📱 Message from ${from}: ${text}`);

      const predictsEngland = parseTip(text);

      // Generate wallet for phone number
      const wallet = getWalletForPhone(from);
      const walletAddress = wallet.address;

      // Submit tip to contract if address is configured
      let txHash = '';
      if (CONTRACT_ADDRESS) {
        try {
          txHash = await submitTip(wallet, predictsEngland);
          console.log(`✅ Tip submitted on-chain: ${txHash}`);
        } catch (e: any) {
          console.error('❌ Contract call failed:', e.message);
          // Continue even if contract call fails
        }
      }

      // Log to database
      addTip({
        phone: maskPhone(from),
        text,
        predictsEngland,
        wallet: walletAddress,
        timestamp: Date.now(),
      });

      console.log(`💾 Tip saved: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);

      return new Response('OK', { status: 200 });
    }

    // Fallback for Twilio format (for testing)
    const { From, Body, MediaUrl0 } = data;
    if (From && Body) {
      const text = Body;
      const predictsEngland = parseTip(text);

      const wallet = getWalletForPhone(From);
      const walletAddress = wallet.address;

      let txHash = '';
      if (CONTRACT_ADDRESS) {
        try {
          txHash = await submitTip(wallet, predictsEngland);
          console.log(`Tip submitted on-chain: ${txHash}`);
        } catch (e: any) {
          console.error('Contract call failed:', e.message);
        }
      }

      addTip({
        phone: maskPhone(From),
        text,
        predictsEngland,
        wallet: walletAddress,
        timestamp: Date.now(),
      });

      return `Tip logged! Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}${txHash ? ` | Tx: ${txHash.slice(0, 10)}...` : ''}`;
    }

    return new Response('OK', { status: 200 });
  } catch (e: any) {
    console.error('Webhook error:', e);
    return new Response(e?.message || 'error', { status: 500 });
  }
});

app.get('/', () => 'OmniTip Webhook Server');

app.listen(3001);
console.log('🚀 Server listening on http://localhost:3001');
console.log(`📱 Webhook URL: http://localhost:3001/webhook`);
console.log(`🔑 Verify token: ${VERIFY_TOKEN}`);

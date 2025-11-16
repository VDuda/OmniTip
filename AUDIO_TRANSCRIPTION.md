# 🎤 Audio Message Transcription Setup

OmniTip can process WhatsApp voice messages and transcribe them to text for sentiment analysis.

## How It Works

1. **User sends voice note** → WhatsApp message with `type: "audio"`
2. **Webhook receives audio ID** → `message.audio.id`
3. **Download audio file** → Use WhatsApp Cloud API to get the audio file
4. **Transcribe audio** → Convert speech to text
5. **Process as normal** → Parse prediction and submit to blockchain

## Current Implementation

✅ **Audio download** - Implemented in `lib/whatsapp.ts`
⚠️ **Transcription** - Placeholder (needs API key or local model)

## Transcription Options

### Option 1: OpenAI Whisper API (Recommended for MVP)

**Pros:**
- ✅ Best accuracy
- ✅ Easy to implement
- ✅ Supports multiple languages
- ✅ Fast processing

**Cons:**
- ❌ Costs $0.006 per minute (~$0.01 per voice note)
- ❌ Requires OpenAI API key

**Setup:**

1. Get API key from: https://platform.openai.com/api-keys

2. Add to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-...
   ```

3. Update `lib/whatsapp.ts`:
   ```typescript
   export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
     const formData = new FormData();
     formData.append('file', new Blob([audioBuffer], { type: 'audio/ogg' }), 'audio.ogg');
     formData.append('model', 'whisper-1');
     formData.append('language', 'en'); // or 'es' for Spanish
     
     const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
       },
       body: formData,
     });
     
     if (!response.ok) {
       throw new Error(`Whisper API error: ${response.statusText}`);
     }
     
     const data = await response.json();
     return data.text;
   }
   ```

4. Install form-data if needed:
   ```bash
   bun add form-data
   ```

### Option 2: Groq Whisper API (Fast & Cheap)

**Pros:**
- ✅ Very fast (2-3x faster than OpenAI)
- ✅ Free tier available
- ✅ Same Whisper model

**Cons:**
- ❌ Newer service (less proven)

**Setup:**

1. Get API key from: https://console.groq.com/

2. Add to `.env.local`:
   ```bash
   GROQ_API_KEY=gsk_...
   ```

3. Update `lib/whatsapp.ts`:
   ```typescript
   export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
     const formData = new FormData();
     formData.append('file', new Blob([audioBuffer], { type: 'audio/ogg' }), 'audio.ogg');
     formData.append('model', 'whisper-large-v3');
     
     const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
       },
       body: formData,
     });
     
     const data = await response.json();
     return data.text;
   }
   ```

### Option 3: Local Whisper Model (Free but Complex)

**Pros:**
- ✅ Completely free
- ✅ No API limits
- ✅ Privacy (no data sent externally)

**Cons:**
- ❌ Requires GPU for good performance
- ❌ Complex setup
- ❌ Slower on CPU

**Setup:**

1. Install Whisper:
   ```bash
   bun add @xenova/transformers
   ```

2. Update `lib/whatsapp.ts`:
   ```typescript
   import { pipeline } from '@xenova/transformers';
   
   let transcriber: any = null;
   
   export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
     // Initialize transcriber (only once)
     if (!transcriber) {
       console.log('🔄 Loading Whisper model...');
       transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
       console.log('✅ Whisper model loaded');
     }
     
     // Save audio to temp file
     const tempPath = `/tmp/audio-${Date.now()}.ogg`;
     await Bun.write(tempPath, audioBuffer);
     
     // Transcribe
     const result = await transcriber(tempPath);
     
     // Clean up
     await Bun.file(tempPath).delete();
     
     return result.text;
   }
   ```

**Note:** First run will download ~40MB model. Use `whisper-tiny.en` for English only, or `whisper-small` for multilingual.

### Option 4: AssemblyAI (Good Balance)

**Pros:**
- ✅ Good accuracy
- ✅ Free tier (100 hours/month)
- ✅ Speaker diarization available

**Cons:**
- ❌ Slower than Groq/OpenAI

**Setup:**

1. Get API key from: https://www.assemblyai.com/

2. Add to `.env.local`:
   ```bash
   ASSEMBLYAI_API_KEY=...
   ```

3. Install SDK:
   ```bash
   bun add assemblyai
   ```

4. Update `lib/whatsapp.ts`:
   ```typescript
   import { AssemblyAI } from 'assemblyai';
   
   export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
     const client = new AssemblyAI({
       apiKey: process.env.ASSEMBLYAI_API_KEY!,
     });
     
     // Upload audio
     const uploadUrl = await client.files.upload(audioBuffer);
     
     // Transcribe
     const transcript = await client.transcripts.transcribe({
       audio: uploadUrl,
       language_code: 'en', // or 'es'
     });
     
     if (transcript.status === 'error') {
       throw new Error(transcript.error);
     }
     
     return transcript.text || '';
   }
   ```

## Recommendation

**For Hackathon/MVP:**
- Use **Groq** (fast, free tier, easy setup)

**For Production:**
- Use **OpenAI Whisper** (most reliable, worth the cost)

## Testing Audio Messages

### Via WhatsApp

1. Send a voice note to your bot number
2. Check server logs:
   ```
   🎤 Processing audio message: 1234567890
   🎤 Audio URL: https://...
   📄 MIME type: audio/ogg; codecs=opus
   ✅ Downloaded audio: 12345 bytes
   📝 Transcription: "Messi will score two goals"
   📱 Message from +5491122334455: Messi will score two goals
   ```

### Test Payload

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15550783881",
            "phone_number_id": "106540352242922"
          },
          "contacts": [{
            "profile": { "name": "Test User" },
            "wa_id": "5491122334455"
          }],
          "messages": [{
            "from": "5491122334455",
            "id": "wamid.test123",
            "timestamp": "1744344496",
            "type": "audio",
            "audio": {
              "mime_type": "audio/ogg; codecs=opus",
              "sha256": "test-hash",
              "id": "1908647269898587",
              "url": "https://lookaside.fbsbx.com/whatsapp_business/attachments/?mid=...",
              "voice": true
            }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

## Audio Format

WhatsApp sends audio as:
- **Format**: OGG with Opus codec
- **Sample rate**: 16 kHz
- **Channels**: Mono
- **Typical size**: 10-50 KB per message

All transcription services support this format natively.

## Cost Estimation

**OpenAI Whisper:**
- $0.006 per minute
- Average voice note: 10 seconds = $0.001
- 1000 voice notes = $1

**Groq:**
- Free tier: 14,400 requests/day
- Effectively free for hackathon

**Local Whisper:**
- Free, but requires compute resources

## Next Steps

1. Choose a transcription provider
2. Add API key to `.env.local`
3. Implement the transcription function
4. Test with real voice messages
5. Add error handling and retries

## Troubleshooting

### "Failed to get media URL"
- Check `WHATSAPP_ACCESS_TOKEN` is valid
- Verify token has `whatsapp_business_messaging` permission

### "Failed to download audio"
- Audio URLs expire after 5 minutes
- Process immediately when webhook is received

### "Transcription failed"
- Check API key is valid
- Verify audio file is not corrupted
- Check API rate limits

### Audio file is empty
- WhatsApp may send notification before audio is ready
- Add retry logic with exponential backoff

## Example: Complete Implementation with OpenAI

```typescript
// lib/whatsapp.ts
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not set, skipping transcription');
    return '[Voice message - transcription disabled]';
  }

  try {
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: 'audio/ogg' }), 'audio.ogg');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Whisper API error: ${error}`);
    }
    
    const data = await response.json();
    console.log(`📝 Transcription: "${data.text}"`);
    return data.text;
  } catch (error: any) {
    console.error('❌ Transcription error:', error.message);
    return '[Voice message - transcription failed]';
  }
}
```

---

**Ready to enable voice messages?** Choose a provider and add the API key to `.env.local`!

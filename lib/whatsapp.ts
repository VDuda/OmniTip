/**
 * WhatsApp Cloud API helpers for downloading media
 */

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_API_VERSION = 'v21.0';

/**
 * Download audio file from WhatsApp Cloud API
 * @param mediaId - The media ID from the webhook payload
 * @param directUrl - Optional direct URL if provided in webhook
 * @returns Audio file as Buffer
 */
export async function downloadWhatsAppAudio(mediaId: string, directUrl?: string): Promise<Buffer> {
  if (!WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WHATSAPP_ACCESS_TOKEN not configured');
  }

  let audioUrl = directUrl;
  
  // If no direct URL provided, fetch it using the media ID
  if (!audioUrl) {
    const mediaUrlResponse = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        },
      }
    );

    if (!mediaUrlResponse.ok) {
      throw new Error(`Failed to get media URL: ${mediaUrlResponse.statusText}`);
    }

    const mediaData = await mediaUrlResponse.json() as { url: string; mime_type: string };
    audioUrl = mediaData.url;
    console.log(`📄 MIME type: ${mediaData.mime_type}`);
  }

  console.log(`🎤 Downloading audio from: ${audioUrl.substring(0, 50)}...`);

  // Download the actual audio file
  const audioResponse = await fetch(audioUrl, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
  });

  if (!audioResponse.ok) {
    throw new Error(`Failed to download audio: ${audioResponse.statusText}`);
  }

  const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
  console.log(`✅ Downloaded audio: ${audioBuffer.length} bytes`);

  return audioBuffer;
}

/**
 * Transcribe audio using Whisper API
 */
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  // Try Groq first (fast & free)
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (GROQ_API_KEY) {
    try {
      const formData = new FormData();
      const blob = new Blob([audioBuffer.buffer as ArrayBuffer], { type: 'audio/ogg' });
      formData.append('file', blob, 'audio.ogg');
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'en');
      
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📝 Transcription (Groq): "${data.text}"`);
        return data.text;
      }
    } catch (error: any) {
      console.error('❌ Groq transcription error:', error.message);
    }
  }

  // Try OpenAI Whisper as fallback
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (OPENAI_API_KEY) {
    try {
      const formData = new FormData();
      const blob = new Blob([audioBuffer.buffer as ArrayBuffer], { type: 'audio/ogg' });
      formData.append('file', blob, 'audio.ogg');
      formData.append('model', 'whisper-1');
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📝 Transcription (OpenAI): "${data.text}"`);
        return data.text;
      }
    } catch (error: any) {
      console.error('❌ OpenAI transcription error:', error.message);
    }
  }

  // No API key configured
  console.log('⚠️  No transcription API key configured (GROQ_API_KEY or OPENAI_API_KEY)');
  return '[Voice message - transcription not configured]';
}

/**
 * Process audio message from WhatsApp
 * @param audioId - Media ID from webhook
 * @param audioUrl - Optional direct URL from webhook
 * @param isVoice - Whether this is a voice recording (vs audio file)
 */
export async function processAudioMessage(
  audioId: string, 
  audioUrl?: string,
  isVoice?: boolean
): Promise<string> {
  try {
    console.log(`🎤 Processing ${isVoice ? 'voice recording' : 'audio file'}: ${audioId}`);
    
    // Download the audio file
    const audioBuffer = await downloadWhatsAppAudio(audioId, audioUrl);

    // Save to temp file if needed for transcription
    // const tempPath = `/tmp/audio-${audioId}.ogg`;
    // await Bun.write(tempPath, audioBuffer);

    // Transcribe the audio
    const transcription = await transcribeAudio(audioBuffer);

    return transcription;
  } catch (error: any) {
    console.error('❌ Audio processing error:', error.message);
    return '[Voice message - processing failed]';
  }
}

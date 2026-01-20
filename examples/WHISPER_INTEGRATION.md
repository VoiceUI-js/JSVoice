# Whisper Engine Reference Implementation

This directory contains resources for implementing high-accuracy, server-side speech recognition using OpenAI's Whisper model (or compatible APIs like Groq/Deepgram) with JSVoice.

## Why Use Whisper?

The Native Web Speech API is free and fast, but:
- It requires an active internet connection (Chrome).
- It is not supported in Firefox.
- It has lower accuracy for accents or technical terms.

**Whisper Offerings:**
- Near-perfect accuracy.
- Support for 99+ languages.
- Reliable endpointing (handling pauses).

**Trade-offs:**
- **Cost:** Requires an API Key (OpenAI charges ~$0.006/min).
- **Latency:** It is file-based (Record -> Stop -> Upload -> Transcribe). It is NOT streaming real-time char-by-char. Expect 1-3s delay after speaking.

## Integration

### 1. Frontend Setup

Import the engine and pass it to JSVoice.

```javascript
import JSVoice from 'jsvoice';
import WhisperSpeechEngine from 'jsvoice/src/engines/WhisperSpeechEngine'; // Adjust import path

const voice = new JSVoice({
  // Priority: Try Whisper first, fallback to Native if it fails
  engines: [WhisperSpeechEngine, JSVoice.NativeEngine], 
  
  // Whisper Options
  whisperEndpoint: 'http://localhost:3000/api/whisper', // Your backend proxy
  // whisperApiKey: 'sk-...' // ONLY for local dev/testing. NEVER ship this.
});

// Since Whisper is async, usage is slightly different:
// 1. User clicks "Record" -> voice.start()
// 2. User speaks...
// 3. User clicks "Stop" -> voice.stop()
// 4. ...waiting...
// 5. Command recognized!
```

### 2. Backend Setup (Required)

You must proxy requests to OpenAI to keep your API key secret. 

1. Go to `examples/backend/`
2. Create a `.env` file: `OPENAI_API_KEY=sk-...`
3. Run the server:

```bash
cd examples/backend
npm install express multer form-data node-fetch dotenv
node server.js
```

### 3. Usage Strategy

**Push-to-Talk (Best UX for Whisper)**
Since Whisper is transactional (file-based), a "Hold to Speak" or "Toggle Record" button works best.

```javascript
// React Example
<button 
  onMouseDown={() => voice.start()} 
  onMouseUp={() => voice.stop()}
>
  Hold to Speak
</button>
```

**Continuous Mode?**
JSVoice's `continuous: true` flag works differently with Whisper. The engine *could* be modified to automatically stop recording every 5 seconds, send audio, and restart. However, this creates "gaps" in audio. For true continuous streaming, use a WebSocket-based engine (like Deepgram) instead of REST-based Whisper.

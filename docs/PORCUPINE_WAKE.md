# Optional Porcupine wake-word adapter

JSVoice’s built-in wake word is **transcript-based** (listens for a phrase inside STT results). With the **default local Whisper** path those transcripts stay on-device; with `engineMode: 'native'` they may use a cloud STT service. For production always-on keyword spotting without full STT, use the optional **Picovoice Porcupine** adapter.

## Install peers

```bash
npm i jsvoice @xenova/transformers   # default STT
npm i @picovoice/porcupine-web @picovoice/web-voice-processor
```

Get an AccessKey from [Picovoice Console](https://console.picovoice.ai/).

## Usage

```js
import { createVoice } from 'jsvoice';
import { createPorcupineWakeAdapter } from 'jsvoice/engines/porcupine-wake';

const voice = createVoice();

const wake = await createPorcupineWakeAdapter({
  accessKey: process.env.PICOVOICE_ACCESS_KEY,
  keyword: 'porcupine', // built-in label when supported
  sensitivity: 0.5,
  onWake: ({ label }) => console.log('Wake:', label),
  onError: (e) => console.error(e),
});

// Auto-start JSVoice listening on wake
wake.attachToVoice(voice);
await wake.start();

// Later
// await wake.stop();
```

## Notes

- Packages are **optional peers** — not bundled into jsvoice.
- Processing is **on-device** (WASM); follow Picovoice’s license and privacy docs.
- If packages are missing, `createPorcupineWakeAdapter` / `start()` throws a clear install error.
- API surface of `@picovoice/porcupine-web` may change across major versions; pin versions in production.

## Fallback

Without Porcupine:

```js
const voice = createVoice({ wakeWord: 'hey assistant' });
```

/**
 * LEAD (AI/humans): example engine modes for JSVoice.
 * Full guide: docs/AI_IMPLEMENTATION.md · AGENTS.md · docs/LOCAL_BROWSER_WHISPER.md
 * Production import: import { createVoice } from 'jsvoice';
 * Default path needs: npm i jsvoice @xenova/transformers
 */
import { createVoice } from '../src/index.js'; // or 'jsvoice'

// ---------------------------------------------------------------------------
// 1) Default — browser Whisper tiny (any modern browser, on-device)
// Requires: npm install @xenova/transformers
// First run downloads ~30MB model (cached afterward).
// ---------------------------------------------------------------------------
const voice = createVoice({
  onStatusChange: (msg) => console.log('Status:', msg),
  onModelLoadProgress: (progress) => {
    console.log(
      'Model:',
      progress.status,
      progress.file || '',
      progress.progress != null ? `${Math.round((progress.progress > 1 ? progress.progress : progress.progress * 100))}%` : ''
    );
  },
  onEngineSelected: ({ engineName, mode }) => {
    console.log('Engine selected:', engineName, 'policy mode:', mode);
  },
  // On save-data networks, confirm download:
  // confirmModelDownload: true,
});

voice.addCommand('hello world', () => {
  voice.speak('Hello! How can I help you?');
});

// await voice.start(); // after a user gesture

// ---------------------------------------------------------------------------
// 2) Opt-in Native Web Speech (no model download; browser-dependent)
// ---------------------------------------------------------------------------
const nativeVoice = createVoice({
  engineMode: 'native',
  onStatusChange: (msg) => console.log('Native status:', msg),
});

// ---------------------------------------------------------------------------
// 3) Local-first auto (fall back to Native if local cannot init)
// ---------------------------------------------------------------------------
const autoVoice = createVoice({
  engineMode: 'auto',
  localOptions: {
    vad: { silenceMs: 1000 },
  },
});

// ---------------------------------------------------------------------------
// 4) Force private local with custom VAD
// ---------------------------------------------------------------------------
const privateVoice = createVoice({
  engineMode: 'local',
  localOptions: {
    model: 'Xenova/whisper-tiny.en',
    maxRecordMs: 12000,
    vad: { enabled: true, silenceMs: 900, energyThreshold: 0.02 },
  },
});

export { voice, nativeVoice, autoVoice, privateVoice };

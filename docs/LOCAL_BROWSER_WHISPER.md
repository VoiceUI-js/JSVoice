# Browser Whisper (default speech understanding)

> **Lead:** This is the **default** speech path for `createVoice()`.  
> AI agents implementing the library: also read **[AI_IMPLEMENTATION.md](./AI_IMPLEMENTATION.md)** and **[AGENTS.md](../AGENTS.md)**.  
> Do not confuse with server Whisper (`jsvoice/engines/whisper`).

JSVoice’s **default** speech understander is **open-source Whisper tiny** running **in the browser** via [Transformers.js](https://huggingface.co/docs/transformers.js). Audio stays on the device; the same path works in Chrome, Edge, Firefox, Safari, and other modern browsers that support `getUserMedia`, Web Workers, and WASM.

This is **not** the same as the optional **server Whisper API** engine (`jsvoice/engines/whisper`). See [examples/WHISPER_INTEGRATION.md](../examples/WHISPER_INTEGRATION.md) for the proxy/API path.

---

## Why default local?

| | Native Web Speech | Browser Whisper tiny (default) |
|--|-------------------|--------------------------------|
| **Browsers** | Chrome / Edge / Safari (varies) | Any modern browser with mic + Workers |
| **Privacy** | Often cloud (vendor) | On-device |
| **Setup** | No model download | First load ~30MB model (then cached) |
| **Language (this ship)** | Many locales | English (`whisper-tiny.en`) |
| **Latency** | Streaming partials | After each utterance (VAD / stop) |

---

## Install

```bash
npm install jsvoice @xenova/transformers
```

`@xenova/transformers` is an **optional peer** of `jsvoice` but is **required** for the default local path.

---

## Quick start

```js
import { createVoice } from 'jsvoice';

// Default: engineMode 'local' → Xenova/whisper-tiny.en
const voice = createVoice({
  onModelLoadProgress: (p) => {
    console.log(p.status, p.file, p.progress);
  },
  onStatusChange: (msg) => console.log(msg),
});

voice.addCommand('hello', () => voice.speak('Hi there'));

// After a user gesture:
await voice.start();
// Speak → pause → model transcribes → command runs
```

### Opt into vendor Web Speech (no model)

```js
const voice = createVoice({ engineMode: 'native' });
```

### Local-first with native fallback if local fails

```js
const voice = createVoice({ engineMode: 'auto' });
```

---

## Options (`localOptions`)

| Option | Default | Notes |
|--------|---------|--------|
| `model` | `Xenova/whisper-tiny.en` | English tiny only recommended this ship |
| `maxRecordMs` | `15000` | Hard cap per utterance |
| `vad.enabled` | `true` | Energy VAD auto-ends utterance |
| `vad.silenceMs` | `1200` | Silence after speech to stop |
| `vad.energyThreshold` | `0.02` | RMS threshold |
| `allowCdnFallback` | `false` | Load transformers from CDN if peer missing (CSP risk) |
| `requireUserConfirmOnSaveData` | `true` | Block auto-download when `navigator.connection.saveData` |
| `confirmModelDownload` | — | `true` or `async () => boolean` |

```js
createVoice({
  localOptions: {
    vad: { silenceMs: 900 },
    confirmModelDownload: true, // allow download even on saveData
  },
});
```

---

## UX flow

1. **Loading** — first visit downloads model weights (~30MB); progress via `onModelLoadProgress` / kit `VoiceModelLoadCard`.
2. **Ready** — model cached in browser (Cache API).
3. **Listening** — mic open; PCM captured (AudioWorklet, ScriptProcessor fallback).
4. **Silence VAD** — after speech + silence (or max duration) → **processing**.
5. **Result** — final transcript → command matching.
6. **Restart** — if `autoRestart` / continuous, next utterance starts.

There are **no interim partials** like Web Speech; treat local as **utterance-based**.

---

## CSP notes

- Prefer installing `@xenova/transformers` and allowing WASM (`script-src` / `wasm-unsafe-eval` as required by your stack).
- Model files are fetched from Hugging Face (or your mirror) on first load — set `connect-src` accordingly, or self-host models.
- Keep `allowCdnFallback: false` in production unless you trust the CDN and CSP allows it.
- `worker-src` must allow your app origin (module workers).

---

## UI kit

- `VoiceModelLoadCard` — progress / confirm / error for model download.
- `VoiceTransformersMissingCard` — missing peer dependency.
- `VoiceRecoveryPanel` — can pass `modelLoad` props for first-load UX.

---

## Direct engine import

```js
import LocalTransformersSpeechEngine from 'jsvoice/engines/local';
import { JSVoice } from 'jsvoice';

const engine = new LocalTransformersSpeechEngine({
  model: 'Xenova/whisper-tiny.en',
});
const voice = new JSVoice({ engine });
```

---

## Migration (behavior change)

| Before | After |
|--------|--------|
| `createVoice()` preferred Native Web Speech | `createVoice()` uses **local Whisper tiny** |
| Local was opt-in (`engineMode: 'local'`) | Local is **default**; use `engineMode: 'native'` to restore old preference |

---

## Security

See [SECURITY_AND_PRIVACY.md](./SECURITY_AND_PRIVACY.md). Default path keeps audio on-device. Native mode may send audio to the browser vendor.

# JSVoice — AI Implementation Guide

> ### You are reading the primary AI instruction file for this package.
>
> **Audience:** coding agents (Claude, Cursor, Copilot, Grok, Codex, etc.) and tools that help developers integrate this library after `npm install jsvoice`.  
> **Goal:** Implement JSVoice correctly in a host app without inventing APIs, mixing engines, or breaking privacy/browser constraints.
>
> | Next | Path |
> |------|------|
> | Short rules | [AGENTS.md](../AGENTS.md) |
> | Default STT | [LOCAL_BROWSER_WHISPER.md](./LOCAL_BROWSER_WHISPER.md) |
> | API tables | [API_REFERENCE.md](./API_REFERENCE.md) |
> | Privacy | [SECURITY_AND_PRIVACY.md](./SECURITY_AND_PRIVACY.md) |
> | LLM index | [llms.txt](../llms.txt) |
> | Source entry | [src/index.js](../src/index.js) (file header has the same rules) |
>
> **After npm install:** `node_modules/jsvoice/docs/AI_IMPLEMENTATION.md`

---

## 0. Critical facts (read first)

1. **Package name:** `jsvoice` (npm).
2. **Default speech understander is on-device Whisper tiny** via Transformers.js — **not** the Web Speech API.
3. **Default factory:** always prefer `createVoice()` from `jsvoice`. Do **not** use bare `new JSVoice()` unless injecting a custom engine (tests).
4. **Required peer for default path:**
   ```bash
   npm install jsvoice @xenova/transformers
   ```
5. **Default model:** `Xenova/whisper-tiny.en` (English, ~30MB first download, then cached).
6. **Browser:** works in Chrome, Edge, Firefox, Safari with mic + Web Workers + WASM + secure context (HTTPS/localhost).
7. **User gesture required** to start recognition (click/tap). Never call `start()` only on page load.
8. **Local STT is utterance-based:** listen → speech → silence VAD → process → final transcript → match commands. No streaming interim partials on local path.
9. **`JSVoice.isApiSupported` only checks Native Web Speech.** Default local path does **not** need it. Do not gate the whole app on `isApiSupported`.
10. **Server Whisper** (`jsvoice/engines/whisper`) is a **different** optional path (upload to API). Do not confuse with browser Whisper.
11. **React UI** is optional (`jsvoice/react`, `jsvoice/react/kit`). Core works in vanilla JS.
12. **Do not invent APIs.** Stick to methods listed below. Prefer `addCommand` over deprecated constructors.

---

## 1. What this library is

**JSVoice** turns spoken (or typed) phrases into **registered commands** and optional **built-in DOM actions**, with optional **browser TTS** (`speak`).

It is **not**:
- An LLM / free-form NLU chatbot
- A JSVoice-hosted cloud speech service
- A replacement for full conversational AI

**Pipeline:**

```text
Microphone
  → Speech engine (default: Local Whisper tiny in Worker)
  → Final transcript string
  → CommandManager (exact + pattern match, scopes)
  → Callback / built-in action
  → Optional speak() TTS
```

---

## 2. Install & entry points

### Install

```bash
# Default (recommended): on-device Whisper
npm install jsvoice @xenova/transformers

# React Hyper Kit also needs:
npm install react react-dom

# Optional Porcupine wake (true on-device KWS):
npm install @picovoice/porcupine-web @picovoice/web-voice-processor
```

### Import map (use these exact paths)

| Import | When to use |
|--------|-------------|
| `jsvoice` | **Default.** `createVoice`, `JSVoice`, Hybrid/Native re-exports |
| `jsvoice/core` | Pure `JSVoice` class only |
| `jsvoice/engines/local` | Direct local Whisper engine class |
| `jsvoice/engines/hybrid` | Hybrid policy engine |
| `jsvoice/engines/native` | Web Speech engine only |
| `jsvoice/engines/whisper` | **Server/API** Whisper (proxy), not browser tiny |
| `jsvoice/engines/porcupine-wake` | Optional wake adapter |
| `jsvoice/react` | `VoiceProvider`, hooks |
| `jsvoice/react/kit` | Dock, palette, HUD, full Hyper Kit |
| `jsvoice/ui-kit` | Framework-agnostic store/theme/actions |
| `jsvoice/packs/basic` | Navigation / Form / Media command packs |
| `jsvoice/packs/kit` | Kit UI command packs |
| `jsvoice/plugins/kit` | Kit plugin install helper |

Types: `src/index.d.ts`, kit `src/react/kit/index.d.ts`.

---

## 3. Canonical integration recipes

### 3.1 Vanilla JS / SPA (recommended default)

```js
import { createVoice } from 'jsvoice';

const voice = createVoice({
  // engineMode: 'local', // DEFAULT — do not change unless needed
  onStatusChange: (msg) => setStatus(msg),
  onModelLoadProgress: (p) => setModelProgress(p),
  onCommandRecognized: (phrase, raw) => console.log('ok', phrase, raw),
  onCommandNotRecognized: (raw) => console.log('miss', raw),
  onError: (err) => console.error(err),
  localOptions: {
    vad: { enabled: true, silenceMs: 1200 },
    // confirmModelDownload: true, // if saveData networks
  },
});

voice.addCommand('hello', () => {
  voice.speak('Hello');
});

voice.addCommand('go to {page}', ({ page }) => {
  navigate(page);
}, { isPattern: true });

// MUST be after user gesture:
document.getElementById('mic').onclick = () => voice.toggle();
```

### 3.2 Native Web Speech only (no model download)

```js
const voice = createVoice({ engineMode: 'native' });
// Note: fails/unavailable in Firefox. Not fully private on Chrome.
```

### 3.3 Local-first with native fallback

```js
const voice = createVoice({ engineMode: 'auto' });
```

### 3.4 React Hyper Kit

```jsx
'use client'; // Next.js App Router
import { useMemo } from 'react';
import { createVoice } from 'jsvoice';
import {
  VoiceKitProvider,
  VoiceDock,
  VoiceCommandPalette,
  VoiceHUD,
  VoiceModelLoadCard,
} from 'jsvoice/react/kit';

export function VoiceRoot({ children }) {
  const voice = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const v = createVoice({
      onModelLoadProgress: (p) => {
        /* optional: store progress in React state */
      },
    });
    v.addCommand('hello', () => v.speak('Hello'));
    return v;
  }, []);

  if (!voice) return children;

  return (
    <VoiceKitProvider voice={voice} theme="glassDark" enableKitCommands>
      {children}
      <VoiceDock />
      <VoiceHUD />
      <VoiceCommandPalette />
    </VoiceKitProvider>
  );
}
```

**SSR rules:**
- Never create `createVoice()` during SSR without a window guard.
- Mark client components; do not import engines on the server that touch `window`.

### 3.5 Tests (no mic, no model)

```js
import JSVoice from 'jsvoice/core';
// or project helpers:
// FakeSpeechEngine from test helpers / demo QA harness

const engine = new FakeSpeechEngine(); // inject compatible engine
const voice = new JSVoice({
  engine,
  skipMicrophoneCheck: true,
  autoRestart: false,
});
await voice.processText('hello world'); // preferred for unit tests
```

**Never** load real Whisper weights in CI.

---

## 4. Engine modes (do not invent new modes)

| `engineMode` | Behavior |
|--------------|----------|
| **`local`** (default) | On-device Whisper tiny.en |
| **`native`** | Browser Web Speech API only |
| **`auto`** | Prefer local; fall back to native if local cannot init |

### Engine classes

| Class | Path | Role |
|-------|------|------|
| `LocalTransformersSpeechEngine` | `jsvoice/engines/local` | Browser Whisper (default understander) |
| `HybridSpeechEngine` | `jsvoice/engines/hybrid` | Mode policy wrapper used by `createVoice` |
| `NativeSpeechEngine` | `jsvoice/engines/native` | Web Speech |
| `WhisperSpeechEngine` | `jsvoice/engines/whisper` | **Server** REST/proxy Whisper |
| `BaseSpeechEngine` | internal | Interface: `init/start/stop`, callbacks |

### Local engine options (`localOptions`)

```ts
{
  model?: string;              // default 'Xenova/whisper-tiny.en'
  maxRecordMs?: number;        // default 15000
  allowCdnFallback?: boolean;  // default false (CSP-safe)
  requireUserConfirmOnSaveData?: boolean; // default true
  confirmModelDownload?: boolean | (() => boolean | Promise<boolean>);
  vad?: {
    enabled?: boolean;         // default true
    silenceMs?: number;        // default 1200
    energyThreshold?: number;  // default 0.02
    minSpeechMs?: number;      // default 200
  };
  WorkerFactory?: () => Worker; // tests only
}
```

### Local UX states

`loading` → `ready` → `listening` → `processing` → `idle` / `error`

Show model progress UI (`onModelLoadProgress` or kit `VoiceModelLoadCard`) on first load.

---

## 5. Core API you should use

### Lifecycle

| Method | Notes |
|--------|--------|
| `await voice.start()` | Starts engine after mic permission |
| `voice.stop()` | Stops listening |
| `voice.toggle()` | Start/stop |
| `voice.speak(text, lang?)` | Browser TTS queue |
| `await voice.processText(text)` | Run command path without mic (tests, palette) |

### Commands

```js
// Exact
voice.addCommand('scroll down', () => window.scrollBy(0, 400));

// Pattern with captures
voice.addCommand('set volume to {level}', ({ level }) => {
  setVolume(Number(level));
}, { isPattern: true });

// Options
voice.addCommand('delete item', handler, {
  id: 'delete-item',
  priority: 10,
  cooldown: 1000,
  scope: 'admin',
  once: false,
  minConfidence: 0.5,
});

voice.removeCommand('scroll down'); // or by id
voice.listCommands();
voice.setScope('checkout');
voice.pushScope('modal');
voice.popScope();
voice.resetScope();
```

Pattern tokens: `{name}`, `{level:int}`, `{n:number}`, `{w:word}`.

### Introspection

| API | Purpose |
|-----|---------|
| `voice.isListening` | Mic/recognition active |
| `voice.microphoneAllowed` | Permission state |
| `voice.voiceFeedback` | Last status string |
| `voice.getEngineInfo()` | `{ name, mode, listening, supported }` |
| `voice.getSnapshot()` / `subscribe()` | Reactive snapshot |
| `voice.use(plugin)` | Register plugin |
| `voice.setOption(key, value)` | Runtime option |

### Important callbacks (`createVoice` / options)

```js
{
  onSpeechStart, onSpeechEnd,
  onCommandRecognized, onCommandNotRecognized, onActionPerformed,
  onMicrophonePermissionGranted, onMicrophonePermissionDenied,
  onWakeWordDetected, onError, onStatusChange,
  onEngineStateChange, onCommandEvaluated,
  onEngineSelected, onFallbackActivated, onTelemetry,
  onModelLoadProgress, // local model download
}
```

### Wake word

```js
createVoice({
  wakeWord: 'hey assistant',
  wakeWordTimeout: 5000,
  onWakeWordDetected: (w) => {},
});
```

Transcript-based only (STT must run). Prefer Porcupine for true KWS. With default **local**, audio stays on-device; with **native**, vendor may stream audio continuously.

---

## 6. Built-in DOM actions (security!)

When no user command matches, JSVoice may run **built-in actions** from the transcript (scroll, click, fill, zoom, theme, navigate, etc.).

**When implementing for a host app:**
- Prefer **explicit `addCommand`** over free-form DOM automation on sensitive pages.
- Gate delete/pay/submit behind confirm UI.
- Use scopes so admin phrases are inactive on public views.
- See [SECURITY_AND_PRIVACY.md](./SECURITY_AND_PRIVACY.md).

---

## 7. Source architecture (for agents navigating the repo)

```text
src/
  index.js                 # createVoice() factory — DEFAULT ENTRY
  JSVoice.js               # Core: commands, TTS, lifecycle, snapshot
  index.d.ts               # Public TypeScript types
  engines/
    HybridSpeechEngine.js          # local | native | auto policy
    LocalTransformersSpeechEngine.js  # browser Whisper (default)
    NativeSpeechEngine.js
    WhisperSpeechEngine.js         # server/API path
    BaseSpeechEngine.js
    PorcupineWakeAdapter.js
  workers/local-asr.worker.js      # Transformers.js Whisper worker
  audio/pcm-capture-worklet.js     # AudioWorklet capture source
  modules/
    RecognitionManager.js         # Wires engine callbacks → core
    CommandManager.js              # Match exact/pattern/scopes
    MicrophoneManager.js           # Ref-counted getUserMedia
    BuiltInActions.js + actions/*  # DOM action handlers
  plugins/                 # VadPlugin, FuzzyMatch, Hotkeys, …
  packs/                   # basic + kit command packs
  react/                   # Provider + hooks
  react/kit/               # Hyper UI Kit
  ui-kit/                  # Store, theme, modules (framework-agnostic)
```

### Data flow (detailed)

```text
createVoice(options)
  → HybridSpeechEngine(mode: local|native|auto)
  → JSVoice({ engine: hybrid })
  → RecognitionManager.initRecognition(engine)
  → engine.start()
       [local] mic → PCM (AudioWorklet) → VAD stop → Worker Whisper → onResult(final)
       [native] SpeechRecognition → interim/final results
  → JSVoice._handleSpeechResult(transcript)
  → CommandManager match → callback
       else BuiltInActions
```

---

## 8. Plugins & packs

```js
import VadPlugin from 'jsvoice/…'; // if exported path available; see examples
// Pattern: voice.use(pluginFn, options?)

// Packs:
import { NavigationPack, FormPack, MediaPack } from 'jsvoice/packs/basic';
// Apply packs per pack docs (install functions / iterate commands).
```

Local engine already has **built-in VAD**; external `VadPlugin` is optional/redundant for local.

---

## 9. Hyper Voice UI Kit (React)

**Import:** `jsvoice/react/kit`

**Minimum useful set:**
- `VoiceKitProvider` — required wrapper with `voice` instance
- `VoiceDock` — start/stop mic UI
- `VoiceHUD` / transcript components
- `VoiceCommandPalette` — keyboard command runner
- `VoiceModelLoadCard` — first-load Whisper progress
- `VoiceTransformersMissingCard` — missing peer
- `VoiceRecoveryPanel` — insecure context / mic blocked / troubleshooting

**Rules for agents:**
- Pass the **same** `voice` instance created with `createVoice()`.
- Theme via `theme` prop or `createVoiceTheme`.
- Do not reimplement dock logic with raw buttons unless product requires it — use kit components when possible.
- For Next.js: client-only, transpile package if needed, ensure workers bundle correctly.

---

## 10. Bundler / worker / CSP checklist

### Workers
- Local path spawns `local-asr.worker.js` as a **module worker**.
- Bundlers (Vite/Webpack/Next) must allow worker + dynamic `import('@xenova/transformers')` inside the worker.
- Demo-app Next config may alias `@xenova/transformers`.

### CSP
- Allow WASM (`wasm-unsafe-eval` / stack-specific).
- `connect-src` for model host (Hugging Face or self-host).
- `worker-src` self/origin.
- Keep `allowCdnFallback: false` in production unless intentional.

### Save-Data
If `navigator.connection.saveData`, host may need:
```js
createVoice({ confirmModelDownload: true })
// or async confirm dialog
```

---

## 11. Common mistakes (avoid these)

| Mistake | Correct approach |
|---------|------------------|
| Gate app on `JSVoice.isApiSupported` | Use default local; that flag is Native-only |
| `new JSVoice()` with no engine | Use `createVoice()` |
| Expect streaming partials on local | Local is utterance/VAD based |
| Skip `@xenova/transformers` with default mode | Install peer or set `engineMode: 'native'` |
| Call `start()` on mount without gesture | Bind to click/button |
| Use server Whisper docs for browser path | See LOCAL_BROWSER_WHISPER.md |
| Load real Whisper in Jest CI | Inject FakeSpeechEngine / mock Worker |
| Create voice during SSR | `typeof window` guard / client component |
| Auto-confirm destructive voice DOM actions | Confirm UI + scopes + explicit commands |
| Assume multilingual local by default | Default is **English** tiny.en |
| Confuse `engines/whisper` with local | `whisper` = server API; `local` = browser tiny |

---

## 12. Implementation checklist for agents

When integrating into a host app, complete:

- [ ] `npm i jsvoice @xenova/transformers` (+ react peers if kit)
- [ ] `createVoice()` singleton (or per-page with dispose care)
- [ ] Secure context (HTTPS/localhost)
- [ ] Mic start only after user gesture
- [ ] Register explicit commands for product features
- [ ] Status UI: Listening / Loading model / Understanding (processing)
- [ ] Model progress UI on first visit
- [ ] Error UI: permission denied, transformers missing, insecure context
- [ ] Tests with `processText` or FakeSpeechEngine
- [ ] Document privacy mode (local default vs native) for the product
- [ ] Scope commands on sensitive routes
- [ ] Optional: kit dock + palette for accessibility

---

## 13. Decision tree

```text
Need voice commands in a web app?
├─ Want any-browser + private STT? → createVoice()  [DEFAULT local]
├─ Want zero model download, Chrome-only OK? → createVoice({ engineMode: 'native' })
├─ Want local but recover if model fails? → createVoice({ engineMode: 'auto' })
├─ Need server-grade Whisper API? → WhisperSpeechEngine + backend proxy
├─ Need React dock/palette? → jsvoice/react/kit + createVoice()
└─ Need unit tests? → Fake engine + processText(), never real Whisper
```

---

## 14. Minimal “hello” acceptance criteria

Integration is correct when:

1. After click, status becomes listening (or loading model then listening).
2. User says a registered phrase (English for default model).
3. After short silence, command callback runs.
4. Optional: `voice.speak` replies.
5. Firefox works without Native Web Speech when using default local.
6. Denying mic shows a clear error, not a silent failure.

---

## 15. Related human docs (deeper reading)

| Doc | Use |
|-----|-----|
| [LOCAL_BROWSER_WHISPER.md](./LOCAL_BROWSER_WHISPER.md) | Default STT details |
| [API_REFERENCE.md](./API_REFERENCE.md) | Full API tables |
| [SECURITY_AND_PRIVACY.md](./SECURITY_AND_PRIVACY.md) | Privacy + DOM risk |
| [USER_GUIDE.md](./USER_GUIDE.md) | End-user UX language |
| [../DOCUMENTATION.md](../DOCUMENTATION.md) | Full developer guide |
| [../examples/setup.js](../examples/setup.js) | Engine mode examples |
| [../examples/WHISPER_INTEGRATION.md](../examples/WHISPER_INTEGRATION.md) | Server Whisper only |
| [HYPER_VOICE_UI_KIT.md](./HYPER_VOICE_UI_KIT.md) | React kit overview |
| [HYPER_VOICE_MIGRATION.md](./HYPER_VOICE_MIGRATION.md) | Behavior changes |

---

## 16. Version note

Document aligned with **jsvoice** behavior where:

- `createVoice()` default `engineMode` is **`local`**
- Default model is **`Xenova/whisper-tiny.en`**
- Package version: see `package.json`

If source and this file disagree, **trust the source** (`src/index.js`, `src/engines/*`) and update this guide.

---

## 17. Prompt snippet (for host AIs)

You can paste this into another agent when implementing:

```text
Integrate npm package "jsvoice".
- Use createVoice() from "jsvoice" (default engineMode local = browser Whisper tiny).
- Install peer @xenova/transformers.
- Do not gate on JSVoice.isApiSupported.
- Start listening only after user gesture.
- Register commands with voice.addCommand / patterns.
- Show model load progress on first use.
- Use processText or FakeSpeechEngine in tests.
- For React UI use jsvoice/react/kit.
- Read docs/AI_IMPLEMENTATION.md and docs/LOCAL_BROWSER_WHISPER.md in node_modules/jsvoice.
```

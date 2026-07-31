# AGENTS.md — JSVoice (for AI coding agents)

> **Lead:** You are helping implement or modify **jsvoice**.  
> **Full playbook (read next):** [docs/AI_IMPLEMENTATION.md](docs/AI_IMPLEMENTATION.md)  
> **Default STT:** on-device Whisper tiny via `createVoice()` — see [docs/LOCAL_BROWSER_WHISPER.md](docs/LOCAL_BROWSER_WHISPER.md)  
> **On npm:** this file is at `node_modules/jsvoice/AGENTS.md`

You are helping implement or modify **jsvoice**, a browser voice-command library.

## Read first (full detail)

| Priority | File |
|----------|------|
| 1 | [docs/AI_IMPLEMENTATION.md](docs/AI_IMPLEMENTATION.md) — complete AI implementation guide |
| 2 | [docs/LOCAL_BROWSER_WHISPER.md](docs/LOCAL_BROWSER_WHISPER.md) — default STT |
| 3 | [docs/API_REFERENCE.md](docs/API_REFERENCE.md) — API tables |
| 4 | [docs/SECURITY_AND_PRIVACY.md](docs/SECURITY_AND_PRIVACY.md) — privacy + DOM risk |
| 5 | [src/index.js](src/index.js) + [src/engines/](src/engines/) — source of truth |

When this package is installed from npm, the same files live under `node_modules/jsvoice/docs/` and `node_modules/jsvoice/AGENTS.md`.

---

## Non-negotiable product rules

1. **Default STT is on-device Whisper tiny** (`engineMode: 'local'`, model `Xenova/whisper-tiny.en`).
2. Prefer **`createVoice()`** from `jsvoice` — do not use bare `new JSVoice()` without an engine (except tests with FakeSpeechEngine).
3. Install peer for default path: **`@xenova/transformers`**.
4. **Do not** gate the app on `JSVoice.isApiSupported` (that is Native Web Speech only). Local works in Firefox without Web Speech.
5. **`start()` / `toggle()` only after a user gesture** (click).
6. Local recognition is **utterance + VAD**, not streaming partials.
7. **`jsvoice/engines/whisper`** = server/API path — not the default browser model.
8. Do **not invent APIs**. Use methods in `docs/API_REFERENCE.md` / `src/index.d.ts`.
9. Destructive voice→DOM actions need confirm + scopes; prefer explicit `addCommand`.
10. Tests: `processText()` or FakeSpeechEngine — **never** download Whisper weights in CI.

---

## Minimal correct integration

```bash
npm install jsvoice @xenova/transformers
```

```js
import { createVoice } from 'jsvoice';

const voice = createVoice({
  onModelLoadProgress: (p) => {},
  onStatusChange: (m) => {},
  onError: (e) => console.error(e),
});

voice.addCommand('hello', () => voice.speak('Hi'));

// After click:
await voice.start();
```

Native-only (optional): `createVoice({ engineMode: 'native' })`.

React kit: `jsvoice/react/kit` + client-only components + same `createVoice()` instance.

---

## Repo map (edit carefully)

```text
src/index.js              createVoice factory (default local)
src/JSVoice.js            core command/TTS lifecycle
src/engines/              local | hybrid | native | server whisper
src/workers/              local-asr.worker.js
src/modules/              CommandManager, mic, recognition, built-ins
src/react/kit/            Hyper UI Kit
src/ui-kit/               store / theme / modules
docs/AI_IMPLEMENTATION.md THIS GUIDE (detailed)
test/                     Jest + FakeSpeechEngine
```

---

## When changing the library itself

- Keep **local-first default** unless the user explicitly asks to reverse it.
- Preserve optional peer model (do not force transformers into UMD core).
- Add/adjust tests under `test/` for engines and `createVoice` defaults.
- Update **docs/AI_IMPLEMENTATION.md**, **LOCAL_BROWSER_WHISPER.md**, README, and this file together.

---

## Host-app agent prompt (copy-paste)

```text
Integrate jsvoice using createVoice() with default local Whisper.
Install @xenova/transformers. Do not use isApiSupported as a hard gate.
Start mic only on user gesture. Register addCommand phrases.
Show model load progress. Follow node_modules/jsvoice/docs/AI_IMPLEMENTATION.md.
```

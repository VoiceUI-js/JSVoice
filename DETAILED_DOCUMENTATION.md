# JSVoice: The Official Manual

**The World-Class Web Voice Library**

> **Current Version:** v2.4.2  
> **Status:** Production Ready  
> **License:** MIT  

---

## 1. Introduction

**JSVoice** is a production-grade JavaScript library that enables voice interaction in web applications. By default it understands speech with **open-source Whisper tiny in the browser** (Transformers.js). You can also opt into the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) via `engineMode: 'native'`.

### What It Does
*   **Understands speech in any modern browser:** Default on-device Whisper tiny (Chrome, Edge, Firefox, Safari with mic + Workers).
*   **Optional Native STT:** Vendor Web Speech when you set `engineMode: 'native'`.
*   **Manages State:** Tracks microphone permissions, listening states, model load, and engine lifecycles.
*   **Parses Commands:** Matches spoken phrases to functions, including variable extraction (e.g., "Set volume to 50%").
*   **Isolates Context:** Supports "Scopes" to enable/disable commands based on the active UI screen.
*   **Synthesizes Speech:** Provides a clean text-to-speech API (browser TTS).

### What It Is NOT
*   **Not a JSVoice cloud service:** Audio is not sent to JSVoice servers. Default local path keeps audio on-device; Native mode may use the browser vendor.
*   **Not an NLU/LLM:** It does not "understand" free-form intent like ChatGPT. It matches defined phrases and patterns.
*   **Not a Magic Wand:** It cannot bypass browser security rules (e.g., must be triggered by a user click).

---

## 2. Installation & Setup

### Requirements

| Requirement | Reason |
| :--- | :--- |
| **HTTPS** | Browsers block microphone access on HTTP (except localhost). |
| **User Interaction** | `start()` must be called after a user gesture (click/tap) on many devices. |

### Comparison Table

| Feature | Chrome / Edge | Safari (iOS/Mac) | Firefox |
| :--- | :--- | :--- | :--- |
| **Default local Whisper** | ✅ | ✅ (device-dependent) | ✅ |
| **Native Web Speech** | ✅ (often cloud) | ⚠️ Partial | ❌ Unsupported |
| **Synthesis (TTS)** | ✅ | ✅ | ✅ |
| **Microphone** | ✅ | ⚠️ Strict lifecycle | ✅ |

*Default path does **not** require `JSVoice.isApiSupported` (that flag is for Native only).*  
*Guide: [docs/LOCAL_BROWSER_WHISPER.md](docs/LOCAL_BROWSER_WHISPER.md).*

### Install via NPM/Yarn

```bash
# Default on-device Whisper path (recommended)
npm install jsvoice @xenova/transformers
# or
yarn add jsvoice @xenova/transformers
```

Native-only apps can omit `@xenova/transformers` and use `createVoice({ engineMode: 'native' })`.

### ES Module Usage

```javascript
import { createVoice } from 'jsvoice';

// Default: browser Whisper tiny (any modern browser)
const voice = createVoice({
  onModelLoadProgress: (p) => console.log(p),
});

// Optional: vendor Web Speech only
// const voice = createVoice({ engineMode: 'native' });
```

### CDN Usage (Prototyping)

UMD builds the core API. Full local Whisper still needs Transformers.js available to the worker (bundler or peer). For demos, prefer npm + a modern bundler.

```html
<script src="https://unpkg.com/jsvoice/dist/voice-ui.umd.min.js"></script>
<script>
  // Prefer createVoice from ESM apps; UMD global may expose JSVoice / createVoice depending on build
  const voice = typeof createVoice === 'function' ? createVoice() : new JSVoice({ engineMode: 'native' });
</script>
```

---

## 3. Core Concepts

### The Voice Lifecycle

1.  **Idle:** Engine is sleeping.
2.  **Starting:** `voice.start()` called. Permission requested.
3.  **Listening:** Microphone is active. Engine processes audio.
4.  **Processing:** User stopped speaking; browser calculates final result.
5.  **Match:** Result matches a command -> Callback execution.
6.  **No Match:** Result does not match -> `onCommandNotRecognized` fires.

### Command Resolution (O(1) vs O(N))
*   **Exact Commands:** Uses a Hash Map (O(1)). Lightning fast. Preferred for 90% of use cases.
*   **Pattern Commands:** Uses Regex iteration (O(N)). Slightly slower but allows variables (`{val}`).

### Scopes
Commands can be "Global" (always active) or "Scoped" (active only when a specific screen is visible). This prevents command collisions (e.g., "Save" doing different things on different pages).

---

## 4. Quick Start (5-Minute Success)

Copy this into your main JavaScript file. This example handles permission errors and feedback loops correctly.

```javascript
import { createVoice } from 'jsvoice';

// 1. Initialize
const voice = createVoice({
  debug: true, // See logs in console
  onStatusChange: (msg) => console.log('Status:', msg),
});

// 2. Add a Command
voice.addCommand('hello computer', () => {
  voice.speak('Hello human. Systems operational.');
});

// 3. Connect to UI (MANDATORY: Must be user-triggered)
document.getElementById('mic-btn').addEventListener('click', async () => {
  if (voice.isListening) {
    voice.stop();
  } else {
    try {
      await voice.start();
    } catch (err) {
      alert('Microphone denied: ' + err.message);
    }
  }
});
```

---

## 5. API Reference

> **Note:** Only public, stable APIs are listed here.

### `const voice = createVoice(options)`
Creates a singleton instance. See Configuration Options below.

### `voice.start(): Promise<boolean>`
Starts the engine. Rejects if microphone permission is denied.
*   **Returns:** `true` if started, `false` if already running.
*   **Throws:** `Error` if permission denied or browser unsupported.

### `voice.stop(): void`
Stops listening immediately.

### `voice.addCommand(phrase, callback, options)`
Registers a voice command.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `phrase` | `string` | The text to listen for (e.g., "scroll down"). |
| `callback` | `function` | Function to run on match. Receives extracted args. |
| `options` | `object` | `{ priority: 0, scope: 'global', minConfidence: 0.8 }` |

### `voice.setScope(scopeName)`
Switches the active command scope. Only "global" commands and commands matching `scopeName` will be active.

### `voice.pushScope(scopeName) / voice.popScope()`
Manages a stack of scopes. Useful for modals or nested UI components.

### `voice.speak(text, lang)`
Synthesizes speech.
*   `text` (string): Text to speak.
*   `lang` (string, optional): e.g., 'en-US'. Defaults to initialization language.

---

## 6. Configuration Options

```typescript
interface JSVoiceOptions {
  // Core
  lang?: string;              // 'en-US' (default)
  continuous?: boolean;       // true (default) - Keep listening after results
  interimResults?: boolean;   // true (default) - See text while speaking
  
  // Stability
  autoRestart?: boolean;      // true - Restart if engine crashes/stops
  restartDelay?: number;      // 500ms
  
  // Debugging
  debug?: boolean;            // false - Enable verbose logging
  
  // Callbacks
  onStatusChange?: (msg: string) => void;
  onCommandRecognized?: (phrase: string, args: object) => void;
  onCommandNotRecognized?: (transcript: string) => void;
  onError?: (error: Error) => void;
}
```

---

## 7. Commands System

### Exact Commands (Preferred)
These are optimized for speed.

```javascript
// High priority command (beats others)
voice.addCommand('emergency stop', stopMachine, { priority: 100 });
```

### Pattern Commands
Use curly braces `{}` to capture variables. Type inference is automatic where possible.

```javascript
voice.addCommand('move {direction} by {pixels:int} pixels', (args) => {
  // args = { direction: "left", pixels: 50 }
  moveObject(args.direction, args.pixels);
}, { isPattern: true });
```

**Supported Types:**
*   `{val}` (string, greedy)
*   `{val:int}` (integer)
*   `{val:number}` (float)
*   `{val:word}` (single word)

---

## 8. Wake Word System

> **⚠️ WARNING:** In the current version (v2.4), wake word detection requires streaming audio to the browser's recognition engine. In Chrome, this means **continuous network usage**.

```javascript
const voice = createVoice({
  wakeWord: 'hey jarvis',
  onWakeWordDetected: () => console.log('I am awake'),
});
```

**Recommendation:** Only use this feature if you understand the privacy/network implications. For strict privacy, wait for the v3.0 Local WASM engine.

---

## 9. Audio Visualization

Visualizing audio amplitude requires opening a separate `AudioContext`. 

> **Performance Note:** This creates a second media stream in some browsers, which may show a "recording" indicator twice.

```javascript
import VisualizerPlugin from 'jsvoice/plugins/visualizer';

voice.use(VisualizerPlugin);

voice.startAmplitude((levels) => {
  // levels = [128, 200, 150, ...] (Frequency data)
  drawWaveform(levels);
});
```

**Cleanup:** Always call `voice.stopAmplitude()` when unmounting components to prevent memory leaks.

---

## 10. React / Framework Integration

JSVoice is framework-agnostic, but relies on a singleton pattern.

### React Pattern

```jsx
// hooks/useVoice.js
import { useEffect } from 'react';
import { createVoice } from 'jsvoice';

// Create singleton OUTSIDE component
const voice = createVoice(); 

export function useVoice() {
  useEffect(() => {
    return () => voice.stop(); // Cleanup on unmount
  }, []);
  return voice;
}
```

**SSR Warning:** `createVoice` checks for `window`. In Next.js/Nuxt, ensure you only initialize inside `useEffect` or check `typeof window !== 'undefined'`.

---

## 11. Error Handling & Debugging

### Debug Mode
Enable `debug: true` in options to see:
*   Partial transcripts
*   Confidence scores
*   Command match failures
*   State transitions

### Common Errors

1.  **`NotAllowedError`**: User denied microphone.
    *   *Fix:* Show a UI dialog instructing them to unblock it in the URL bar.
2.  **`NetworkError`** (Native Chrome path): Client is offline.
    *   *Fix:* Use default local Whisper (`createVoice()` / `engineMode: 'local'`) which works offline after the model is cached.
3.  **`Aborted`**: Another app took the mic, or the tab went to background (mobile).
    *   *Fix:* `autoRestart: true` usually handles this.

---

## 12. Security & Privacy

### No Data Collection by JSVoice
JSVoice does **not** collect, store, or transmit your audio to JSVoice servers.

### Where audio goes
*   **Default local Whisper:** Audio is processed on-device; model weights may download from Hugging Face (or your mirror) once and cache.
*   **Native Web Speech (`engineMode: 'native'`):** Chrome often streams to Google; Safari may use Apple services.
*   **Server Whisper engine:** Audio is sent to your proxy / provider.

### Best Practice
Always include a clear "Listening" indicator. Never record without user consent. See [docs/SECURITY_AND_PRIVACY.md](docs/SECURITY_AND_PRIVACY.md).

---

## 13. FAQ

**Q: Why doesn't Native mode work in Firefox?**
A: Mozilla has not implemented the Web Speech API. Use the **default** `createVoice()` local Whisper path (or `engineMode: 'local'`), which works in Firefox with mic + Workers + `@xenova/transformers`.

**Q: Can I use this completely offline?**
A: Yes with the **default local** path after the first model download (~30MB Whisper tiny, then cached). Use `engineMode: 'local'` and avoid Native. Install `@xenova/transformers`.

**Q: Is it safe for production?**
A: Yes, when you handle permissions, secure context, and first-load model UX. Prefer default local for privacy; use `autoRestart` and clear status UI for utterance-based local STT.

---

## 14. Versioning & Roadmap

JSVoice follows [Semantic Versioning](https://semver.org/).

*   **Current:** Default on-device Whisper tiny (Transformers.js), hybrid policy, Hyper UI Kit, O(1) matching.
*   **Planned:**
    *   Stronger on-device wake (Porcupine / WASM KWS)
    *   Multilingual local models as first-class options
    *   State Machine architecture refactor

### Deprecations
*   `addPatternCommand` is deprecated. Use `addCommand(..., { isPattern: true })`.

---

## 15. Contributing

We welcome PRs! 

1.  **Fork** the repo.
2.  **Clone** locally.
3.  **Run Tests:** `npm test`.
4.  **Lint:** `npm run lint`.

Please verify that your changes pass the new **CommandManager** test suite before submitting.

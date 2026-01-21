# JSVoice: The Official Manual

**The World-Class Web Voice Library**

> **Current Version:** v2.4.2  
> **Status:** Production Ready  
> **License:** MIT  

---

## 1. Introduction

**JSVoice** is a production-grade JavaScript library that enables voice interaction in web applications. It serves as a robust wrapper around the standard [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API), normalizing inconsistent browser behaviors and adding a powerful command management layer.

### What It Does
*   **Normalizes Speech Recognition:** Handles differences between Chrome, Edge, Safari, and mobile browsers.
*   **Manages State:** Tracks microphone permissions, listening states, and engine lifecycles.
*   **Parses Commands:** Matches spoken phrases to functions, including variable extraction (e.g., "Set volume to 50%").
*   **Isolates Context:** Supports "Scopes" to enable/disable commands based on the active UI screen.
*   **Synthesizes Speech:** Provides a clean text-to-speech API.

### What It Is NOT
*   **Not a Cloud Service:** It does not stream audio to JSVoice servers. It strictly uses the browser's native capabilities (which may stream to Google/Apple depending on the browser vendor).
*   **Not an NLU/LLM:** It does not "understand" intent like ChatGPT. It matches defined phrases and patterns.
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
| **Recognition** | ✅ Excellent (Cloud) | ⚠️ Good (Device/Cloud) | ❌ Unsupported |
| **Synthesis** | ✅ Excellent | ✅ Excellent | ✅ Good |
| **Microphone** | ✅ Standard permissions | ⚠️ Strict lifecycle | ✅ Standard permissions |

*Note: JSVoice automatically detects browser support via `JSVoice.isApiSupported`.*

### Install via NPM/Yarn

```bash
npm install jsvoice
# or
yarn add jsvoice
```

### ES Module Usage

```javascript
import { createVoice } from 'jsvoice';

const voice = createVoice();
```

### CDN Usage (Prototyping)

```html
<script src="https://unpkg.com/jsvoice/dist/voice-ui.umd.min.js"></script>
<script>
  const voice = JSVoice.createVoice();
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
2.  **`NetworkError`** (Chrome): Client is offline.
    *   *Fix:* Chrome requires internet for high-quality recognition. Use offline fallback if available.
3.  **`Aborted`**: Another app took the mic, or the tab went to background (mobile).
    *   *Fix:* `autoRestart: true` usually handles this.

---

## 12. Security & Privacy

### No Data Collection
JSVoice does **not** collect, store, or transmit your audio. 

### Browser Vendors
*   **Chrome:** Streams audio to Google Cloud (unless using on-device Speech API, available in newer Pixel phones).
*   **Safari/iOS:** May handle on-device or send to Apple.
*   **Firefox:** Not supported.

### Best Practice
Always include a clear "Listening" indicator in your UI. Never record without user consent.

---

## 13. FAQ

**Q: Why doesn't this work in Firefox?**
A: Mozilla has not implemented the Web Speech API (`SpeechRecognition`). There is no workaround without using a third-party paid API or our experimental WASM engine.

**Q: Can I use this completely offline?**
A: Only on browsers that support on-device recognition (e.g., Safari on newer iOS, Chrome on Pixel). For 100% offline guarantee on all devices, you need our `LocalWhisperEngine` (separate plugin, currently beta).

**Q: Is it safe for production?**
A: Yes, validation logic and cleanup routines are robust. However, you must handle the reality that browser speech APIs can be fickle (e.g., stopping randomly). Utilize the `autoRestart` option.

---

## 14. Versioning & Roadmap

JSVoice follows [Semantic Versioning](https://semver.org/).

*   **v2.4.x (Current):** Stability, O(1) matching, critical bug fixes.
*   **v3.0 (Planned):**
    *   Local WASM Wake Word (Privacy first)
    *   Full offline engine via Transformers.js as a core option
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

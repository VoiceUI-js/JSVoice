
# JSVoice

> A lightweight JavaScript library that adds **voice commands** (Web Speech API) and **speech synthesis** to any website.
> Ideal for accessibility, hands-free navigation, and voice-driven UI demos.

---

## ✨ Features

* Start/stop voice recognition with minimal code
* **Built-in DOM actions:** scroll up/down/top/bottom, zoom in/out/reset, fill input, click button
* **Custom commands API** — register your own phrases → handlers
* **Status callback** to show mic/recognition state in your UI
* **Auto-restart** (optional) when recognition ends unexpectedly
* **Speech synthesis** helper: `speak(text)`
* Progressive enhancement: detect API availability and fail gracefully

---

## ⚙️ Requirements

* Browser with Web Speech API (recognition & synthesis): Chrome/Edge recommended
* HTTPS origin for microphone access
* User gesture typically required to start recognition

Use `JSVoice.isApiSupported` to detect support.

---

## 📦 Installation

```bash
npm install jsvoice
# or: yarn add jsvoice / pnpm add jsvoice
```

---

## 🏁 Quick Start

```js
import JSVoice from 'jsvoice';

const voice = new JSVoice({
  onStatusChange: (msg) => {
    document.getElementById('status').textContent = msg;
  },
  onCommandRecognized: (cmd, raw, result) => {
    console.log('✅ matched:', cmd, 'raw:', raw, 'result:', result);
  },
  onError: (e) => console.error('voice error:', e),
});

// Start/stop from a user gesture
document.getElementById('micBtn').addEventListener('click', () => voice.toggle());

// Register a custom command
voice.addCommand('open settings', () => {
  alert('Opening settings…');
});
```

Minimal HTML:

```html
<button id="micBtn">🎤 Mic</button>
<div id="status">Voice commands ready. Click mic to start.</div>
```

---

## 🧠 Built-In Commands

All phrases are matched case-insensitively after punctuation cleanup.

### Scrolling

* “scroll down”
* “scroll up”
* “scroll to bottom” / “scroll full down”
* “scroll to top” / “scroll full up”

### Zoom (`document.body.style.zoom`)

* “zoom in” / “zoom out” / “reset zoom”
  Range: 50%–200%, step 10%

### Fill an input

```
type <VALUE> in <FIELD>
fill <VALUE> in <FIELD>
```

Examples:

* “type John Doe in name”
* “fill "[hello@example.com](mailto:hello@example.com)" in email” (quotes optional)

Locates fields by (in order): cleaned `id`, `placeholder`, `aria-label`, `<label>` text (for/parent), `name`, plus special handling for email fields.

### Click button/link

```
click <TEXT>
click button <TEXT>
```

Matches `button`, `a`, `input[type=button|submit]`, `[role=button]`, `[aria-label]`, or `[data-voice-command-click]`.

> On success, `onActionPerformed(action, payload)` fires (e.g., `scrollDown`, `fillInput`, `clickButton`).

---

## 🧩 API

### Constructor

```ts
new JSVoice(options?: JSVoiceOptions)
```

#### `JSVoiceOptions`

| Option                          | Type                                    |   Default | Description                                      |
| ------------------------------- | --------------------------------------- | --------: | ------------------------------------------------ |
| `continuous`                    | `boolean`                               |    `true` | Keep recognition open for multiple phrases.      |
| `interimResults`                | `boolean`                               |    `true` | Emit interim transcripts while speaking.         |
| `lang`                          | `string`                                | `'en-US'` | BCP-47 language tag for recognition & synthesis. |
| `commands`                      | `Record<string, (raw, cleaned) => any>` |      `{}` | Initial custom commands.                         |
| `autoRestart`                   | `boolean`                               |    `true` | Try to restart after unexpected end.             |
| `restartDelay`                  | `number` (ms)                           |     `500` | Delay before auto-restart.                       |
| `onSpeechStart`                 | `() => void`                            |         — | Recognition started.                             |
| `onSpeechEnd`                   | `() => void`                            |         — | Recognition ended.                               |
| `onCommandRecognized`           | `(phrase, raw, result) => void`         |         — | Custom command matched.                          |
| `onCommandNotRecognized`        | `(raw) => void`                         |         — | No built-in/custom command matched.              |
| `onActionPerformed`             | `(action, payload?) => void`            |         — | Built-in DOM action performed.                   |
| `onMicrophonePermissionGranted` | `(e?) => void`                          |         — | Mic permission granted.                          |
| `onMicrophonePermissionDenied`  | `(e) => void`                           |         — | Mic permission denied/unavailable.               |
| `onError`                       | `(e) => void`                           |         — | Web Speech/internal errors.                      |
| `onStatusChange`                | `(message) => void`                     |         — | Human-readable status for your UI.               |

### Static

* `JSVoice.isApiSupported: boolean`

### Methods

| Method                        | Returns            | Description                                      |
| ----------------------------- | ------------------ | ------------------------------------------------ |
| `start()`                     | `Promise<boolean>` | Requests mic (if needed) and starts recognition. |
| `stop()`                      | `void`             | Stops recognition.                               |
| `toggle()`                    | `void`             | Starts if idle, stops if listening.              |
| `speak(text, lang?)`          | `void`             | Uses SpeechSynthesis to speak text.              |
| `addCommand(phrase, handler)` | `void`             | Register a custom phrase.                        |
| `removeCommand(phrase)`       | `boolean`          | Unregister a phrase.                             |
| `setOption(key, value)`       | `void`             | Update options; live-applies relevant ones.      |

### Getters

| Getter              | Type      | Meaning                                           |
| ------------------- | --------- | ------------------------------------------------- |
| `isListening`       | `boolean` | Recognition is currently active.                  |
| `microphoneAllowed` | `boolean` | Mic permission after initial check.               |
| `isApiSupported`    | `boolean` | Same as static.                                   |
| `voiceFeedback`     | `string`  | Latest status message passed to `onStatusChange`. |

---

## 🧪 React example

```jsx
import { useRef, useState } from 'react';
import JSVoice from 'jsvoice';

export default function Mic() {
  const [status, setStatus] = useState('Click to start');
  const voiceRef = useRef(null);

  function ensure() {
    if (!voiceRef.current) {
      voiceRef.current = new JSVoice({
        onStatusChange: setStatus,
        onError: (e) => console.error(e),
      });
    }
    return voiceRef.current;
  }

  return (
    <>
      <button onClick={() => ensure().toggle()}>🎙️ Toggle Voice</button>
      <p>{status}</p>
    </>
  );
}
```

---

## 🔐 Permissions, Privacy & UX

* Calls `getUserMedia({ audio: true })` once to confirm access; **stops tracks immediately** after grant.
* No audio/transcripts are sent to servers; recognition is handled in-browser.
* Provide a mic toggle and status indicator.
* With `autoRestart=true`, recognition tries to resume after idle timeouts.

---

## 🧭 Accessibility Tips

* Prefer elements with clear text or `aria-label`.
* Add `data-voice-command-click="keyword"` for robust click targeting.
* Ensure labels/ids/placeholders are meaningful for “fill input”.

---

## 🧱 Project Structure

```
jsvoice/
└─ src/
   ├─ modules/
   │  ├─ actions/
   │  │  ├─ ClickAction.js
   │  │  ├─ FillInputAction.js
   │  │  ├─ ScrollAction.js
   │  │  └─ ZoomAction.js
   │  ├─ BuiltInActions.js
   │  ├─ CommandProcessor.js
   │  └─ RecognitionManager.js
   ├─ utils/
   │  └─ helpers.js
   ├─ JSVoice.js           # Public class (facade)
   └─ index.js             # Package entry (re-exports JSVoice)
```

---


```

(Type declarations optional; see below.)

---

## 🧾 Type Declarations (optional)

Provide `dist/index.d.ts` and set `"types": "dist/index.d.ts"`:

```ts
declare module 'jsvoice' {
  export type JSVoiceOptions = {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
    commands?: Record<string, (raw: string, cleaned: string) => any>;
    autoRestart?: boolean;
    restartDelay?: number;
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    onCommandRecognized?: (phrase: string, raw: string, result: any) => void;
    onCommandNotRecognized?: (raw: string) => void;
    onActionPerformed?: (action: string, payload?: any) => void;
    onMicrophonePermissionGranted?: (e?: any) => void;
    onMicrophonePermissionDenied?: (e: any) => void;
    onError?: (e: any) => void;
    onStatusChange?: (msg: string) => void;
  };

  export default class JSVoice {
    static isApiSupported: boolean;
    constructor(opts?: JSVoiceOptions);
    start(): Promise<boolean>;
    stop(): void;
    toggle(): void;
    speak(text: string, lang?: string): void;
    addCommand(phrase: string, handler: (raw: string, cleaned: string) => any): void;
    removeCommand(phrase: string): boolean;
    readonly isListening: boolean;
    readonly microphoneAllowed: boolean;
    readonly isApiSupported: boolean;
    readonly voiceFeedback: string;
    setOption(key: keyof JSVoiceOptions, value: any): void;
  }
}
```

---

## 🐛 Troubleshooting

* **Not supported:** `JSVoice.isApiSupported` is false → use Chrome/Edge, check site permissions.
* **Permission errors:** ensure HTTPS, valid mic, active tab.
* **Double-start:** if you see `InvalidStateError`, call `stop()` then `start()` after a small delay.
* **Selectors miss elements:** add semantic text/`aria-label` or `data-voice-command-click`.

---

## 🚧 Roadmap

* Local wake-word support
* Optional WebAssembly STT fallback
* UMD build & CDN demo
* Built-in grammar packs & i18n

---

## 🤝 Contributing

1. Fork and create a feature branch
2. Keep the public API stable (`JSVoice.js` as the facade)
3. Add tests for new behavior
4. Run lint/tests before pushing
5. Open a focused PR with a clear description

Labels: `bug`, `enhancement`, `docs`, `good first issue`.

---

## 📄 License

MIT © You

---




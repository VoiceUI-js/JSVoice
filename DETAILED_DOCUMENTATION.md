
# JSVoice

> A lightweight JavaScript library that adds **voice commands** (Web Speech API) and **speech synthesis** to any website.
> Ideal for accessibility, hands-free navigation, and voice-driven UI demos.

---

## ✨ Features

* Start/stop voice recognition with minimal code
* **Built-in DOM actions:** scroll, zoom, navigate, fill input, and click elements
* **Custom commands API** — register your own phrases → handlers
* **Wake Word support** — activate listening with a key phrase (e.g., "Hey, Computer")
* **Push-to-Talk functionality** that works with or without wake word mode
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

### Standard Mode

```js
import JSVoice from 'jsvoice';

const voice = new JSVoice({
  onStatusChange: (msg) => {
    document.getElementById('status').textContent = msg;
  },
  onCommandRecognized: (cmd) => {
    console.log(`✅ Command recognized: ${cmd}`);
  },
});

// Start/stop from a user gesture
document.getElementById('micBtn').addEventListener('click', () => voice.toggle());

// Register a custom command
voice.addCommand('open settings', () => {
  alert('Opening settings…');
});
```

### Wake Word Mode

```js
import JSVoice from 'jsvoice';

const voice = new JSVoice({
  wakeWord: 'hey computer',
  onWakeWordDetected: () => console.log('Wake word detected!'),
  onStatusChange: (msg) => {
    document.getElementById('status').textContent = msg;
  },
});

// Add a custom command
voice.addCommand('show a message', () => {
  alert('Message shown!');
});

// Start listening for the wake word
voice.start();

// Optional: Add a push-to-talk button that works with wake word mode
document.getElementById('pushBtn').addEventListener('click', () => {
  voice.activateCommandMode();
});
```

---

## 💡 UI/UX Tips & Examples

Providing clear visual feedback is crucial for a good voice command experience.

### Listening State Indicator

You can use the `onStatusChange` callback or the `isListening` getter to show a visual indicator of the microphone's state. A simple dot or icon can change color:

**HTML:**
```html
<button id="micBtn">🎤</button>
<span id="micIndicator" class="dot idle"></span>
```

**CSS:**
```css
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: background-color 0.3s;
}
.idle { background-color: grey; }
.listening { background-color: green; }
```

**JavaScript:**
```js
const voice = new JSVoice({
  onStatusChange: () => {
    const indicator = document.getElementById('micIndicator');
    if (voice.isListening) {
      indicator.classList.remove('idle');
      indicator.classList.add('listening');
    } else {
      indicator.classList.remove('listening');
      indicator.classList.add('idle');
    }
  }
});
```

### Custom Command: Toggle Dark Mode

Here is a complete example of a useful custom command that toggles a dark mode theme.

**HTML:**
```html
<button id="micBtn">🎤 Toggle Voice</button>
<p>Say "toggle dark mode"</p>
```

**CSS:**
```css
:root {
  --background-color: #fff;
  --text-color: #000;
}

[data-theme="dark"] {
  --background-color: #333;
  --text-color: #fff;
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
}
```

**JavaScript:**
```js
const voice = new JSVoice();
voice.start();

voice.addCommand('toggle dark mode', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});
```


---

## 🧠 Built-In Commands

All phrases are matched case-insensitively after punctuation cleanup.

### Scrolling

* “scroll down”
* “scroll up”
* “scroll to bottom” / “scroll full down”
* “scroll to top” / “scroll full up”

### Page Navigation

* “go back”
* “go forward”
* “reload page”

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
* “fill "hello@example.com" in email” (quotes optional)

Locates fields by (in order): cleaned `id`, `placeholder`, `aria-label`, `<label>` text, `name`.

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

| Option | Type | Default | Description |
| --- | --- | ---: | --- |
| `continuous` | `boolean` | `true` | Keep recognition open. Forced `true` if `wakeWord` is set. |
| `interimResults` | `boolean` | `true` | Emit interim transcripts while speaking. |
| `lang` | `string` | `'en-US'` | BCP-47 language tag for recognition & synthesis. |
| `commands` | `Record<string, Function>` | `{}` | Initial custom commands. |
| `patternCommands` | `Array<{pattern: string, callback: Function}>` | `[]` | Initial pattern-based commands. |
| `autoRestart` | `boolean` | `true` | Try to restart after unexpected end. |
| `restartDelay` | `number` (ms) | `500` | Delay before auto-restart. |
| `wakeWord` | `string \| null` | `null` | Phrase to activate command listening. |
| `wakeWordTimeout` | `number` (ms) | `5000` | Time to listen for a command after wake word is heard. |
| `onSpeechStart` | `() => void` | — | Recognition started. |
| `onSpeechEnd` | `() => void` | — | Recognition ended. |
| `onCommandRecognized` | `(phrase, raw, result) => void` | — | Custom command matched. |
| `onCommandNotRecognized` | `(raw) => void` | — | No built-in/custom command matched. |
| `onActionPerformed` | `(action, payload?) => void`| — | Built-in DOM action performed. |
| `onMicrophonePermissionGranted` | `(e?) => void` | — | Mic permission granted. |
| `onMicrophonePermissionDenied` | `(e) => void` | — | Mic permission denied/unavailable. |
| `onWakeWordDetected` | `() => void` | — | `wakeWord` was detected. |
| `onError` | `(e) => void` | — | Web Speech/internal errors. |
| `onStatusChange` | `(message) => void` | — | Human-readable status for your UI. |

### Static

* `JSVoice.isApiSupported: boolean`

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `start()` | `Promise<boolean>` | Requests mic (if needed) and starts recognition. |
| `stop()` | `void` | Stops recognition. |
| `toggle()` | `void` | Starts if idle, stops if listening. |
| `activateCommandMode()` | `Promise<void>` | Manually triggers command listening (for push-to-talk). |
| `speak(text, lang?)` | `void` | Uses SpeechSynthesis to speak text. |
| `addCommand(phrase, handler)` | `void` | Register a custom phrase. |
| `removeCommand(phrase)` | `boolean` | Unregister a phrase. |
| `addPatternCommand(pattern, handler)`| `void` | Register a pattern-based command. |
| `removePatternCommand(pattern)`| `boolean` | Unregister a pattern. |
| `setOption(key, value)` | `void` | Update options; live-applies relevant ones. |

### Getters

| Getter | Type | Meaning |
| --- | --- | --- |
| `isListening` | `boolean` | Recognition is currently active. |
| `microphoneAllowed` | `boolean` | Mic permission has been granted. |
| `isApiSupported` | `boolean` | Same as static. |
| `voiceFeedback` | `string` | Latest status message. |
| `isWakeWordModeActive`| `boolean` | `true` if a `wakeWord` is configured. |
| `isAwaitingCommand` | `boolean` | `true` if waiting for a command after wake word. |

---

## 🧱 Project Structure

```
jsvoice/
└─ src/
   ├─ modules/
   │  ├─ actions/
   │  │  ├─ ClickAction.js
   │  │  ├─ FillInputAction.js
   │  │  ├─ GoBackAction.js
   │  │  ├─ GoForwardAction.js
   │  │  ├─ ReloadPageAction.js
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

## 🧾 Type Declarations (optional)

```ts
declare module 'jsvoice' {
  export type JSVoiceOptions = {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
    commands?: Record<string, Function>;
    patternCommands?: Array<{pattern: string, callback: Function}>;
    autoRestart?: boolean;
    restartDelay?: number;
    wakeWord?: string | null;
    wakeWordTimeout?: number;
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    onCommandRecognized?: (phrase: string, raw: string, result: any) => void;
    onCommandNotRecognized?: (raw: string) => void;
    onActionPerformed?: (action: string, payload?: any) => void;
    onMicrophonePermissionGranted?: (e?: any) => void;
    onMicrophonePermissionDenied?: (e: any) => void;
    onWakeWordDetected?: () => void;
    onError?: (e: any) => void;
    onStatusChange?: (msg: string) => void;
  };

  export default class JSVoice {
    static isApiSupported: boolean;
    constructor(opts?: JSVoiceOptions);
    start(): Promise<boolean>;
    stop(): void;
    toggle(): void;
    activateCommandMode(): Promise<void>;
    speak(text: string, lang?: string): void;
    addCommand(phrase: string, handler: Function): void;
    removeCommand(phrase: string): boolean;
    addPatternCommand(pattern: string, handler: Function): void;
    removePatternCommand(pattern: string): boolean;
    readonly isListening: boolean;
    readonly microphoneAllowed: boolean;
    readonly isApiSupported: boolean;
    readonly voiceFeedback: string;
    readonly isWakeWordModeActive: boolean;
    readonly isAwaitingCommand: boolean;
    setOption(key: keyof JSVoiceOptions, value: any): void;
  }
}
```

---

## 🤝 Contributing

1. Fork and create a feature branch
2. Keep the public API stable (`JSVoice.js` as the facade)
3. Add tests for new behavior
4. Run lint/tests before pushing
5. Open a focused PR with a clear description

---

## 📄 License

MIT

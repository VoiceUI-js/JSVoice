# JSVoice

<div align="center">

### Modern JavaScript Voice Command Library

**Add voice control to your web application. On-device Whisper by default. TypeScript ready.**

[![npm version](https://img.shields.io/npm/v/jsvoice?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/jsvoice)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/jsvoice?style=for-the-badge&logo=npm&logoColor=white&color=00C853)](https://www.npmjs.com/package/jsvoice)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/jsvoice?style=for-the-badge&logo=webpack&logoColor=white&color=FF6F00)](https://bundlephobia.com/package/jsvoice)

[Full Docs](DOCUMENTATION.md) • [**AI Implementation Guide**](docs/AI_IMPLEMENTATION.md) • [Browser Whisper](docs/LOCAL_BROWSER_WHISPER.md) • [User Guide](docs/USER_GUIDE.md) • [API Reference](docs/API_REFERENCE.md) • [Security](docs/SECURITY_AND_PRIVACY.md) • [Contributing](CONTRIBUTING.md)

</div>

---

> ### Start here (humans & AI)
>
> | Who | Read first |
> |-----|------------|
> | **AI / copilots implementing this package** | **[docs/AI_IMPLEMENTATION.md](docs/AI_IMPLEMENTATION.md)** → [AGENTS.md](AGENTS.md) → [llms.txt](llms.txt) |
> | **App developers** | Install below → Quick Start → [docs/LOCAL_BROWSER_WHISPER.md](docs/LOCAL_BROWSER_WHISPER.md) |
> | **End users of a voice app** | [docs/USER_GUIDE.md](docs/USER_GUIDE.md) |
>
> **Defaults that matter:** `createVoice()` uses **on-device Whisper tiny** (`engineMode: 'local'`).  
> Install peer: `npm i jsvoice @xenova/transformers`.  
> Do **not** gate the app on `JSVoice.isApiSupported` (that is Native Web Speech only).  
> Call `start()` / `toggle()` only after a **user gesture**.  
> After npm install, guides live at `node_modules/jsvoice/docs/…` and `node_modules/jsvoice/AGENTS.md`.

---

## What is JSVoice?

JSVoice is a **production-ready JavaScript library** for adding voice commands and speech synthesis to web applications. By default it understands speech with **open-source Whisper tiny in the browser** (any modern browser, on-device). You can opt into the vendor **Web Speech API** when you prefer zero model download.

**Perfect for:**

- **Accessibility** - Enable hands-free navigation for all users
- **Voice-First Interfaces** - Build modern conversational UIs
- **Productivity Tools** - Create voice-controlled applications
- **Smart Home Dashboards** - Control IoT devices with voice
- **Gaming** - Add voice command integration to games

---

## Why Choose JSVoice?

### Lean core + optional peers
The core library has **no required runtime npm dependencies**. Default speech understanding uses optional peer **`@xenova/transformers`** (browser Whisper). React and Porcupine are optional peers for UI kit / wake word.

### Three entry paths
| Path | Import | Use when |
|------|--------|----------|
| **Core** | `createVoice` / `JSVoice` | Commands + TTS only |
| **React** | `jsvoice/react` | Provider + hooks + HUD |
| **Hyper Kit** | `jsvoice/react/kit` | Dock, palette, assistant, devtools |

### TypeScript Support
Type definitions included (`src/index.d.ts` + kit types).

### Feature Rich
Built-in DOM actions, pattern matching, wake word, hybrid engines, plugins, packs, and a full voice UI kit.

---

## AI agents / copilots

If an AI is implementing this library in your app, point it at:

- **[docs/AI_IMPLEMENTATION.md](docs/AI_IMPLEMENTATION.md)** — full architecture + recipes + anti-patterns  
- **[AGENTS.md](AGENTS.md)** — short non-negotiable rules  
- **[llms.txt](llms.txt)** — index for LLM tools  

These ship with the npm package (`node_modules/jsvoice/…`).

## Installation

**Using NPM:**
```bash
npm install jsvoice @xenova/transformers
```

**Using Yarn:**
```bash
yarn add jsvoice @xenova/transformers
```

`@xenova/transformers` is required for the **default** on-device Whisper path. Skip it only if you use `engineMode: 'native'`.

**Using CDN:**
```html
<script src="https://unpkg.com/jsvoice/dist/voice-ui.umd.min.js"></script>
```

---

## Quick Start

### 1) Core (recommended factory)

```javascript
import { createVoice } from 'jsvoice';

// Default: on-device Whisper tiny (works in any modern browser)
// Peer: npm install @xenova/transformers
const voice = createVoice({
  onStatusChange: (message) => console.log('Status:', message),
  onModelLoadProgress: (p) => console.log('Model', p.status, p.progress),
});

voice.addCommand('hello world', () => {
  voice.speak('Hello! How can I help you?');
});

// Test without mic
// await voice.processText('hello world');

document.getElementById('mic-button').addEventListener('click', () => {
  voice.toggle();
});
```

> **Behavior change:** `createVoice()` now defaults to **browser Whisper-tiny** (private, any browser).  
> For vendor Web Speech only: `createVoice({ engineMode: 'native' })`.  
> Guide: [docs/LOCAL_BROWSER_WHISPER.md](docs/LOCAL_BROWSER_WHISPER.md)

### 2) React Hyper Kit

```jsx
import { createVoice } from 'jsvoice';
import { VoiceKitProvider, VoiceDock, VoiceCommandPalette } from 'jsvoice/react/kit';

const voice = createVoice();
voice.addCommand('hello', () => voice.speak('Hello'));

export function App() {
  return (
    <VoiceKitProvider voice={voice} theme="glassDark" enableKitCommands>
      <YourApp />
      <VoiceDock />
      <VoiceCommandPalette />
    </VoiceKitProvider>
  );
}
```

**Current package version:** see `package.json` (`1.1.0`).  
**Security:** see [docs/SECURITY_AND_PRIVACY.md](docs/SECURITY_AND_PRIVACY.md) before enabling voice→DOM automation in production.

### Tooling

```bash
npm test                 # Jest unit/integration (FakeSpeechEngine)
npm run test:e2e         # Playwright harness
npm run storybook        # Hyper Kit component stories
npm run build            # dist: core + react + kit + ui-kit + porcupine adapter
```

Optional on-device wake word (Picovoice Porcupine peers): [docs/PORCUPINE_WAKE.md](docs/PORCUPINE_WAKE.md)

---

## Key Features

### Voice Recognition
Real-time speech-to-text conversion with continuous listening mode, automatic restart on failure, and support for 50+ languages including English, Spanish, French, German, Japanese, Chinese, and more.

### Speech Synthesis
Text-to-speech output with multiple voices, customizable speech parameters including rate, pitch, and volume, plus intelligent queue management for sequential speech.

### Custom Commands
Easy registration of exact phrase commands and pattern-based commands with automatic variable extraction for dynamic command handling.

### Wake Word Detection
Hands-free activation with configurable wake words like "Hey Assistant" (phrase match on STT transcripts). With the **default local** engine, transcripts stay on-device; with **`engineMode: 'native'`**, browser vendors may stream audio. Optional **Porcupine** adapter for true on-device KWS: [docs/PORCUPINE_WAKE.md](docs/PORCUPINE_WAKE.md).

### Pattern Matching
Extract variables from voice commands automatically using simple pattern syntax like `{variable}` for dynamic command processing.



### Pluggable engines (local Whisper by default)
`createVoice()` uses a **Hybrid** wrapper with **`engineMode: 'local'`** by default: on-device **Whisper tiny.en** via Transformers.js so recognition works in Chrome, Edge, Firefox, Safari, and other modern browsers. Use `engineMode: 'native'` for vendor Web Speech only, or `auto` for local-first with native fallback if local cannot load. See [docs/LOCAL_BROWSER_WHISPER.md](docs/LOCAL_BROWSER_WHISPER.md).

### Hyper Voice UI Kit
Premium voice-first React UI system: dock, orb, HUD, command palette, transcript, debug lab, onboarding, rule/widget builders, and theming.

```js
import { createVoice } from 'jsvoice';
import { VoiceKitProvider, VoiceDock, VoiceCommandPalette } from 'jsvoice/react/kit';

const voice = createVoice();
// <VoiceKitProvider voice={voice} theme="glassDark"><VoiceDock /><VoiceCommandPalette /></VoiceKitProvider>
```

See [docs/HYPER_VOICE_UI_KIT.md](docs/HYPER_VOICE_UI_KIT.md). Demo: `demo-app` → `/ui/hyper`.

### Plugins & Extensions (New in v2.4)
JSVoice features a modular plugin system to keep the core lightweight. Import only what you need:

- **VAD Plugin:** Auto-stop listening when silence is detected. `import VadPlugin from 'jsvoice/plugins/VadPlugin'`
- **Hotkeys Plugin:** Add Push-to-Talk (Spacebar) and Toggle shortcuts. `import HotkeysPlugin from 'jsvoice/plugins/HotkeysPlugin'`
- **Fuzzy Match:** Support synonyms and "close enough" phrases. `import FuzzyMatchPlugin from 'jsvoice/plugins/FuzzyMatchPlugin'`
- **Session Recorder:** Debug, replay, and analyze sessions. `import SessionRecorderPlugin from 'jsvoice/plugins/SessionRecorderPlugin'`
- **Command Packs:** Pre-built commands for Navigation, Forms, and Media. `import { NavigationPack } from 'jsvoice/packs/basic'`

## Advanced Commands (New in v2.4)
JSVoice v2.4 supports **Typed Entities** and Confidence Checks.
```javascript
// Register a command with types
voice.registerCommand('set volume to {level:int}', ({ level }) => {
    // level is automatically parsed as an Integer
    player.setVolume(level);
});

// Register with confidence threshold (0.0 - 1.0)
voice.registerCommand('delete account', deleteFn, { 
    minConfidence: 0.95 
// Register with confidence threshold (0.0 - 1.0)
voice.registerCommand('delete account', deleteFn, { 
    minConfidence: 0.95 
});
```

## React Integration (New in v2.4)
JSVoice v2.4 includes a dedicated React package for seamless integration.

### Setup
```javascript
// _app.js or RootLayout
import { VoiceProvider } from 'jsvoice/react';
import { createVoice } from 'jsvoice';

const voice = createVoice();

export default function App({ Component, pageProps }) {
  return (
    <VoiceProvider voice={voice}>
      <Component {...pageProps} />
    </VoiceProvider>
  );
}
```

### Hooks & Components
```javascript
import { useVoice, useVoiceStatus } from 'jsvoice/react';
import { PushToTalkButton } from 'jsvoice/react/components';

function Microphone() {
  const voice = useVoice();
  const status = useVoiceStatus(s => s.status);
  const transcript = useVoiceStatus(s => s.transcript);

  return (
    <div>
      <p>Status: {status}</p>
      <p>{transcript.partial}</p>
      <PushToTalkButton />
    </div>
  );
}
```

## Voice UI Kit (New in v2.4)
A modular system of 15+ voice-native UI patterns ready to drop into your app.
Includes:
- **Intent Badges:** Visualize user state ("Urgent", "Calm").
- **Focus Mode:** Time-boxed interaction guards.
- **Confirmation Overlays:** Safety layer for dangerous commands.
- **Tour Mode:** Voice-driven onboarding.
- And 10+ more modules.

Import the plugin and components:
```javascript
import VoiceKitPlugin from 'jsvoice/plugins/kit';
import { IntentBadge, ConfirmationOverlay } from 'jsvoice/react/kit/components';

// 1. Install Plugin
voice.use(VoiceKitPlugin);

// 2. Use Components
function App() {
  return (
    <>
      <ConfirmationOverlay />
      <Header>
         <IntentBadge />
      </Header>
    </>
  )
}
```

### Advanced UI Kit Modules (New)
For complex applications, JSVoice provides specialized modules for dynamic layouts, constraints, and data binding.

```javascript
import { createVoice } from 'jsvoice';
import WidgetPlugin from 'jsvoice/ui-kit/modules/widgets';
import UndoPlugin from 'jsvoice/ui-kit/modules/undo';

// 1. Initialize
const voice = createVoice();
voice.use(WidgetPlugin);
voice.use(UndoPlugin);

// 2. React Components
import { WidgetCanvas } from 'jsvoice/ui-kit/modules/widgets/components';

function App() {
  return <WidgetCanvas />;
}
```

### UI Kit Modules Reference

Each module comes with pre-built voice commands and React components.

**1. Widgets (`jsvoice/ui-kit/modules/widgets`)**
*   **Purpose:** Dynamic layout management.
*   **Commands:**
    *   `"create panel for {name}"` -> Adds a new widget.
    *   `"remove widget {name}"` -> Deletes a widget.
    *   `"rename widget {old} to {new}"` -> Renames a widget.
*   **Component:** `<WidgetCanvas />`

**2. Rules (`jsvoice/ui-kit/modules/rules`)**
*   **Purpose:** User-defined behavior rules.
*   **Commands:**
    *   `"always show errors"` / `"never hide warnings"` -> Adds a rule.
    *   `"remove rule {description}"`
    *   `"list rules"`
*   **Component:** `<RulesPanel />`

**3. Links (`jsvoice/ui-kit/modules/links`)**
*   **Purpose:** Data binding between widgets.
*   **Commands:**
    *   `"link {source} to {target}"` -> Syncs data between widgets.
    *   `"filter {widget} by {value}"` -> Propagates filter to linked widgets.
*   **Component:** `<LinksPanel />`

**4. Constraints (`jsvoice/ui-kit/modules/constraints`)**
*   **Purpose:** Layout locking.
*   **Commands:**
    *   `"pin {widget}"` / `"keep {widget} always visible"`
    *   `"unpin {widget}"`
*   **Component:** `<ConstraintsPanel />`

**5. Bookmarks (`jsvoice/ui-kit/modules/bookmarks`)**
*   **Purpose:** Save/restore state.
*   **Commands:**
    *   `"bookmark this as {name}"`
    *   `"save this state"`
    *   `"jump to bookmark {name}"`
*   **Component:** `<BookmarkList />`

**6. Summaries (`jsvoice/ui-kit/modules/summaries`)**
*   **Purpose:** Heuristic event logs and insights.
*   **Commands:**
    *   `"summarize usage"` / `"what happened"`
    *   `"summarize last {n} events"`
*   **Component:** `<SummaryPanel />`

**7. Voice Mode (`jsvoice/ui-kit/modules/voice-mode`)**
*   **Purpose:** Eyes-free accessibility layer with screen reading.
*   **Commands:**
    *   `"voice only mode"` -> Activates full-screen overlay.
    *   `"exit voice mode"`
    *   `"read current state"` / `"next item"`
*   **Component:** `<VoiceModeOverlay />`

**8. Undo (`jsvoice/ui-kit/modules/undo`)**
*   **Purpose:** Granular history management by category.
*   **Commands:**
    *   `"undo last action"`
    *   `"undo only filters"`
    *   `"revert layout"`
*   **Component:** `<UndoStackViewer />`

**9. Repair (`jsvoice/ui-kit/modules/repair`)**
*   **Purpose:** Smart error correction interactions.
*   **Commands:**
    *   `"that's not what I meant"` -> Opens suggestion modal.
    *   `"fix this"`
    *   `"apply option {number}"`
*   **Component:** `<RepairSuggestionModal />`

All modules are zero-rupee, strictly local, and SSR-safe.

### Default: Private browser Whisper (any browser)
`createVoice()` uses [Transformers.js](https://huggingface.co/docs/transformers.js) + **Whisper tiny (English)** in a Web Worker. No audio leaves the device. Works where Web Speech is missing (e.g. Firefox). First visit downloads ~30MB (then cached). Details: [docs/LOCAL_BROWSER_WHISPER.md](docs/LOCAL_BROWSER_WHISPER.md).

---

## Native vs. Local Engine

| Feature | Local (default) | Native (`engineMode: 'native'`) |
| :--- | :--- | :--- |
| **Model** | Whisper tiny.en on-device | Browser / OS speech service |
| **Speed** | After each utterance (VAD) | Streaming partials |
| **Accuracy** | Good for commands | High (vendor cloud) |
| **Privacy** | **On-device** | Often leaves device |
| **Browser support** | **Any modern browser** | Chrome, Safari, Edge (varies) |
| **Setup** | Peer `@xenova/transformers` + first ~30MB download | No model download |

---

## Engine modes
*   **`local` (default)** — on-device Whisper tiny; portable + private.
*   **`native`** — Web Speech API only.
*   **`auto`** — local first; fall back to native if local cannot initialize.

## Permission Denied Behavior
**Security Note:** If a user explicitly denies Microphone permission (`NotAllowedError`), JSVoice will **NOT** attempt to fall back or bypass this. The stream manager enters a `stopped` state and requires user intervention (UI button click) to re-request access.

## Local Engine Performance
The Local Engine runs `whisper-tiny.en` (approx 30MB) in a Web Worker with AudioWorklet capture and energy VAD.
*   **First Load:** Downloads model (cached via Cache API).
*   **Privacy:** All audio processing happens on-device.
*   **Save-Data:** May require confirm before download on constrained networks.

---

### Built-in Commands
Seven categories of pre-built commands including scrolling, zooming, clicking, form filling, content reading, theme control, and navigation.

### Multi-language Support
**Default local model is English** (`whisper-tiny.en`). Multi-locale STT via **`engineMode: 'native'`** uses the Web Speech API (50+ languages where the browser supports them). Multilingual on-device models are not the default this ship.

---

## Built-in Commands

JSVoice includes pre-built voice commands for common web interactions:

**Scrolling Commands:**
- `scroll down` - Scroll down 500 pixels
- `scroll up` - Scroll up 500 pixels
- `scroll to bottom` - Jump to page bottom
- `scroll to top` - Jump to page top

**Zoom Control:**
- `zoom in` - Increase zoom by 10%
- `zoom out` - Decrease zoom by 10%
- `reset zoom` - Reset to 100%

**Element Interaction:**
- `click [text]` - Click element containing text
- `click button [text]` - Click specific button

**Form Filling:**
- `type [value] in [field]` - Fill input field
- `fill [value] in [field]` - Alternative syntax

**Content Reading:**
- `read this page` - Read entire page aloud
- `read this paragraph` - Read nearest text block
- `read section [text]` - Read specific section

**Theme Control:**
- `toggle dark mode` - Switch between light and dark themes
- `dark mode on` - Enable dark mode
- `dark mode off` - Enable light mode

**Navigation:**
- `open new tab` - Open blank tab
- `go to [website]` - Open website (supports Google, YouTube, GitHub, etc.)

---

## Advanced Features

### Pattern Commands with Variables

Extract variables from voice commands for dynamic functionality:

```javascript
voice.addPatternCommand('set volume to {level}', (args) => {
  const volume = parseInt(args.level);
  audioElement.volume = volume / 100;
  voice.speak(`Volume set to ${volume} percent`);
});

// User says: "set volume to 75"
// System extracts: { level: "75" }
// Result: Volume set to 75%
```

### Wake Word Detection (Transcript-Based)

Wake word matches a phrase inside STT results (not a separate always-on KWS model).

**Privacy notes:**
*   **Default local engine:** audio is processed on-device with Whisper tiny; the mic stays open while waiting for the phrase.
*   **`engineMode: 'native'`:** vendors may stream audio continuously — avoid for strict privacy.
*   **Server Whisper API:** do not use paid APIs for always-on wake (cost). Prefer local STT or [Porcupine](docs/PORCUPINE_WAKE.md).

```javascript
const voice = createVoice({
  wakeWord: 'hey assistant',
  wakeWordTimeout: 5000,
  onWakeWordDetected: (word) => {
    console.log('Wake word detected:', word);
  },
});

// User says: "hey assistant"
// System activates and listens
// User says: "scroll down"
// System executes command
```



---

## API Reference

### Core Methods

**start()**  
Start speech recognition and return a promise.

```javascript
await voice.start();
```

**stop()**  
Stop speech recognition immediately.

```javascript
voice.stop();
```

**toggle()**  
Toggle speech recognition on or off.

```javascript
voice.toggle();
```

**speak(text, lang)**  
Convert text to speech with optional language parameter.

```javascript
voice.speak('Hello world');
voice.speak('Bonjour', 'fr-FR');
```

### Command Methods

**addCommand(phrase, callback)**  
Register an exact phrase command.

```javascript
voice.addCommand('hello', () => {
  console.log('Hello command executed');
});
```

**removeCommand(phrase)**  
Remove a registered command.

```javascript
voice.removeCommand('hello');
```

**addPatternCommand(pattern, callback)** (Deprecated) 
 Use `addCommand` with `{ type: 'pattern' }` instead.
 *Register a pattern-based command with variable extraction.*

```javascript
// Old (Deprecated):
// voice.addPatternCommand('search for {query}', (args) => { ... });

// New Standard (v2.4+):
voice.addCommand('search for {query}', (args) => {
  console.log('Searching for:', args.query);
}, { isPattern: true });
```

**removePatternCommand(pattern)** (Deprecated) 
Use `removeCommand` instead.
*Remove a pattern command.*

```javascript
voice.removeCommand('search for {query}');
```

### Debugging

JSVoice v2.4+ is silent by default. To see internal logs, enable debug mode:

```javascript
const voice = new JSVoice({
  debug: true, // Enables verbose logging
  onStatusChange: (msg) => console.log(msg)
});
```



### Properties

**isListening**  
Returns true if currently listening for voice commands.

```javascript
if (voice.isListening) {
  console.log('Listening for commands...');
}
```

**microphoneAllowed**  
Returns true if microphone permission has been granted.

```javascript
if (voice.microphoneAllowed) {
  console.log('Microphone access granted');
}
```

**isApiSupported**  
Static property that returns true if the **Native Web Speech** constructor exists.  
Default **local** Whisper does **not** require this — it only needs mic + Worker + WASM. Use `engineMode: 'native'` when you depend on this flag.

```javascript
// Prefer createVoice() (local Whisper works even when isApiSupported is false)
const voice = createVoice();
```

**voiceFeedback**  
Returns the latest status message.

```javascript
console.log(voice.voiceFeedback);
```

---

## Configuration Options

```javascript
const voice = createVoice({
  // Engine (createVoice)
  engineMode: 'local',           // default: browser Whisper tiny; 'native' | 'auto'
  localOptions: {                // on-device Whisper
    model: 'Xenova/whisper-tiny.en',
    vad: { enabled: true, silenceMs: 1200 },
  },
  onModelLoadProgress: (p) => {},

  // Recognition settings
  continuous: true,              // Keep listening / auto-restart utterances
  interimResults: true,          // Native path only (local is utterance-based)
  lang: 'en-US',                // Mainly for native path / TTS
  autoRestart: true,
  restartDelay: 500,
  engines: [],                  // Custom engine classes (advanced)
  engine: null,                 // Specific engine instance
  
  // Wake word settings
  wakeWord: null,               // Wake word phrase (e.g., 'hey assistant')
  wakeWordTimeout: 5000,
  
  // Initial commands
  commands: {},
  patternCommands: [],
  
  // Event callbacks
  onSpeechStart: () => {},
  onSpeechEnd: () => {},
  onCommandRecognized: (phrase, raw, result) => {},
  onCommandNotRecognized: (raw) => {},
  onActionPerformed: (action, payload) => {},
  onMicrophonePermissionGranted: () => {},
  onMicrophonePermissionDenied: (error) => {},
  onWakeWordDetected: (word) => {},
  onError: (error) => {},
  onStatusChange: (message) => {}
});
```

---

## Browser Support

**Default local Whisper** (recommended) needs a modern browser with:
- Microphone (`getUserMedia`)
- Web Workers + WASM
- Secure context (HTTPS or localhost)

| Browser | Default local Whisper | Native Web Speech (`engineMode: 'native'`) |
|---------|----------------------|--------------------------------------------|
| Chrome / Edge / Opera | Yes | Yes |
| Firefox | Yes | No (API not implemented) |
| Safari | Yes (device-dependent perf) | Partial |

**Requirements:**
- HTTPS or localhost (mic)
- User gesture to start
- Peer `@xenova/transformers` for default path
- First visit may download ~30MB model (then cached)

```javascript
// Works in Firefox and Chrome without checking Web Speech support
const voice = createVoice();

// Only if you force native:
if (!JSVoice.isApiSupported) {
  console.warn('Native Web Speech unavailable; use default local or install transformers peer');
}
```

---

## Examples

### React Integration

```jsx
import { useEffect, useRef } from 'react';
import JSVoice from 'jsvoice';

function VoiceComponent() {
  const voiceRef = useRef(null);

  useEffect(() => {
    voiceRef.current = new JSVoice({
      onStatusChange: (msg) => console.log(msg)
    });

    return () => voiceRef.current?.stop();
  }, []);

  return (
    <button onClick={() => voiceRef.current?.toggle()}>
      Toggle Voice Control
    </button>
  );
}
```

### Vue Integration

```vue
<template>
  <button @click="toggleVoice">Toggle Voice Control</button>
</template>

<script>
import JSVoice from 'jsvoice';

export default {
  data() {
    return { voice: null };
  },
  mounted() {
    this.voice = new JSVoice({
      onStatusChange: (msg) => console.log(msg)
    });
  },
  methods: {
    toggleVoice() {
      this.voice.toggle();
    }
  },
  beforeUnmount() {
    this.voice?.stop();
  }
}
</script>
```

### TypeScript

```typescript
import JSVoice, { JSVoiceOptions } from 'jsvoice';

const options: JSVoiceOptions = {
  lang: 'en-US',
  continuous: true,
  onCommandRecognized: (phrase, raw, result) => {
    console.log(`Recognized: ${phrase}`);
  }
};

const voice = new JSVoice(options);
```

---

## Use Cases

### Accessibility

Enable hands-free navigation for users with disabilities:

```javascript
voice.addCommand('next page', () => {
  window.location.href = getNextPageUrl();
});

voice.addCommand('previous page', () => {
  window.history.back();
});

voice.addCommand('read content', () => {
  const text = document.body.innerText;
  voice.speak(text);
});
```

### E-Commerce

Create voice-controlled shopping experiences:

```javascript
voice.addPatternCommand('add {quantity} {product} to cart', (args) => {
  addToCart(args.product, parseInt(args.quantity));
  voice.speak(`Added ${args.quantity} ${args.product} to your cart`);
});

voice.addCommand('checkout', () => {
  navigateToCheckout();
  voice.speak('Proceeding to checkout');
});
```

### Smart Home Dashboard

Control IoT devices with voice commands:

```javascript
voice.addPatternCommand('turn {device} {state}', (args) => {
  controlDevice(args.device, args.state);
  voice.speak(`Turning ${args.device} ${args.state}`);
});

voice.addPatternCommand('set {device} to {value}', (args) => {
  setDeviceValue(args.device, args.value);
  voice.speak(`Setting ${args.device} to ${args.value}`);
});
```

### Gaming

Add voice commands to games:

```javascript
voice.addCommand('attack', () => player.attack());
voice.addCommand('defend', () => player.defend());
voice.addCommand('use potion', () => player.usePotion());
voice.addCommand('open inventory', () => ui.showInventory());
```

---

## Documentation

**Complete Guides:**
- [Full API Documentation](DETAILED_DOCUMENTATION.md) - Comprehensive reference with all methods and options
- [Quick Start Guide](#quick-start) - Get started in minutes
- [Examples](examples/) - Working code samples and demonstrations
- [Configuration Options](DETAILED_DOCUMENTATION.md#configuration-options) - All settings explained
- [Troubleshooting](DETAILED_DOCUMENTATION.md#troubleshooting) - Common issues and solutions

**Additional Resources:**
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- [Changelog](CHANGELOG.md) - Version history and release notes
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines

---

## Performance & Scaling

**Bundle Size:** 32KB minified and gzipped
**Dependencies:** Zero external libraries
**Initialization:** Under 50ms startup time

**Scaling (New in v2.4):**
*   **O(1) Command Matching:** Exact phrase matching now uses Hash Maps, maintaining instant response times even with 10,000+ commands.
*   **Scope Optimization:** Only commands in the current scope are evaluated, further reducing latency in complex apps.

**Microphone Handling:**
*   Smart stream management ensures the microphone is released immediately when not in use or when permissions differ from needs.

**Optimization:**
- Tree-shaking compatible for smaller bundles
- Source maps included for debugging
- Multiple build formats (ESM, CJS, UMD)
- Lazy loading support

---

## Security and Privacy

**Data Handling:**
- All processing happens in the browser
- No data sent to external servers
- No data collection or storage
- No tracking or analytics

**Permissions:**
- Explicit user consent required for microphone
- HTTPS required for security
- Permissions revocable anytime
- Transparent permission requests

---

## Contributing

We welcome contributions from the community!

**How to Contribute:**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

**Guidelines:**
- Follow existing code style
- Add documentation for new features
- Include examples where helpful
- Write clear commit messages

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## Developer Suite (Dev Suite)
JSVoice v2.4 includes a built-in Developer Suite to inspect and debug voice interactions.
*   **/dev/console**: Shows real-time engine state, circuit breaker status, fallback events, model progress, processing time, and transcript stream.
*   **/dev/inspector**: Traces command evaluation, showing match scores, rejected reasons (e.g., cooldown, scope mismatch), and execution latency.
*   **/dev/builder**: A "Simulate Transcript" tool to test command matching without speaking, including a collision tester.
*   **/dev/hud**: A heads-up display showing recording/processing states, active engine name, and fallback notices.

---

## Running the Demo App (Next.js)

To see the **Voice UI Kit** in action:

1.  Navigate to the demo folder:
    ```bash
    cd demo-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) and click **"Launch Demo Hub"**.

---

## Support

**Get Help:**
- [Full Documentation](DETAILED_DOCUMENTATION.md)
- [GitHub Issues](https://github.com/VoiceUI-js/VoiceUI/issues)
- [GitHub Discussions](https://github.com/VoiceUI-js/VoiceUI/discussions)

**Report Issues:**
- Bug reports via GitHub Issues
- Feature requests via GitHub Discussions
- Security issues via email

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

Free for commercial and personal use.

---

## Links

- [NPM Package](https://www.npmjs.com/package/jsvoice)
- [GitHub Repository](https://github.com/VoiceUI-js/VoiceUI)
- [Full Documentation](DETAILED_DOCUMENTATION.md)
- [Live Examples](examples/)
- [Issue Tracker](https://github.com/VoiceUI-js/VoiceUI/issues)

---

## Acknowledgments

Built by the open-source community.

Thanks to all [contributors](https://github.com/VoiceUI-js/VoiceUI/graphs/contributors) who helped improve JSVoice.

---

<div align="center">

**Made for the JavaScript community**

[⬆ Back to Top](#jsvoice)

</div>

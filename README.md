# JSVoice

<div align="center">

### Modern JavaScript Voice Command Library

**Add voice control to your web application. Zero dependencies. TypeScript ready.**

[![npm version](https://img.shields.io/npm/v/jsvoice?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/jsvoice)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/jsvoice?style=for-the-badge&logo=npm&logoColor=white&color=00C853)](https://www.npmjs.com/package/jsvoice)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/jsvoice?style=for-the-badge&logo=webpack&logoColor=white&color=FF6F00)](https://bundlephobia.com/package/jsvoice)

[Documentation](#documentation) • [Quick Start](#quick-start) • [Examples](#examples) • [API](#api-reference) • [Contributing](#contributing)

</div>

---

## What is JSVoice?

JSVoice is a **production-ready JavaScript library** for adding voice commands and speech synthesis to web applications. Built on the Web Speech API, it provides an intuitive interface for creating voice-enabled experiences with zero dependencies.

**Perfect for:**

- **Accessibility** - Enable hands-free navigation for all users
- **Voice-First Interfaces** - Build modern conversational UIs
- **Productivity Tools** - Create voice-controlled applications
- **Smart Home Dashboards** - Control IoT devices with voice
- **Gaming** - Add voice command integration to games

---

## Why Choose JSVoice?

### Zero Dependencies
Pure JavaScript with no external libraries. Minimal bundle size at just 32KB minified and gzipped.

### TypeScript Support
Full type definitions included for complete IDE autocomplete and type checking.

### Production Ready
Comprehensive error handling, extensive documentation, and active maintenance.

### Easy to Use
Simple API with clear documentation and working examples to get started in minutes.

### Feature Rich
Built-in commands, pattern matching, wake word detection, and pluggable engines.

---

## Installation

**Using NPM:**
```bash
npm install jsvoice
```

**Using Yarn:**
```bash
yarn add jsvoice
```

**Using CDN:**
```html
<script src="https://unpkg.com/jsvoice/dist/voice-ui.umd.min.js"></script>
```

---

## Quick Start

### Basic Example

```javascript
import JSVoice from 'jsvoice';

// Create instance
// Defaults to "Auto" mode: Uses Browser Native API, falls back to Local AI if unavailable.
const voice = new JSVoice({
  onStatusChange: (message) => {
    console.log('Status:', message);
  }
});

// Add a command
voice.addCommand('hello world', () => {
  voice.speak('Hello! How can I help you?');
});

// Start listening
document.getElementById('mic-button').addEventListener('click', () => {
  voice.toggle();
});
```

That's it! You now have voice commands in your application.

---

## Key Features

### Voice Recognition
Real-time speech-to-text conversion with continuous listening mode, automatic restart on failure, and support for 50+ languages including English, Spanish, French, German, Japanese, Chinese, and more.

### Speech Synthesis
Text-to-speech output with multiple voices, customizable speech parameters including rate, pitch, and volume, plus intelligent queue management for sequential speech.

### Custom Commands
Easy registration of exact phrase commands and pattern-based commands with automatic variable extraction for dynamic command handling.

### Wake Word Detection
Hands-free activation with configurable wake words like "Hey Assistant".
*Note: Currently uses cloud-based recognition APIs. On-device WASM detection is on the roadmap.*

### Pattern Matching
Extract variables from voice commands automatically using simple pattern syntax like `{variable}` for dynamic command processing.



### Pluggable Engines & Hybrid Mode
JSVoice now uses a smart **Hybrid Engine** by default. It prioritizes the browser's Native Web Speech API for zero-latency performance but automatically falls back to a local, private Transformers.js (Whisper) model if the native API is unsupported (e.g., Firefox) or unreliable.

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

### "Free Mode" (Private & Offline)
You can force JSVoice to run entirely offline using the `engineMode: 'local'` option. This uses [Transformers.js](https://huggingface.co/docs/transformers.js) to run OpenAI's Whisper model directly in the browser via WebAssembly/WebGPU. No data leaves the device.

---

## Native vs. Local Engine

| Feature | Native (Web Speech API) | Local (Transformers.js) |
| :--- | :--- | :--- |
| **Speed** | Instant (Cloud-assisted) | Fast (Device dependent) |
| **Accuracy** | High (Google/Apple Cloud) | Good (Whisper Tiny/Base) |
| **Privacy** | Data sent to Big Tech | **100% Private / Offline** |
| **Cost** | Free (Unlimited) | Free (Zero Rupee) |
| **Browser Support** | Chrome, Safari, Edge | **All Browsers** (Firefox included) |
| **Setup** | Zero setup | First-load model download (~30MB) |

---

## Auto Mode & Fallback Policy
JSVoice v2.2 introduces an explicit `HybridPolicy`. By default (`native`), the browser's Web Speech API is used. If this fails due to network issues or browser incompatibility (e.g., Firefox), the system checks the `CircuitBreaker`. If the breaker opens (3 faults/60s), JSVoice automatically activates the **Local Engine** (Transformers.js/Whisper) to ensure voice commands continue to work offline.

## Permission Denied Behavior
**Security Note:** If a user explicitly denies Microphone permission (`NotAllowedError`), JSVoice will **NOT** attempt to fall back or bypass this. The stream manager enters a `stopped` state and requires user intervention (UI button click) to re-request access.

## Local Engine Performance
The Local Engine runs `whisper-tiny` (approx 30MB) in a Web Worker.
*   **First Load:** Downloads model from CDN (cached via Cache API).
*   **Privacy:** All audio processing happens on-device.
*   **Mobile Data:** Uses `navigator.connection.saveData` to avoid downloading on restricted networks unless overridden.

---

### Built-in Commands
Seven categories of pre-built commands including scrolling, zooming, clicking, form filling, content reading, theme control, and navigation.

### Multi-language Support
Support for 50+ languages through the Web Speech API including en-US, es-ES, fr-FR, de-DE, ja-JP, zh-CN, and many more.

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

### Wake Word Detection (Text-Stream Based)

**⚠️ PRIVACY WARNING:**
This feature currently relies on **continuous text streaming**. Even if you are only waiting for "Hey Computer", the audio is being sent to the speech recognition provider (e.g., Google, OpenAI) to be transcribed into text *before* JSVoice checks for the keyword.
*   **Do not use this** if you require strictly offline privacy (unless using a local engine).
*   **Do not use this** with paid APIs (like Whisper) for "always on" listening, as it will incur massive costs.

To enable wake word:

> ⚠️ **Privacy Notice:** This feature currently relies on the browser's speech recognition engine (Web Speech API). In Chrome, this means audio is streamed to Google servers effectively continuously to detect the phrase. For strictly private/offline environments, this is not yet recommended.

```javascript
const voice = new JSVoice({
  wakeWord: 'hey assistant',
  wakeWordTimeout: 5000,
  onWakeWordDetected: (word) => {
    console.log('Wake word detected:', word);
  }
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
Static property that returns true if Web Speech API is supported.

```javascript
if (JSVoice.isApiSupported) {
  const voice = new JSVoice();
}
```

**voiceFeedback**  
Returns the latest status message.

```javascript
console.log(voice.voiceFeedback);
```

---

## Configuration Options

```javascript
const voice = new JSVoice({
  // Recognition settings
  continuous: true,              // Keep listening continuously
  interimResults: true,          // Show interim recognition results
  lang: 'en-US',                // Recognition language
  autoRestart: true,            // Auto-restart on error
  restartDelay: 500,            // Restart delay in milliseconds
  engines: [],                  // Custom engine classes (try first)
  engine: null,                 // Specific engine instance
  
  // Wake word settings
  wakeWord: null,               // Wake word phrase (e.g., 'hey assistant')
  wakeWordTimeout: 5000,        // Timeout after wake word in milliseconds
  
  // Initial commands
  commands: {},                 // Object of exact phrase commands
  patternCommands: [],          // Array of pattern commands
  
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

**Fully Supported:**
- Google Chrome 25+
- Microsoft Edge 79+
- Opera 27+

**Partially Supported:**
- Safari 14.1+ (iOS 14.5+ required)

**Not Supported:**
- Mozilla Firefox (Web Speech API not implemented)

**Requirements:**
- HTTPS connection (required for microphone access)
- User gesture to initiate (click or tap)
- Microphone permission granted by user

**Browser Detection:**

```javascript
if (JSVoice.isApiSupported) {
  // Initialize voice features
  const voice = new JSVoice();
} else {
  // Show fallback message
  console.warn('Voice commands not supported in this browser');
  alert('Please use Chrome, Edge, or Safari for voice features');
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

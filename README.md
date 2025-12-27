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
Built-in commands, pattern matching, wake word detection, and real-time audio visualization.

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
Hands-free activation with configurable wake words like "Hey Assistant" or "OK Computer", customizable timeout settings, and audio feedback.

### Pattern Matching
Extract variables from voice commands automatically using simple pattern syntax like `{variable}` for dynamic command processing.

### Audio Visualization
Real-time amplitude monitoring with waveform display, frequency bar visualization, and customizable rendering options.

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

### Wake Word Detection

Enable hands-free activation with wake words:

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

### Real-Time Audio Visualization

Display audio waveforms and frequency bars:

```javascript
voice.startAmplitude((bars) => {
  // bars is array of normalized values (0-1)
  bars.forEach((value, index) => {
    const height = value * 100;
    updateVisualization(index, height);
  });
}, {
  mode: 'bars',
  barCount: 16
});
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

**addPatternCommand(pattern, callback)**  
Register a pattern-based command with variable extraction.

```javascript
voice.addPatternCommand('search for {query}', (args) => {
  console.log('Searching for:', args.query);
});
```

**removePatternCommand(pattern)**  
Remove a pattern command.

```javascript
voice.removePatternCommand('search for {query}');
```

### Visualization Methods

**startAmplitude(callback, options)**  
Start real-time audio amplitude monitoring.

```javascript
voice.startAmplitude((bars) => {
  console.log(bars);
}, { 
  mode: 'bars', 
  barCount: 8 
});
```

**stopAmplitude()**  
Stop amplitude monitoring and clean up resources.

```javascript
voice.stopAmplitude();
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

## Performance

**Bundle Size:** 32KB minified and gzipped

**Dependencies:** Zero external libraries

**Initialization:** Under 100ms startup time

**Memory:** Efficient with automatic resource cleanup

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

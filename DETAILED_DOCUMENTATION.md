# JSVoice - Detailed Documentation

**Version:** 0.2.1  
**Last Updated:** December 27, 2025

---

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Core Concepts](#core-concepts)
5. [API Reference](#api-reference)
6. [Built-in Commands](#built-in-commands)
7. [Custom Commands](#custom-commands)
8. [Pattern Commands](#pattern-commands)
9. [Wake Word Mode](#wake-word-mode)
10. [Amplitude Visualization](#amplitude-visualization)
11. [Configuration Options](#configuration-options)
12. [Event Callbacks](#event-callbacks)
13. [Browser Compatibility](#browser-compatibility)
14. [Troubleshooting](#troubleshooting)
15. [Examples](#examples)
16. [Best Practices](#best-practices)

---

## Introduction

JSVoice is a lightweight, zero-dependency JavaScript library that brings voice command and speech synthesis capabilities to web applications. It leverages the browser's built-in Web Speech API to provide a seamless voice-interactive experience.

### Key Features

- 🎤 **Voice Recognition** - Convert speech to text
- 🗣️ **Speech Synthesis** - Convert text to speech
- 🎯 **Custom Commands** - Define your own voice commands
- 🔍 **Pattern Matching** - Extract variables from commands
- 🎙️ **Wake Word Detection** - Hands-free activation
- 📊 **Amplitude Visualization** - Real-time audio waveforms
- 🔧 **Zero Dependencies** - No external libraries required
- 📦 **Small Bundle** - Lightweight and fast

---

## Installation

### Via NPM

```bash
npm install jsvoice
```

### Via CDN (UMD)

```html
<script src="https://unpkg.com/jsvoice/dist/voice-ui.umd.min.js"></script>
```

### ES Module

```javascript
import JSVoice from 'jsvoice';
```

### CommonJS

```javascript
const JSVoice = require('jsvoice');
```

---

## Quick Start

### Basic Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>JSVoice Demo</title>
</head>
<body>
  <button id="micBtn">🎤 Start Listening</button>
  <p id="status">Click the button to start</p>

  <script type="module">
    import JSVoice from './node_modules/jsvoice/dist/voice-ui.esm.js';

    const voice = new JSVoice({
      onStatusChange: (msg) => {
        document.getElementById('status').textContent = msg;
      }
    });

    // Add a custom command
    voice.addCommand('hello world', () => {
      alert('Hello, World!');
      voice.speak('Hello to you too!');
    });

    // Toggle listening on button click
    document.getElementById('micBtn').addEventListener('click', () => {
      voice.toggle();
    });
  </script>
</body>
</html>
```

---

## Core Concepts

### 1. Voice Recognition

Voice recognition converts spoken words into text. JSVoice uses the browser's `SpeechRecognition` API.

```javascript
const voice = new JSVoice();
await voice.start(); // Start listening
voice.stop();        // Stop listening
voice.toggle();      // Toggle on/off
```

### 2. Speech Synthesis

Speech synthesis converts text into spoken words using the browser's `speechSynthesis` API.

```javascript
voice.speak('Hello, how are you?');
voice.speak('Hola', 'es-ES'); // Spanish
```

### 3. Commands

Commands are phrases that trigger specific actions when recognized.

**Types of Commands:**
- **Built-in Commands** - Pre-defined actions (scroll, zoom, click, etc.)
- **Custom Commands** - Your own exact phrase commands
- **Pattern Commands** - Commands with variable extraction

### 4. Pluggable Speech Engines

JSVoice supports a pluggable architecture for speech recognition engines.
- **NativeSpeechEngine** - Uses the browser's Web Speech API (default).
- **Custom Engines** - You can implement your own engines (e.g., using OpenAI Whisper) by extending `BaseSpeechEngine`.

---

## API Reference

### Constructor

```typescript
new JSVoice(options?: JSVoiceOptions)
```

Creates a new JSVoice instance.

**Example:**
```javascript
const voice = new JSVoice({
  lang: 'en-US',
  continuous: true,
  autoRestart: true,
  onCommandRecognized: (phrase, raw, result) => {
    console.log('Command:', phrase);
  }
});
```

---

### Methods

#### `start(): Promise<boolean>`

Starts speech recognition.

```javascript
const started = await voice.start();
if (started) {
  console.log('Listening started');
}
```

**Returns:** Promise that resolves to `true` if started successfully.

---

#### `stop(): void`

Stops speech recognition.

```javascript
voice.stop();
```

---

#### `toggle(): void`

Toggles speech recognition on/off.

```javascript
voice.toggle(); // Start if stopped, stop if started
```

---

#### `speak(text: string, lang?: string): void`

Speaks the given text using speech synthesis.

```javascript
voice.speak('Hello, world!');
voice.speak('Bonjour', 'fr-FR'); // French
```

**Parameters:**
- `text` - The text to speak
- `lang` - Optional language code (defaults to `options.lang`)

---

#### `addCommand(phrase: string, callback: Function): void`

Registers a custom voice command.

```javascript
voice.addCommand('open menu', () => {
  document.getElementById('menu').classList.add('open');
});
```

**Parameters:**
- `phrase` - The exact phrase to match
- `callback` - Function to execute when phrase is recognized
  - Arguments: `(rawTranscript, cleanedTranscript, speakMethod)`

---

#### `removeCommand(phrase: string): boolean`

Removes a previously registered command.

```javascript
const removed = voice.removeCommand('open menu');
console.log(removed); // true if removed, false if not found
```

---

#### `addPatternCommand(pattern: string, callback: Function): void`

Registers a pattern-based command with variable extraction.

```javascript
voice.addPatternCommand('set volume to {level}', (args, raw, cleaned, speak) => {
  const volume = parseInt(args.level);
  console.log('Setting volume to:', volume);
  speak(`Volume set to ${volume}`);
});
```

**Pattern Syntax:**
- Use `{variableName}` for placeholders
- Variables are extracted and passed to callback

**Callback Arguments:**
- `args` - Object with extracted variables
- `rawTranscript` - Original speech text
- `cleanedTranscript` - Processed text
- `speakMethod` - Function to speak responses

---

#### `removePatternCommand(pattern: string): boolean`

Removes a pattern command.

```javascript
voice.removePatternCommand('set volume to {level}');
```

---

#### `setOption(key: string, value: any): void`

Updates a configuration option.

```javascript
voice.setOption('lang', 'es-ES');
voice.setOption('autoRestart', false);
```

---

#### `startAmplitude(callback: Function, options?: Object): void`

Starts real-time audio amplitude monitoring.

```javascript
voice.startAmplitude((bars) => {
  // bars is array of 0-1 values
  bars.forEach((value, index) => {
    console.log(`Bar ${index}: ${Math.round(value * 100)}%`);
  });
}, {
  mode: 'bars',
  barCount: 8
});
```

**Options:**
- `mode` - 'bars' or 'waveform'
- `barCount` - Number of frequency bars (default: 8)

---

#### `stopAmplitude(): void`

Stops amplitude monitoring and cleans up resources.

```javascript
voice.stopAmplitude();
```

---

### Properties

#### `isListening: boolean` (read-only)

Whether speech recognition is currently active.

```javascript
if (voice.isListening) {
  console.log('Currently listening');
}
```

---

#### `microphoneAllowed: boolean` (read-only)

Whether microphone permission has been granted.

```javascript
if (!voice.microphoneAllowed) {
  alert('Please allow microphone access');
}
```

---

#### `isApiSupported: boolean` (read-only)

Whether the Web Speech API is supported in the current browser.

```javascript
if (!voice.isApiSupported) {
  alert('Voice commands not supported in this browser');
}
```

---

#### `voiceFeedback: string` (read-only)

Latest status message.

```javascript
console.log(voice.voiceFeedback);
// "Listening for commands..."
```

---

#### `isWakeWordModeActive: boolean` (read-only)

Whether wake word mode is currently active.

```javascript
if (voice.isWakeWordModeActive) {
  console.log('Waiting for wake word');
}
```

---

#### `isAwaitingCommand: boolean` (read-only)

Whether the system is awaiting a command after wake word detection.

```javascript
if (voice.isAwaitingCommand) {
  console.log('Wake word detected, listening for command');
}
```

---

### Static Properties

#### `JSVoice.isApiSupported: boolean`

Static check for Web Speech API support.

```javascript
if (JSVoice.isApiSupported) {
  const voice = new JSVoice();
} else {
  console.log('Browser not supported');
}
```

---

## Built-in Commands

JSVoice comes with several built-in commands for common web interactions.

### Scrolling Commands

| Command | Action |
|---------|--------|
| "scroll down" | Scroll down 500px |
| "scroll up" | Scroll up 500px |
| "scroll to bottom" | Scroll to page bottom |
| "scroll to top" | Scroll to page top |
| "scroll full down" | Scroll to page bottom |
| "scroll full up" | Scroll to page top |

### Zoom Commands

| Command | Action |
|---------|--------|
| "zoom in" | Increase zoom by 10% |
| "zoom out" | Decrease zoom by 10% |
| "reset zoom" | Reset zoom to 100% |

**Range:** 50% - 200%

### Click Commands

| Command | Action |
|---------|--------|
| "click [text]" | Click element containing text |
| "click button [text]" | Click button containing text |

**Examples:**
- "click submit"
- "click button login"
- "click the menu"

### Fill Input Commands

| Command | Action |
|---------|--------|
| "type [value] in [field]" | Fill input field |
| "fill [value] in [field]" | Fill input field |

**Examples:**
- "type John Doe in name"
- "fill hello@example.com in email"

**Field Matching:**
- Input `id`
- Input `name`
- Input `placeholder`
- Label text
- `aria-label`

### Read Content Commands

| Command | Action |
|---------|--------|
| "read this page" | Read entire page |
| "read page" | Read entire page |
| "read this paragraph" | Read nearest text block |
| "read this" | Read selected or nearest text |
| "read section [text]" | Read specific section |

### Dark Mode Commands

| Command | Action |
|---------|--------|
| "toggle dark mode" | Toggle dark/light theme |
| "switch theme" | Toggle dark/light theme |
| "dark mode on" | Enable dark mode |
| "dark mode off" | Enable light mode |

**Note:** Uses `data-theme` attribute on `<html>` element.

### Open Tab Commands

| Command | Action |
|---------|--------|
| "open new tab" | Open blank tab |
| "open google" | Open Google |
| "go to [site]" | Open website |

**Examples:**
- "go to github"
- "go to youtube"

---

## Custom Commands

### Exact Phrase Commands

Register commands that match exact phrases.

```javascript
// Simple command
voice.addCommand('show menu', () => {
  document.getElementById('menu').style.display = 'block';
});

// Command with speech response
voice.addCommand('what time is it', (raw, cleaned, speak) => {
  const time = new Date().toLocaleTimeString();
  speak(`The time is ${time}`);
});

// Command with parameters
voice.addCommand('navigate home', (raw, cleaned, speak) => {
  window.location.href = '/';
  speak('Navigating to home page');
});
```

---

## Pattern Commands

### Variable Extraction

Extract variables from voice commands using patterns.

```javascript
// Single variable
voice.addPatternCommand('set color to {color}', (args) => {
  document.body.style.background = args.color;
});
// Say: "set color to blue"

// Multiple variables
voice.addPatternCommand('move {direction} by {amount}', (args) => {
  console.log(`Moving ${args.direction} by ${args.amount}`);
});
// Say: "move left by 50"

// With response
voice.addPatternCommand('search for {query}', (args, raw, cleaned, speak) => {
  const url = `https://google.com/search?q=${encodeURIComponent(args.query)}`;
  window.open(url, '_blank');
  speak(`Searching for ${args.query}`);
});
// Say: "search for javascript tutorials"
```

---

## Wake Word Mode

### Hands-Free Activation

Wake word mode allows hands-free activation of voice commands.

```javascript
const voice = new JSVoice({
  wakeWord: 'hey assistant',
  wakeWordTimeout: 5000, // 5 seconds to give command
  onWakeWordDetected: (word) => {
    console.log('Wake word detected:', word);
  }
});

await voice.start();
```

**Usage:**
1. Say the wake word: "hey assistant"
2. System activates and listens for command
3. Give your command within timeout period
4. System processes command and returns to wake word mode

**Example:**
```
User: "hey assistant"
System: [Wake word detected, listening...]
User: "scroll down"
System: [Scrolls down, returns to wake word mode]
```

---

## Amplitude Visualization

### Real-Time Audio Waveforms

Visualize microphone input in real-time.

```javascript
const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');

voice.startAmplitude((bars) => {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw bars
  const barWidth = canvas.width / bars.length;
  bars.forEach((value, index) => {
    const height = value * canvas.height;
    const x = index * barWidth;
    const y = canvas.height - height;
    
    ctx.fillStyle = `hsl(${value * 120}, 70%, 50%)`;
    ctx.fillRect(x, y, barWidth - 2, height);
  });
}, {
  mode: 'bars',
  barCount: 16
});

// Stop when done
voice.stopAmplitude();
```

---

---

## Custom Speech Engines

JSVoice allows you to use custom speech recognition providers (like OpenAI Whisper, Azure Speech, etc.) by creating a custom engine.

### Creating a Custom Engine

To create a custom engine, extend the `BaseSpeechEngine` class and implement the required methods.

```javascript
import { BaseSpeechEngine } from 'jsvoice';

class WhisperEngine extends BaseSpeechEngine {
  async init() {
    // Initialize your Whisper client or WebSocket connection
    console.log('Whisper Engine Initialized');
  }

  async start() {
    this.isListening = true;
    this.onStart(); // Notify JSVoice
    // Start capturing audio and sending to Whisper
  }

  async stop() {
    this.isListening = false;
    this.onEnd(); // Notify JSVoice
    // Stop capturing
  }
}
```

### Using a Custom Engine

Pass your custom engine class or instance to the `JSVoice` constructor.

```javascript
const voice = new JSVoice({
  engines: [WhisperEngine, NativeSpeechEngine] // Try Whisper first, fallback to Native
});

// Or force a specific instance
const voice = new JSVoice({
  engine: new WhisperEngine({ apiKey: '...' })
});
```

---

## Configuration Options

### Complete Options Reference

```typescript
interface JSVoiceOptions {
  // Recognition Settings
  continuous?: boolean;        // Default: true
  interimResults?: boolean;    // Default: true
  lang?: string;              // Default: 'en-US'
  autoRestart?: boolean;      // Default: true
  restartDelay?: number;      // Default: 500ms
  
  // Engine Settings
  engines?: Array<Class<BaseSpeechEngine>>; // List of engine classes to try (priority order)
  engine?: BaseSpeechEngine;               // Specific engine instance to use (overrides engines)

  // Wake Word Settings
  wakeWord?: string | null;          // Default: null
  wakeWordTimeout?: number;          // Default: 5000ms
  
  // Initial Commands
  commands?: Record<string, Function>;
  patternCommands?: Array<{pattern: string, callback: Function}>;
  
  // Event Callbacks
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onCommandRecognized?: (phrase, raw, result, args?) => void;
  onCommandNotRecognized?: (raw) => void;
  onActionPerformed?: (action, payload?) => void;
  onMicrophonePermissionGranted?: (event?) => void;
  onMicrophonePermissionDenied?: (error) => void;
  onWakeWordDetected?: (wakeWord) => void;
  onError?: (error) => void;
  onStatusChange?: (message) => void;
}
```

---

## Event Callbacks

### Lifecycle Events

```javascript
const voice = new JSVoice({
  onSpeechStart: () => {
    console.log('Started listening');
    document.getElementById('mic').classList.add('active');
  },
  
  onSpeechEnd: () => {
    console.log('Stopped listening');
    document.getElementById('mic').classList.remove('active');
  },
  
  onCommandRecognized: (phrase, raw, result, args) => {
    console.log('Command recognized:', phrase);
    console.log('Raw transcript:', raw);
    console.log('Result:', result);
    if (args) console.log('Extracted args:', args);
  },
  
  onCommandNotRecognized: (raw) => {
    console.log('Unknown command:', raw);
    voice.speak('Sorry, I didn\'t understand that');
  },
  
  onActionPerformed: (action, payload) => {
    console.log('Action performed:', action, payload);
  },
  
  onError: (error) => {
    console.error('Voice error:', error);
  },
  
  onStatusChange: (message) => {
    document.getElementById('status').textContent = message;
  }
});
```

---

## Browser Compatibility

### Supported Browsers

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 25+ | ✅ Full |
| Edge | 79+ | ✅ Full |
| Safari | 14.1+ | ⚠️ Partial |
| Firefox | - | ❌ No |
| Opera | 27+ | ✅ Full |

### Feature Detection

```javascript
if (!JSVoice.isApiSupported) {
  // Show fallback UI
  document.getElementById('voice-ui').style.display = 'none';
  document.getElementById('fallback').style.display = 'block';
}
```

### Requirements

- ✅ HTTPS (required for microphone access)
- ✅ User gesture (click/tap to start)
- ✅ Microphone permission
- ✅ Supported browser

---

## Troubleshooting

### Common Issues

#### "Microphone access denied"

**Solution:**
```javascript
voice.start().catch((error) => {
  if (error.name === 'NotAllowedError') {
    alert('Please allow microphone access in browser settings');
  }
});
```

#### "No speech detected"

**Causes:**
- Microphone not working
- Background noise
- Speaking too quietly

**Solution:**
- Check microphone settings
- Speak clearly and loudly
- Reduce background noise

#### "Commands not recognized"

**Solution:**
- Speak clearly
- Check language setting
- Verify command spelling
- Use exact phrases

#### "Auto-restart not working"

**Solution:**
```javascript
voice.setOption('autoRestart', true);
voice.setOption('restartDelay', 500);
```

---

## Examples

See the `examples/` directory for complete working examples:

1. **Mic Waveform** - Real-time audio visualization
2. **Real-Time Demo** - Low-latency audio capture
3. **Theme Toggle** - Dark/light mode switching

---

## Best Practices

### 1. Always Check API Support

```javascript
if (JSVoice.isApiSupported) {
  const voice = new JSVoice();
} else {
  // Show fallback UI
}
```

### 2. Provide Visual Feedback

```javascript
const voice = new JSVoice({
  onStatusChange: (msg) => {
    statusElement.textContent = msg;
  }
});
```

### 3. Handle Errors Gracefully

```javascript
const voice = new JSVoice({
  onError: (error) => {
    console.error(error);
    showErrorMessage('Voice command failed. Please try again.');
  }
});
```

### 4. Use Clear Command Phrases

```javascript
// ✅ Good - Clear and specific
voice.addCommand('open settings menu', openSettings);

// ❌ Bad - Ambiguous
voice.addCommand('open', doSomething);
```

### 5. Provide Speech Feedback

```javascript
voice.addCommand('delete item', (raw, cleaned, speak) => {
  deleteItem();
  speak('Item deleted successfully');
});
```

### 6. Clean Up Resources

```javascript
// When done with amplitude visualization
voice.stopAmplitude();

// When done with voice recognition
voice.stop();
```

---

## TypeScript Support

JSVoice includes full TypeScript definitions.

```typescript
import JSVoice, { JSVoiceOptions } from 'jsvoice';

const options: JSVoiceOptions = {
  lang: 'en-US',
  continuous: true,
  onCommandRecognized: (phrase, raw, result) => {
    console.log(phrase);
  }
};

const voice = new JSVoice(options);
```

---

## License

MIT © JSVoice Contributors

---

## Support

- **GitHub Issues:** https://github.com/VoiceUI-js/VoiceUI/issues
- **Documentation:** This file
- **Examples:** `examples/` directory

---

**Last Updated:** December 27, 2025  
**Version:** 0.2.1

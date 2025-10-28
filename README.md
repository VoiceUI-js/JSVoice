# JSVoice: Add Voice Superpowers to Your Website

[![npm version](https://badge.fury.io/js/jsvoice.svg)](https://badge.fury.io/js/jsvoice)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**JSVoice** is a lightweight, dependency-free JavaScript library that brings the power of voice commands and speech synthesis to your web applications. It harnesses the browser's built-in Web Speech API to provide a seamless voice-interactive experience for your users.

Ideal for:

*   **Accessibility:** Enabling hands-free navigation and control.
*   **Voice-driven UIs:** Creating modern, voice-first user interfaces.
*   **Demos and Prototypes:** Quickly adding voice interaction to your projects.

For a full, detailed breakdown of the API and all options, please see our [DETAILED_DOCUMENTATION.md](DETAILED_DOCUMENTATION.md).

## Key Features

*   🎤 **Voice Commands:** Start and stop voice recognition with a single function call.
*   🗣️ **Speech Synthesis:** Give your application a voice with the `speak()` helper.
*   🤖 **Built-in Actions:** Common actions like scrolling, zooming, and form filling work out-of-the-box.
*   🔧 **Custom Commands:** Easily define your own voice commands and corresponding actions.
*   🔄 **Automatic Restart:** Optionally, the library can automatically restart the recognition service.
*   🌐 **Browser Support:** Gracefully degrades on browsers that do not support the Web Speech API.
*   👍 **Lightweight:** No external dependencies, keeping your application fast and lean.

## Built-in Commands

JSVoice comes with a variety of built-in commands for common web interactions:

### Navigation

*   **Scrolling:**
    *   "scroll down"
    *   "scroll up"
    *   "scroll to bottom" / "scroll full down"
    *   "scroll to top" / "scroll full up"
*   **Zooming:**
    *   "zoom in"
    *   "zoom out"
    *   "reset zoom"

### Content Interaction

*   **Reading:**
    *   "read this page" / "read page"
    *   "read this paragraph" / "read this"
    *   "read section [header text]"
    *   "read [something]"
*   **Clicking:**
    *   "click [text]"
    *   "click button [text]"

### Form Interaction

*   **Filling Inputs:**
    *   "type [value] in [field]"
    *   "fill [value] in [field]"

### Theming

*   **Dark Mode:**
    *   "toggle dark mode"
    *   "switch theme"
    *   "dark mode on"
    *   "dark mode off"

## Installation

You can install JSVoice using npm or by including it directly in your HTML.

### npm

```bash
npm install jsvoice
```

### Direct include

```html
<script src="https://unpkg.com/jsvoice/dist/jsvoice.umd.min.js"></script>
```

## Quick Start

Getting started with JSVoice is simple. Here's a basic example:

```html
<!DOCTYPE html>
<html>
<head>
  <title>JSVoice Demo</title>
</head>
<body>
  <button id="micBtn">🎤 Mic</button>
  <p id="status">Click the mic and say "hello world"</p>

  <script src="dist/jsvoice.umd.js"></script>
  <script>
    const voice = new JSVoice();

    voice.addCommand('hello world', () => {
      alert('Hello, world!');
    });

    document.getElementById('micBtn').addEventListener('click', () => {
      voice.toggle();
    });
  </script>
</body>
</html>
```

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## License

JSVoice is open-source software licensed under the [MIT License](LICENSE).

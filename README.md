#  VoiceUI: Effortless Voice Commands & Synthesis for Web Apps

<!-- [![npm version](https://badge.fury.io/js/voice-ui.svg)](https://www.npmjs.com/package/voice-ui)
[![npm downloads](https://img.shields.io/npm/dm/voice-ui.svg)](https://www.npmjs.com/package/voice-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/your-github-username/voice-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/your-github-username/voice-ui/actions/workflows/ci.yml) -->

A lightweight and framework-agnostic JavaScript library for adding robust voice command and speech synthesis capabilities to web applications using the Web Speech API. Enhance user experience with intuitive voice navigation, form filling, and interactive feedback.

## ✨ Features

*   **🎙️ Speech Recognition:** Continuously listen and convert spoken language to text.
*   **🗣️ Speech Synthesis:** Enable your application to speak text messages back to the user.
*   **🧠 Intelligent Command Matching:** Robust parsing to match recognized speech against predefined commands.
*   **🌐 Generic DOM Actions:** Built-in capabilities for common voice commands:
    *   **Scrolling:** "scroll up", "scroll down", "scroll to top", "scroll to bottom"
    *   **Zooming:** "zoom in", "zoom out", "reset zoom"
    *   **Form Filling:** "fill `<value>` in `<field>`" (e.g., "fill John Doe in username")
    *   **Clicking Elements:** "click `<button-text>`" (e.g., "click submit button")
*   **Custom Commands:** Easily define and register your own application-specific voice commands.
*   **Comprehensive Callbacks:** Get notified on speech start/end, command recognized/not recognized, microphone permission changes, and errors.
*   **Browser Compatibility Checks:** Gracefully handles browsers without Web Speech API support.
*   **Automatic Restart:** Configurable auto-restart for continuous listening even after periods of silence or minor errors.
*   **Framework Agnostic:** Works seamlessly with vanilla JavaScript, React, Vue, Angular, Svelte, and more.

## 🚀 Installation

Install VoiceUI in your project using npm or yarn:

```bash
npm install voice-ui
# or
yarn add voice-ui



// voice-ui/src/VoiceUI.js

/**
 * VoiceUI Library
 * A JavaScript library for integrating voice commands and speech synthesis into web applications.
 *
 * It uses the Web Speech API for recognition and synthesis.
 * Consumers can register custom commands and receive status updates via callbacks.
 */
class VoiceUI {
  // Static property to check API support once
  static isApiSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  /**
   * @typedef {Object} VoiceUIOptions
   * @property {boolean} [continuous=true] - Whether speech recognition should be continuous.
   * @property {boolean} [interimResults=true] - Whether to return interim results.
   * @property {string} [lang='en-US'] - The language for speech recognition and synthesis.
   * @property {Object.<string, Function>} [commands={}] - Initial commands to register.
   * @property {Function} [onSpeechStart] - Callback when speech recognition starts.
   * @property {Function} [onSpeechEnd] - Callback when speech recognition stops.
   * @property {Function} [onCommandRecognized] - Callback when a command is successfully recognized and processed.
   * @property {Function} [onCommandNotRecognized] - Callback when speech is recognized but no command matches.
   * @property {Function} [onActionPerformed] - Callback for generic DOM actions (scroll, zoom, fill, click).
   * @property {Function} [onMicrophonePermissionGranted] - Callback when microphone permission is granted.
   * @property {Function} [onMicrophonePermissionDenied] - Callback when microphone permission is denied.
   * @property {Function} [onError] - Callback for Web Speech API errors.
   * @property {Function} [onStatusChange] - Generic callback for user-facing voice status messages.
   * @property {boolean} [autoRestart=true] - Whether to automatically restart recognition on unexpected end.
   * @property {number} [restartDelay=500] - Delay in ms before attempting to restart recognition.
   */

  /**
   * Creates an instance of VoiceUI.
   * @param {VoiceUIOptions} options - Configuration options for the VoiceUI library.
   */
  constructor(options = {}) {
    if (!VoiceUI.isApiSupported) {
      console.warn("Web Speech API not supported by this browser.");
      this._callCallback('onStatusChange', "Voice commands not supported by your browser. Try Chrome or Edge.");
      return;
    }

    // Default options
    this.options = {
      continuous: true,
      interimResults: true,
      lang: 'en-US',
      commands: {},
      autoRestart: true,
      restartDelay: 500,
      // Default empty functions for all callbacks to prevent errors
      onSpeechStart: () => {},
      onSpeechEnd: () => {},
      onCommandRecognized: () => {},
      onCommandNotRecognized: () => {},
      onActionPerformed: () => {},
      onMicrophonePermissionGranted: () => {},
      onMicrophonePermissionDenied: () => {},
      onError: () => {},
      onStatusChange: () => {},
      ...options,
    };

    this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = null; // Will be initialized in _initRecognition
    this.speechSynthesis = window.speechSynthesis;

    this._isListening = false;
    this._microphoneAllowed = false;
    this._currentVoiceFeedback = "Initializing voice commands...";
    this._commands = { ...this.options.commands }; // Store user-defined commands

    this._initRecognition();
    this._checkMicrophonePermission(); // Check permissions on startup
    this._callCallback('onStatusChange', "Click mic to start voice commands.");
  }

  /**
   * Helper to call callbacks safely.
   * @param {string} callbackName
   * @param {...any} args
   * @private
   */
  _callCallback(callbackName, ...args) {
    if (typeof this.options[callbackName] === 'function') {
      this.options[callbackName](...args);
    }
  }

  /**
   * Initializes the SpeechRecognition instance and sets up its event handlers.
   * @private
   */
  _initRecognition() {
    this.recognition = new this.SpeechRecognition();
    this.recognition.continuous = this.options.continuous;
    this.recognition.interimResults = this.options.interimResults;
    this.recognition.lang = this.options.lang;

    this.recognition.onstart = () => {
      this._isListening = true;
      this._callCallback('onSpeechStart');
      this._updateStatus("Listening for commands...");
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript.trim()) {
        this._updateStatus(`Listening... "${interimTranscript}"`);
      }

      if (finalTranscript.trim()) {
        console.log("[VoiceUI] Final command recognized:", finalTranscript);
        this._processCommand(finalTranscript);
        // Reset status after processing command, unless another interim is active
        if (!interimTranscript.trim() && this._isListening) {
             this._updateStatus("Listening for commands...");
        }
      }
    };

    this.recognition.onend = () => {
      this._callCallback('onSpeechEnd');
      if (this._isListening && this.options.autoRestart && this._microphoneAllowed) {
        // Recognition ended unexpectedly, attempt to restart
        console.log("[VoiceUI] SpeechRecognition ended unexpectedly, attempting restart.");
        this._updateStatus("No speech detected for a while, re-calibrating...");
        setTimeout(() => {
          if (this._isListening && this._microphoneAllowed) { // Double check intent and mic access
            this._startRecognitionInternal();
          } else if (!this._microphoneAllowed) {
            this._updateStatus("Microphone access needed to restart voice commands.");
          }
        }, this.options.restartDelay);
      } else if (!this._isListening) {
        // Manually stopped by user
        this._updateStatus("Voice commands off. Click mic to start.");
        console.log("[VoiceUI] SpeechRecognition manually stopped.");
      }
    };

    this.recognition.onerror = (event) => {
      console.error("[VoiceUI] Speech Recognition Error:", event.error, event.message);
      this._callCallback('onError', event);
      this._isListening = false; // Stop listening state on error

      let errorMessage = "Voice error.";
      if (event.error === "not-allowed") {
        errorMessage = "Microphone access denied. Please allow it in browser settings.";
        this._microphoneAllowed = false;
        this._callCallback('onMicrophonePermissionDenied');
      } else if (event.error === "no-speech") {
        // No speech for a while, onend will attempt restart if autoRestart is true
        errorMessage = "No speech detected for a while.";
      } else if (event.error === "network") {
        errorMessage = "Network error. Check your internet connection.";
        if (this._microphoneAllowed && this.options.autoRestart) {
            setTimeout(() => this._startRecognitionInternal(), this.options.restartDelay);
        }
      }

      this._updateStatus(`Error: ${errorMessage}`);
    };
  }

  /**
   * Attempts to request microphone permission.
   * @private
   */
  async _checkMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately after checking
      this._microphoneAllowed = true;
      this._callCallback('onMicrophonePermissionGranted');
    } catch (error) {
      console.warn("[VoiceUI] Microphone permission not granted initially:", error.name);
      this._microphoneAllowed = false;
      this._callCallback('onMicrophonePermissionDenied', error);
      if (error.name === "NotAllowedError") {
        this._updateStatus("Error: Microphone access denied. Please allow it in browser settings.");
      } else {
        this._updateStatus("Microphone access required for voice commands.");
      }
    }
  }

  /**
   * Updates the internal voice feedback message and calls the onStatusChange callback.
   * @param {string} message
   * @private
   */
  _updateStatus(message) {
    this._currentVoiceFeedback = message;
    this._callCallback('onStatusChange', message);
  }

  /**
   * Cleans a string by removing common punctuation and converting to lowercase.
   * @param {string} text
   * @returns {string} Cleaned text.
   * @private
   */
  _cleanText(text) {
    return text.replace(/[.,!?"]+/g, '').trim().toLowerCase();
  }

  /**
   * Attempts to find an input (or textarea) element in the DOM based on various attributes.
   * @param {string} identifier The cleaned text to search for (e.g., "username", "email")
   * @returns {{success: boolean, element?: HTMLInputElement | HTMLTextAreaElement, reason?: string}} Result object.
   * @private
   */
  _findInputField(identifier) {
    let element = null;

    if (identifier.includes("email") || identifier.includes("e-mail")) {
      element = document.querySelector('input[type="email" i], input[inputmode="email" i], input[id*="email" i], input[name*="email" i]');
      if (element) return { success: true, element };
    }

    element = document.querySelector(`input[placeholder*="${identifier}" i], textarea[placeholder*="${identifier}" i]`);
    if (element) return { success: true, element };

    element = document.querySelector(`input[aria-label*="${identifier}" i], textarea[aria-label*="${identifier}" i]`);
    if (element) return { success: true, element };

    const labels = document.querySelectorAll('label');
    for (const label of labels) {
      const labelText = this._cleanText(label.textContent || '');
      if (labelText.includes(identifier)) {
        if (label.htmlFor) {
          element = document.getElementById(label.htmlFor);
          if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) return { success: true, element };
        }
        element = label.querySelector('input, textarea');
        if (element) return { success: true, element };
      }
    }

    element = document.querySelector(`input[name*="${identifier}" i], textarea[name*="${identifier}" i]`);
    if (element) return { success: true, element };

    const potentialById = document.getElementById(identifier);
    if (potentialById && (potentialById.tagName === 'INPUT' || potentialById.tagName === 'TEXTAREA')) {
      return { success: true, element: potentialById };
    }
    const potentialByIdCleaned = document.getElementById(this._cleanText(identifier));
    if (potentialByIdCleaned && (potentialByIdCleaned.tagName === 'INPUT' || potentialByIdCleaned.tagName === 'TEXTAREA')) {
      return { success: true, element: potentialByIdCleaned };
    }

    return { success: false, reason: "field not found" };
  }

  /**
   * Processes the recognized speech transcript, trying to match commands.
   * This is where the core logic from CommandContext's handleCommand goes.
   * @param {string} rawTranscript - The raw transcript from speech recognition.
   * @private
   */
  async _processCommand(rawTranscript) {
    const s = this._cleanText(rawTranscript); // Clean the raw voice input once

    // 1. Check for user-defined commands first
    for (const commandPhrase in this._commands) {
      if (s.includes(this._cleanText(commandPhrase))) {
        try {
          // Execute the user-provided callback for the command
          const commandResult = await this._commands[commandPhrase](rawTranscript, s);
          this._callCallback('onCommandRecognized', commandPhrase, rawTranscript, commandResult);
          this._updateStatus(`Command: "${commandPhrase}" processed.`);
          return true; // Command matched and executed
        } catch (e) {
          console.error(`[VoiceUI] Error executing command "${commandPhrase}":`, e);
          this._callCallback('onError', new Error(`Command "${commandPhrase}" failed: ${e.message}`));
          this._updateStatus(`Error with command "${commandPhrase}".`);
          return true; // Command matched, but failed
        }
      }
    }

    // 2. Handle built-in, generic DOM manipulation commands

    // Scroll commands
    if (s.includes("scroll down")) {
      window.scrollBy({ top: 500, behavior: "smooth" });
      this._callCallback('onActionPerformed', 'scroll', { direction: 'down', amount: 500 });
      this._updateStatus("Scrolled down."); return true;
    }
    if (s.includes("scroll up")) {
      window.scrollBy({ top: -500, behavior: "smooth" });
      this._callCallback('onActionPerformed', 'scroll', { direction: 'up', amount: 500 });
      this._updateStatus("Scrolled up."); return true;
    }
    if (s.includes("scroll full down") || s.includes("scroll to bottom") || s.includes("scroll down full")) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      this._callCallback('onActionPerformed', 'scroll', { direction: 'bottom' });
      this._updateStatus("Scrolled to bottom."); return true;
    }
    if (s.includes("scroll full up") || s.includes("scroll to top") || s.includes("scroll up full")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      this._callCallback('onActionPerformed', 'scroll', { direction: 'top' });
      this._updateStatus("Scrolled to top."); return true;
    }

    // Zoom In/Out/Reset commands
    let currentZoom = parseFloat(document.body.style.zoom || '1');
    if (isNaN(currentZoom)) currentZoom = 1;
    const zoomStep = 0.1;
    const minZoom = 0.5;
    const maxZoom = 2.0;

    if (s.includes("zoom in")) {
      let newZoom = Math.min(maxZoom, currentZoom + zoomStep);
      document.body.style.zoom = newZoom;
      this._callCallback('onActionPerformed', 'zoom', { action: 'in', newZoom });
      this._updateStatus(`Zoomed to ${Math.round(newZoom * 100)}%.`); return true;
    }
    if (s.includes("zoom out")) {
      let newZoom = Math.max(minZoom, currentZoom - zoomStep);
      document.body.style.zoom = newZoom;
      this._callCallback('onActionPerformed', 'zoom', { action: 'out', newZoom });
      this._updateStatus(`Zoomed to ${Math.round(newZoom * 100)}%.`); return true;
    }
    if (s.includes("reset zoom")) {
      document.body.style.zoom = 1;
      this._callCallback('onActionPerformed', 'zoom', { action: 'reset', newZoom: 1 });
      this._updateStatus("Zoom reset."); return true;
    }

    // Fill Input Field Command
    const fillInputMatch = rawTranscript.match(/(?:type|fill)\s+(.+?)\s+(?:in|with)\s+(.+)/i);
    if (fillInputMatch) {
      let valueToType = fillInputMatch[1].trim();
      const fieldIdentifierRaw = fillInputMatch[2].trim();

      if (valueToType.startsWith('"') && valueToType.endsWith('"') && valueToType.length > 1) {
        valueToType = valueToType.slice(1, -1);
      }
      const fieldIdentifierCleaned = this._cleanText(fieldIdentifierRaw);

      const findResult = this._findInputField(fieldIdentifierCleaned);

      if (findResult.success) {
        const targetInput = findResult.element;
        targetInput.value = valueToType;
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        this._callCallback('onActionPerformed', 'fillInput', { field: fieldIdentifierCleaned, value: valueToType, element: targetInput });
        this._updateStatus(`Filled "${fieldIdentifierCleaned}" with "${valueToType}".`); return true;
      }
      this._updateStatus(`Could not find input field "${fieldIdentifierCleaned}".`);
      return true; // Command pattern matched, but execution failed
    }

    // Click button command
    const clickButtonMatch = rawTranscript.match(/click (?:button )?(.+)/i);
    if (clickButtonMatch && clickButtonMatch[1]) {
      const targetTextCleaned = this._cleanText(clickButtonMatch[1]);
      const possibleButtons = document.querySelectorAll(
        'button, a, input[type="button"], input[type="submit"], [role="button"], [aria-label]'
      );

      for (const element of possibleButtons) {
        let elementText = this._cleanText(element.textContent || '');
        let ariaLabel = this._cleanText(element.getAttribute('aria-label') || '');
        let inputValue = (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit'))
          ? this._cleanText(element.value || '') : '';

        if (elementText.includes(targetTextCleaned) || ariaLabel.includes(targetTextCleaned) || inputValue.includes(targetTextCleaned)) {
          element.click();
          this._callCallback('onActionPerformed', 'clickButton', { text: targetTextCleaned, element });
          this._updateStatus(`Clicked "${targetTextCleaned}".`); return true;
        }
      }
      this._updateStatus(`Could not find button "${targetTextCleaned}".`);
      return true; // Command pattern matched, but execution failed
    }

    // Fallback: No command matched
    this._callCallback('onCommandNotRecognized', rawTranscript);
    this._updateStatus(`Unknown command: "${rawTranscript}"`);
    return false; // No command pattern recognized
  }

  /**
   * Starts speech recognition.
   * @returns {boolean} True if recognition started or was already running, false otherwise.
   */
  start() {
    if (!VoiceUI.isApiSupported) {
      this._updateStatus("Voice commands not supported by your browser.");
      return false;
    }
    if (!this._microphoneAllowed) {
      this._updateStatus("Microphone access required. Please allow in browser settings.");
      // Attempt to re-request permission
      this._checkMicrophonePermission();
      return false;
    }
    return this._startRecognitionInternal();
  }

  /**
   * Internal method to safely start recognition.
   * @returns {boolean}
   * @private
   */
  _startRecognitionInternal() {
    if (this.recognition && !this._isListening) {
      try {
        this.recognition.start();
        return true;
      } catch (e) {
        if (e.name === 'InvalidStateError') {
          // Already started, which is fine, just ensure state is correct
          this._isListening = true;
          this._updateStatus("Listening for commands...");
          return true;
        }
        console.error("[VoiceUI] Error attempting to start SpeechRecognition:", e);
        this._callCallback('onError', e);
        this._updateStatus(`Error starting voice: ${e.message}`);
        this._isListening = false;
        return false;
      }
    }
    return true; // Already listening or recognition not initialized
  }

  /**
   * Stops speech recognition.
   */
  stop() {
    if (this.recognition && this._isListening) {
      this.recognition.stop();
      this._isListening = false; // Optimistic update, onend will confirm
      this._updateStatus("Voice commands off. Click mic to start.");
    }
  }

  /**
   * Toggles speech recognition on/off.
   */
  toggle() {
    if (this._isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Makes the browser speak a given text.
   * @param {string} text - The text to speak.
   * @param {string} [lang] - The language for synthesis (defaults to instance lang).
   */
  speak(text, lang = this.options.lang) {
    if (!this.speechSynthesis) {
      console.warn("[VoiceUI] SpeechSynthesis not supported by this browser.");
      this._callCallback('onError', new Error("SpeechSynthesis not supported."));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    this.speechSynthesis.speak(utterance);
  }

  /**
   * Registers a custom voice command.
   * @param {string} phrase - The command phrase (e.g., "open settings").
   * @param {Function} callback - The function to execute when the command is recognized.
   *                              It receives `rawTranscript` and `cleanedTranscript` as arguments.
   */
  addCommand(phrase, callback) {
    if (typeof phrase !== 'string' || typeof callback !== 'function') {
      console.error("[VoiceUI] addCommand: Invalid phrase or callback.");
      return;
    }
    this._commands[phrase] = callback;
    console.log(`[VoiceUI] Command "${phrase}" added.`);
  }

  /**
   * Removes a previously registered voice command.
   * @param {string} phrase - The command phrase to remove.
   * @returns {boolean} True if the command was removed, false otherwise.
   */
  removeCommand(phrase) {
    if (this._commands.hasOwnProperty(phrase)) {
      delete this._commands[phrase];
      console.log(`[VoiceUI] Command "${phrase}" removed.`);
      return true;
    }
    return false;
  }

  // --- Getters for status ---
  get isListening() {
    return this._isListening;
  }

  get microphoneAllowed() {
    return this._microphoneAllowed;
  }

  get isApiSupported() {
    return VoiceUI.isApiSupported;
  }

  get voiceFeedback() {
    return this._currentVoiceFeedback;
  }
}

export default VoiceUI;
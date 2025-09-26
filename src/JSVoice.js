import { callCallback, cleanText } from './utils/helpers.js';
import { initRecognition, checkMicrophonePermission } from './modules/RecognitionManager.js';
import { processCommand } from './modules/CommandProcessor.js';

/**
 * JSVoice Library (formerly VoiceUI)
 * A JavaScript library for integrating voice commands and speech synthesis into web applications.
 *
 * NOTE: All references to the old name (VoiceUI) have been replaced with JSVoice.
 */
class JSVoice { // <--- 1. CRITICAL CHANGE: Class renamed
  static _isApiSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  
  static get isApiSupported() {
    return JSVoice._isApiSupported; // <--- 2. Internal static reference updated
  }

  /**
   * @typedef {Object} JSVoiceOptions
   * // (rest of the typedef structure remains the same)
   */

  /**
   * Creates an instance of JSVoice. // <--- JSDoc updated
   * @param {JSVoiceOptions} options - Configuration options for the JSVoice library. // <--- JSDoc updated
   */
  constructor(options = {}) {
    if (!JSVoice.isApiSupported) { // <--- 3. Static access updated
      console.warn("[JSVoice] Web Speech API not supported by this browser.");
      this._callCallback('onStatusChange', "Voice commands not supported by your browser. Try Chrome or Edge.");
      return;
    }

    this.options = {
      continuous: true,
      interimResults: true,
      lang: 'en-US',
      commands: {},
      autoRestart: true,
      restartDelay: 500,
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
    
    this.recognition = null;
    this.speechSynthesis = window.speechSynthesis;

    // State object to pass by reference to modules
    this._state = {
      _isListening: false,
      _microphoneAllowed: false,
    };
    
    this._currentVoiceFeedback = "Initializing voice commands...";
    this._commands = {};
    
    for (const phrase in this.options.commands) {
      this._commands[cleanText(phrase)] = this.options.commands[phrase];
    }
    
    // Initialize Recognition Manager
    this.recognition = initRecognition(
      this.options,
      this._updateStatus.bind(this),
      this._callCallback.bind(this),
      this._processCommand.bind(this),
      this._startRecognitionInternal.bind(this),
      this._state
    );
    
    // Initial microphone check
    this._initialMicrophoneCheckPromise = this._checkMicrophonePermission().catch(e => {
      if (e && e.name === 'NotAllowedError') return;
      // Other errors are handled and status is updated inside checkMicrophonePermission
    });
    
    this._updateStatus("Voice commands ready. Click mic to start.");
  }

  /** Helper to call callbacks safely. */
  _callCallback(callbackName, ...args) {
    callCallback(this.options, callbackName, ...args);
  }
  
  /** Updates the internal status and calls the status change callback. */
  _updateStatus(message) {
    this._currentVoiceFeedback = message;
    this._callCallback('onStatusChange', message);
  }
  
  /** Imports and runs the mic permission check from RecognitionManager. */
  async _checkMicrophonePermission() {
    return checkMicrophonePermission(
      this._updateStatus.bind(this),
      this._callCallback.bind(this),
      this._state
    );
  }
  
  /** Imports and runs the command processing logic from CommandProcessor. */
  async _processCommand(rawTranscript) {
    return processCommand(
      rawTranscript,
      this._commands,
      this._updateStatus.bind(this),
      this._callCallback.bind(this)
    );
  }
  
  /** Internal method to safely start recognition. */
  _startRecognitionInternal() {
    if (this.recognition && !this._state._isListening) {
      try {
        this.recognition.start();
        return true;
      } catch (e) {
        if (e.name === 'InvalidStateError') {
          this._state._isListening = true;
          this._updateStatus("Already listening for commands.");
          return true;
        }
        console.error("[JSVoice] Error attempting to start SpeechRecognition:", e);
        this._callCallback('onError', e);
        this._updateStatus(`Error starting voice: ${e.message}`);
        this._state._isListening = false;
        return false;
      }
    } else if (this._state._isListening) {
      this._updateStatus("Already listening for commands.");
      return true;
    }
    return false;
  }
  
  /**
   * Starts speech recognition.
   */
  async start() {
    if (!JSVoice.isApiSupported) { // <--- 4. Static access updated
      this._updateStatus("Voice commands not supported by your browser.");
      return false;
    }
    
    await this._initialMicrophoneCheckPromise;

    if (!this._state._microphoneAllowed) {
      this._updateStatus("Microphone access denied. Cannot start voice commands.");
      return false;
    }
    
    return this._startRecognitionInternal();
  }
  
  /**
   * Stops speech recognition.
   */
  stop() {
    if (this.recognition && this._state._isListening) {
      this.recognition.stop();
    }
  }
  
  /**
   * Toggles speech recognition on/off.
   */
  toggle() {
    if (this._state._isListening) {
      this.stop();
    } else {
      this.start();
    }
  }
  
  /**
   * Makes the browser speak a given text.
   */
  speak(text, lang = this.options.lang) {
    if (!this.speechSynthesis || !window.SpeechSynthesisUtterance) {
      console.warn("[JSVoice] SpeechSynthesis not supported by this browser.");
      this._callCallback('onError', new Error("SpeechSynthesis not supported."));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    this.speechSynthesis.speak(utterance);
  }
  
  /**
   * Registers a custom voice command.
   */
  addCommand(phrase, callback) {
    if (typeof phrase !== 'string' || typeof callback !== 'function') {
      console.error("[JSVoice] addCommand: Invalid phrase or callback.");
      return;
    }
    this._commands[cleanText(phrase)] = callback;
  }
  
  /**
   * Removes a previously registered voice command.
   */
  removeCommand(phrase) {
    const cleanedPhrase = cleanText(phrase);
    if (this._commands.hasOwnProperty(cleanedPhrase)) {
      delete this._commands[cleanedPhrase];
      return true;
    }
    return false;
  }
  
  get isListening() {
    return this._state._isListening;
  }
  
  get microphoneAllowed() {
    return this._state._microphoneAllowed;
  }
  
  get isApiSupported() {
    return JSVoice.isApiSupported; 
  }
  
  get voiceFeedback() {
    return this._currentVoiceFeedback;
  }
}

export default JSVoice; 
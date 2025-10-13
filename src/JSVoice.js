import { callCallback, cleanText } from './utils/helpers.js';
import { initRecognition, checkMicrophonePermission } from './modules/RecognitionManager.js';
import { processCommand } from './modules/CommandProcessor.js';

/**
 * JSVoice Library (formerly VoiceUI)
 * A JavaScript library for integrating voice commands and speech synthesis into web applications.
 */
class JSVoice {
  static _isApiSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  
  static get isApiSupported() {
    return JSVoice._isApiSupported;
  }

  /**
   * @typedef {Object} JSVoiceOptions
   * @property {boolean} [continuous=true] - If true, recognition continues even if the user pauses speaking. Ignored if wakeWord is set (which forces continuous).
   * @property {boolean} [interimResults=true] - If true, interim results are returned.
   * @property {string} [lang='en-US'] - The language of the recognition.
   * @property {Object.<string, Function>} [commands={}] - An object mapping exact phrases to callback functions.
   * @property {Array.<{pattern: string, callback: Function}>} [patternCommands=[]] - An array of objects for pattern-based commands (e.g., `{pattern: "change background to {color}", callback: myFunc}`).
   * @property {boolean} [autoRestart=true] - If true, recognition will automatically restart after ending.
   * @property {number} [restartDelay=500] - Delay in milliseconds before restarting recognition if autoRestart is true.
   * @property {string|null} [wakeWord=null] - A phrase that will activate command listening. If set, 'continuous' is forced to true.
   * @property {number} [wakeWordTimeout=5000] - Duration in milliseconds after a wake word is detected or a command is processed, during which the system listens for commands. After this, it reverts to waiting for the wake word.
   * @property {Function} [onSpeechStart] - Callback fired when speech recognition starts.
   * @property {Function} [onSpeechEnd] - Callback fired when speech recognition ends.
   * @property {Function} [onCommandRecognized] - Callback fired when a command is successfully recognized and processed.
   * @property {Function} [onCommandNotRecognized] - Callback fired when speech is recognized but no command matches.
   * @property {Function} [onActionPerformed] - Callback fired when a built-in action (like scroll, zoom, click, read) is performed.
   * @property {Function} [onMicrophonePermissionGranted] - Callback fired when microphone permission is granted.
   * @property {Function} [onMicrophonePermissionDenied] - Callback fired when microphone permission is denied.
   * @property {Function} [onWakeWordDetected] - Callback fired when the configured wake word is detected.
   * @property {Function} [onError] - Callback fired on any speech recognition error.
   * @property {Function} [onStatusChange] - Callback fired when the internal status message changes.
   */

  /**
   * Creates an instance of JSVoice.
   * @param {JSVoiceOptions} options - Configuration options for the JSVoice library.
   */
  constructor(options = {}) {
    if (!JSVoice.isApiSupported) {
      console.warn("[JSVoice] Web Speech API not supported by this browser.");
      this._callCallback('onStatusChange', "Voice commands not supported by your browser. Try Chrome or Edge.");
      return;
    }

    this.options = {
      continuous: true,
      interimResults: true,
      lang: 'en-US',
      commands: {},
      patternCommands: [],
      autoRestart: true,
      restartDelay: 500,
      wakeWord: null,
      wakeWordTimeout: 5000,
      onSpeechStart: () => {},
      onSpeechEnd: () => {},
      onCommandRecognized: () => {},
      onCommandNotRecognized: () => {},
      onActionPerformed: () => {},
      onMicrophonePermissionGranted: () => {},
      onMicrophonePermissionDenied: () => {},
      onWakeWordDetected: () => {},
      onError: () => {},
      onStatusChange: () => {},
      ...options,
    };
    
    // If wakeWord is set, force continuous listening
    if (this.options.wakeWord) {
      this.options.continuous = true;
      this.options.wakeWord = cleanText(this.options.wakeWord); // Clean wake word once
    }

    this.recognition = null;
    this.speechSynthesis = window.speechSynthesis;

    // State object to pass by reference to modules
    this._state = {
      _isListening: false,
      _microphoneAllowed: false,
      _awaitingCommand: false,
      _wakeWordModeActive: !!this.options.wakeWord,
      _isStoppingIntentionally: false, // Flag to indicate an intentional stop (e.g., from speak() or JSVoice.stop())
    };
    
    this._currentVoiceFeedback = "Initializing voice commands...";
    this._commands = {};
    this._patternCommands = [];
    this._wakeWordCommandTimer = null;

    // Process initial exact commands
    for (const phrase in this.options.commands) {
      this._commands[cleanText(phrase)] = this.options.commands[phrase];
    }
    // Process initial pattern commands (use addPatternCommand to ensure cleaning/storage)
    for (const patternCmd of this.options.patternCommands) {
        this.addPatternCommand(patternCmd.pattern, patternCmd.callback);
    }
    
    // Initialize Recognition Manager
    this.recognition = initRecognition(
      this.options,
      this._updateStatus.bind(this),
      this._callCallback.bind(this),
      this._handleSpeechResult.bind(this),
      this._startRecognitionInternal.bind(this),
      this._state
    );
    
    // Initial microphone check
    this._initialMicrophoneCheckPromise = this._checkMicrophonePermission().catch(e => {
      if (e && e.name === 'NotAllowedError') return;
      // Other errors are handled and status is updated inside checkMicrophonePermission
    });
    
    // Initial status update based on wake word configuration
    this._updateStatus(
        this._state._wakeWordModeActive 
        ? `Voice commands ready. Waiting for wake word "${this.options.wakeWord}"...` 
        : "Voice commands ready. Click mic to start."
    );
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
  
  /** 
   * Handles incoming speech results, including wake word detection.
   * @param {string} rawTranscript - The raw transcript from speech recognition.
   */
  async _handleSpeechResult(rawTranscript) {
    const cleanedTranscript = cleanText(rawTranscript);

    // --- Wake Word Logic ---
    if (this._state._wakeWordModeActive) {
      if (!this._state._awaitingCommand) {
        // We are in wake word mode, waiting for the wake word
        if (cleanedTranscript.includes(this.options.wakeWord)) {
          this._state._awaitingCommand = true; // Switch to command-listening mode
          this._callCallback('onWakeWordDetected', this.options.wakeWord);
          this._updateStatus(`Wake word "${this.options.wakeWord}" detected! Listening for command...`);
          
          // Set/reset a timeout to revert to wake word listening if no command is given
          if (this._wakeWordCommandTimer) clearTimeout(this._wakeWordCommandTimer);
          this._wakeWordCommandTimer = setTimeout(() => {
            this._resetWakeWordState();
          }, this.options.wakeWordTimeout);
          return true; // Wake word handled, waiting for actual command
        } else {
          // In wake word mode, but wake word not detected. Ignore this speech as a command.
          this._updateStatus(`Waiting for wake word "${this.options.wakeWord}"...`);
          return false;
        }
      } else {
        // We are in command-listening mode after a wake word. Process the command.
        // Reset the timeout as speech was detected, extending the command window.
        if (this._wakeWordCommandTimer) clearTimeout(this._wakeWordCommandTimer);
        this._wakeWordCommandTimer = setTimeout(() => {
          this._resetWakeWordState();
        }, this.options.wakeWordTimeout);
      }
    }

    // --- Normal Command Processing (or if in _awaitingCommand state) ---
    const commandHandled = await processCommand(
      rawTranscript,
      this._commands,
      this._patternCommands,
      this._updateStatus.bind(this),
      this._callCallback.bind(this),
      this.speak.bind(this)
    );
    
    // If no command was handled and not in wake word mode, and still listening, indicate general listening
    if (!commandHandled && !this._state._wakeWordModeActive && this._state._isListening) {
      this._updateStatus("Listening for commands...");
    }
    
    return commandHandled;
  }

  /** Resets the wake word command listening state. */
  _resetWakeWordState() {
    this._state._awaitingCommand = false;
    if (this._wakeWordCommandTimer) {
      clearTimeout(this._wakeWordCommandTimer);
      this._wakeWordCommandTimer = null;

    // Real-time amplitude / analyser support
    this._audioContext = null;
    this._analyser = null;
    this._micStream = null; // MediaStream used for analyser (kept separate from recognition)
    this._amplitudeCallback = null;
    this._amplitudeRafId = null;
    this._amplitudeOptions = null;
    }
    if (this._state._isListening) {
        this._updateStatus(`Reverted to wake word mode. Waiting for "${this.options.wakeWord}"...`);
    } else {
        this._updateStatus("Voice commands off. Click mic to start.");
    }
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
    if (!JSVoice.isApiSupported) {
      this._updateStatus("Voice commands not supported by your browser.");
      return false;
    }
    
    await this._initialMicrophoneCheckPromise;

    if (!this._state._microphoneAllowed) {
      this._updateStatus("Microphone access denied. Cannot start voice commands.");
      return false;
    }
    
    // If wake word mode is active, ensure we update status correctly on manual start
    if (this._state._wakeWordModeActive) {
        this._state._awaitingCommand = false; // Start fresh in wake word mode
        this._updateStatus(`Waiting for wake word "${this.options.wakeWord}"...`);
    } else {
        this._updateStatus("Listening for commands...");
    }

    return this._startRecognitionInternal();
  }
  
  /**
   * Stops speech recognition.
   */
  stop() {
    if (this.recognition && this._state._isListening) {
      this._state._isStoppingIntentionally = true; // NEW: Set flag before stopping
      this.recognition.stop(); // This will trigger onend (and possibly onerror)
      
      // onend in RecognitionManager will now handle resetting _isStoppingIntentionally and status.
      // We explicitly don't reset the flag here, as onend will be the definitive resetter.
    } else {
        this._updateStatus("Voice commands off.");
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
   * If speech recognition is active, it will be temporarily stopped
   * to prevent self-recognition, then restarted after synthesis.
   * @param {string} text - The text to be spoken.
   * @param {string} [lang] - The language for synthesis (defaults to options.lang).
   */
  speak(text, lang = this.options.lang) {
    if (!this.speechSynthesis || !window.SpeechSynthesisUtterance) {
      console.warn("[JSVoice] SpeechSynthesis not supported by this browser.");
      this._callCallback('onError', new Error("SpeechSynthesis not supported."));
      return;
    }

    const wasListening = this._state._isListening;
    let restartRecognition = false;

    if (wasListening && this._state._microphoneAllowed) {
        this._state._isStoppingIntentionally = true; // NEW: Set flag before stopping
        this.recognition.stop(); 
        restartRecognition = true;
    } else if (wasListening && !this._state._microphoneAllowed) {
        console.warn("[JSVoice] Cannot temporarily stop recognition for speak: Microphone not allowed.");
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const finalizeSpeak = () => {
      // _isStoppingIntentionally is reset by onend event handler in RecognitionManager
      if (restartRecognition && this._state._microphoneAllowed) {
        this._startRecognitionInternal();
        // Restore appropriate status
        if (this._state._wakeWordModeActive) {
            this._updateStatus(
                this._state._awaitingCommand 
                ? `Listening for command... (after wake word)` 
                : `Waiting for wake word "${this.options.wakeWord}"...`
            );
        } else {
            this._updateStatus("Listening for commands.");
        }
      } else if (!this._state._microphoneAllowed) {
          this._updateStatus("Microphone access needed for voice commands.");
      } else if (!wasListening) {
          this._updateStatus("Voice commands ready. Click mic to start.");
      }
    };

    utterance.onend = finalizeSpeak;
    utterance.onerror = (event) => {
      console.error("[JSVoice] SpeechSynthesis Error:", event);
      this._callCallback('onError', new Error(`SpeechSynthesis failed: ${event.error}`));
      finalizeSpeak();
    };

    this.speechSynthesis.speak(utterance);
  }
  
  /**
   * Registers a custom voice command based on an exact phrase.
   * @param {string} phrase - The exact phrase to match for the command.
   * @param {Function} callback - The function to execute when the phrase is recognized. Arguments: (rawTranscript: string, cleanedTranscript: string, jsVoiceSpeakMethod: Function)
   */
  addCommand(phrase, callback) {
    if (typeof phrase !== 'string' || typeof callback !== 'function') {
      console.error("[JSVoice] addCommand: Invalid phrase or callback.");
      return;
    }
    const cleanedPhrase = cleanText(phrase);
    if (this._commands.hasOwnProperty(cleanedPhrase)) {
        console.warn(`[JSVoice] Overwriting existing exact command: "${phrase}"`);
    }
    this._commands[cleanedPhrase] = callback;
  }
  
  /**
   * Removes a previously registered exact phrase voice command.
   * @param {string} phrase - The phrase of the command to remove.
   * @returns {boolean} True if the command was removed, false otherwise.
   */
  removeCommand(phrase) {
    const cleanedPhrase = cleanText(phrase);
    if (this._commands.hasOwnProperty(cleanedPhrase)) {
      delete this._commands[cleanedPhrase];
      return true;
    }
    return false;
  }

  /**
   * Registers a custom voice command based on a pattern.
   * Pattern example: "change background to {color}"
   * Callback arguments: (extractedArgs: Object, rawTranscript: string, cleanedTranscript: string, jsVoiceSpeakMethod: Function)
   * @param {string} pattern - The pattern to match for the command (e.g., "set theme to {themeName}"). Placeholders in curly braces will be extracted.
   * @param {Function} callback - The function to execute. Receives an object of extracted arguments, raw/cleaned transcripts, and the speak method.
   */
  addPatternCommand(pattern, callback) {
    if (typeof pattern !== 'string' || typeof callback !== 'function') {
      console.error("[JSVoice] addPatternCommand: Invalid pattern or callback.");
      return;
    }
    const cleanedPattern = cleanText(pattern);
    const existingIndex = this._patternCommands.findIndex(cmd => cmd.cleanedPattern === cleanedPattern);
    if (existingIndex > -1) {
        console.warn(`[JSVoice] Overwriting existing pattern command: "${pattern}"`);
        this._patternCommands[existingIndex] = { pattern, cleanedPattern, callback };
    } else {
        this._patternCommands.push({ pattern, cleanedPattern, callback });
    }
  }

  /**f
   * Removes a previously registered pattern voice command.
   * @param {string} pattern - The pattern of the command to remove.
   * @returns {boolean} True if the command was removed, false otherwise.
   */
  removePatternCommand(pattern) {
    const cleanedPattern = cleanText(pattern);
    const initialLength = this._patternCommands.length;
    this._patternCommands = this._patternCommands.filter(cmd => cmd.cleanedPattern !== cleanedPattern);
    return this._patternCommands.length < initialLength;
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

  get isWakeWordModeActive() {
    return this._state._wakeWordModeActive;
  }

  get isAwaitingCommand() {
    return this._state._awaitingCommand;
  }

  /**
   * Starts real-time amplitude monitoring. This will request microphone access (if not already granted)
   * and call `onAmplitude` callback regularly with a value in range [0, 1].
   * @param {Function} onAmplitude - function(amplitude: number) called with current RMS amplitude
   * @param {Object} [opts] - optional settings: { fftSize: number (default 2048), smoothingTimeConstant: number (0-1, default 0.3) }
   * @returns {Promise<boolean>} resolves true if analyser started, false otherwise
   */
  /**
   * startAmplitude callback can receive either a number (RMS) or an array (bars mode).
   * opts.mode: 'rms' (default) | 'bars' (frequency bars)
   * opts.barCount: number of bars when mode === 'bars' (default 8)
   */
  async startAmplitude(onAmplitude, opts = {}) {
    if (typeof onAmplitude !== 'function') {
      console.error('[JSVoice] startAmplitude requires a callback function');
      return false;
    }

    this._amplitudeCallback = onAmplitude;
    this._amplitudeOptions = {
      fftSize: opts.fftSize || 2048,
      smoothingTimeConstant: typeof opts.smoothingTimeConstant === 'number' ? opts.smoothingTimeConstant : 0.3,
      mode: opts.mode || 'rms',
      barCount: opts.barCount || 8,
    };

    // Ensure microphone permission check has run
    try {
      await this._initialMicrophoneCheckPromise;
    } catch (e) {
      // permission check might throw when denied
    }

    if (!this._state._microphoneAllowed || !this._micStream) {
      try {
        // Reuse RecognitionManager to request a live stream without stopping tracks
        const stream = await checkMicrophonePermission(this._updateStatus.bind(this), this._callCallback.bind(this), this._state, { returnStream: true });
        this._micStream = stream;
      } catch (err) {
        this._callCallback('onMicrophonePermissionDenied', err);
        this._updateStatus('Error: Microphone access denied. Cannot start amplitude analyser.');
        return false;
      }
    }

    try {
      // Create AudioContext and analyser
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.error('[JSVoice] Web Audio API not supported in this browser.');
        return false;
      }

      this._audioContext = this._audioContext || new AudioContext();
      // If context is suspended (autoplay policy), try to resume
      if (this._audioContext.state === 'suspended') {
        try { await this._audioContext.resume(); } catch(e) { /* continue */ }
      }

      this._analyser = this._audioContext.createAnalyser();
      this._analyser.fftSize = this._amplitudeOptions.fftSize;
      this._analyser.smoothingTimeConstant = this._amplitudeOptions.smoothingTimeConstant;

      const source = this._audioContext.createMediaStreamSource(this._micStream);
      source.connect(this._analyser);

      if (this._amplitudeOptions.mode === 'bars') {
        // Use frequency-domain data to make multiple bars
        const freqSize = this._analyser.frequencyBinCount;
        const freqData = new Uint8Array(freqSize);
        const sampleBars = () => {
          if (!this._analyser || !this._amplitudeCallback) return;
          this._analyser.getByteFrequencyData(freqData);
          // Group frequency bins into barCount buckets
          const bars = new Array(this._amplitudeOptions.barCount).fill(0);
          const binsPerBar = Math.floor(freqSize / bars.length) || 1;
          for (let i = 0; i < bars.length; i++) {
            let sum = 0;
            const start = i * binsPerBar;
            const end = Math.min(start + binsPerBar, freqSize);
            for (let j = start; j < end; j++) sum += freqData[j];
            const avg = sum / (end - start || 1);
            // Normalize 0..255 to 0..1
            bars[i] = Math.min(1, Math.max(0, avg / 255));
          }
          try { this._amplitudeCallback(bars); } catch (e) { console.error('[JSVoice] amplitude callback error', e); }
          this._amplitudeRafId = window.requestAnimationFrame(sampleBars);
        };
        if (this._amplitudeRafId) cancelAnimationFrame(this._amplitudeRafId);
        this._amplitudeRafId = window.requestAnimationFrame(sampleBars);
      } else {
        const bufferLength = this._analyser.fftSize;
        const data = new Float32Array(bufferLength);
        const sample = () => {
          if (!this._analyser || !this._amplitudeCallback) return;
          this._analyser.getFloatTimeDomainData(data);
          // Compute RMS
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = data[i];
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          // Clamp and normalize (rms is typically 0..1)
          const amplitude = Math.min(1, Math.max(0, rms));
          try {
            this._amplitudeCallback(amplitude);
          } catch (e) {
            console.error('[JSVoice] amplitude callback error', e);
          }
          this._amplitudeRafId = window.requestAnimationFrame(sample);
        };
        if (this._amplitudeRafId) cancelAnimationFrame(this._amplitudeRafId);
        this._amplitudeRafId = window.requestAnimationFrame(sample);
      }

  // (per-branch RAF already started above)

      this._updateStatus('Amplitude monitoring started.');
      return true;
    } catch (e) {
      console.error('[JSVoice] startAmplitude error:', e);
      this._callCallback('onError', e);
      return false;
    }
  }

  /**
   * Stops real-time amplitude monitoring and frees resources.
   */
  stopAmplitude() {
    if (this._amplitudeRafId) {
      cancelAnimationFrame(this._amplitudeRafId);
      this._amplitudeRafId = null;
    }
    if (this._analyser) {
      try { this._analyser.disconnect(); } catch (e) {}
      this._analyser = null;
    }
    if (this._audioContext) {
      try { this._audioContext.close(); } catch (e) {}
      this._audioContext = null;
    }
    if (this._micStream) {
      try { this._micStream.getTracks().forEach(t => t.stop()); } catch (e) {}
      this._micStream = null;
    }
    this._amplitudeCallback = null;
    this._updateStatus('Amplitude monitoring stopped.');
  }
}

export default JSVoice;
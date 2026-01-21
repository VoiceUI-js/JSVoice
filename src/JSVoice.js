import { callCallback, cleanText } from './utils/helpers.js';
import { logger } from './utils/Logger.js';
import { initRecognition, checkMicrophonePermission } from './modules/RecognitionManager.js';
import { CommandManager } from './modules/CommandManager.js';

/**
 * JSVoice Core
 * A modular voice command library. 
 * NOTE: This class is pure logic. It does NOT bundle engines by default.
 */
class JSVoice {
  static get isApiSupported() {
    // Only check if window exists (SSR Guard)
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  constructor(options = {}) {
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
      engines: [], // Must be injected
      engine: null, // Manual instance override
      plugins: [], // Plugins to load
      debug: false, // New debug mode
      defaultScope: 'global',
      onSpeechStart: () => { },
      onSpeechEnd: () => { },
      onCommandRecognized: () => { },
      onCommandNotRecognized: () => { },
      onActionPerformed: () => { },
      onMicrophonePermissionGranted: () => { },
      onMicrophonePermissionDenied: () => { },
      onWakeWordDetected: () => { },
      onEngineStateChange: () => { }, // New State Callback
      onCommandEvaluated: () => { },  // New Debug Callback
      onError: () => { },
      onStatusChange: () => { },
      onEngineSelected: () => { },
      onFallbackActivated: () => { },
      onTelemetry: () => { }, // Global Telemetry Hook
      ...options,
    };

    // New Callbacks object to manage events
    this._callbacks = {
      onSpeechStart: () => { },
      onSpeechEnd: () => { },
      onResult: (transcript, isFinal) => { },
      onCommandRecognized: (commandName, commandText) => { },
      onCommandNotRecognized: () => { },
      onMicrophonePermissionGranted: () => { },
      onMicrophonePermissionDenied: () => { },
      onEngineStateChange: () => { },
      onEngineSelected: () => { },
      onFallbackActivated: () => { },
      onTelemetry: () => { },
      onCommandEvaluated: () => { },
      onError: () => { },
      onStatusChange: () => { },
      ...options, // Merge user-provided callbacks
    };

    // State Snapshot (Reactive Source of Truth)
    this._snapshot = {
      status: 'idle',
      transcript: { partial: '', final: '', updatedAt: 0 },
      permissions: { microphone: 'unknown' },
      engine: { name: 'unknown', mode: 'unknown' },
      metrics: {}
    };
    this._listeners = new Set();


    // Warn if no engines provided
    if ((!this.options.engines || this.options.engines.length === 0) && !this.options.engine) {
      console.warn('[JSVoice] No engines provided. Use createVoice() for defaults or inject NativeSpeechEngine.');
    }

    // Initialize Command Manager
    this._commandManager = new CommandManager();
    this._commandManager.debugMode = !!this.options.debug;
    this._commandManager.onCommandEvaluated = (evt) => this._callCallback('onCommandEvaluated', evt);
    this._commandManager.onTelemetry = (evt) => this._callCallback('onTelemetry', evt);

    // Set initial scope if defined
    if (this.options.defaultScope !== 'global') {
      this._commandManager.setScope(this.options.defaultScope);
    }

    /**
     * Registers a plugin function with this JSVoice instance.
     * @param {Function} plugin - Function receiving a restricted API
     */
    this.use = (plugin) => {
      const _self = this;
      if (typeof plugin === 'function') {
        const pluginApi = {
          // Public Methods
          start: this.start.bind(this),
          stop: this.stop.bind(this),
          toggle: this.toggle.bind(this),
          speak: this.speak.bind(this),
          addCommand: this.addCommand.bind(this),
          removeCommand: this.removeCommand.bind(this),
          // Pattern cmds are now unified in addCommand, but keeping for back-compat
          addPatternCommand: this.addPatternCommand.bind(this),
          removePatternCommand: this.removePatternCommand.bind(this),
          setOption: this.setOption.bind(this),
          startAmplitude: this.startAmplitude.bind(this),
          stopAmplitude: this.stopAmplitude.bind(this),

          // Scopes
          setScope: this.setScope.bind(this),
          resetScope: this.resetScope.bind(this),

          // Getters (read-only)
          get isListening() { return this.isListening; },
          get microphoneAllowed() { return this.microphoneAllowed; },
          get voiceFeedback() { return this.voiceFeedback; },
          get isApiSupported() { return JSVoice.isApiSupported; },
          get options() { return { ..._self.options }; }
        };

        plugin(pluginApi);
      }
      return this;
    };

    // Load initial plugins
    if (this.options.plugins && Array.isArray(this.options.plugins)) {
      this.options.plugins.forEach(p => this.use(p));
    }

    if (this.options.wakeWord) {
      this.options.continuous = true;
      this.options.wakeWord = cleanText(this.options.wakeWord);
    }

    this.recognition = null;
    this.speechSynthesis = (typeof window !== 'undefined') ? window.speechSynthesis : null;

    this._state = {
      _isListening: false,
      _microphoneAllowed: false,
      _awaitingCommand: false,
      _wakeWordModeActive: !!this.options.wakeWord,
      _isStoppingIntentionally: false,
    };

    this._currentVoiceFeedback = 'Initializing...';
    // Remove old internal command storage, defer to manager
    // this._commands = {}; 
    // this._patternCommands = [];
    this._wakeWordCommandTimer = null;

    // Concurrency Guards
    this._startLock = false;
    this._sessionToken = 0; // Incremented on every start attempt

    // Process initial Legacy commands (convert to Manager)
    for (const phrase in this.options.commands) {
      this._commandManager.register(phrase, this.options.commands[phrase], { type: 'exact' });
    }
    for (const patternCmd of this.options.patternCommands) {
      this._commandManager.register(patternCmd.pattern, patternCmd.callback, { type: 'pattern' });
    }

    // Engine initialization logic
    this._initEngine();
  }

  _initEngine() {
    let EngineClassToUse = null;
    let engineInstance = this.options.engine;

    if (!engineInstance) {
      const enginesList = Array.isArray(this.options.engines) ? this.options.engines : [];

      for (const EngineClass of enginesList) {
        if (EngineClass && EngineClass.isSupported) {
          EngineClassToUse = EngineClass;
          break;
        }
      }

      if (EngineClassToUse) {
        engineInstance = new EngineClassToUse(this.options);
      }
    }

    if (!engineInstance) {
      // Only log if we expected engines (i.e. browser environment)
      if (typeof window !== 'undefined' && this.options.engines.length > 0) {
        logger.warn('No supported speech engine found.');
      }
      return;
    }

    // Attach State Listener
    if (engineInstance.setCallbacks) {
      // We need to wrap existing setCallbacks logic or pass it down. 
      // Currently initRecognition handles setCallbacks. We must make sure it includes state changes.
      // See RecognitionManager change below or inline logic. 
      // Since initRecognition is external, we'll verify it handles 'onStateChange' or we monkey-patch it here.
    }

    // We pass onStateChange directly to the engine instance before initRecognition 
    // if the engine supports direct callback assignment, OR we rely on initRecognition to wire it up.
    // Let's modify initRecognition to support hooking onStateChange.

    // For now, let's inject it into the options passed to initRecognition's scope?
    // Actually, initRecognition accepts the engine instance. We can just attach the listener.
    engineInstance.onStateChange = (state) => {
      this._callCallback('onEngineStateChange', state);
    };

    this.recognition = initRecognition(
      engineInstance,
      this._updateStatus.bind(this),
      this._callCallback.bind(this),
      this._handleSpeechResult.bind(this),
      this._startRecognitionInternal.bind(this),
      this._state
    );

    this._initPromise = this.recognition.init().catch((e) => {
      logger.error('Engine Init Error:', e);
      this._callCallback('onError', e);
    });
  }

  _callCallback(callbackName, ...args) {
    callCallback(this.options, callbackName, ...args);
  }

  _updateStatus(message) {
    this._currentVoiceFeedback = message;
    this._callCallback('onStatusChange', message);
  }

  async _checkMicrophonePermission(opts) {
    return checkMicrophonePermission(
      this._updateStatus.bind(this),
      this._callCallback.bind(this),
      this._state,
      opts
    );
  }

  async _handleSpeechResult(rawTranscript) {
    const cleanedTranscript = cleanText(rawTranscript);

    // Wake Word Logic
    if (this._state._wakeWordModeActive) {
      if (!this._state._awaitingCommand) {
        if (cleanedTranscript.includes(this.options.wakeWord)) {
          this._state._awaitingCommand = true;
          this._callCallback('onWakeWordDetected', this.options.wakeWord);
          this._updateStatus(`Wake word detected! Listening...`);

          if (this._wakeWordCommandTimer) clearTimeout(this._wakeWordCommandTimer);
          this._wakeWordCommandTimer = setTimeout(() => {
            this._resetWakeWordState();
          }, this.options.wakeWordTimeout);
          return true;
        } else {
          this._updateStatus(`Waiting for "${this.options.wakeWord}"...`);
          return false;
        }
      } else {
        // Extend timeout logic
        if (this._wakeWordCommandTimer) clearTimeout(this._wakeWordCommandTimer);
        this._wakeWordCommandTimer = setTimeout(() => {
          this._resetWakeWordState();
        }, this.options.wakeWordTimeout);
      }
    }

    // Delegation to CommandManager
    const commandHandled = await this._commandManager.process(
      rawTranscript,
      this.speak.bind(this)
    );

    if (commandHandled) {
      // We can manually trigger onCommandRecognized here if we want core to fire it,
      // but CommandManager handles execution. 
      // We should likely bind the core callback to the manager output or fire it here using the manager result.
      // The manager's process returns boolean. To keep legacy callbacks firing (onCommandRecognized),
      // we might want the manager to return details or fire the callback itself. 
      // Current Manager impl calls callback but doesn't fire core events.
      // The `onCommandRecognized` global event is skipped in current Manager impl.
      // We should fix Manager to emit this or return structured result. 
      // For this iteration, we rely on the specific command callback firing.
      // If we want Global events, we should have passed `this._callCallback` to Manager. Not done yet.
    }

    if (!commandHandled && !this._state._wakeWordModeActive && this._state._isListening) {
      this._updateStatus('Listening for commands...');
      this._callCallback('onCommandNotRecognized', rawTranscript);
    }
    return commandHandled;
  }

  _resetWakeWordState() {
    this._state._awaitingCommand = false;
    if (this._wakeWordCommandTimer) {
      clearTimeout(this._wakeWordCommandTimer);
      this._wakeWordCommandTimer = null;
    }
    if (this._state._isListening) {
      this._updateStatus(`Reverted to wake word mode.`);
    }
  }

  async _startRecognitionInternal() {
    if (this.recognition && !this._state._isListening) {
      try {
        await this.recognition.start();
        return true;
      } catch (e) {
        this._callCallback('onError', e);
        this._state._isListening = false;
        return false;
      }
    }
    return false;
  }

  /**
   * Safe Start Method.
   */
  async start() {
    if (this._startLock) {
      logger.warn('start() ignored: operation already in progress.');
      return false; // Lock contention is not necessarily an error, just a no-op
    }
    this._startLock = true;
    const mySession = ++this._sessionToken;

    try {
      if (!this.recognition) {
        this._updateStatus('Voice commands not initialized.');
        throw new Error('Voice engine not initialized.');
      }

      if (this._initPromise) await this._initPromise.catch((e) => logger.error('Engine Init Error', e));

      // Async Check: Did stop() happen while we waited?
      if (mySession !== this._sessionToken) return false;

      await this._checkMicrophonePermission();

      // Async Check 2
      if (mySession !== this._sessionToken) return false;

      if (!this._state._microphoneAllowed) {
        this._updateStatus('Microphone access denied.');
        // Explicit rejection for modern await flows
        throw new Error('Microphone access denied.');
      }

      if (this._state._wakeWordModeActive) {
        this._state._awaitingCommand = false;
        this._updateStatus(`Waiting for "${this.options.wakeWord}"...`);
      } else {
        this._updateStatus('Listening for commands...');
      }

      const result = await this._startRecognitionInternal();
      return result;
    } finally {
      this._startLock = false;
    }
  }

  stop() {
    this._sessionToken++; // Invalidate any pending start()
    if (this.recognition && this._state._isListening) {
      this._state._isStoppingIntentionally = true;
      this.recognition.stop();
      // stop visualizer if plugin attached (via weak ref or simple check)
      if (this._audioVisualizer) {
        this.stopAmplitude();
      }
    } else {
      this._updateStatus('Voice commands off.');
    }
  }

  toggle() {
    if (this._state._isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  speak(text, lang = this.options.lang) {
    if (typeof window === 'undefined') return; // SSR Guard
    if (!text) return;

    if (!this.speechSynthesis || !window.SpeechSynthesisUtterance) {
      console.warn('[JSVoice] SpeechSynthesis not supported.');
      return;
    }

    // Logic to pause recognition...
    const wasListening = this._state._isListening;
    let restartRecognition = false;

    if (wasListening && this._state._microphoneAllowed) {
      this._state._isStoppingIntentionally = true;
      this.recognition.stop();
      restartRecognition = true;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const finalizeSpeak = () => {
      if (restartRecognition && this._state._microphoneAllowed) {
        this._startRecognitionInternal();
      }
    };

    utterance.onend = finalizeSpeak;
    utterance.onerror = finalizeSpeak;
    this.speechSynthesis.speak(utterance);
  }

  // --- Visualizer Proxy Methods ---
  // The core doesn't import visualizer, but exposes the API if the module is loaded via plugin
  // or manually attached.
  startAmplitude(callback, options) {
    if (!this._audioVisualizer) {
      console.error('[JSVoice] AudioVisualizer module not loaded. Use createVoice() or voice.use(VisualizerPlugin).');
      return;
    }
    // Optimization: If we have an active engine with a stream, pass it!
    // But NativeSpeechEngine (Web Speech API) does NOT expose the stream.
    // So we usually must create a new one. AudioVisualizer.js handles the sharing logic if passed.
    this._audioVisualizer.start(callback, options).catch((err) => {
      this._callCallback('onError', err);
    });
  }

  stopAmplitude() {
    if (this._audioVisualizer) {
      this._audioVisualizer.stop();
    }
  }

  /* --- New Command API (Proxied to Manager) --- */

  /**
   * registers a command with optional configuration.
   * @param {string} phrase 
   * @param {Function} callback 
   * @param {Object} options { priority, scope, cooldown, once }
   */
  addCommand(phrase, callback, options = {}) {
    this._commandManager.register(phrase, callback, options);
  }

  removeCommand(phrase) {
    return this._commandManager.unregister(phrase);
  }

  addPatternCommand(pattern, callback) {
    // Backwards compatibility wrapper
    logger.warn('addPatternCommand is deprecated. Use addCommand(phrase, callback, { isPattern: true }) instead.');
    this._commandManager.register(pattern, callback, { type: 'pattern', isPattern: true });
  }

  removePatternCommand(pattern) {
    return this._commandManager.unregister(pattern);
  }

  setScope(scopeName) {
    this._commandManager.setScope(scopeName);
  }

  pushScope(scopeName) {
    this._commandManager.pushScope(scopeName);
  }

  popScope() {
    return this._commandManager.popScope();
  }

  resetScope() {
    this._commandManager.resetScope();
  }

  /* --- Options --- */

  setOption(key, value) {
    this.options[key] = value;
    if (key === 'debug') {
      this._commandManager.debugMode = !!value;
      logger.setDebug(value);
    }
    if (this.recognition && this.recognition.setOptions) {
      this.recognition.setOptions({ [key]: value });
    }
  }

  // Getters
  /* -------------------------------------------------------------------------- */
  /*                               Internal Helpers                             */
  /* -------------------------------------------------------------------------- */

  getSnapshot() {
    return this._snapshot;
  }

  subscribe(listener) {
    if (!this._listeners) this._listeners = new Set();
    this._listeners.add(listener);
    // Emit initial
    listener(this._snapshot, { type: 'init' });
    return () => this._listeners.delete(listener);
  }

  _notifyListeners(event) {
    if (!this._listeners) return;
    this._listeners.forEach(l => l(this._snapshot, event));
  }

  _updateSnapshot(changes) {
    this._snapshot = { ...this._snapshot, ...changes };
  }

  _callCallback(name, ...args) {
    // 1. Update Snapshot based on event
    if (name === 'onEngineStateChange') {
      const state = args[0] || 'unknown';
      this._updateSnapshot({ status: state });
    }

    if (name === 'onResult') {
      // args[0] is transcript or event
      const data = args[0];
      const now = Date.now();
      if (typeof data === 'string') {
        this._updateSnapshot({
          transcript: {
            partial: (!args[1] ? data : ''),
            final: (args[1] ? data : this._snapshot.transcript.final),
            updatedAt: now
          }
        });
      } else if (data && typeof data === 'object') {
        // Protocol
        this._updateSnapshot({
          transcript: {
            partial: (!data.isFinal ? data.text : ''),
            final: (data.isFinal ? data.text : this._snapshot.transcript.final),
            updatedAt: now
          }
        });
      }
    }

    if (name === 'onEngineSelected') {
      const { mode } = args[0] || {};
      this._updateSnapshot({ engine: { ...this._snapshot.engine, mode } });
    }

    if (this._listeners) {
      this._notifyListeners({ type: name, payload: args });
    }

    // 3. Execute legacy callback
    if (this._callbacks && typeof this._callbacks[name] === 'function') {
      try {
        this._callbacks[name](...args);
      } catch (err) {
        console.error(`[JSVoice] Error in callback '${name}':`, err);
      }
    }
  }

  _updateStatus(message) {
    this._callCallback('onStatusChange', message);
  }

  // Getters
  get isListening() { return this._state._isListening; }
  get microphoneAllowed() { return this._state._microphoneAllowed; }
  get voiceFeedback() { return this._currentVoiceFeedback; }
}

export default JSVoice;

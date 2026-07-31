/**
 * =============================================================================
 * JSVoice core class — pure command/TTS/lifecycle logic (no default engine).
 * =============================================================================
 * Prefer:  import { createVoice } from 'jsvoice'   // injects Hybrid + local Whisper
 * Avoid:   new JSVoice() without `engine` or `engines` (will warn / not listen)
 *
 * isApiSupported = Native Web Speech only. Default local Whisper does NOT need it.
 *
 * Guides: docs/AI_IMPLEMENTATION.md · AGENTS.md · docs/API_REFERENCE.md
 * =============================================================================
 */
import { callCallback, cleanText } from './utils/helpers.js';
import { logger } from './utils/Logger.js';
import { initRecognition, checkMicrophonePermission } from './modules/RecognitionManager.js';
import { CommandManager } from './modules/CommandManager.js';
import { handleBuiltInActions } from './modules/BuiltInActions.js';

/**
 * JSVoice Core
 * A modular voice command library.
 * NOTE: This class is pure logic. It does NOT bundle engines by default.
 * Production apps should use createVoice() from src/index.js / 'jsvoice'.
 */
class JSVoice {
  /**
   * True if the browser exposes Native Web Speech (`SpeechRecognition`).
   * Does NOT mean local Whisper is unavailable — default createVoice() uses local STT.
   */
  static get isApiSupported() {
    // Only check if window exists (SSR Guard)
    if (typeof globalThis.window === 'undefined') return false;
    return !!(globalThis.window.SpeechRecognition || globalThis.window.webkitSpeechRecognition);
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
      // Capture instance for inner object
      const voiceInstance = this;
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
          get isListening() { return voiceInstance.isListening; },
          get microphoneAllowed() { return voiceInstance.microphoneAllowed; },
          get voiceFeedback() { return voiceInstance.voiceFeedback; },
          get isApiSupported() { return JSVoice.isApiSupported; },
          get options() { return { ...voiceInstance.options }; }
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
    this.speechSynthesis = (typeof globalThis.window !== 'undefined') ? globalThis.window.speechSynthesis : null;

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
      if (typeof globalThis.window !== 'undefined' && this.options.engines.length > 0) {
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

    // 1) User-registered commands
    let commandHandled = await this._commandManager.process(
      rawTranscript,
      this.speak.bind(this)
    );

    // 2) Built-in DOM actions (scroll, click, fill, etc.)
    if (!commandHandled) {
      try {
        commandHandled = !!handleBuiltInActions(
          rawTranscript,
          cleanedTranscript,
          this._updateStatus.bind(this),
          (name, ...args) => this._callCallback(name, ...args),
          this.speak.bind(this)
        );
      } catch (e) {
        this._callCallback('onError', e);
      }
    }

    if (commandHandled) {
      // Fire legacy global callback for kits / apps
      this._callCallback('onCommandRecognized', rawTranscript, rawTranscript);
    } else if (!this._state._wakeWordModeActive) {
      // Notify for both live listening and processText() testing paths
      if (this._state._isListening) {
        this._updateStatus('Listening for commands...');
      }
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

      // Tests / FakeSpeechEngine harness can skip getUserMedia
      if (!this.options.skipMicrophoneCheck) {
        await this._checkMicrophonePermission();
      } else {
        this._state._microphoneAllowed = true;
      }

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

  /**
   * Toggle listening. Returns the start() promise when starting, or false when stopping.
   * @returns {Promise<boolean>|boolean}
   */
  toggle() {
    if (this._state._isListening) {
      this.stop();
      return false;
    }
    return this.start();
  }

  speak(text, lang = this.options.lang) {
    if (typeof globalThis.window === 'undefined') return; // SSR Guard
    if (text == null || text === '') {
      this._callCallback('onError', new Error('Invalid speak text'));
      return;
    }

    if (!this.speechSynthesis || !globalThis.window.SpeechSynthesisUtterance) {
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
   * Registers a command with optional configuration.
   * @param {string} phrase
   * @param {Function} callback
   * @param {Object} options { priority, scope, cooldown, once }
   * @returns {string|null} command id
   */
  addCommand(phrase, callback, options = {}) {
    if (!phrase || typeof phrase !== 'string') {
      this._callCallback('onError', new Error('Invalid command phrase'));
      return null;
    }
    if (typeof callback !== 'function') {
      this._callCallback('onError', new Error('Invalid command callback'));
      return null;
    }
    return this._commandManager.register(phrase, callback, options);
  }

  removeCommand(phrase) {
    return this._commandManager.unregister(phrase);
  }

  addPatternCommand(pattern, callback) {
    // Backwards compatibility wrapper
    logger.warn('addPatternCommand is deprecated. Use addCommand(phrase, callback, { isPattern: true }) instead.');
    if (!pattern || typeof pattern !== 'string') {
      this._callCallback('onError', new Error('Invalid pattern'));
      return null;
    }
    if (typeof callback !== 'function') {
      this._callCallback('onError', new Error('Invalid pattern callback'));
      return null;
    }
    return this._commandManager.register(pattern, callback, { type: 'pattern', isPattern: true });
  }

  removePatternCommand(pattern) {
    return this._commandManager.unregister(pattern);
  }

  /**
   * Public read-only list of registered commands (no private manager access needed).
   * @returns {Array<{id:string,phrase:string,type:string,scope:string,priority:number}>}
   */
  listCommands() {
    const list = [];
    if (!this._commandManager?.commandRegistry) return list;
    this._commandManager.commandRegistry.forEach((cmd) => {
      list.push({
        id: cmd.id,
        phrase: cmd.originalPhrase || cmd.phrase,
        type: cmd.type || 'exact',
        scope: cmd.scope || 'global',
        priority: cmd.priority || 0,
        args: cmd.argConfigs || [],
      });
    });
    return list.sort(
      (a, b) => (b.priority || 0) - (a.priority || 0) || String(a.phrase).localeCompare(String(b.phrase))
    );
  }

  /**
   * Process a text transcript as if spoken (testing, palette run, typed input).
   * @param {string} text
   * @returns {Promise<boolean>} whether a command matched
   */
  async processText(text) {
    if (!text || typeof text !== 'string') {
      this._callCallback('onError', new Error('Invalid transcript text'));
      return false;
    }
    return this._handleSpeechResult(text);
  }

  /**
   * @returns {{ name: string, mode: string, listening: boolean, supported: boolean }}
   */
  getEngineInfo() {
    const eng = this.recognition;
    const name =
      eng?.name ||
      eng?.constructor?.name ||
      this._snapshot?.engine?.name ||
      'unknown';
    return {
      name,
      mode: this._snapshot?.engine?.mode || this.options.engineMode || 'unknown',
      listening: !!this._state._isListening,
      supported: JSVoice.isApiSupported,
    };
  }

  /**
   * @returns {string[]}
   */
  listScopes() {
    if (!this._commandManager?.scopes) return ['global'];
    return Array.from(this._commandManager.scopes);
  }

  get currentScope() {
    return this._commandManager?.currentScope || 'global';
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
    if (!key || typeof key !== 'string') {
      this._callCallback('onError', new Error('Invalid option key'));
      return;
    }
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

    // 3. Execute callback (prefer _callbacks, fall back to options for parity)
    const fn =
      (this._callbacks && this._callbacks[name]) ||
      (this.options && this.options[name]);
    if (typeof fn === 'function') {
      try {
        fn(...args);
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
  /** Instance mirror of static support check (for API parity / tests). */
  get isApiSupported() { return JSVoice.isApiSupported; }
  get isWakeWordModeActive() { return !!this._state._wakeWordModeActive; }
  get isAwaitingCommand() { return !!this._state._awaitingCommand; }
}

export default JSVoice;

/**
 * Hybrid speech engine — policy wrapper used by createVoice().
 *
 * LEAD (AI/integrators):
 *   modes: 'local' (default) | 'native' | 'auto' (local then native if local fails)
 *   Default understander = LocalTransformersSpeechEngine (Whisper tiny.en).
 *   Do not invent modes. See docs/AI_IMPLEMENTATION.md and docs/LOCAL_BROWSER_WHISPER.md.
 */
import BaseSpeechEngine from './BaseSpeechEngine.js';
import NativeSpeechEngine from './NativeSpeechEngine.js';
import { CircuitBreaker } from '../modules/CircuitBreaker.js';

/**
 * Hybrid speech engine.
 *
 * Default product policy: **local-first** (browser Whisper tiny) so recognition
 * works in any modern browser. Native Web Speech is opt-in via mode: 'native',
 * or used as fallback when mode is 'auto' and local cannot initialize.
 */
class HybridSpeechEngine extends BaseSpeechEngine {
  constructor(options = {}) {
    super(options);

    this.config = {
      // local = default understander; native = Web Speech; auto = local then native on init failure
      mode: options.mode || 'local',
      native: {},
      local: {},
      policy: {
        fallback: 'native', // when local fails in auto: try native
      },
      autoRestart: options.autoRestart,
      ...options,
    };

    this.engineMode = this.config.mode;
    this.activeEngine = null;
    this.nativeEngine = null;
    this.localEngine = null;
    this.currentMode = null;

    this.circuitBreaker = new CircuitBreaker({
      threshold: 3,
      windowMs: 60000,
      cooldownMs: 30000,
    });

    this.circuitBreaker.onStateChange = (newState) => {
      this._emitTelemetry({ type: 'circuit_breaker_state', state: newState });
    };
  }

  async init() {
    if (typeof globalThis.window === 'undefined') return;
    await this._resolveEngine();
  }

  async _resolveEngine() {
    let targetMode = this.engineMode;

    if (targetMode === 'auto') {
      // Local-first auto: prefer on-device Whisper; fall back to Native if local unsupported
      const localSupported = await this._isLocalSupported();
      if (localSupported) {
        targetMode = 'local';
      } else if (NativeSpeechEngine.isSupported) {
        targetMode = 'native';
      } else {
        targetMode = 'local'; // attempt local and surface error
      }
    }

    if (targetMode === 'local') {
      try {
        await this._setEngine('local');
        return;
      } catch (e) {
        // In auto (or if host allows), fall back to native when local fails to load
        if (
          (this.engineMode === 'auto' || this.config.policy?.fallback === 'native') &&
          NativeSpeechEngine.isSupported &&
          this.engineMode !== 'local'
        ) {
          this._emitTelemetry({
            type: 'fallback_activated',
            from: 'local',
            to: 'native',
            reason: e?.message || 'local_init_failed',
          });
          if (this.options.onFallbackActivated) {
            this.options.onFallbackActivated({
              from: 'local',
              to: 'native',
              reason: e?.message,
            });
          }
          await this._setEngine('native');
          return;
        }
        // Pure local mode: rethrow / surface
        throw e;
      }
    }

    await this._setEngine(targetMode);
  }

  async _isLocalSupported() {
    try {
      const module = await import('./LocalTransformersSpeechEngine.js');
      return !!module.default?.isSupported;
    } catch {
      return false;
    }
  }

  async _setEngine(mode) {
    if (this.currentMode === mode && this.activeEngine) {
      if (this.activeEngine.init) await this.activeEngine.init();
      return;
    }

    this.currentMode = mode;
    this._emitTelemetry({
      type: 'engine_state_change',
      engine: mode,
      state: 'selected',
    });

    if (this.options.onEngineSelected) {
      this.options.onEngineSelected({
        engineName: mode,
        mode: this.engineMode,
        reason: 'policy_decision',
      });
    }

    if (this.activeEngine) {
      try {
        if (this.activeEngine.abort) this.activeEngine.abort();
        else if (this.activeEngine.stop) await this.activeEngine.stop();
      } catch {
        /* ignore */
      }
      this.activeEngine = null;
    }

    if (mode === 'native') {
      if (!this.nativeEngine) {
        this.nativeEngine = new NativeSpeechEngine({
          ...this.config.native,
          continuous: this.config.continuous ?? this.config.native.continuous,
          interimResults:
            this.config.interimResults ?? this.config.native.interimResults,
          lang: this.config.lang ?? this.config.native.lang,
          autoRestart: this.config.autoRestart,
          restartDelay: this.config.restartDelay,
        });
      }
      this.activeEngine = this.nativeEngine;
    } else if (mode === 'local') {
      if (!this.localEngine) {
        const module = await import('./LocalTransformersSpeechEngine.js');
        const LocalEngine = module.default;
        this.localEngine = new LocalEngine({
          ...this.config.local,
          onTelemetry: (e) => this._emitTelemetry(e),
          onModelLoadProgress: (p) => {
            if (this.options.onModelLoadProgress) {
              this.options.onModelLoadProgress(p);
            }
            if (this.config.local?.onModelLoadProgress) {
              this.config.local.onModelLoadProgress(p);
            }
          },
          confirmModelDownload:
            this.config.local?.confirmModelDownload ??
            this.options.confirmModelDownload,
        });
      }
      this.activeEngine = this.localEngine;
    } else {
      throw new Error(`Unknown hybrid engine mode: ${mode}`);
    }

    this._wireEngineCallbacks(this.activeEngine);
    if (this.activeEngine.init) {
      await this.activeEngine.init();
    }
  }

  _wireEngineCallbacks(engine) {
    engine.setCallbacks({
      onStart: () => {
        if (this.currentMode === 'native') this.circuitBreaker.recordSuccess();
        this.onStart();
      },
      onEnd: () => this.onEnd(),
      onResult: (t, f) => this.onResult(t, f),
      onError: (e) => this._handleError(e),
      onStateChange: (s) => this.setState(s),
    });

    // Forward model progress if local engine exposes it later
    if (engine.onModelLoadProgress !== undefined && this.options.onModelLoadProgress) {
      engine.onModelLoadProgress = (p) => this.options.onModelLoadProgress(p);
    }
  }

  _handleError(error) {
    if (this.currentMode === 'native') {
      const type = error?.error || error?.name || 'unknown';
      if (type === 'not-allowed' || type === 'NotAllowedError') {
        this.onError(error);
        return;
      }
      this.circuitBreaker.recordError(type);
    }

    // Local missing peer: surface clearly
    const code = error?.code || error?.error;
    if (
      code === 'TRANSFORMERS_MISSING' &&
      this.engineMode === 'auto' &&
      NativeSpeechEngine.isSupported
    ) {
      this._emitTelemetry({
        type: 'fallback_activated',
        from: 'local',
        to: 'native',
        reason: 'transformers_missing',
      });
      this._setEngine('native')
        .then(() => {
          if (this.config.autoRestart) this.activeEngine?.start?.();
        })
        .catch((e) => this.onError(e));
      return;
    }

    this.onError(error);
  }

  async start() {
    if (!this.activeEngine) await this.init();
    if (!this.activeEngine) {
      throw new Error('No speech engine available');
    }
    return this.activeEngine.start();
  }

  async stop() {
    if (this.activeEngine) return this.activeEngine.stop();
  }

  abort() {
    if (this.activeEngine) return this.activeEngine.abort?.();
  }

  setOptions(options) {
    super.setOptions(options);
    if (options.mode) this.engineMode = options.mode;
    if (options.local) {
      this.config.local = { ...this.config.local, ...options.local };
    }
    if (options.native) {
      this.config.native = { ...this.config.native, ...options.native };
    }
    if (options.onModelLoadProgress) {
      this.options.onModelLoadProgress = options.onModelLoadProgress;
    }
    if (this.activeEngine?.setOptions) {
      this.activeEngine.setOptions(options);
    }
  }

  /** Switch engine at runtime */
  async setEngineMode(mode) {
    this.engineMode = mode;
    this.config.mode = mode;
    await this._setEngine(mode === 'auto' ? 'local' : mode);
    if (mode === 'auto') await this._resolveEngine();
  }

  getActiveMode() {
    return this.currentMode;
  }

  _emitTelemetry(event) {
    if (this.options.onTelemetry) {
      this.options.onTelemetry(event);
    }
  }
}

export default HybridSpeechEngine;

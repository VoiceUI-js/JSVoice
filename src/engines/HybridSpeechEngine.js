import BaseSpeechEngine from './BaseSpeechEngine.js';
import NativeSpeechEngine from './NativeSpeechEngine.js';
import { CircuitBreaker } from '../modules/CircuitBreaker.js';

class HybridSpeechEngine extends BaseSpeechEngine {
    constructor(options = {}) {
        super(options);

        this.config = {
            mode: 'auto', // native, local, auto
            native: {},
            local: {},
            policy: {
                fallback: 'prompt', // silent, prompt, manual
                // ...
            },
            ...options
        };

        this.engineMode = this.config.mode;
        this.activeEngine = null;
        this.nativeEngine = null;
        this.localEngine = null;

        // Circuit Breaker for Native Engine
        this.circuitBreaker = new CircuitBreaker({
            threshold: 3,
            windowMs: 60000,
            cooldownMs: 30000
        });

        this.circuitBreaker.onStateChange = (newState) => {
            this._emitTelemetry({ type: 'circuit_breaker_state', state: newState });
            if (newState === 'open' && this.engineMode === 'auto') {
                this._handleCircuitOpen();
            }
        };
    }

    async init() {
        if (typeof globalThis.window === 'undefined') return; // SSR Safety
        await this._resolveEngine();
    }

    async _resolveEngine() {
        let targetMode = this.engineMode;

        if (targetMode === 'auto') {
            const nativeSupported = NativeSpeechEngine.isSupported;
            const circuitHealthy = this.circuitBreaker.canAttempt();

            if (nativeSupported && circuitHealthy) {
                targetMode = 'native';
            } else {
                if (!nativeSupported) console.warn('[JSVoice] Native API unsupported.');
                else console.warn('[JSVoice] Native API unstable (Circuit Open).');

                targetMode = 'local';
            }
        }

        await this._setEngine(targetMode);
    }

    async _setEngine(mode) {
        if (this.currentMode === mode && this.activeEngine) return;

        if (this.currentMode === mode && this.activeEngine) return;

        this.currentMode = mode;

        // Emit Selection Event
        this._emitTelemetry({ type: 'engine_state_change', engine: mode, state: 'selected' });

        // Notify Listener if configured
        if (this.options.onEngineSelected) {
            this.options.onEngineSelected({ engineName: mode, mode: this.engineMode, reason: 'policy_decision' });
        }

        // Cleanup old engine
        if (this.activeEngine) {
            await this.activeEngine.stop();
            this.activeEngine = null;
        }

        // Initialize new engine
        if (mode === 'native') {
            if (!this.nativeEngine) {
                this.nativeEngine = new NativeSpeechEngine(this.config.native);
            }
            this.activeEngine = this.nativeEngine;
        } else if (mode === 'local') {
            if (!this.localEngine) {
                try {
                    const module = await import('./LocalTransformersSpeechEngine.js');
                    const LocalEngine = module.default;
                    this.localEngine = new LocalEngine(this.config.local);
                } catch (e) {
                    console.error('[JSVoice] Failed to load Local Engine:', e);
                    this.onError(new Error('Local fallback engine could not be loaded.'));
                    return;
                }
            }
            this.activeEngine = this.localEngine;
        }

        if (this.activeEngine) {
            this._wireEngineCallbacks(this.activeEngine);
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
            onResult: (t, f) => this.onResult(t, f), // Should forward TranscriptEvent ideally
            onError: (e) => this._handleError(e),
            onStateChange: (s) => this.setState(s)
        });


        // Forward strict model progress from local engine
        if (engine.onModelLoadProgress) {
            // If local engine already attached it
        }
    }

    _handleError(error) {
        if (this.currentMode === 'native') {
            // Record failure in circuit
            const type = error.error || error.name || 'unknown';
            // Permissions = Hard Stop (Do NOT record as network failure for circuit breaker logic, usually)
            if (type === 'not-allowed' || type === 'NotAllowedError') {
                this.onError(error); // Propagate immediately
                return;
            }

            this.circuitBreaker.recordError(type);
        }

        // If circuit is now open, it handles transition via callback. 
        // If not, we just propagate.
        // Wait, if error happened, we need to decide if we Fallback immediately for THIS session?
        // The circuit breaker transition callback handles future starts. 
        // For active session recovery:

        if (this.engineMode === 'auto' && this.currentMode === 'native') {
            // Fallback Logic
            // If error is critical (network), try to swap live?
        }

        this.onError(error);
    }

    _handleCircuitOpen() {
        console.log('[JSVoice] Circuit Open -> Switching to Local Fallback');
        this._setEngine('local').then(() => {
            if (this.config.autoRestart) {
                this.activeEngine.start();
            }
        });

        this._emitTelemetry({
            type: 'fallback_activated',
            from: 'native',
            to: 'local',
            reason: 'circuit_breaker_open'
        });
    }

    async start() {
        if (!this.activeEngine) await this.init();

        // Check circuit before native start (Half-Open logic)
        if (this.currentMode === 'native' && !this.circuitBreaker.canAttempt()) {
            // If we are native but breaker says no, we should have switched?
            // Re-resolve
            await this._resolveEngine();
        }

        return this.activeEngine.start();
    }

    async stop() {
        if (this.activeEngine) return this.activeEngine.stop();
    }

    abort() {
        if (this.activeEngine) return this.activeEngine.abort();
    }

    setOptions(options) {
        super.setOptions(options);
        if (this.activeEngine) {
            this.activeEngine.setOptions(options);
        }
    }

    _emitTelemetry(event) {
        // Find a way to reach Global JSVoice telemetry hook? 
        // Or options.onTelemetry
        if (this.options.onTelemetry) {
            this.options.onTelemetry(event);
        }
    }
}

export default HybridSpeechEngine;

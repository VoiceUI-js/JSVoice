/**
 * Abstract base class for speech recognition engines.
 * All engines (Native, Whisper, etc.) must extend this class.
 */
class BaseSpeechEngine {
    constructor(options = {}) {
        this.options = options;
        this.onStart = () => { };
        this.onEnd = () => { };
        this.onError = (error) => { };
        this.onResult = (transcript, isFinal) => { };
        this.isListening = false;
    }

    /**
     * Check if this engine is supported in the current environment.
     * By default returns true, subclasses should override if they have specific requirements.
     * @returns {boolean}
     */
    static get isSupported() {
        return true;
    }

    /**
     * Initialize the engine (load models, setup listeners, etc.)
     * @returns {Promise<void>}
     */
    async init() {
        throw new Error('init() must be implemented by subclass');
    }

    /**
     * Start speech recognition
     * @returns {Promise<void>}
     */
    async start() {
        throw new Error('start() must be implemented by subclass');
    }

    /**
     * Stop speech recognition
     * @returns {Promise<void>}
     */
    async stop() {
        throw new Error('stop() must be implemented by subclass');
    }

    /**
     * Set callback functions
     * @param {Object} callbacks
     */
    setCallbacks({ onStart, onEnd, onError, onResult }) {
        if (onStart) this.onStart = onStart;
        if (onEnd) this.onEnd = onEnd;
        if (onError) this.onError = onError;
        if (onResult) this.onResult = onResult;
    }

    /**
     * Update engine configuration
     * @param {Object} options
     */
    setOptions(options) {
        this.options = { ...this.options, ...options };
    }
}

export default BaseSpeechEngine;

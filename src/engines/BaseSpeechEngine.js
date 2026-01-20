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
        this.onStateChange = (state) => { }; // NEW: State change callback
        this.isListening = false;
        this.state = 'idle'; // NEW: Initial state
    }

    /**
     * Updates the engine state and notifies listeners.
     * @param {string} newState - One of 'idle', 'listening', 'recording', 'processing', 'speaking', 'error'
     */
    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.onStateChange(newState);
        }
    }

    // ... (rest of the class methods)

    /**
     * Set callback functions
     * @param {Object} callbacks
     */
    setCallbacks({ onStart, onEnd, onError, onResult, onStateChange }) {
        if (onStart) this.onStart = onStart;
        if (onEnd) this.onEnd = onEnd;
        if (onError) this.onError = onError;
        if (onResult) this.onResult = onResult;
        if (onStateChange) this.onStateChange = onStateChange;
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

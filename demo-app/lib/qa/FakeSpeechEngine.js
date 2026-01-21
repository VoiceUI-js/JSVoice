/**
 * FakeSpeechEngine
 * Deterministic transcript injector for testing without microphone.
 */
export class FakeSpeechEngine {
    constructor(options = {}) {
        this.options = options;
        this.handlers = {
            onResult: () => { },
            onError: () => { },
            onStart: () => { },
            onEnd: () => { }
        };
        this.isListening = false;
    }

    start() {
        this.isListening = true;
        this.handlers.onStart();
        return Promise.resolve();
    }

    stop() {
        this.isListening = false;
        this.handlers.onEnd();
    }

    // Compatibility with RecognitionManager
    setCallbacks(cbs) {
        this.handlers.onResult = cbs.onResult || (() => { });
        this.handlers.onError = cbs.onError || (() => { });
        this.handlers.onStart = cbs.onStart || (() => { });
        this.handlers.onEnd = cbs.onEnd || (() => { });
    }

    // Methods used by Voice Core (Legacy but kept for safety)
    subscribe(event, handler) {
        if (event === 'result') this.handlers.onResult = handler;
        if (event === 'error') this.handlers.onError = handler;
        if (event === 'start') this.handlers.onStart = handler;
        if (event === 'end') this.handlers.onEnd = handler;
    }

    // Test Harness Methods
    simulateTranscript(text, isFinal = true) {
        if (!this.isListening) return;
        this.handlers.onResult({
            transcript: text,
            isFinal: isFinal,
            confidence: 0.99
        });
    }

    simulateError(error) {
        this.handlers.onError(error);
    }
}

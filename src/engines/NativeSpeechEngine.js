import BaseSpeechEngine from './BaseSpeechEngine.js';

class NativeSpeechEngine extends BaseSpeechEngine {
    constructor(options) {
        super(options);
        this.recognition = null;
        this.SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    }

    static get isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }

    async init() {
        if (!this.SpeechRecognitionConstructor) {
            throw new Error('Native Speech API not supported in this browser.');
        }

        this.recognition = new this.SpeechRecognitionConstructor();
        this._applyOptions();
        this._setupListeners();
    }

    _applyOptions() {
        if (this.recognition) {
            this.recognition.continuous = this.options.continuous;
            this.recognition.interimResults = this.options.interimResults;
            this.recognition.lang = this.options.lang;
        }
    }

    setOptions(options) {
        super.setOptions(options);
        this._applyOptions();
    }

    _setupListeners() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.onStart();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.onEnd();
        };

        this.recognition.onerror = (event) => {
            // Map native errors to standard error format if needed, or pass through
            this.onError(event);
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Emit interim results
            if (interimTranscript.trim()) {
                this.onResult(interimTranscript, false);
            }

            // Emit final results
            if (finalTranscript.trim()) {
                this.onResult(finalTranscript, true);
            }
        };
    }

    async start() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (e) {
                // Handle "already started" or similar race conditions gracefully if possible
                if (e.name !== 'InvalidStateError') {
                    throw e;
                }
            }
        }
    }

    async stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    abort() {
        if (this.recognition) {
            this.recognition.abort();
        }
    }
}

export default NativeSpeechEngine;

/**
 * Deterministic speech engine for Jest (no real microphone / Web Speech).
 */
export class FakeSpeechEngine {
  constructor(options = {}) {
    this.options = {
      continuous: true,
      interimResults: true,
      lang: 'en-US',
      autoRestart: true,
      restartDelay: 50,
      wakeWord: null,
      ...options,
    };
    this.name = 'FakeSpeechEngine';
    this.isListening = false;
    this.handlers = {
      onStart: () => {},
      onEnd: () => {},
      onError: () => {},
      onResult: () => {},
      onStateChange: () => {},
    };

    this.start = jest.fn(async () => {
      this.isListening = true;
      this.handlers.onStateChange?.('listening');
      this.handlers.onStart?.();
    });

    this.stop = jest.fn(async () => {
      this.isListening = false;
      this.handlers.onStateChange?.('idle');
      this.handlers.onEnd?.();
    });

    this.abort = jest.fn(async () => {
      this.isListening = false;
      this.handlers.onEnd?.();
    });
  }

  static get isSupported() {
    return true;
  }

  async init() {
    return this;
  }

  setCallbacks(cbs = {}) {
    this.handlers = { ...this.handlers, ...cbs };
  }

  setOptions(options = {}) {
    this.options = { ...this.options, ...options };
  }

  /**
   * Simulate a recognition result.
   * @param {string} text
   * @param {boolean} [isFinal=true]
   */
  simulateTranscript(text, isFinal = true) {
    if (!this.isListening && isFinal) {
      // allow processing only when listening (matches real engine behavior in tests)
      return;
    }
    this.handlers.onResult?.(text, isFinal);
  }

  /**
   * Force-fire even when not listening (for edge-case tests).
   */
  forceTranscript(text, isFinal = true) {
    this.handlers.onResult?.(text, isFinal);
  }

  simulateError(error, message = '') {
    this.handlers.onError?.({ error, message });
  }
}

export default FakeSpeechEngine;

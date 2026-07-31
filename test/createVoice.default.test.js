/**
 * @jest-environment jsdom
 */

jest.mock('../src/engines/LocalTransformersSpeechEngine.js', () => {
  class MockLocal {
    static get isSupported() {
      return true;
    }
    constructor(opts = {}) {
      this.options = opts;
      this.isListening = false;
      this.state = 'idle';
      this._cbs = {};
    }
    setCallbacks(cbs) {
      this._cbs = { ...this._cbs, ...cbs };
    }
    setState(s) {
      this.state = s;
    }
    async init() {
      this.state = 'ready';
    }
    async start() {
      this.isListening = true;
      this._cbs.onStart?.();
    }
    async stop() {
      this.isListening = false;
      this._cbs.onEnd?.();
    }
    abort() {
      this.isListening = false;
    }
    setOptions() {}
  }
  return { __esModule: true, default: MockLocal };
});

import { createVoice } from '../src/index.js';
import HybridSpeechEngine from '../src/engines/HybridSpeechEngine.js';

describe('createVoice defaults', () => {
  test('uses HybridSpeechEngine with local mode by default', async () => {
    const voice = createVoice({
      skipMicrophoneCheck: true,
      autoRestart: false,
    });
    expect(voice.options.engine).toBeInstanceOf(HybridSpeechEngine);
    expect(voice.options.engine.engineMode).toBe('local');

    await voice.options.engine.init();
    expect(voice.options.engine.getActiveMode()).toBe('local');
  });

  test('engineMode native selects native path', async () => {
    const voice = createVoice({
      engineMode: 'native',
      skipMicrophoneCheck: true,
      autoRestart: false,
    });
    expect(voice.options.engine.engineMode).toBe('native');
    await voice.options.engine.init();
    expect(voice.options.engine.getActiveMode()).toBe('native');
  });
});

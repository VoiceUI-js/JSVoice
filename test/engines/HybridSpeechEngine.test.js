/**
 * @jest-environment jsdom
 */
import HybridSpeechEngine from '../../src/engines/HybridSpeechEngine.js';

jest.mock('../../src/engines/LocalTransformersSpeechEngine.js', () => {
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
      this._cbs = cbs;
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

jest.mock('../../src/engines/NativeSpeechEngine.js', () => {
  class MockNative {
    static get isSupported() {
      return true;
    }
    constructor() {
      this.isListening = false;
      this._cbs = {};
    }
    setCallbacks(cbs) {
      this._cbs = cbs;
    }
    async init() {}
    async start() {
      this.isListening = true;
      this._cbs.onStart?.();
    }
    async stop() {
      this.isListening = false;
      this._cbs.onEnd?.();
    }
    abort() {}
    setOptions() {}
  }
  return { __esModule: true, default: MockNative };
});

describe('HybridSpeechEngine', () => {
  test('default mode is local', async () => {
    const hybrid = new HybridSpeechEngine({ mode: 'local' });
    await hybrid.init();
    expect(hybrid.getActiveMode()).toBe('local');
  });

  test('native mode selects native', async () => {
    const hybrid = new HybridSpeechEngine({ mode: 'native' });
    await hybrid.init();
    expect(hybrid.getActiveMode()).toBe('native');
  });

  test('auto prefers local when supported', async () => {
    const hybrid = new HybridSpeechEngine({ mode: 'auto' });
    await hybrid.init();
    expect(hybrid.getActiveMode()).toBe('local');
  });

  test('start delegates to active engine', async () => {
    const hybrid = new HybridSpeechEngine({ mode: 'local' });
    const onStart = jest.fn();
    hybrid.setCallbacks({
      onStart,
      onEnd: jest.fn(),
      onResult: jest.fn(),
      onError: jest.fn(),
      onStateChange: jest.fn(),
    });
    await hybrid.init();
    await hybrid.start();
    expect(onStart).toHaveBeenCalled();
  });
});

/**
 * @jest-environment jsdom
 */
import LocalTransformersSpeechEngine from '../../src/engines/LocalTransformersSpeechEngine.js';
import { microphoneManager } from '../../src/modules/MicrophoneManager.js';

function createMockWorker(handlers = {}) {
  const workers = [];
  class MockWorker {
    constructor() {
      this.onmessage = null;
      this.onerror = null;
      this.posted = [];
      workers.push(this);
    }
    postMessage(msg) {
      this.posted.push(msg);
      if (msg.type === 'init') {
        queueMicrotask(() => {
          this.onmessage?.({ data: { type: 'status', status: 'ready' } });
        });
      }
      if (msg.type === 'process') {
        queueMicrotask(() => {
          this.onmessage?.({
            data: {
              type: 'result',
              transcript: handlers.transcript ?? 'hello world',
              isFinal: true,
              jobId: msg.jobId,
            },
          });
        });
      }
    }
    terminate() {}
  }
  return { MockWorker, workers };
}

describe('LocalTransformersSpeechEngine', () => {
  beforeEach(() => {
    microphoneManager.reset();
    // Minimal media mocks
    global.AudioContext = class {
      constructor() {
        this.sampleRate = 16000;
        this.destination = {};
        this.audioWorklet = null;
      }
      createMediaStreamSource() {
        return { connect() {}, disconnect() {} };
      }
      createGain() {
        return { gain: { value: 1 }, connect() {}, disconnect() {} };
      }
      createScriptProcessor() {
        return {
          onaudioprocess: null,
          connect() {},
          disconnect() {},
        };
      }
      close() {
        return Promise.resolve();
      }
    };
    global.webkitAudioContext = global.AudioContext;
    // jsdom may lack Worker / secure context
    if (typeof global.Worker === 'undefined') {
      global.Worker = class {
        postMessage() {}
        terminate() {}
      };
    }
    Object.defineProperty(global, 'isSecureContext', {
      value: true,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
      writable: true,
    });

    const track = { stop: jest.fn(), onended: null };
    const stream = {
      active: true,
      getTracks: () => [track],
    };
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockResolvedValue(stream),
    };
  });

  afterEach(() => {
    microphoneManager.reset();
  });

  test('default model is whisper-tiny.en', () => {
    expect(LocalTransformersSpeechEngine.defaultModel).toBe(
      'Xenova/whisper-tiny.en'
    );
    const { MockWorker } = createMockWorker();
    const engine = new LocalTransformersSpeechEngine({
      WorkerFactory: () => new MockWorker(),
    });
    expect(engine.options.model).toBe('Xenova/whisper-tiny.en');
  });

  test('init becomes ready via worker status', async () => {
    const { MockWorker, workers } = createMockWorker();
    const engine = new LocalTransformersSpeechEngine({
      WorkerFactory: () => new MockWorker(),
      requireUserConfirmOnSaveData: false,
    });

    const ready = engine.init();
    await ready;
    expect(engine.state).toBe('ready');
    expect(workers[0].posted.some((m) => m.type === 'init')).toBe(true);
  });

  test('start → stop posts process and emits result', async () => {
    const { MockWorker } = createMockWorker({ transcript: 'scroll down' });
    const engine = new LocalTransformersSpeechEngine({
      WorkerFactory: () => new MockWorker(),
      requireUserConfirmOnSaveData: false,
      vad: { enabled: false },
      maxRecordMs: 0,
    });

    const results = [];
    engine.setCallbacks({
      onStart: jest.fn(),
      onEnd: jest.fn(),
      onResult: (t, f) => results.push({ t, f }),
      onError: jest.fn(),
      onStateChange: jest.fn(),
    });

    await engine.init();
    await engine.start();
    expect(engine.isListening).toBe(true);

    // Inject a fake PCM frame
    engine._handlePcmFrame(new Float32Array(1600).fill(0.1));
    await engine.stop();

    // Allow worker microtasks
    await new Promise((r) => setTimeout(r, 10));

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].t).toBe('scroll down');
    expect(engine.setCallbacks).toBeDefined();
  });

  test('abort releases listening state', async () => {
    const { MockWorker } = createMockWorker();
    const engine = new LocalTransformersSpeechEngine({
      WorkerFactory: () => new MockWorker(),
      requireUserConfirmOnSaveData: false,
      vad: { enabled: false },
    });
    await engine.init();
    await engine.start();
    engine.abort();
    expect(engine.isListening).toBe(false);
    expect(engine.state).toBe('idle');
  });

  test('VAD stops after speech then silence', async () => {
    const { MockWorker } = createMockWorker();
    const engine = new LocalTransformersSpeechEngine({
      WorkerFactory: () => new MockWorker(),
      requireUserConfirmOnSaveData: false,
      vad: { enabled: true, silenceMs: 30, energyThreshold: 0.01, minSpeechMs: 10 },
      maxRecordMs: 0,
    });
    await engine.init();
    await engine.start();

    const stopSpy = jest.spyOn(engine, 'stop');

    // Loud frames = speech
    const loud = new Float32Array(512).fill(0.5);
    engine._handlePcmFrame(loud);

    // Simulate that speech started long enough ago and silence elapsed
    engine._speechDetected = true;
    engine._speechStartedAt = Date.now() - 200;
    engine._silenceStartedAt = Date.now() - 50;

    const quiet = new Float32Array(512).fill(0);
    engine._handlePcmFrame(quiet);

    expect(stopSpy).toHaveBeenCalled();
    engine.dispose();
  });
});

// test/JSVoice.integration.test.js
import { createTestVoice } from './helpers/createTestVoice.js';
import JSVoice from '../src/JSVoice.js';

describe('JSVoice Integration Tests', () => {
  let voice;
  let engine;
  let mockCallbacks;

  beforeEach(() => {
    mockCallbacks = {
      onSpeechStart: jest.fn(),
      onSpeechEnd: jest.fn(),
      onCommandRecognized: jest.fn(),
      onCommandNotRecognized: jest.fn(),
      onActionPerformed: jest.fn(),
      onMicrophonePermissionGranted: jest.fn(),
      onMicrophonePermissionDenied: jest.fn(),
      onError: jest.fn(),
      onStatusChange: jest.fn(),
    };
  });

  afterEach(() => {
    if (voice) {
      voice.stop();
    }
    jest.clearAllMocks();
  });

  test('should create JSVoice instance with default options', () => {
    ({ voice, engine } = createTestVoice());
    expect(voice).toBeDefined();
    expect(voice.isApiSupported).toBe(true);
    expect(JSVoice.isApiSupported).toBe(true);
    expect(voice.isListening).toBe(false);
    expect(voice.microphoneAllowed).toBe(true);
    expect(engine).toBeDefined();
  });

  test('should create JSVoice instance with custom options', () => {
    ({ voice } = createTestVoice({
      lang: 'es-ES',
      continuous: false,
      onStatusChange: jest.fn(),
    }));
    expect(voice.options.lang).toBe('es-ES');
    expect(voice.options.continuous).toBe(false);
  });

  test('should add and remove custom commands', () => {
    ({ voice } = createTestVoice());
    const testCallback = jest.fn();

    voice.addCommand('test command', testCallback);
    expect(voice.listCommands().some((c) => c.phrase === 'test command' || c.phrase.includes('test'))).toBe(true);
    expect(voice.removeCommand('test command')).toBe(true);
    expect(voice.removeCommand('nonexistent command')).toBe(false);
  });

  test('should add and remove pattern commands', () => {
    ({ voice } = createTestVoice());
    const testCallback = jest.fn();

    voice.addPatternCommand('change {property} to {value}', testCallback);
    expect(voice.removePatternCommand('change {property} to {value}')).toBe(true);
    expect(voice.removePatternCommand('nonexistent pattern')).toBe(false);
  });

  test('should update options using setOption', () => {
    ({ voice } = createTestVoice());

    voice.setOption('lang', 'fr-FR');
    expect(voice.options.lang).toBe('fr-FR');

    voice.setOption('continuous', false);
    expect(voice.options.continuous).toBe(false);
  });

  test('should handle invalid setOption calls', () => {
    ({ voice } = createTestVoice(mockCallbacks));

    voice.setOption('', 'value');
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));

    voice.setOption(null, 'value');
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should handle invalid addCommand calls', () => {
    ({ voice } = createTestVoice(mockCallbacks));

    voice.addCommand('', jest.fn());
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));

    voice.addCommand('test', 'not a function');
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should handle invalid addPatternCommand calls', () => {
    ({ voice } = createTestVoice(mockCallbacks));

    voice.addPatternCommand('', jest.fn());
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));

    voice.addPatternCommand('test {param}', 'not a function');
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should handle invalid speak calls', () => {
    ({ voice } = createTestVoice(mockCallbacks));

    voice.speak('');
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));

    voice.speak(null);
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should provide correct getter values', () => {
    ({ voice } = createTestVoice());

    expect(typeof voice.isListening).toBe('boolean');
    expect(typeof voice.microphoneAllowed).toBe('boolean');
    expect(typeof voice.isApiSupported).toBe('boolean');
    expect(typeof voice.voiceFeedback).toBe('string');
    expect(typeof voice.isWakeWordModeActive).toBe('boolean');
    expect(typeof voice.isAwaitingCommand).toBe('boolean');
  });

  test('should handle wake word mode', () => {
    ({ voice } = createTestVoice({
      wakeWord: 'hey assistant',
      onStatusChange: jest.fn(),
    }));

    expect(voice.isWakeWordModeActive).toBe(true);
    expect(voice.options.continuous).toBe(true);
  });

  test('processText runs registered commands', async () => {
    const cb = jest.fn();
    ({ voice } = createTestVoice({
      onCommandRecognized: mockCallbacks.onCommandRecognized,
    }));
    voice.addCommand('hello world', cb);
    const matched = await voice.processText('hello world');
    expect(matched).toBe(true);
    expect(cb).toHaveBeenCalled();
  });

  test('getEngineInfo returns shape', () => {
    ({ voice } = createTestVoice());
    const info = voice.getEngineInfo();
    expect(info).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        listening: false,
        supported: expect.any(Boolean),
      })
    );
  });
});

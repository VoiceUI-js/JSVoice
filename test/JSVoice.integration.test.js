// test/JSVoice.integration.test.js

import JSVoice from '../src/JSVoice.js';

describe('JSVoice Integration Tests', () => {
  let voice;
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
    voice = new JSVoice();
    expect(voice).toBeDefined();
    expect(voice.isApiSupported).toBe(true);
    expect(voice.isListening).toBe(false);
    expect(voice.microphoneAllowed).toBe(false);
  });

  test('should create JSVoice instance with custom options', () => {
    const customOptions = {
      lang: 'es-ES',
      continuous: false,
      onStatusChange: jest.fn(),
    };

    voice = new JSVoice(customOptions);
    expect(voice.options.lang).toBe('es-ES');
    expect(voice.options.continuous).toBe(false);
  });

  test('should add and remove custom commands', () => {
    voice = new JSVoice();
    const testCallback = jest.fn();

    // Add command
    voice.addCommand('test command', testCallback);
    expect(voice.removeCommand('test command')).toBe(true);
    expect(voice.removeCommand('nonexistent command')).toBe(false);
  });

  test('should add and remove pattern commands', () => {
    voice = new JSVoice();
    const testCallback = jest.fn();

    // Add pattern command
    voice.addPatternCommand('change {property} to {value}', testCallback);
    expect(voice.removePatternCommand('change {property} to {value}')).toBe(true);
    expect(voice.removePatternCommand('nonexistent pattern')).toBe(false);
  });

  test('should update options using setOption', () => {
    voice = new JSVoice();

    voice.setOption('lang', 'fr-FR');
    expect(voice.options.lang).toBe('fr-FR');

    voice.setOption('continuous', false);
    expect(voice.options.continuous).toBe(false);
  });

  test('should handle invalid setOption calls', () => {
    voice = new JSVoice(mockCallbacks);

    // Invalid key
    voice.setOption('', 'value');
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));

    // Invalid key type
    voice.setOption(null, 'value');
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should handle invalid addCommand calls', () => {
    voice = new JSVoice(mockCallbacks);

    // Invalid phrase
    voice.addCommand('', jest.fn());
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));

    // Invalid callback
    voice.addCommand('test', 'not a function');
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should handle invalid addPatternCommand calls', () => {
    voice = new JSVoice(mockCallbacks);

    // Invalid pattern
    voice.addPatternCommand('', jest.fn());
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));

    // Invalid callback
    voice.addPatternCommand('test {param}', 'not a function');
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should handle invalid speak calls', () => {
    voice = new JSVoice(mockCallbacks);

    // Invalid text
    voice.speak('');
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));

    voice.speak(null);
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should provide correct getter values', () => {
    voice = new JSVoice();

    expect(typeof voice.isListening).toBe('boolean');
    expect(typeof voice.microphoneAllowed).toBe('boolean');
    expect(typeof voice.isApiSupported).toBe('boolean');
    expect(typeof voice.voiceFeedback).toBe('string');
    expect(typeof voice.isWakeWordModeActive).toBe('boolean');
    expect(typeof voice.isAwaitingCommand).toBe('boolean');
  });

  test('should handle wake word mode', () => {
    voice = new JSVoice({
      wakeWord: 'hey assistant',
      onStatusChange: jest.fn(),
    });

    expect(voice.isWakeWordModeActive).toBe(true);
    expect(voice.options.continuous).toBe(true); // Should be forced to true
  });
});

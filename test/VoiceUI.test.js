// test/VoiceUI.test.js — uses FakeSpeechEngine (no real Web Speech)

import { createTestVoice, FakeSpeechEngine } from './helpers/createTestVoice.js';
import JSVoice from '../src/JSVoice.js';

const mockSpeechSynthesis = window.speechSynthesis;
const mockMediaDevices = navigator.mediaDevices;

describe('JSVoice Library Core Functionality', () => {
  let voiceUi;
  let engine;
  let mockCallbacks;

  beforeEach(async () => {
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

    ({ voice: voiceUi, engine } = createTestVoice(mockCallbacks));
    await voiceUi._initialMicrophoneCheckPromise;
  });

  afterEach(() => {
    if (voiceUi && voiceUi.isListening) {
      voiceUi.stop();
    }
    if (voiceUi && voiceUi.stopAmplitude) {
      voiceUi.stopAmplitude();
    }
    jest.clearAllTimers();
    // Do not restoreAllMocks — that would wipe FakeSpeechEngine jest.fn methods
  });

  test('should be instantiated and check API support', () => {
    expect(JSVoice.isApiSupported).toBe(true);
    expect(voiceUi.isListening).toBe(false);
    expect(engine).toBeDefined();
    expect(voiceUi.recognition).toBeDefined();
  });

  test('should allow start after mic granted (test harness)', async () => {
    expect(voiceUi.microphoneAllowed).toBe(true);
    await voiceUi.start();
    expect(engine.start).toHaveBeenCalled();
    expect(mockCallbacks.onSpeechStart).toHaveBeenCalled();
    expect(voiceUi.isListening).toBe(true);
  });

  test('should handle microphone permission denial on start', async () => {
    mockMediaDevices.getUserMedia.mockImplementationOnce(() =>
      Promise.reject({ name: 'NotAllowedError', message: 'User denied.' })
    );

    const deniedCallbacks = {
      onMicrophonePermissionDenied: jest.fn(),
      onError: jest.fn(),
      onStatusChange: jest.fn(),
    };
    const { voice: deniedVoiceUi } = createTestVoice({
      ...deniedCallbacks,
      skipMicGrant: true,
    });

    await expect(deniedVoiceUi.start()).rejects.toThrow();
    expect(deniedCallbacks.onMicrophonePermissionDenied).toHaveBeenCalled();
    expect(deniedVoiceUi.microphoneAllowed).toBe(false);
  });

  test('should start speech recognition', async () => {
    engine.start.mockClear();
    await voiceUi.start();
    expect(engine.start).toHaveBeenCalledTimes(1);
    expect(mockCallbacks.onSpeechStart).toHaveBeenCalledTimes(1);
    expect(voiceUi.isListening).toBe(true);
  });

  test('should stop speech recognition', async () => {
    await voiceUi.start();
    engine.start.mockClear();

    voiceUi.stop();
    expect(engine.stop).toHaveBeenCalledTimes(1);
    expect(mockCallbacks.onSpeechEnd).toHaveBeenCalledTimes(1);
    expect(voiceUi.isListening).toBe(false);
  });

  test('should toggle speech recognition', async () => {
    engine.start.mockClear();
    engine.stop.mockClear();

    await voiceUi.toggle(); // returns start() promise
    expect(engine.start).toHaveBeenCalledTimes(1);
    expect(voiceUi.isListening).toBe(true);

    voiceUi.toggle(); // stops
    expect(engine.stop).toHaveBeenCalledTimes(1);
    expect(voiceUi.isListening).toBe(false);
  });

  test('should process a custom registered command', async () => {
    const customAction = jest.fn();
    voiceUi.addCommand('Hello World!', customAction);
    await voiceUi.start();

    engine.simulateTranscript('Hello World!');
    await new Promise((r) => setTimeout(r, 0));

    expect(customAction).toHaveBeenCalledTimes(1);
    expect(mockCallbacks.onCommandRecognized).toHaveBeenCalled();
  });

  test('should handle fill input command', async () => {
    document.body.innerHTML = '<input id="test-input" name="test input" value="" />';
    await voiceUi.start();

    engine.simulateTranscript('fill test input with hello');
    await Promise.resolve();
    await Promise.resolve();

    expect(document.getElementById('test-input').value).toBe('hello');
    expect(mockCallbacks.onActionPerformed).toHaveBeenCalledTimes(1);
  });

  test('should handle click button command', async () => {
    document.body.innerHTML =
      '<button id="test-button" name="test button" onclick="global.mockButtonClick()">Test Button</button>';
    global.mockButtonClick = jest.fn();

    await voiceUi.start();

    engine.simulateTranscript('click test button');
    await Promise.resolve();
    await Promise.resolve();

    expect(global.mockButtonClick).toHaveBeenCalledTimes(1);
    expect(mockCallbacks.onActionPerformed).toHaveBeenCalledTimes(1);
  });

  test('should handle unknown commands', async () => {
    await voiceUi.start();

    engine.simulateTranscript('some unknown command');
    await Promise.resolve();
    await Promise.resolve();

    expect(mockCallbacks.onCommandNotRecognized).toHaveBeenCalledTimes(1);
    expect(mockCallbacks.onCommandRecognized).not.toHaveBeenCalled();
  });

  test('should speak text using SpeechSynthesis', async () => {
    const textToSpeak = 'Hello, this is a test.';
    voiceUi.speak(textToSpeak);

    expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
    const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
    expect(utterance.text).toBe(textToSpeak);
  });

  test('should restart recognition on unexpected end if autoRestart is true', async () => {
    voiceUi.setOption('autoRestart', true);
    voiceUi.setOption('restartDelay', 50);

    await voiceUi.start();
    engine.start.mockClear();

    // Simulate unexpected end
    engine.handlers.onEnd?.();

    await new Promise((resolve) => setTimeout(resolve, voiceUi.options.restartDelay + 50));

    expect(engine.start).toHaveBeenCalled();
  });

  test('should not restart recognition if autoRestart is false', async () => {
    voiceUi.setOption('autoRestart', false);
    voiceUi.setOption('restartDelay', 50);

    await voiceUi.start();
    engine.start.mockClear();

    engine.handlers.onEnd?.();

    await new Promise((resolve) => setTimeout(resolve, voiceUi.options.restartDelay + 50));

    expect(engine.start).not.toHaveBeenCalled();
  });

  test('should handle recognition error (network type)', async () => {
    await voiceUi.start();
    engine.start.mockClear();

    engine.simulateError('network', 'A simulated network error occurred.');

    await new Promise((resolve) => setTimeout(resolve, voiceUi.options.restartDelay + 50));

    expect(mockCallbacks.onError).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'network' })
    );
    expect(engine.start).toHaveBeenCalled();
  });

  test('should handle recognition error (not-allowed type)', async () => {
    await voiceUi.start();
    engine.start.mockClear();

    engine.simulateError('not-allowed', 'User denied microphone.');

    await new Promise((resolve) => setTimeout(resolve, voiceUi.options.restartDelay + 50));

    expect(mockCallbacks.onError).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'not-allowed' })
    );
    expect(engine.start).not.toHaveBeenCalled();
  });

  test('should update options using setOption', () => {
    voiceUi.setOption('lang', 'es-ES');
    expect(voiceUi.options.lang).toBe('es-ES');
  });

  test('should remove a custom command', async () => {
    const action = jest.fn();
    voiceUi.addCommand('delete this command', action);
    expect(voiceUi.removeCommand('delete this command')).toBe(true);

    await voiceUi.start();
    engine.simulateTranscript('delete this command');
    await Promise.resolve();
    await Promise.resolve();

    expect(action).not.toHaveBeenCalled();
  });

  test('should prevent start if microphone not allowed', async () => {
    mockMediaDevices.getUserMedia.mockImplementationOnce(() =>
      Promise.reject({ name: 'NotAllowedError', message: 'User denied.' })
    );

    const deniedCallbacks = {
      onMicrophonePermissionDenied: jest.fn(),
      onError: jest.fn(),
      onStatusChange: jest.fn(),
    };
    const { voice: deniedVoiceUi, engine: deniedEngine } = createTestVoice({
      ...deniedCallbacks,
      skipMicGrant: true,
    });

    deniedEngine.start.mockClear();
    await expect(deniedVoiceUi.start()).rejects.toThrow();
    expect(deniedEngine.start).not.toHaveBeenCalled();
    expect(deniedVoiceUi.isListening).toBe(false);
  });

  test('should process fill input with quotes', async () => {
    document.body.innerHTML = '<input id="item-name" name="item name" value="" />';
    await voiceUi.start();

    engine.simulateTranscript('fill item name with "apple sauce"');
    await Promise.resolve();
    await Promise.resolve();

    expect(document.getElementById('item-name').value).toBe('apple sauce');
  });

  test('should process fill input when value is also a field name', async () => {
    document.body.innerHTML = '<input id="name" name="name" value="" />';
    await voiceUi.start();

    engine.simulateTranscript('fill name with name');
    await Promise.resolve();
    await Promise.resolve();

    expect(document.getElementById('name').value).toBe('name');
  });

  test('should not process command if recognition is not started', async () => {
    const customAction = jest.fn();
    voiceUi.addCommand('do something', customAction);
    voiceUi.stop();

    engine.simulateTranscript('do something');
    await Promise.resolve();

    expect(customAction).not.toHaveBeenCalled();
  });

  test('should handle initial commands provided in options', async () => {
    const optionCommandAction = jest.fn();
    const onCommandRecognized = jest.fn();
    const { voice: optionVoiceUi, engine: optionEngine } = createTestVoice({
      commands: {
        'option command': optionCommandAction,
      },
      onCommandRecognized,
      onStatusChange: jest.fn(),
    });

    await optionVoiceUi.start();
    optionEngine.simulateTranscript('option command');
    await new Promise((r) => setTimeout(r, 0));

    expect(optionCommandAction).toHaveBeenCalledTimes(1);
    expect(onCommandRecognized).toHaveBeenCalled();
  });

  test('processText works without listening', async () => {
    const action = jest.fn();
    voiceUi.addCommand('typed command', action);
    await voiceUi.processText('typed command');
    expect(action).toHaveBeenCalled();
  });
});

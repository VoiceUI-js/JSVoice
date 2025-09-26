// test/VoiceUI.test.js

import VoiceUI from '../src/VoiceUI';

// Access the mocked SpeechRecognition constructor and other globals
const MockSpeechRecognition = window.SpeechRecognition;
const mockSpeechSynthesis = window.speechSynthesis;
const mockMediaDevices = navigator.mediaDevices;


describe('JSVoice Library (VoiceUI Class) Core Functionality', () => {
  let voiceUi;
  let mockCallbacks;
  // This will hold the specific instance of MockSpeechRecognition for the current test
  let recognitionInstance; 

  beforeEach(async () => {
    // The beforeEach in setupTests.js already handles clearing all mocks.

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

    // 1. Instantiate VoiceUI. This synchronously calls the mocked SpeechRecognition constructor once.
    voiceUi = new VoiceUI(mockCallbacks);
    
    // 2. CRITICAL FIX: Get the instance directly from the mock's internal array.
    // Since mockSpeechRecognitionInstances is cleared in setupTests.js, this is guaranteed to be the first instance created.
    recognitionInstance = MockSpeechRecognition.mock.instances[0];

    // 3. Await the internal promise to ensure microphone checks finish
    await voiceUi._initialMicrophoneCheckPromise; 
  });

  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  test('should be instantiated and check API support', () => {
    expect(VoiceUI.isApiSupported).toBe(true);
    expect(MockSpeechRecognition).toHaveBeenCalledTimes(1);
    expect(voiceUi.isListening).toBe(false);
  });

  test('should request microphone permission on instantiation', () => {
    expect(mockMediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(voiceUi.microphoneAllowed).toBe(true);
    expect(mockCallbacks.onMicrophonePermissionGranted).toHaveBeenCalledTimes(1);
    expect(voiceUi.voiceFeedback).toBe("Voice commands ready. Click mic to start.");
  });

  test('should handle microphone permission denial', async () => {
    jest.clearAllMocks();
    MockSpeechRecognition.mockClear(); 

    mockMediaDevices.getUserMedia.mockImplementationOnce(() => 
      Promise.reject({ name: "NotAllowedError", message: "User denied." })
    );

    const deniedCallbacks = {
      onMicrophonePermissionDenied: jest.fn(),
      onError: jest.fn(),
    };
    const deniedVoiceUi = new VoiceUI(deniedCallbacks);
    
    await deniedVoiceUi._initialMicrophoneCheckPromise.catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 10)); 

    expect(deniedCallbacks.onMicrophonePermissionDenied).toHaveBeenCalledTimes(1);
    expect(deniedCallbacks.onError).toHaveBeenCalledTimes(0);
    expect(deniedVoiceUi.microphoneAllowed).toBe(false);
  });

  test('should start speech recognition', () => {
    // recognitionInstance is now guaranteed to be defined
    recognitionInstance.start.mockClear(); 
    voiceUi.start();
    expect(recognitionInstance.start).toHaveBeenCalledTimes(1);
    expect(mockCallbacks.onSpeechStart).toHaveBeenCalledTimes(1);
    expect(voiceUi.isListening).toBe(true);
  });

  test('should stop speech recognition', () => {
    voiceUi.start(); 
    recognitionInstance.start.mockClear(); 

    voiceUi.stop();
    expect(recognitionInstance.stop).toHaveBeenCalledTimes(1);
    expect(mockCallbacks.onSpeechEnd).toHaveBeenCalledTimes(1);
    expect(voiceUi.isListening).toBe(false);
  });

  test('should toggle speech recognition', () => {
    recognitionInstance.start.mockClear(); 
    recognitionInstance.stop.mockClear();

    voiceUi.toggle(); // Should start
    expect(recognitionInstance.start).toHaveBeenCalledTimes(1);
    expect(voiceUi.isListening).toBe(true);

    voiceUi.toggle(); // Should stop
    expect(recognitionInstance.stop).toHaveBeenCalledTimes(1);
    expect(voiceUi.isListening).toBe(false);
  });

  test('should process a custom registered command', async () => {
    const customAction = jest.fn();
    voiceUi.addCommand('Hello World!', customAction);
    voiceUi.start(); 

    // recognitionInstance is now correctly defined and has _fireResult
    recognitionInstance._fireResult('Hello World!'); 
    await Promise.resolve();

    expect(customAction).toHaveBeenCalledTimes(1);
    expect(mockCallbacks.onCommandRecognized).toHaveBeenCalledTimes(1);
  });
  
  test('should handle "fill input" command', async () => {
    document.body.innerHTML = '<input id="test-input" name="test input" value="" />';
    voiceUi.start(); 

    recognitionInstance._fireResult('fill test input with hello'); 
    await Promise.resolve();

    expect(document.getElementById('test-input').value).toBe('hello');
    expect(mockCallbacks.onActionPerformed).toHaveBeenCalledTimes(1);
  });
  
  test('should handle "click button" command', async () => {
    document.body.innerHTML = '<button id="test-button" name="test button" onclick="global.mockButtonClick()">Test Button</button>';
    global.mockButtonClick = jest.fn(); 
    
    voiceUi.start(); 

    recognitionInstance._fireResult('click test button');
    await Promise.resolve();

    expect(global.mockButtonClick).toHaveBeenCalledTimes(1);
    expect(mockCallbacks.onActionPerformed).toHaveBeenCalledTimes(1);
  });

  test('should handle unknown commands', async () => {
    voiceUi.start(); 

    recognitionInstance._fireResult('some unknown command');
    await Promise.resolve();

    expect(mockCallbacks.onCommandNotRecognized).toHaveBeenCalledTimes(1);
    expect(mockCallbacks.onCommandRecognized).not.toHaveBeenCalled();
  });
  
  test('should speak text using SpeechSynthesis', async () => {
    const textToSpeak = "Hello, this is a test.";
    voiceUi.speak(textToSpeak);

    expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
    const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
    
    // This assertion should now pass due to the corrected mock and reliable object access.
    expect(utterance.text).toBe(textToSpeak); 
    expect(utterance).toBeInstanceOf(window.SpeechSynthesisUtterance);
  });

  test('should restart recognition on unexpected end if autoRestart is true', async () => {
    voiceUi.setOption('autoRestart', true);
    voiceUi.setOption('restartDelay', 50); 

    voiceUi.start();
    recognitionInstance.start.mockClear(); 

    if (recognitionInstance.onend) recognitionInstance.onend(); 
    
    // Wait for the restart delay to pass
    await new Promise(resolve => setTimeout(resolve, voiceUi.options.restartDelay + 50)); 

    expect(recognitionInstance.start).toHaveBeenCalledTimes(1); 
  });

  test('should not restart recognition if autoRestart is false', async () => {
    voiceUi.setOption('autoRestart', false);
    voiceUi.setOption('restartDelay', 50); 

    voiceUi.start();
    recognitionInstance.start.mockClear(); 

    if (recognitionInstance.onend) recognitionInstance.onend(); 
    
    // Wait for the restart delay to pass
    await new Promise(resolve => setTimeout(resolve, voiceUi.options.restartDelay + 50));

    expect(recognitionInstance.start).not.toHaveBeenCalled(); 
  });

  test('should handle recognition error (network type)', async () => {
    voiceUi.start();
    recognitionInstance.start.mockClear(); 

    recognitionInstance._fireError('network', 'A simulated network error occurred.');
    
    // Wait for the restart delay to pass
    await new Promise(resolve => setTimeout(resolve, voiceUi.options.restartDelay + 50)); 
    
    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.objectContaining({ error: 'network' }));
    expect(recognitionInstance.start).toHaveBeenCalledTimes(1); // Auto-restart is expected for network errors
  });
  
  test('should handle recognition error (not-allowed type)', async () => {
    voiceUi.start();
    recognitionInstance.start.mockClear();

    const errorEvent = { error: 'not-allowed', message: 'User denied microphone.' };
    recognitionInstance._fireError(errorEvent.error, errorEvent.message); 

    // Wait for the restart delay to pass (should not restart)
    await new Promise(resolve => setTimeout(resolve, voiceUi.options.restartDelay + 50)); 

    expect(mockCallbacks.onError).toHaveBeenCalledWith(expect.objectContaining({ error: 'not-allowed' }));
    expect(recognitionInstance.start).not.toHaveBeenCalled(); // No restart for not-allowed errors
  });
  
  test('should update options using setOption', () => {
    voiceUi.setOption('lang', 'es-ES');
    expect(voiceUi.options.lang).toBe('es-ES');
  });

  test('should remove a custom command', async () => {
    const action = jest.fn();
    voiceUi.addCommand('delete this command', action);
    expect(voiceUi.removeCommand('delete this command')).toBe(true);
    
    voiceUi.start();
    recognitionInstance._fireResult('delete this command');
    await Promise.resolve();

    expect(action).not.toHaveBeenCalled();
  });
  
  test('should prevent start if microphone not allowed initially', async () => {
    // Reset mocks for THIS test only
    jest.clearAllMocks();
    MockSpeechRecognition.mockClear();
    
    mockMediaDevices.getUserMedia.mockImplementationOnce(() => 
      Promise.reject({ name: "NotAllowedError", message: "User denied." })
    );

    const deniedCallbacks = { 
      onMicrophonePermissionDenied: jest.fn(), 
      onError: jest.fn(),
      onStatusChange: jest.fn() 
    };
    const deniedVoiceUi = new VoiceUI(deniedCallbacks); 
    
    await deniedVoiceUi._initialMicrophoneCheckPromise.catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(deniedCallbacks.onError).toHaveBeenCalledTimes(0); 
    expect(deniedVoiceUi.microphoneAllowed).toBe(false);
    
    // Get the new instance created by deniedVoiceUi
    const deniedInstance = MockSpeechRecognition.mock.instances[0];
    deniedInstance.start.mockClear(); 

    // Attempt to start recognition, which should fail early
    deniedVoiceUi.start();
    
    expect(deniedInstance.start).not.toHaveBeenCalled(); 
    expect(deniedVoiceUi.isListening).toBe(false);
  });
  
  test('should process fill input with quotes', async () => {
    document.body.innerHTML = '<input id="item-name" name="item name" value="" />';
    voiceUi.start();
    
    recognitionInstance._fireResult('fill item name with "apple sauce"');
    await Promise.resolve();

    expect(document.getElementById('item-name').value).toBe('apple sauce');
  });
  
  test('should process fill input when value is also a field name', async () => {
    document.body.innerHTML = '<input id="name" name="name" value="" />';
    voiceUi.start();

    recognitionInstance._fireResult('fill name with name');
    await Promise.resolve();

    expect(document.getElementById('name').value).toBe('name');
  });

  test('should not process command if recognition is not started (isListening false)', async () => {
    const customAction = jest.fn();
    voiceUi.addCommand('do something', customAction);
    voiceUi.stop(); // Ensure it is stopped

    // Simulate result event directly on the recognition instance.
    recognitionInstance._fireResult('do something');
    await Promise.resolve();

    expect(customAction).not.toHaveBeenCalled();
  });

  test('should handle initial commands provided in options', async () => {
    // We clear all mocks here to ensure only the instance from optionVoiceUi is tracked.
    jest.clearAllMocks();
    MockSpeechRecognition.mockClear();

    const optionCommandAction = jest.fn();
    const initialOptions = {
      commands: {
        'option command': optionCommandAction 
      },
      onCommandRecognized: jest.fn(),
      onStatusChange: jest.fn()
    };

    const optionVoiceUi = new VoiceUI(initialOptions);
    await optionVoiceUi._initialMicrophoneCheckPromise;
    await new Promise(resolve => setTimeout(resolve, 10));

    optionVoiceUi.start();
    
    // Get the instance created for this specific VoiceUI instance
    const optionRecognitionInstance = MockSpeechRecognition.mock.instances[0];
    optionRecognitionInstance.start.mockClear(); 

    optionRecognitionInstance._fireResult('option command');
    await Promise.resolve();

    expect(optionCommandAction).toHaveBeenCalledTimes(1);
    expect(initialOptions.onCommandRecognized).toHaveBeenCalledTimes(1);
  });
});
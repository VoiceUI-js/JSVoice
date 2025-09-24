// test/VoiceUI.test.js
import VoiceUI from '../src/VoiceUI';

// Access the mocked SpeechRecognition constructor and other globals
const MockSpeechRecognition = window.SpeechRecognition; // This is now your MockSpeechRecognition class
const mockSpeechSynthesis = window.speechSynthesis;
const mockMediaDevices = navigator.mediaDevices;

describe('VoiceUI Library Core Functionality', () => {
  let voiceUi;
  let mockCallbacks;
  let recognitionInstance; // Holds the specific instance of MockSpeechRecognition for the current test

  beforeEach(() => {
    // Clear all Jest mocks (defined in setupTests.js)
    jest.clearAllMocks(); // This calls the beforeEach in setupTests.js

    // Instantiate VoiceUI. This will internally call 'new MockSpeechRecognition()'.
    // The MockSpeechRecognition constructor itself is now responsible for making
    // its 'start' and 'stop' methods Jest mocks.
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

    voiceUi = new VoiceUI(mockCallbacks);

    // Get the specific instance of MockSpeechRecognition that VoiceUI created.
    // It will be the first (and usually only) instance Jest tracked.
    expect(MockSpeechRecognition).toHaveBeenCalledTimes(1); // Ensure it was called
    recognitionInstance = MockSpeechRecognition.mock.instances[0];

    // Manually reset internal state if MockSpeechRecognition doesn't fully handle it on its own
    // (though we added it to the beforeEach in setupTests, this is redundant now but harmless)
    recognitionInstance._isStarted = false;
    recognitionInstance.onstart = null;
    recognitionInstance.onend = null;
    recognitionInstance.onresult = null;
    recognitionInstance.onerror = null;
  });

  // Helper to get the current mock recognition instance
  const getRecognitionInstance = () => recognitionInstance;

  // ... (rest of your tests remain the same) ...
  // For instance: `expect(instance.start).toHaveBeenCalled();` will now work because `instance.start` is a jest.fn()
});
// test/setupTests.js

// This mock will be instantiated for each new JSVoice instance.
const mockSpeechRecognition = jest.fn(function () {
  const instance = {
    // --- Properties ---
    continuous: false,
    interimResults: false,
    lang: 'en-US',
    grammars: {},

    // --- Event Handlers (jest.fn so we can spy on them if needed) ---
    onstart: jest.fn(),
    onend: jest.fn(),
    onresult: jest.fn(),
    onerror: jest.fn(),
    onaudiostart: jest.fn(),
    onaudioend: jest.fn(),
    onsoundstart: jest.fn(),
    onsoundend: jest.fn(),
    onspeechstart: jest.fn(),
    onspeechend: jest.fn(),

    // --- Methods ---
    start: jest.fn(function() {
      // Simulate the start event
      if (this.onstart) {
        this.onstart();
      }
    }),
    stop: jest.fn(function() {
      // Simulate the end event
      if (this.onend) {
        this.onend();
      }
    }),
    abort: jest.fn(function() {
      // Simulate the end event
       if (this.onend) {
        this.onend();
      }
    }),

    // --- Custom Test Helpers ---
    // Helper to simulate a successful speech result
    _fireResult: function (transcript, isFinal = true) {
      const event = {
        resultIndex: 0,
        results: [
          [
            {
              transcript: transcript,
              confidence: 0.9,
            },
          ],
        ],
      };
      event.results[0].isFinal = isFinal;

      if (this.onresult) {
        this.onresult(event);
      }
    },

    // Helper to simulate an error
    _fireError: function (error = 'no-speech', message = 'No speech detected.') {
      const errorEvent = {
        error: error,
        message: message,
      };
      if (this.onerror) {
        this.onerror(errorEvent);
      }
    },
  };

  // Keep track of instances to allow tests to access them
  mockSpeechRecognition.mock.instances.push(instance);
  return instance;
});

const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(() => []),
};

const MockSpeechSynthesisUtterance = jest.fn(function (text) {
  this.text = text;
  this.lang = 'en-US';
  this.onend = null;
  this.onerror = null;
});

const mockMediaDevices = {
  getUserMedia: jest.fn(() => Promise.resolve({ getTracks: () => [] })),
};

// --- Global Binding ---
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: mockSpeechRecognition,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: mockSpeechRecognition,
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    writable: true,
    value: MockSpeechSynthesisUtterance,
});

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis,
});

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: mockMediaDevices,
});

// --- Reset mocks before each test ---
beforeEach(() => {
    // Clears all mock call history
    jest.clearAllMocks();
    
    // Specifically clear the array of speech recognition instances
    mockSpeechRecognition.mock.instances.length = 0;

    // Reset the mock implementation for getUserMedia to the default successful promise
    mockMediaDevices.getUserMedia.mockImplementation(() => Promise.resolve({ getTracks: () => [] }));
    
    // Clean up any DOM modifications
    document.body.innerHTML = '';
    document.head.innerHTML = '';

    // Reset spies
    jest.restoreAllMocks();
});

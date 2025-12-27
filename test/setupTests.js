// test/setupTests.js

// --- MOCK CLASS AND OBJECT DEFINITIONS ---

// Global array to hold instances of MockSpeechRecognition created by the tests
const mockSpeechRecognitionInstances = [];

// Mock MediaStream (Required for navigator.mediaDevices.getUserMedia mock)
class MockMediaStream {
  getTracks() {
    return [];
  }
}

// Mock Event class for _fireResult (To simulate the native Web Speech API event structure)
class MockSpeechRecognitionEvent extends Event {
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.results = eventInitDict.results || [];
    this.resultIndex = eventInitDict.resultIndex || 0;
  }
}

// THIS CLASS WILL BE INSTANTIATED BY THE JEST MOCK
class _ActualMockSpeechRecognitionClass {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-US';
    this.onstart = null;
    this.onend = null;
    this.onresult = null;
    this.onerror = null;
    this._isStarted = false;

    // CRITICAL: Ensure these are jest.fn() for call tracking
    this.start = jest.fn(() => {
      this._isStarted = true;
      if (this.onstart) {
        this.onstart();
      }
    });

    this.stop = jest.fn(() => {
      this._isStarted = false;
      if (this.onend) {
        this.onend();
      }
    });

    this.abort = jest.fn(() => {
      this._isStarted = false;
      if (this.onend) {
        this.onend();
      }
    });

    // --- TEST UTILITY METHODS (Accessed via recognitionInstance._fireResult) ---
    this._fireResult = (transcript) => {
      if (!this._isStarted) {
        return;
      }
      if (this.onresult) {
        const event = new MockSpeechRecognitionEvent('result', {
          results: [[{ transcript: transcript, confidence: 1.0 }]],
          resultIndex: 0,
        });
        this.onresult(event);
      }
      this._isStarted = false;
      if (this.onend) {
        this.onend();
      }
    };

    this._fireError = (errorType, message) => {
      if (this.onerror) {
        this.onerror({ error: errorType, message: message });
      }
    };
  }
}

// --- MOCK API DEFINITIONS ---

// 1. Mock the SpeechRecognition constructor
const MockSpeechRecognition = jest.fn(() => {
  const instance = new _ActualMockSpeechRecognitionClass();
  mockSpeechRecognitionInstances.push(instance);
  return instance;
});

// 2. Mock for SpeechSynthesis
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(() => []),
};

// 3. Mock for SpeechSynthesis Utterance (Fixes the undefined 'text' property in the test)
const MockSpeechSynthesisUtterance = jest.fn(function (text) {
  this.text = text;
  this.lang = 'en-US';
  this.onend = null;
  this.onerror = null;
});

// 4. Mock for MediaDevices (Microphone)
const mockMediaDevices = {
  getUserMedia: jest.fn(() => Promise.resolve(new MockMediaStream())),
};

// --- GLOBAL BINDING ---

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: MockSpeechRecognition,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: MockSpeechRecognition,
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

// --- RESET MOCKS BEFORE EACH TEST ---

beforeEach(() => {
  jest.clearAllMocks();

  // Reset internal state for all tracked SpeechRecognition instances
  mockSpeechRecognitionInstances.forEach((instance) => {
    instance._isStarted = false;
    instance.onstart = null;
    instance.onend = null;
    instance.onresult = null;
    instance.onerror = null;
  });
  mockSpeechRecognitionInstances.length = 0;

  mockMediaDevices.getUserMedia.mockImplementation(() => Promise.resolve(new MockMediaStream()));

  document.body.style.zoom = '1';
  document.body.innerHTML = '';
  delete global.mockButtonClick;

  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

// test/setupTests.js

// --- MOCK CLASS AND OBJECT DEFINITIONS ---
// (Keep the order from the previous successful step for these definitions)

// Global array to hold instances of MockSpeechRecognition created by the tests
const mockSpeechRecognitionInstances = [];

class MockSpeechRecognitionEvent extends Event { /* ... same ... */ }

class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-US';
    this.onstart = null;
    this.onend = null;
    this.onresult = null;
    this.onerror = null;
    this._isStarted = false;

    // Make start and stop methods Jest mocks directly on the instance
    this.start = jest.fn(() => {
      if (this._isStarted) {
        throw new DOMException('Already started', 'InvalidStateError');
      }
      this._isStarted = true;
      if (this.onstart) this.onstart();
    });
    this.stop = jest.fn(() => {
      if (!this._isStarted) return;
      this._isStarted = false;
      if (this.onend) this.onend();
    });

    mockSpeechRecognitionInstances.push(this); // Track all instances
  }

  // ... _fireResult, _fireError methods ...
  _fireResult(transcript, isFinal = true) { /* ... same ... */ }
  _fireError(errorType) { /* ... same ... */ }
}

class MockSpeechSynthesisUtterance { /* ... same ... */ }

const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(() => []),
  speaking: false,
  pending: false,
  paused: false,
};

const mockMediaDevices = {
  getUserMedia: jest.fn(() =>
    Promise.resolve({
      getTracks: () => [{ stop: jest.fn() }]
    })
  )
};

global.DOMException = class DOMException extends Error { /* ... same ... */ };


// --- ASSIGN MOCKS TO GLOBAL OBJECTS ---

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  // The value is now the MockSpeechRecognition class itself.
  // Jest will automatically treat a class assigned to a global as a mockable constructor.
  value: MockSpeechRecognition,
});
Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: MockSpeechRecognition, // Both point to the same mock class
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
  // Clear mocks on the constructor and instances
  MockSpeechRecognition.mockClear(); // Clear constructor calls
  mockSpeechRecognitionInstances.forEach(instance => {
    instance.start.mockClear(); // Clear instance method calls
    instance.stop.mockClear();
    instance._isStarted = false; // Reset internal state
    // Clear event handlers if they were set directly on the instance outside of constructor
    instance.onstart = null;
    instance.onend = null;
    instance.onresult = null;
    instance.onerror = null;
  });
  // Clear the tracking array for instances
  mockSpeechRecognitionInstances.length = 0;


  mockSpeechSynthesis.speak.mockClear();
  mockMediaDevices.getUserMedia.mockClear();
  document.body.style.zoom = '1';
});

// Make mockSpeechRecognitionInstances available for tests if needed, though
// it's usually better to get instance via MockSpeechRecognition.mock.instances[0]
// for the primary instance created by VoiceUI.
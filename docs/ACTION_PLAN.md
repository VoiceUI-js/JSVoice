# JSVoice - Action Plan for Improvement

**Last Updated:** December 27, 2025  
**Status:** Ready to Execute

---

## 🎯 Quick Start Checklist

### Week 1: Critical Fixes ⚡
- [ ] **Day 1-2**: Fix failing tests
  - Debug `test/VoiceUI.test.js` failures
  - Fix async operation warnings
  - Ensure all tests pass with exit code 0
  
- [ ] **Day 3-4**: Implement missing amplitude methods
  - Add `startAmplitude(callback, options)` to JSVoice.js
  - Add `stopAmplitude()` to JSVoice.js
  - Use Web Audio API for real-time analysis
  - Update `examples/real-time/` to work correctly
  
- [ ] **Day 5**: Generate TypeScript definitions
  - Create `dist/index.d.ts`
  - Add build script for types
  - Test with TypeScript project
  
- [ ] **Day 6-7**: Code cleanup
  - Fix naming: VoiceUI → JSVoice in rollup.config.js
  - Remove commented code (lines 211-217 in JSVoice.js)
  - Fix typo on line 444 (/**f → /**)

### Week 2-3: Quality Improvements 📈
- [ ] **Documentation**
  - Create `DETAILED_DOCUMENTATION.md`
  - Add JSDoc comments to all public methods
  - Update README with better examples
  - Add troubleshooting section
  
- [ ] **Testing**
  - Increase code coverage to 80%+
  - Add integration tests
  - Add E2E tests for examples
  - Set up CI/CD pipeline
  
- [ ] **Code Quality**
  - Add ESLint configuration
  - Add Prettier for formatting
  - Set up pre-commit hooks
  - Run linter on all files

### Week 4: New Features 🚀
- [ ] **New Built-in Actions**
  - NavigateAction (back, forward, refresh)
  - MediaAction (play, pause, volume)
  - SelectAction (select all, copy, paste)
  
- [ ] **New Examples**
  - Custom commands demo
  - Pattern matching demo
  - Wake word demo
  - Form filling demo
  - React integration example

---

## 🔧 Detailed Implementation Guide

### 1. Fix Failing Tests

**File:** `test/VoiceUI.test.js`

**Problem:** Tests are failing with async warnings

**Solution:**
```javascript
// Add proper cleanup in tests
afterEach(() => {
  jest.clearAllTimers();
  jest.clearAllMocks();
});

// Use fake timers for async operations
beforeEach(() => {
  jest.useFakeTimers();
});

// Properly wait for async operations
await act(async () => {
  await voice.start();
  jest.runAllTimers();
});
```

**Commands to run:**
```bash
npm test -- --verbose
npm run test:coverage
```

---

### 2. Implement Amplitude Visualization

**File:** `src/JSVoice.js`

**Add these methods:**
```javascript
/**
 * Starts real-time audio amplitude monitoring
 * @param {Function} callback - Called with amplitude data
 * @param {Object} options - Configuration options
 */
startAmplitude(callback, options = {}) {
  const { mode = 'bars', barCount = 8 } = options;
  
  if (!this._state._microphoneAllowed) {
    console.error('[JSVoice] Microphone not allowed for amplitude monitoring');
    return;
  }
  
  // Get microphone stream
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      this._amplitudeStream = stream;
      this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this._analyser = this._audioContext.createAnalyser();
      this._analyser.fftSize = 256;
      
      const source = this._audioContext.createMediaStreamSource(stream);
      source.connect(this._analyser);
      
      const bufferLength = this._analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAmplitude = () => {
        if (!this._amplitudeStream) return;
        
        this._analyser.getByteFrequencyData(dataArray);
        
        // Convert to normalized bars
        const bars = [];
        const step = Math.floor(bufferLength / barCount);
        for (let i = 0; i < barCount; i++) {
          const start = i * step;
          const end = start + step;
          let sum = 0;
          for (let j = start; j < end; j++) {
            sum += dataArray[j];
          }
          bars.push(sum / (step * 255)); // Normalize to 0-1
        }
        
        callback(bars);
        this._amplitudeRafId = requestAnimationFrame(updateAmplitude);
      };
      
      updateAmplitude();
    })
    .catch(err => {
      console.error('[JSVoice] Error accessing microphone for amplitude:', err);
      this._callCallback('onError', err);
    });
}

/**
 * Stops amplitude monitoring and cleans up resources
 */
stopAmplitude() {
  if (this._amplitudeRafId) {
    cancelAnimationFrame(this._amplitudeRafId);
    this._amplitudeRafId = null;
  }
  
  if (this._amplitudeStream) {
    this._amplitudeStream.getTracks().forEach(track => track.stop());
    this._amplitudeStream = null;
  }
  
  if (this._audioContext) {
    this._audioContext.close();
    this._audioContext = null;
  }
  
  this._analyser = null;
}
```

**Test with:**
```bash
# Open examples/real-time/index.html in browser
# Click "Start Listening"
# Verify bars animate with audio
```

---

### 3. Generate TypeScript Definitions

**File:** `dist/index.d.ts` (create new)

**Content:**
```typescript
declare module 'jsvoice' {
  export interface JSVoiceOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
    commands?: Record<string, (raw: string, cleaned: string, speak: Function) => any>;
    patternCommands?: Array<{pattern: string, callback: Function}>;
    autoRestart?: boolean;
    restartDelay?: number;
    wakeWord?: string | null;
    wakeWordTimeout?: number;
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    onCommandRecognized?: (phrase: string, raw: string, result: any, args?: any) => void;
    onCommandNotRecognized?: (raw: string) => void;
    onActionPerformed?: (action: string, payload?: any) => void;
    onMicrophonePermissionGranted?: (e?: any) => void;
    onMicrophonePermissionDenied?: (e: any) => void;
    onWakeWordDetected?: (wakeWord: string) => void;
    onError?: (e: any) => void;
    onStatusChange?: (msg: string) => void;
  }

  export default class JSVoice {
    static readonly isApiSupported: boolean;
    
    constructor(options?: JSVoiceOptions);
    
    start(): Promise<boolean>;
    stop(): void;
    toggle(): void;
    speak(text: string, lang?: string): void;
    addCommand(phrase: string, handler: (raw: string, cleaned: string, speak: Function) => any): void;
    removeCommand(phrase: string): boolean;
    addPatternCommand(pattern: string, handler: (args: any, raw: string, cleaned: string, speak: Function) => any): void;
    removePatternCommand(pattern: string): boolean;
    setOption(key: keyof JSVoiceOptions, value: any): void;
    startAmplitude(callback: (bars: number[]) => void, options?: {mode?: string, barCount?: number}): void;
    stopAmplitude(): void;
    
    readonly isListening: boolean;
    readonly microphoneAllowed: boolean;
    readonly isApiSupported: boolean;
    readonly voiceFeedback: string;
    readonly isWakeWordModeActive: boolean;
    readonly isAwaitingCommand: boolean;
  }
}
```

**Add to package.json:**
```json
{
  "scripts": {
    "build:types": "echo 'Types generated manually for now'",
    "build": "rollup -c && npm run build:types"
  }
}
```

---

### 4. Create New Examples

**Example: Custom Commands**

**File:** `examples/custom-commands/index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JSVoice - Custom Commands Demo</title>
  <style>
    body { font-family: system-ui; padding: 2rem; max-width: 800px; margin: 0 auto; }
    .command-list { background: #f5f5f5; padding: 1rem; border-radius: 8px; }
    .status { padding: 1rem; background: #e3f2fd; border-radius: 8px; margin: 1rem 0; }
    button { padding: 0.5rem 1rem; font-size: 1rem; cursor: pointer; }
  </style>
</head>
<body>
  <h1>🎤 Custom Commands Demo</h1>
  <button id="micBtn">Start Listening</button>
  <div class="status" id="status">Click to start</div>
  
  <div class="command-list">
    <h3>Try these commands:</h3>
    <ul>
      <li>"change background to red"</li>
      <li>"set font size to 20"</li>
      <li>"show alert hello world"</li>
      <li>"navigate to google"</li>
    </ul>
  </div>

  <script type="module">
    import JSVoice from '../../src/JSVoice.js';

    const voice = new JSVoice({
      onStatusChange: (msg) => {
        document.getElementById('status').textContent = msg;
      }
    });

    // Pattern command: change background
    voice.addPatternCommand('change background to {color}', (args) => {
      document.body.style.background = args.color;
      voice.speak(`Background changed to ${args.color}`);
    });

    // Pattern command: set font size
    voice.addPatternCommand('set font size to {size}', (args) => {
      document.body.style.fontSize = args.size + 'px';
      voice.speak(`Font size set to ${args.size}`);
    });

    // Exact command: show alert
    voice.addPatternCommand('show alert {message}', (args) => {
      alert(args.message);
    });

    // Exact command: navigate
    voice.addPatternCommand('navigate to {site}', (args) => {
      window.open(`https://${args.site}.com`, '_blank');
    });

    document.getElementById('micBtn').addEventListener('click', () => {
      voice.toggle();
    });
  </script>
</body>
</html>
```

---

### 5. Add New Built-in Actions

**File:** `src/modules/actions/NavigateAction.js`
```javascript
/**
 * Handles browser navigation commands
 */
export function handleNavigate(cleanedTranscript, updateStatus, callCallback) {
  const s = cleanedTranscript;

  if (s.includes("go back") || s.includes("back")) {
    window.history.back();
    callCallback('onActionPerformed', 'navigateBack');
    updateStatus("Navigated back");
    return true;
  }

  if (s.includes("go forward") || s.includes("forward")) {
    window.history.forward();
    callCallback('onActionPerformed', 'navigateForward');
    updateStatus("Navigated forward");
    return true;
  }

  if (s.includes("refresh") || s.includes("reload")) {
    window.location.reload();
    callCallback('onActionPerformed', 'refresh');
    updateStatus("Refreshing page");
    return true;
  }

  return false;
}
```

**Update:** `src/modules/BuiltInActions.js`
```javascript
import { handleNavigate } from './actions/NavigateAction.js';

export function handleBuiltInActions(rawTranscript, cleanedTranscript, updateStatus, callCallback, jsVoiceSpeakMethod) {
  if (handleNavigate(cleanedTranscript, updateStatus, callCallback)) return true;
  // ... rest of actions
}
```

---

## 📊 Success Metrics

Track these metrics to measure improvement:

### Code Quality
- [ ] Test coverage: 80%+ (currently 23%)
- [ ] All tests passing (currently failing)
- [ ] ESLint errors: 0
- [ ] TypeScript errors: 0

### Documentation
- [ ] API documentation: 100% coverage
- [ ] Examples: 10+ (currently 3)
- [ ] Tutorial videos: 3+
- [ ] Blog posts: 5+

### Community
- [ ] GitHub stars: 100+ (currently new)
- [ ] NPM downloads: 1000+/month
- [ ] Contributors: 10+
- [ ] Issues resolved: 90%+

### Performance
- [ ] Bundle size: <500KB (currently 777KB)
- [ ] Load time: <100ms
- [ ] Recognition latency: <50ms
- [ ] Memory usage: <10MB

---

## 🚀 Quick Commands

```bash
# Development
npm install
npm run dev          # Watch mode
npm run build        # Production build
npm test            # Run tests
npm run test:watch  # Watch tests
npm run lint        # Check code quality

# Testing
npm run test:coverage  # Generate coverage report
npm run test:e2e      # Run E2E tests (add this)

# Release
npm version patch    # Bump version
npm publish         # Publish to NPM
git push --tags     # Push tags to GitHub
```

---

## 📝 Notes

- Always run tests before committing
- Update CHANGELOG.md for each release
- Keep README.md in sync with features
- Document breaking changes clearly
- Follow semantic versioning

---

**Ready to start? Pick a task from Week 1 and let's go! 🚀**

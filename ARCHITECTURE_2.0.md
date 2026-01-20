# JSVoice 2.0 Architecture: Modular & Tree-Shakeable

## 1. Motivation
The current JSVoice codebase is "monolithic." It bundles:
- Core Logic (State machine, Events)
- Engines (Native Web Speech)
- Commands (Scroll, Zoom, DOM interactions)
- UI Logic (Visualizer)

This results in:
- **Bloat:** Users who just want Voice-to-Text still pay for "Scroll Down" logic.
- **Tangled Concerns:** Core logic knows too much about specific DOM actions.
- **Rigidity:** Harder to swap engines or disable default behaviors.

## 2. Proposed Folder Structure
We will transition to a monorepo-style package structure (or just clean sub-exports).

```
jsvoice/
├── package.json
├── src/
│   ├── core/                  # Pure Logic. Zero DOM side-effects (mostly).
│   │   ├── JSVoice.ts         # The Orchestrator
│   │   ├── events.ts          # Event Bus
│   │   └── types.ts
│   │
│   ├── engines/               # Pluggable Speech Providers
│   │   ├── native.ts          # Web Speech API wrapper
│   │   ├── whisper.ts         # OpenAI Whisper REST wrapper
│   │   └── tfjs.ts            # (Future) TensorFlow.js / VAD
│   │
│   ├── plugins/               # Optional Functionality
│   │   ├── navigation.ts      # "Go to home", "Open tab"
│   │   ├── scrolling.ts       # "Scroll down"
│   │   ├── forms.ts           # "Fill input"
│   │   └── visualizer.ts      # AudioContext Visualizer
│   │
│   └── index.ts               # Legacy Bundle (exports everything for backward compat)
```

## 3. Package Exports Strategy
We will use modern Node.js `exports` in `package.json` to allow granular imports.

**Revised `package.json`:**
```json
{
  "name": "jsvoice",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",     // Default (All-inclusive)
      "require": "./dist/index.cjs"
    },
    "./core": {
      "types": "./dist/core/index.d.ts",
      "import": "./dist/core/index.js" // Just the class + logic
    },
    "./engines": {
      "types": "./dist/engines/index.d.ts",
      "import": "./dist/engines/index.js"
    },
    "./whisper": {
      "types": "./dist/engines/whisper.d.ts",
      "import": "./dist/engines/whisper.js"
    },
    "./plugins": {
      "types": "./dist/plugins/index.d.ts",
      "import": "./dist/plugins/index.js"
    }
  }
}
```

## 4. Migration Guide (Before vs After)

### Before (Legacy v0.x)
```javascript
import JSVoice from 'jsvoice';

const voice = new JSVoice(); 
// Includes everything: Scroll, Zoom, Visualizer, Native Engine
voice.start();
```

### After (v1.0 Modular)
**Scenario A: "I want everything (Lazy Mode)"**
```javascript
import JSVoice from 'jsvoice'; // Still works! Exports the "Bundle" version
```

**Scenario B: "Pro Mode (Tree-Shaken)"**
```javascript
import { JSVoice } from 'jsvoice/core';
import { NativeSpeechEngine } from 'jsvoice/engines';
import { ScrollPlugin, ZoomPlugin } from 'jsvoice/plugins';

const voice = new JSVoice({
  engines: [NativeSpeechEngine] // Explicit engine injection
});

// Register only what you need
voice.use(ScrollPlugin);
voice.use(ZoomPlugin);

voice.start();
```

## 5. Implementation Roadmap

### Phase 1: Preparation (Non-Breaking)
- [ ] Create `src/plugins/BuiltInPlugins.js` and move logic from `BuiltInActions.js`.
- [ ] Add `voice.use(plugin)` method to `JSVoice` class.
- [ ] Ensure `CommandProcessor` no longer imports `BuiltInActions` directly, but iterates over registered plugins.

### Phase 2: Refactor Imports (Internal)
- [ ] Update `src/index.js` to re-export everything (maintaining legacy API).
- [ ] Create `src/core/index.js` that exports *only* `JSVoice` (without default plugins).

### Phase 3: Rollup Config Update
- [ ] Update `rollup.config.js` to build multiple targets (`dist/core`, `dist/plugins`, etc.) or preserve directory structure.

### Phase 4: Release v1.0.0
- [ ] Update `package.json` exports.
- [ ] Mark v0.x as Maintenance Mode.

## 6. Deprecation Strategy
1.  **v0.3.0**: Add `console.warn` if users rely on implicit built-ins without importing options. (Soft deprecation).
2.  **v0.3.0**: Introduce `voice.use()` and encourage plugin usage.
3.  **v1.0.0**: `new JSVoice()` creates a bare-bones instance. Users *must* add plugins or import the "Bundle" version (`jsvoice/bundle`).


### Refactoring Plan: Modular Architecture (Phase 1)

**Goal**: Decouple `JSVoice.js` from direct state management and helper injection, moving towards an event-driven architecture.

#### Phase 1: Core Decoupling (Non-Breaking)
1. **Event Bus**: Introduce a lightweight `EventEmitter` (or `EventTarget`) to `JSVoice`.
2. **Controller Pattern**: 
   - Create `src/core/RecognitionController.js` class.
   - Move `initRecognition` logic into this class.
   - It should emit events (`started`, `stopped`, `result`, `error`) instead of calling callbacks directly.
3. **State Management**:
   - Create `src/core/VoiceState.js` (simple store).
   - Stop passing mutable `_state` object to `RecognitionManager`.
   - Core listens to Controller events -> updates VoiceState -> emits public events.

#### Phase 2: Manager Consolidation
1. **Microphone**: Make `MicrophoneManager` specific to audio stream handling, not permission UI.
2. **Commands**: Refactor `CommandManager` to be purely about matching (input: text -> output: command). Execution should happen in Core.
3. **Engine**: Standardize `BaseSpeechEngine` usage. Core should `setEngine(engine)`, and Controller handles the rest.

#### Phase 3: Public API Cleanup (v3.0)
1. **Remove Legacy**: Drop `addPatternCommand`.
2. **Remove Globals**: Remove global singleton instances where possible; enforce dependency injection.
3. **Async Initialization**: `createVoice()` should return a Promise or initialized object, ensuring engines are ready.

---

### Release Notes (v2.4.1)

**HOTFIX RELEASE**

**CRITICAL FIXES:**
*   Fixed a runtime crash in `checkMicrophonePermission` caused by calling a non-existent `getStream` method. Now correctly uses `microphoneManager.acquire()`.
*   Fixed strict mode support in regex generation for Pattern Commands.

**IMPROVEMENTS:**
*   **Performance**: Optimized exact command matching to O(1) using Map lookups, significantly reducing latency for apps with many commands.
*   **Stability**: `start()` now properly rejects the Promise if microphone permission is denied, allowing for better error handling in `await` flows.
*   **Logging**: Internal logs now respect the `debug: true` option. Production builds are silent by default.

**DEPRECATIONS:**
*   `addPatternCommand` is deprecated. Use `addCommand(phrase, callback, { isPattern: true })` instead.

**INTERNAL:**
*   Added unit tests for critical permission flows.
*   Added `Logger` utility.

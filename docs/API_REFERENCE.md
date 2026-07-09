# JSVoice — API Reference

**Package:** `jsvoice@1.1.0`  
**Audience:** developers  
**Style:** reference only (no tutorials). For guides see [DOCUMENTATION.md](../DOCUMENTATION.md).

---

## Table of Contents

1. [Imports](#1-imports)
2. [createVoice](#2-createvoice)
3. [JSVoice](#3-jsvoice)
4. [JSVoiceOptions](#4-jsvoiceoptions)
5. [CommandOptions](#5-commandoptions)
6. [Callbacks](#6-callbacks)
7. [Snapshot & subscription](#7-snapshot--subscription)
8. [Engines](#8-engines)
9. [Porcupine wake adapter](#9-porcupine-wake-adapter)
10. [Packs](#10-packs)
11. [React (`jsvoice/react`)](#11-react-jsvoicereact)
12. [Hyper Kit (`jsvoice/react/kit`)](#12-hyper-kit-jsvoicereactkit)
13. [UI Kit core (`jsvoice/ui-kit`)](#13-ui-kit-core-jsvoiceui-kit)
14. [Built-in DOM actions](#14-built-in-dom-actions)
15. [Types index](#15-types-index)

---

## 1. Imports

```ts
// Core (built dist)
import createVoice, { createVoice, JSVoice, /* engines re-exports */ } from 'jsvoice';

// Pure class
import JSVoice from 'jsvoice/core';

// Engines
import NativeSpeechEngine from 'jsvoice/engines/native';
import WhisperSpeechEngine from 'jsvoice/engines/whisper';
import {
  createPorcupineWakeAdapter,
  loadPorcupineModules,
} from 'jsvoice/engines/porcupine-wake';

// Packs
import { NavigationPack, FormPack, MediaPack } from 'jsvoice/packs/basic';
import {
  installKitCommandPacks,
  VoiceKitCommandPack,
  VoiceSettingsCommandPack,
  VoiceDebugCommandPack,
  VoiceWidgetCommandPack,
  VoiceWorkflowCommandPack,
  VoiceA11yCommandPack,
  ALL_KIT_PACKS,
} from 'jsvoice/packs/kit';

// React
import { VoiceProvider, useVoice, useVoiceStatus, useVoiceEvent, VoiceContext } from 'jsvoice/react';

// Hyper UI Kit
import { VoiceKitProvider, VoiceDock, VoiceCommandPalette /* … */ } from 'jsvoice/react/kit';

// Framework-agnostic kit core
import {
  createVoiceTheme,
  VoiceKitActions,
  createVoiceKitStore,
  uikitStore,
  VoiceKitSelectors,
} from 'jsvoice/ui-kit';
```

| Subpath | Module role |
|---------|-------------|
| `jsvoice` | Factory + default export |
| `jsvoice/core` | `JSVoice` class |
| `jsvoice/react` | Context + hooks |
| `jsvoice/react/kit` | Full React kit surface |
| `jsvoice/ui-kit` | Store / theme / actions |
| `jsvoice/packs/basic` | Navigation, Form, Media |
| `jsvoice/packs/kit` | UI kit command packs |
| `jsvoice/engines/*` | Engine implementations |

---

## 2. createVoice

```ts
function createVoice(options?: JSVoiceOptions): JSVoice
```

**Default export** of `jsvoice` is also `createVoice`.

Creates a `JSVoice` instance with hybrid engine defaults (Native → local fallback when configured by factory).

| Param | Type | Description |
|-------|------|-------------|
| `options` | `JSVoiceOptions` | Same as `new JSVoice(options)` |

**Returns:** `JSVoice`

---

## 3. JSVoice

```ts
class JSVoice {
  static readonly isApiSupported: boolean;
  constructor(options?: JSVoiceOptions);
  // …
}
```

### Static

| Member | Type | Description |
|--------|------|-------------|
| `isApiSupported` | `boolean` | `true` if `SpeechRecognition` / `webkitSpeechRecognition` exists on `window` |

### Lifecycle

| Method | Signature | Description |
|--------|-----------|-------------|
| `start` | `(): Promise<boolean>` | Starts recognition after mic check (unless skipped). |
| `stop` | `(): void` | Stops recognition intentionally. |
| `toggle` | `(): Promise<boolean> \| boolean` | Stops if listening (`false`); otherwise returns `start()` promise. |
| `speak` | `(text: string, lang?: string): void` | Browser TTS. Empty/`null` text → `onError`. |

### Commands

| Method | Signature | Description |
|--------|-----------|-------------|
| `addCommand` | `(phrase: string, callback: Function, options?: CommandOptions) => string \| null` | Register command; returns id or `null` if invalid. |
| `removeCommand` | `(idOrPhrase: string) => boolean` | Unregister by id or phrase. |
| `addPatternCommand` | `(pattern: string, callback: Function) => string \| null` | **Deprecated.** Prefer `addCommand` with `{var}` patterns. |
| `removePatternCommand` | `(pattern: string) => boolean` | Remove pattern command. |
| `listCommands` | `() => CommandListItem[]` | Public read-only registry snapshot. |
| `processText` | `(text: string) => Promise<boolean>` | Process transcript without mic. `true` if handled. |

```ts
interface CommandListItem {
  id: string;
  phrase: string;
  type: string;      // 'exact' | 'pattern' | …
  scope: string;
  priority: number;
  args?: any[];
}
```

**Callback signature (user commands):** implementation-defined; pattern commands typically receive extracted args object as first parameter.

### Scopes

| Member | Signature | Description |
|--------|-----------|-------------|
| `setScope` | `(name: string) => void` | Set absolute scope. |
| `pushScope` | `(name: string) => void` | Push scope stack. |
| `popScope` | `() => string` | Pop; returns new current scope. |
| `resetScope` | `() => void` | Reset to `global`. |
| `listScopes` | `() => string[]` | Known scopes. |
| `currentScope` | `string` (readonly) | Active scope. |

### Options & plugins

| Method | Signature | Description |
|--------|-----------|-------------|
| `setOption` | `(key: string, value: any) => void` | Update option; invalid key → `onError`. |
| `use` | `(plugin: (api: any) => void) => this` | Install plugin; chainable. |

### Visualizer (if attached)

| Method | Signature | Description |
|--------|-----------|-------------|
| `startAmplitude` | `(callback: (data: number[]) => void, options?: AmplitudeOptions) => void` | Requires visualizer module/plugin. |
| `stopAmplitude` | `() => void` | Stop amplitude capture. |

```ts
interface AmplitudeOptions {
  mode?: 'bars' | 'waveform';
  barCount?: number;
  fftSize?: number;
  smoothingTimeConstant?: number;
  updateIntervalMs?: number;
}
```

### State (readonly)

| Property | Type | Description |
|----------|------|-------------|
| `isListening` | `boolean` | Recognition active. |
| `microphoneAllowed` | `boolean` | Last known permission flag. |
| `isApiSupported` | `boolean` | Instance mirror of static check. |
| `voiceFeedback` | `string` | Last status message. |
| `isWakeWordModeActive` | `boolean` | Wake mode enabled. |
| `isAwaitingCommand` | `boolean` | Post-wake listening for command. |
| `options` | `JSVoiceOptions` | Current options object (mutable via `setOption`). |

### Introspection

| Method | Signature | Description |
|--------|-----------|-------------|
| `getSnapshot` | `() => VoiceSnapshot` | Current reactive snapshot. |
| `subscribe` | `(listener: (snap: VoiceSnapshot, event?: any) => void) => () => void` | Subscribe; returns unsubscribe. |
| `getEngineInfo` | `() => EngineInfo` | Engine metadata. |

```ts
interface EngineInfo {
  name: string;
  mode: string;
  listening: boolean;
  supported: boolean;
}
```

---

## 4. JSVoiceOptions

```ts
interface JSVoiceOptions {
  debug?: boolean;
  defaultScope?: string;
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  autoRestart?: boolean;
  restartDelay?: number;
  wakeWord?: string | null;
  wakeWordTimeout?: number;       // ms (implementation default ~5000)
  commands?: Record<string, Function>;           // legacy
  patternCommands?: Array<{ pattern: string; callback: Function }>; // legacy
  engines?: Array<new (options: JSVoiceOptions) => BaseSpeechEngine>;
  engine?: BaseSpeechEngine;
  plugins?: Array<(instance: JSVoice) => void>;
  skipMicrophoneCheck?: boolean; // tests / harness only
  // callbacks — see §6
}
```

| Field | Default (typical) | Description |
|-------|-------------------|-------------|
| `lang` | `'en-US'` | BCP 47 language tag. |
| `continuous` | `true` | Continuous recognition. |
| `interimResults` | `true` | Partial results. |
| `autoRestart` | `true` | Restart after unexpected end. |
| `restartDelay` | `500` | Delay ms before restart. |
| `wakeWord` | `null` | Substring match in cleaned transcript. |
| `debug` | `false` | Enables evaluation telemetry path. |
| `defaultScope` | `'global'` | Default command scope. |
| `engine` | — | Injected engine instance. |
| `engines` | `[]` | Classes to probe if no `engine`. |
| `plugins` | `[]` | Applied in constructor. |
| `skipMicrophoneCheck` | `false` | Skip `getUserMedia` (tests). |

---

## 5. CommandOptions

```ts
interface CommandOptions {
  id?: string;
  priority?: number;       // default 0; higher wins
  cooldown?: number;       // ms
  scope?: string;          // default 'global' or defaultScope
  once?: boolean;          // remove after fire
  isPattern?: boolean;     // force pattern mode
  minConfidence?: number;  // 0..1 when engine provides confidence
}
```

### Pattern syntax (phrases)

| Token | Meaning |
|-------|---------|
| `{name}` | Capture group (string/any) |
| `{level:int}` | Integer |
| `{n:number}` | Number (incl. decimal forms per implementation) |
| `{w:word}` | Word token |
| Literal text | Matched after text cleaning (case/punct normalized) |

Exact phrases are cleaned before match (lowercase, punctuation stripped).

---

## 6. Callbacks

Set via constructor `options` or merged into internal callback bag.

| Name | Signature | Fired when |
|------|-----------|------------|
| `onSpeechStart` | `() => void` | Recognition started |
| `onSpeechEnd` | `() => void` | Recognition ended |
| `onCommandRecognized` | `(phrase: string, raw: string, result?: any, args?: Record<string, string>) => void` | Command or built-in handled |
| `onCommandNotRecognized` | `(raw: string) => void` | No handler matched |
| `onActionPerformed` | `(action: string, payload?: any) => void` | Built-in DOM action |
| `onMicrophonePermissionGranted` | `(event?: any) => void` | Mic OK |
| `onMicrophonePermissionDenied` | `(error: any) => void` | Mic denied |
| `onWakeWordDetected` | `(wakeWord: string) => void` | Wake phrase seen |
| `onError` | `(error: Error \| Event) => void` | Errors / validation |
| `onStatusChange` | `(message: string) => void` | Status string update |
| `onEngineStateChange` | `(state: EngineState, details?: any) => void` | Engine state |
| `onCommandEvaluated` | `(event: CommandDebugEvent) => void` | Debug evaluation |
| `onEngineSelected` | `(info: any) => void` | Engine chosen |
| `onFallbackActivated` | `(info: any) => void` | Hybrid fallback |
| `onTelemetry` | `(payload: any) => void` | Telemetry events |

```ts
type EngineState =
  | 'idle'
  | 'listening'
  | 'recording'
  | 'processing'
  | 'speaking'
  | 'error';

interface CommandDebugEvent {
  transcript: string;
  matched: boolean;
  matches: Array<{ id: string; phrase: string; priority: number; scope: string }>;
  winner: string | null;
  rejectionReason: string | null;
}
```

Invalid `addCommand` / `setOption` / empty `speak` / empty `processText` invoke `onError` with `Error`.

---

## 7. Snapshot & subscription

```ts
// Shape is implementation-defined; typical fields:
interface VoiceSnapshot {
  status: string;
  transcript: { partial: string; final: string; updatedAt: number };
  permissions: { microphone: string };
  engine: { name: string; mode: string };
  metrics?: Record<string, unknown>;
}

voice.getSnapshot(): VoiceSnapshot
voice.subscribe((snapshot, event?) => void): () => void
```

`event` often includes `{ type: string, payload?: any }` (e.g. callback name).

---

## 8. Engines

### BaseSpeechEngine

```ts
class BaseSpeechEngine {
  constructor(options?: any);
  static readonly isSupported: boolean;
  state: EngineState;
  isListening: boolean;
  init(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  setState(newState: EngineState): void;
  setCallbacks(callbacks: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (e: any) => void;
    onResult?: (transcript: string | object, isFinal?: boolean) => void;
    onStateChange?: (state: EngineState) => void;
  }): void;
  setOptions(options: any): void;
}
```

### Concrete engines (import paths)

| Export path | Class | Notes |
|-------------|-------|-------|
| `jsvoice/engines/native` | `NativeSpeechEngine` | Web Speech API |
| Hybrid | via `createVoice` / `HybridSpeechEngine` | Native + fallback |
| `jsvoice/engines/whisper` | `WhisperSpeechEngine` | Whisper path |
| Local Transformers | `LocalTransformersSpeechEngine` | On-device model path |

Inject:

```ts
new JSVoice({ engine: engineInstance })
// or
new JSVoice({ engines: [NativeSpeechEngine] })
```

---

## 9. Porcupine wake adapter

**Path:** `jsvoice/engines/porcupine-wake`  
**Peers (optional):** `@picovoice/porcupine-web`, `@picovoice/web-voice-processor`

```ts
interface PorcupineWakeOptions {
  accessKey: string;
  keyword?: string;
  sensitivity?: number; // 0..1
  onWake?: (evt: { label: string; index?: number; raw?: any }) => void;
  onError?: (err: any) => void;
}

function loadPorcupineModules(): Promise<{
  PorcupineWorker: any;
  BuiltInKeyword: any;
  WebVoiceProcessor: any;
}>;

function createPorcupineWakeAdapter(options: PorcupineWakeOptions): Promise<{
  name: string;
  isRunning: boolean;
  start(): Promise<any>;
  stop(): Promise<any>;
  attachToVoice(voice: JSVoice): any;
}>;

function isPorcupineAvailable(): boolean;
```

Throws if `accessKey` missing or peer packages not installed.

---

## 10. Packs

### basic (`jsvoice/packs/basic`)

```ts
interface Pack {
  install(voice: JSVoice): void;
}

const NavigationPack: Pack;
const FormPack: Pack;
const MediaPack: Pack;
```

| Pack | Registers (examples) |
|------|----------------------|
| NavigationPack | go back/forward, reload, scroll * |
| FormPack | focus on `{field}`, submit form |
| MediaPack | play, pause, mute, unmute |

### kit (`jsvoice/packs/kit`)

```ts
function installKitCommandPacks(
  voice: JSVoice,
  packs?: true | Array<'settings' | 'debug' | 'widgets' | 'workflow' | 'a11y' | 'kit'>
): string[];

const ALL_KIT_PACKS: Record<string, { name: string; install(voice: JSVoice, options?: any): any }>;

// Individual packs:
VoiceKitCommandPack
VoiceSettingsCommandPack
VoiceDebugCommandPack
VoiceWidgetCommandPack
VoiceWorkflowCommandPack
VoiceA11yCommandPack
```

---

## 11. React (`jsvoice/react`)

```ts
function VoiceProvider(props: {
  voice?: JSVoice | ((options?: any) => JSVoice);
  options?: JSVoiceOptions;
  children?: React.ReactNode;
}): JSX.Element;

function useVoice(): JSVoice;
function useVoiceStatus<T = any>(selector?: (snapshot: any) => T): T;
function useVoiceEvent(eventName: string, handler: (payload: any) => void): void;

const VoiceContext: React.Context<JSVoice | null>;
```

| Hook | Throws if |
|------|-----------|
| `useVoice` | Outside `VoiceProvider` / kit provider with voice |

Components (also `jsvoice/react/components`):

| Component | Props (main) |
|-----------|----------------|
| `VoiceHUD` | `position?` |
| `PushToTalkButton` | `label?` |

---

## 12. Hyper Kit (`jsvoice/react/kit`)

### VoiceKitProvider

```ts
function VoiceKitProvider(props: {
  voice?: JSVoice;
  theme?: string | object;
  debug?: boolean;
  initialOpen?: boolean;
  persistKey?: string | null;
  commandGroups?: string[];
  plugins?: Function[];
  enableKitCommands?: boolean;
  commandPacks?: true | string[];
  children?: React.ReactNode;
}): JSX.Element;
```

| Prop | Default | Description |
|------|---------|-------------|
| `theme` | `'glassDark'` | Theme name or `createVoiceTheme` result |
| `debug` | `false` | Opens debug UI state |
| `persistKey` | kit default key | LocalStorage UI prefs only; `null` to disable |
| `enableKitCommands` | `false` | Install kit packs |
| `commandPacks` | — | Subset or all when enable true |

### Kit hooks

| Hook | Returns |
|------|---------|
| `useVoiceKit()` | Kit context (`voice`, `theme`, `actions`, …); throws if missing |
| `useVoiceKitOptional()` | Context or `null` |
| `useVoiceKitStore(selector?)` | UI kit store slice |
| `useVoiceOptional()` | Voice from provider or kit |
| `useVoiceCommands()` | `listCommands()`-backed list |
| `useVoiceTranscript({ maxItems?, query? })` | Transcript helpers |
| `useVoiceTheme()` | `{ themeName, theme, setTheme }` |
| `useVoiceDebug()` | Debug panel state + snapshot |
| `useVoicePermissions()` | Mic / secure / speech flags + `requestMicrophone` |
| `useVoicePlugins()` | `{ plugins, setPlugins }` |
| `useVoiceWidgets()` | Widget CRUD helpers |
| `useVoiceRules()` | Rules helpers |
| `useVoiceUi()` | Palette/debug/dock/toast actions |

### VoiceKitActions (also `jsvoice/ui-kit`)

Selected methods:

| Method | Description |
|--------|-------------|
| `setTheme` / `setDensity` | UI prefs |
| `setPaletteOpen` / `togglePalette` | Command palette |
| `setDebugOpen` / `toggleDebug` | Debug drawer |
| `setSettingsOpen` / `toggleSettings` | Settings |
| `setMuted` | Speech mute flag |
| `addTranscript` / `clearTranscript` / `pinTranscript` | Transcript log |
| `pushToast` / `dismissToast` | Toasts |
| `createWidget` / `removeWidget` / … | Widgets (controller) |
| `addStructuredRule` / `validateRule` / `detectRuleConflicts` | Rules |
| `createWorkflow` / `addWorkflowNode` / … | Workflows |
| `trackAnalytics` / `resetAnalytics` | In-memory metrics |
| `exportDebugReport` | JSON-serializable report |
| `loadPrefs` / `savePrefs` | LocalStorage UI prefs |
| `setVoiceMode` | Voice mode flag |

### Component catalog (export names)

**Controls:**  
`VoiceOrb`, `VoiceDock`, `VoiceFullDock`, `VoiceMiniDock`, `VoiceFloatingButton`, `VoiceControlBar`, `VoiceHUD`, `VoiceStatusBadge`, `VoiceStatusPill`, `VoiceStatusRing`, `VoiceListeningIndicator`, `VoiceSpeakingIndicator`, `VoiceProcessingIndicator`, `VoiceMicButton`, `VoiceMuteButton`, `VoiceStopButton`, `VoiceRestartButton`, `VoiceWakeButton`, `VoiceVolumeControl`, `VoiceSpeedControl`, `VoiceLanguageSelect`, `VoiceEngineSelect`, `VoiceScopeSelect`, `VoiceModeToggle`, `VoiceCompactControls`, `VoiceMobileControls`, `PushToTalkButton`, `HoldToSpeakButton`, `VoiceWaveform`, `VoiceAmplitudeMeter`, `WakeWordIndicator`, `VoicePermissionCard`, `VoiceEngineSwitcher`, `VoiceScopeSwitcher`, `VoiceThemeSwitcher`

**Commands:**  
`VoiceCommandPalette`, `VoiceCommandList`, `VoiceCommandItem`, `VoiceCommandGrid`, `VoiceCommandCard`, `VoiceCommandHistory`, `VoiceCommandFavorites`, `CommandCenter`, `CommandBuilder`, `CommandTester`, …

**Transcript:**  
`VoiceTranscript`, `VoiceTranscriptPanel`, `VoiceTranscriptFeed`, `VoiceTranscriptLine`, …

**Debug:**  
`VoiceDebugPanel`, `VoiceDevTools`, `VoiceDevToolsPanel`, `VoiceSnapshotPanel`, `CommandTrace`, `SessionReplayPanel`, …

**Other surfaces:**  
`VoiceSettingsPanel`, `VoiceSettingsDrawer`, `VoiceAssistantLayout`, `VoiceWidgetDashboard`, `VoiceWorkflowBuilder`, `VoicePluginMarketplace`, `VoiceAnalyticsDashboard`, `VoiceOnboarding`, `VoiceA11yPanel`, `VoiceErrorBoundary`, `VoiceKitWorkbench`, templates (`VoiceAssistantTemplate`, …)

**Primitives:**  
`VoiceButton`, `VoiceCard`, `VoiceInput`, `VoiceSelect`, `VoiceTabs`, `VoiceModal`, `VoiceDrawer`, `VoiceTable`, `VoiceEmptyState`, `VoiceErrorState`, `VoiceLoadingState`, `VoiceConfirmDialog`, `VoiceToastHost`, …

Props are generally optional React props (`style`, `className`, feature flags like `compact`, `placement`). See component source or Storybook for per-component props.

### Subpaths

```ts
import { … } from 'jsvoice/react/kit/widgets';
import { … } from 'jsvoice/react/kit/workflows';
import { … } from 'jsvoice/react/kit/debug';
import { … } from 'jsvoice/react/kit/assistant';
import { kitStore, KitActions, useKitState } from 'jsvoice/react/kit/store';
```

---

## 13. UI Kit core (`jsvoice/ui-kit`)

```ts
const uikitStore: {
  getState(): any;
  setState(partial: any): void;
  subscribe(listener: (state: any) => void): () => void;
};

function createVoiceKitStore(seed?: object): typeof uikitStore;
function createVoiceKitController(): typeof VoiceKitActions;
function getInitialUiKitState(): object;

function createVoiceTheme(options?: {
  name?: string;
  base?: string;
  tokens?: Record<string, string>;
}): { name: string; tokens: object; cssVars: Record<string, string> };

function resolveTheme(theme?: string | object): ReturnType<typeof createVoiceTheme>;

const builtInThemes: Record<string, object>;
const themeNames: string[];
const defaultThemes: typeof builtInThemes; // alias
const defaultTokens: Record<string, string>;
const VoiceKitSelectors: Record<string, Function>;
const VoiceKitActions: Record<string, Function>;

// Utils (selected)
function classNames(...parts: any[]): string;
function createId(prefix?: string): string;
function isBrowser(): boolean;
function isSecureContext(): boolean;
function isSpeechRecognitionSupported(): boolean;
function scanInteractiveElements(root?: ParentNode | null, limit?: number): any[];
function resolveSafeClick(tag: any, opts?: { confirm?: (msg: string) => boolean }): any;
function normalizePluginMeta(plugin: any, index?: number): any;
```

Theme CSS variables: `--jsv-*` (plus legacy `--jv-*`).

---

## 14. Built-in DOM actions

Invoked from `processText` / recognition when **no user command** matches. Matching is phrase-heuristic (not a stable public regex API).

| Action family | Trigger style (examples) | Callback |
|---------------|--------------------------|----------|
| Scroll | scroll up/down/top/bottom | `onActionPerformed('…')` |
| Zoom | zoom in/out | `onActionPerformed` |
| Click | `click …` | `onActionPerformed('clickButton', { text, element })` |
| Fill | `fill … with …` / `type … in …` | `onActionPerformed('fillInput', { field, value, element })` |
| Read | read content phrases | may call `speak` |
| Dark mode | dark mode toggle phrases | `onActionPerformed` |
| Open tab | open tab phrases | `onActionPerformed` |

Not individually exported as stable functions for app use; prefer `addCommand` for production flows.

---

## 15. Types index

Primary typings file: `src/index.d.ts` (package `"types"` field).

Kit typings: `src/react/kit/index.d.ts`, `src/react/index.d.ts`, `src/ui-kit/index.d.ts`.

---

### Errors (common)

| Situation | Behavior |
|-----------|----------|
| No engine | `start()` throws / status “not initialized” |
| Mic denied | `onMicrophonePermissionDenied`; `start` throws `Error` |
| Invalid command | `addCommand` → `null` + `onError` |
| Missing Porcupine peers | `createPorcupineWakeAdapter` / `start` throws with install message |

---

*JSVoice API Reference · v1.1.0 · Markdown only*

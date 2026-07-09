# JSVoice Documentation

**Version:** 1.1.0  
**License:** MIT  
**Package:** [`jsvoice`](https://www.npmjs.com/package/jsvoice)  
**Repository:** [VoiceUI-js/VoiceUI](https://github.com/VoiceUI-js/VoiceUI)

Complete developer documentation for the JSVoice browser voice-command library and Hyper Voice UI Kit.

---

## Companion docs (Markdown only)

| Doc | Audience |
|-----|----------|
| **[docs/USER_GUIDE.md](docs/USER_GUIDE.md)** | Non-developers / end users of voice-enabled apps |
| **[docs/API_REFERENCE.md](docs/API_REFERENCE.md)** | Developers — API-only reference |
| **[docs/SECURITY_AND_PRIVACY.md](docs/SECURITY_AND_PRIVACY.md)** | Privacy & voice→DOM safety |

---

## Table of Contents

1. [Overview / Introduction](#1-overview--introduction)
2. [Getting Started](#2-getting-started)
3. [Core Documentation](#3-core-documentation)
   - [Architecture](#31-architecture)
   - [Package entry points](#32-package-entry-points)
   - [JSVoice API](#33-jsvoice-api)
   - [Commands](#34-commands)
   - [Engines](#35-engines)
   - [Built-in DOM actions](#36-built-in-dom-actions)
   - [Plugins](#37-plugins)
   - [Command packs](#38-command-packs)
   - [React integration](#39-react-integration)
   - [Hyper Voice UI Kit](#310-hyper-voice-ui-kit)
   - [Theming](#311-theming)
4. [Common Use Cases / Tutorials](#4-common-use-cases--tutorials)
5. [Troubleshooting / FAQ](#5-troubleshooting--faq)
6. [Best Practices / Tips](#6-best-practices--tips)
7. [Contributing / Development Guide](#7-contributing--development-guide)
8. [Changelog / Version History](#8-changelog--version-history)
9. [Glossary](#9-glossary)
10. [Contact / Support](#10-contact--support)
11. [Related docs](#11-related-docs)

---

## 1. Overview / Introduction

### What is JSVoice?

**JSVoice** is a modern **JavaScript voice-command library for the browser**. It turns speech into structured commands, speaks responses with text-to-speech (TTS), and optionally provides a full **React Hyper Voice UI Kit** (dock, command palette, transcripts, settings, debug tools, and more).

It solves the problem of wiring the raw **Web Speech API** yourself: lifecycle, restarts, permissions, pattern matching, scopes, plugins, hybrid engines, and product-grade UI.

### Problems it solves

| Problem | JSVoice approach |
|---------|------------------|
| Web Speech is verbose and browser-specific | `createVoice()` + engine abstraction |
| Commands need patterns and variables | `{name}`, `{level:int}`, scopes, priorities |
| Firefox / unreliable Native STT | Hybrid engine with local fallback path |
| Need a product UI, not only an API | Hyper Voice UI Kit (`jsvoice/react/kit`) |
| Hard to test without a microphone | `processText()` + FakeSpeechEngine harness |

### Key features

- **Speech recognition** (STT) via pluggable engines  
- **Speech synthesis** (TTS) via the browser  
- **Exact and pattern commands** with typed entities  
- **Wake word** (transcript-based) + optional **Porcupine** adapter  
- **Built-in DOM actions** (scroll, click, fill, read, dark mode, …)  
- **Plugins** (VAD, hotkeys, fuzzy match, session recorder, help, …)  
- **Command packs** (navigation, forms, media, kit UI packs)  
- **React hooks + Hyper UI Kit** (dock, palette, assistant, devtools, widgets, …)  
- **Zero runtime dependencies** for the core package  
- **TypeScript definitions** included  

### Who it’s for

| Audience | Use JSVoice for |
|----------|-----------------|
| **Frontend developers** | Add voice control to SPAs, dashboards, tools |
| **Accessibility engineers** | Hands-free navigation and speech UX |
| **React teams** | Drop-in kit (dock, palette, settings) |
| **Product / AI assistant builders** | Voice shell + command center UI |
| **Library contributors** | Actions, plugins, packs, docs |

### Tech stack

| Layer | Technology |
|-------|------------|
| Language | JavaScript (ES modules) |
| Platform | Browsers (Web Speech API, MediaDevices) |
| Build | Rollup → CJS / ESM / UMD |
| UI (optional) | React ≥ 17 (peer dependency) |
| Local STT (optional) | Transformers.js / Whisper-style engines |
| Wake (optional peer) | Picovoice Porcupine Web |
| Tests | Jest + FakeSpeechEngine; Playwright E2E |
| Demo | Next.js app under `demo-app/` |

---

## 2. Getting Started

### Prerequisites

- **Node.js** 18+ recommended (16+ may work)  
- A **modern browser** (Chrome/Edge best for Native Web Speech; Hybrid helps elsewhere)  
- **HTTPS or `localhost`** (required for microphone access)  
- For React kit: **React 17+** and **react-dom**  

### Installation

**1. Install the package**

```bash
npm install jsvoice
# or
yarn add jsvoice
# or
pnpm add jsvoice
```

**2. (Optional) React peers for UI kit**

```bash
npm install react react-dom
```

**3. (Optional) Porcupine on-device wake word**

```bash
npm install @picovoice/porcupine-web @picovoice/web-voice-processor
```

**CDN (core UMD only)**

```html
<script src="https://unpkg.com/jsvoice/dist/voice-ui.umd.min.js"></script>
<script>
  // Global: JSVoice (UMD build)
</script>
```

### Quick start — Core (minimal)

```javascript
import { createVoice } from 'jsvoice';

const voice = createVoice({
  lang: 'en-US',
  onStatusChange: (msg) => console.log(msg),
  onError: (err) => console.error(err),
});

voice.addCommand('hello world', () => {
  voice.speak('Hello! How can I help you?');
});

// Mic button
document.getElementById('mic').addEventListener('click', () => {
  voice.toggle(); // starts or stops listening
});

// Without mic (tests / typed input)
// await voice.processText('hello world');
```

### Quick start — React Hyper Kit

```jsx
import { createVoice } from 'jsvoice';
import {
  VoiceKitProvider,
  VoiceDock,
  VoiceCommandPalette,
  VoiceHUD,
} from 'jsvoice/react/kit';

const voice = createVoice();
voice.addCommand('hello', () => voice.speak('Hello from the kit'));

export function App() {
  return (
    <VoiceKitProvider voice={voice} theme="glassDark" enableKitCommands>
      <YourApp />
      <VoiceDock />
      <VoiceHUD />
      <VoiceCommandPalette hotkey="mod+k" />
    </VoiceKitProvider>
  );
}
```

In **Next.js**, mark the client boundary:

```jsx
'use client';
```

### Demo app (local)

```bash
# from repo root
npm install
npm run build

cd demo-app
npm install
npm run dev
```

Open:

- `/` — demo hub  
- `/ui/hyper` — Hyper Voice UI Kit workbench  

---

## 3. Core Documentation

### 3.1 Architecture

```
User speech
    → Speech engine (Native | Hybrid | Whisper/Local | injected Fake)
    → RecognitionManager (lifecycle, restarts, errors)
    → JSVoice._handleSpeechResult
         → CommandManager (exact / pattern / scopes)
         → Built-in DOM actions (if no user command matched)
    → Callbacks + speak() + UI kit store (if used)
    → React (VoiceProvider / VoiceKitProvider) or vanilla app
```

**High-level folders**

```text
src/
  JSVoice.js              # Core class
  index.js                # createVoice factory + re-exports
  engines/                # Native, Hybrid, Whisper, Local, Porcupine adapter
  modules/                # Recognition, CommandManager, mic, actions, …
  plugins/                # VAD, Hotkeys, Fuzzy, SessionRecorder, Help, kit
  packs/                  # basic + kit command packs
  react/                  # VoiceProvider, hooks, components
  react/kit/              # Hyper Voice UI Kit
  ui-kit/                 # Framework-agnostic store, theme, utils
dist/                     # Built CJS/ESM/UMD (and kit bundles)
demo-app/                 # Next.js demos + QA lab
examples/                 # Standalone HTML demos
test/                     # Jest + FakeSpeechEngine
e2e/                      # Playwright harness
docs/                     # Topic guides (security, kit, e2e, …)
```

### 3.2 Package entry points

| Import | Purpose |
|--------|---------|
| `jsvoice` | Core factory + engines re-exports (built dist) |
| `jsvoice/core` | Pure `JSVoice` class source |
| `jsvoice/react` | `VoiceProvider`, `useVoice`, `useVoiceStatus` |
| `jsvoice/react/kit` | Full Hyper UI Kit |
| `jsvoice/ui-kit` | Store, theme, actions (mostly framework-agnostic) |
| `jsvoice/packs/basic` | Navigation / Form / Media packs |
| `jsvoice/packs/kit` | UI kit command packs |
| `jsvoice/engines/porcupine-wake` | Optional on-device wake adapter |
| `jsvoice/engines/native` | Native engine class |
| `jsvoice/engines/whisper` | Whisper engine class |

React is **external** in kit bundles — your app supplies `react` / `react-dom`.

### 3.3 JSVoice API

#### Factory: `createVoice(options?)`

Creates a voice instance with **Hybrid** defaults (Native first, local fallback when appropriate).

```js
import { createVoice, JSVoice } from 'jsvoice';

const voice = createVoice({ lang: 'en-US', debug: true });
// or pure core:
const bare = new JSVoice({ engine: myEngineInstance });
```

#### Lifecycle

| Method | Description |
|--------|-------------|
| `start()` | Request mic (unless skipped), start recognition. Returns `Promise<boolean>`. |
| `stop()` | Stop listening intentionally. |
| `toggle()` | Start or stop. Returns start promise when starting, `false` when stopping. |
| `speak(text, lang?)` | Queue browser TTS. Empty text fires `onError`. |

#### Commands

| Method | Description |
|--------|-------------|
| `addCommand(phrase, callback, options?)` | Register exact or pattern command. Returns id or `null`. |
| `removeCommand(idOrPhrase)` | Unregister. |
| `addPatternCommand(pattern, callback)` | Deprecated; use `addCommand` with `{…}` patterns. |
| `listCommands()` | Public read-only list of registered commands. |
| `processText(text)` | Run a transcript without mic (tests, palette, typed UI). |

#### Scopes

| Method / property | Description |
|-------------------|-------------|
| `setScope(name)` | Set absolute scope. |
| `pushScope(name)` / `popScope()` | Stack scopes. |
| `resetScope()` | Back to `global`. |
| `listScopes()` | Known scope names. |
| `currentScope` | Active scope string. |

#### State & introspection

| API | Description |
|-----|-------------|
| `isListening` | Recognition active. |
| `microphoneAllowed` | Last known mic permission state. |
| `isApiSupported` / `JSVoice.isApiSupported` | Web Speech constructor present. |
| `isWakeWordModeActive` | Wake word mode on. |
| `isAwaitingCommand` | Wake detected; waiting for command. |
| `voiceFeedback` | Last status string. |
| `getSnapshot()` | Reactive snapshot for UI. |
| `subscribe(listener)` | Snapshot listener; returns unsubscribe. |
| `getEngineInfo()` | `{ name, mode, listening, supported }`. |
| `setOption(key, value)` | Update options (and engine when applicable). |
| `use(plugin)` | Install a plugin function. |

#### Important options

| Option | Default | Notes |
|--------|---------|--------|
| `lang` | `'en-US'` | Recognition / TTS language. |
| `continuous` | `true` | Continuous listening. |
| `interimResults` | `true` | Partial transcripts. |
| `autoRestart` | `true` | Restart after unexpected end. |
| `restartDelay` | `500` | ms before restart. |
| `wakeWord` | `null` | Phrase inside transcripts. |
| `wakeWordTimeout` | `5000` | ms to wait for command after wake. |
| `engine` | — | Injected engine instance. |
| `engines` | `[]` | Engine classes for selection. |
| `plugins` | `[]` | Plugins applied at construct. |
| `debug` | `false` | Command evaluation telemetry. |
| `defaultScope` | `'global'` | New command default scope. |
| `skipMicrophoneCheck` | `false` | **Tests only** — skip `getUserMedia`. |

#### Callbacks

| Callback | When |
|----------|------|
| `onSpeechStart` / `onSpeechEnd` | Recognition session |
| `onCommandRecognized` | User or built-in action handled |
| `onCommandNotRecognized` | No match |
| `onActionPerformed` | Built-in DOM action ran |
| `onMicrophonePermissionGranted` / `Denied` | Mic flow |
| `onWakeWordDetected` | Wake phrase heard |
| `onEngineStateChange` | Engine state |
| `onCommandEvaluated` | Debug evaluation |
| `onError` | Errors |
| `onStatusChange` | Human-readable status string |
| `onTelemetry` | Engine/command telemetry |

### 3.4 Commands

#### Exact phrase

```js
voice.addCommand('open settings', () => {
  openSettings();
});
```

#### Pattern with variables

```js
voice.addCommand('set volume to {level:int}', ({ level }) => {
  player.setVolume(level);
  voice.speak(`Volume ${level}`);
});
```

Supported entity styles include `{name}`, `{level:int}`, `{n:number}`, `{w:word}`, and similar (see CommandManager).

#### Options

```js
voice.addCommand('delete account', onDelete, {
  minConfidence: 0.95,
  priority: 10,
  scope: 'admin',
  cooldown: 2000,
  once: false,
});
```

#### List & test without mic

```js
console.table(voice.listCommands());
await voice.processText('set volume to 5');
```

### 3.5 Engines

| Engine | Role |
|--------|------|
| **NativeSpeechEngine** | Browser Web Speech API |
| **HybridSpeechEngine** | Native first; local fallback when needed |
| **WhisperSpeechEngine** / **LocalTransformersSpeechEngine** | On-device / local ASR paths |
| **Injected engine** | Tests: FakeSpeechEngine; custom adapters |

```js
import { createVoice } from 'jsvoice';
import NativeSpeechEngine from 'jsvoice/engines/native';

// Default hybrid via createVoice()
const voice = createVoice();

// Or pure core + explicit engine
import JSVoice from 'jsvoice/core';
const voice2 = new JSVoice({ engine: new NativeSpeechEngine({ lang: 'en-US' }) });
```

#### Optional Porcupine wake word

See [docs/PORCUPINE_WAKE.md](docs/PORCUPINE_WAKE.md).

```js
import { createPorcupineWakeAdapter } from 'jsvoice/engines/porcupine-wake';

const wake = await createPorcupineWakeAdapter({
  accessKey: process.env.PICOVOICE_ACCESS_KEY,
  keyword: 'porcupine',
  onWake: ({ label }) => console.log('Wake', label),
});
wake.attachToVoice(voice);
await wake.start();
```

### 3.6 Built-in DOM actions

When no user command matches, JSVoice may run **built-in actions** from the transcript (approximate phrases):

| Action | Example phrases |
|--------|-----------------|
| Scroll | “scroll down”, “scroll up” |
| Zoom | zoom in / out style phrases |
| Click | “click submit”, “click button Save” |
| Fill input | “fill email with user@example.com” |
| Read content | read page / selection style phrases |
| Dark mode | toggle dark mode phrases |
| Open tab | open tab style phrases |

**Security:** Voice can drive the DOM. Read [docs/SECURITY_AND_PRIVACY.md](docs/SECURITY_AND_PRIVACY.md) before production. Prefer explicit `addCommand` for destructive flows; use confirmation UI for delete/pay/logout.

### 3.7 Plugins

Install with `voice.use(plugin)` or `plugins: […]` in options.

| Plugin | Purpose |
|--------|---------|
| `VadPlugin` | Stop on silence (VAD) |
| `HotkeysPlugin` | Push-to-talk / shortcuts |
| `FuzzyMatchPlugin` | Synonyms + fuzzy match on misses |
| `SessionRecorderPlugin` | Record/replay text sessions |
| `HelpPlugin` | “help” lists commands in scope |
| Kit plugin | Voice commands for kit UI modes |

Example:

```js
import FuzzyMatchPlugin from 'jsvoice/…'; // path per package layout / source

voice.use((api) => {
  // function plugins receive a restricted API surface
});
```

Use public APIs (`listCommands`, `processText`) inside plugins — avoid private `_commandManager`.

### 3.8 Command packs

**Basic packs** (`jsvoice/packs/basic`):

```js
import { NavigationPack, FormPack, MediaPack } from 'jsvoice/packs/basic';

NavigationPack.install(voice);
FormPack.install(voice);
MediaPack.install(voice);
```

**Kit packs** (`jsvoice/packs/kit`) — settings, debug, widgets, workflow, a11y, kit:

```js
import { installKitCommandPacks } from 'jsvoice/packs/kit';

installKitCommandPacks(voice, ['settings', 'debug', 'kit']);
// or all:
installKitCommandPacks(voice, true);
```

Via provider:

```jsx
<VoiceKitProvider voice={voice} enableKitCommands commandPacks={['settings', 'kit']} />
```

Packs are **not** auto-installed unless you enable them.

### 3.9 React integration

```js
import { VoiceProvider, useVoice, useVoiceStatus, useVoiceEvent } from 'jsvoice/react';
```

| Export | Role |
|--------|------|
| `VoiceProvider` | Holds JSVoice instance in context |
| `useVoice()` | Instance (throws outside provider) |
| `useVoiceStatus(selector?)` | Snapshot via `useSyncExternalStore` |
| `useVoiceEvent(name, handler)` | Event subscription helper |
| `VoiceHUD` / `PushToTalkButton` | Basic components (`jsvoice/react/components`) |

### 3.10 Hyper Voice UI Kit

Import from `jsvoice/react/kit`.

**Provider**

```jsx
<VoiceKitProvider
  voice={voice}
  theme="glassDark"          // or createVoiceTheme(...)
  debug={false}
  enableKitCommands={false}
  commandPacks={['kit']}
  persistKey="my-app-voice-kit"  // UI prefs only
>
  {children}
</VoiceKitProvider>
```

**Flagship components** (non-exhaustive)

| Component | Role |
|-----------|------|
| `VoiceOrb` / `VoiceDock` / `VoiceControlBar` | Listening controls |
| `VoiceHUD` | Live status + transcript |
| `VoiceCommandPalette` | ⌘/Ctrl+K command search & run |
| `VoiceTranscript` / `VoiceTranscriptPanel` | Transcript UI |
| `VoiceDebugPanel` / `VoiceDevTools` | Debug lab |
| `VoiceSettingsPanel` / Drawer | Preferences |
| `VoiceAssistantLayout` | Chat-style assistant shell |
| `VoiceWidgetDashboard` | Widget canvas |
| `VoiceWorkflowBuilder` | Workflow canvas (**preview** execution) |
| `VoicePluginMarketplace` | Plugin metadata UI (**preview** install) |
| `VoiceAnalyticsDashboard` | In-memory metrics |
| `VoiceOnboarding` | Permission / support wizard |
| `VoiceA11yPanel` | Accessibility helpers |
| Templates | `VoiceAssistantTemplate`, `VoiceDebugLabTemplate`, … |

**Hooks:** `useVoiceKit`, `useVoiceKitStore`, `useVoiceCommands`, `useVoiceTranscript`, `useVoiceTheme`, `useVoiceDebug`, `useVoicePermissions`, `useVoiceWidgets`, `useVoiceRules`, `useVoiceUi`, …

Deep dives: [docs/HYPER_VOICE_UI_KIT.md](docs/HYPER_VOICE_UI_KIT.md), [docs/HYPER_VOICE_COMPONENTS.md](docs/HYPER_VOICE_COMPONENTS.md).

### 3.11 Theming

```js
import { createVoiceTheme, themeNames } from 'jsvoice/ui-kit';
// or from 'jsvoice/react/kit'

const theme = createVoiceTheme({
  name: 'brand',
  base: 'glassDark',
  tokens: { primary: '#7c3aed' },
});
```

Built-in: `defaultDark`, `defaultLight`, `glassDark`, `glassLight`, `neon`, `minimal`, `highContrast` (+ aliases `dark`, `light`, `glass`, …).

CSS variables use `--jsv-*` (legacy `--jv-*` aliases for older kit pieces).

---

## 4. Common Use Cases / Tutorials

### 4.1 Hands-free navigation on a marketing site

```js
import { createVoice } from 'jsvoice';
import { NavigationPack } from 'jsvoice/packs/basic';

const voice = createVoice();
NavigationPack.install(voice);

voice.addCommand('contact sales', () => {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  voice.speak('Opening contact section');
});

document.getElementById('mic').onclick = () => voice.toggle();
```

**Expected:** Say “scroll down” / “go back” / “contact sales” after granting mic.

### 4.2 Typed command testing (no mic)

```js
const voice = createVoice({ skipMicrophoneCheck: true });
voice.addCommand('ping', () => console.log('pong'));
await voice.processText('ping'); // logs pong
```

### 4.3 Scoped admin commands

```js
voice.addCommand('purge cache', purge, { scope: 'admin' });

// Public pages
voice.setScope('global');

// Admin panel mount
voice.setScope('admin');
// “purge cache” only works here
```

### 4.4 Pattern commands for forms

```js
voice.addCommand('set name to {value}', ({ value }) => {
  const el = document.querySelector('#name');
  if (el) el.value = value;
});
// Say: “set name to Ada Lovelace”
```

### 4.5 React dashboard shell

```jsx
<VoiceKitProvider voice={voice} theme="glassDark" enableKitCommands persistKey="dash">
  <Dashboard />
  <VoiceDock placement="bottom-right" />
  <VoiceCommandPalette />
  <VoiceSettingsDrawer />
</VoiceKitProvider>
```

Open palette with **Ctrl/⌘+K**, toggle mic from the dock, change theme in settings.

### 4.6 Debug unrecognized speech

```jsx
<VoiceDevTools />
// or
<VoiceDebugPanel />
```

Use **Command tester** / `processText` and inspect **command trace** + analytics.

---

## 5. Troubleshooting / FAQ

### Microphone does nothing

1. Serve over **HTTPS** or **localhost**.  
2. Check browser permission for mic.  
3. Confirm `createVoice()` / engine initialized (no “No engines provided” warning).  
4. Call `await voice.start()` or `toggle()` after a user gesture (browser policy).  

### Works in Chrome, fails in Firefox

Native Web Speech support varies. Prefer **`createVoice()` Hybrid** defaults and/or local engine path. See engine docs.

### `onCommandNotRecognized` always fires

- Phrase must match after **cleaning** (punctuation/case normalized).  
- Check `listCommands()` and try `processText('exact phrase')`.  
- Pattern braces must match spoken structure.  
- Built-in actions may “consume” a phrase without your custom callback.

### React: “useVoice must be used within VoiceProvider”

Wrap with `VoiceProvider` or `VoiceKitProvider` (kit nests VoiceProvider when `voice` is passed).

### Next.js hydration / `window` errors

Use `'use client'` for voice components. Never call `start()` during SSR. Construct voice in `useState(() => …)` with a `window` guard if needed.

### Bundle size larger than expected

- Core path ≠ full kit. Import only `jsvoice` for commands.  
- Kit pulls UI surface; tree-shake named imports where possible.  
- Measure **per entry**: `dist/voice-ui.esm.js` vs `dist/react/kit/index.esm.js`.

### Tests fail on Web Speech in Jest

Use **FakeSpeechEngine** / `createTestVoice` from `test/helpers/`. Do not expect real `SpeechRecognition` in jsdom.

### Porcupine install error

Peers are optional. Install `@picovoice/porcupine-web` and `@picovoice/web-voice-processor`, and pass a valid AccessKey.

### FAQ

**Q: Does audio leave the device?**  
**A:** With **Native** Web Speech, often yes (browser/vendor). With **local** engines / Porcupine, processing is designed to stay on-device. See Security & Privacy doc.

**Q: Can I use this without React?**  
**A:** Yes. Core and many utils are vanilla JS. React is optional.

**Q: Is the workflow builder production-ready?**  
**A:** Canvas + simulate run is **preview**. Wire your own execution callbacks for production.

**Q: How do I disable built-in DOM actions?**  
**A:** Prefer explicit commands for critical flows; keep sensitive pages free of broad “click …” exposure. Further allowlisting can be added at app level.

---

## 6. Best Practices / Tips

### Do

- Use **`createVoice()`** for defaults unless you need a custom engine graph.  
- Prefer **`listCommands` / `processText`** over private fields.  
- Gate **destructive** actions behind confirm UI + high `minConfidence`.  
- Use **scopes** for multi-page apps.  
- Persist only **UI prefs** (`persistKey`); keep transcripts opt-in.  
- Test with **FakeSpeechEngine** and Playwright harness.  
- Provide **visible mic affordance** and status text for accessibility.  
- Align host control labels with speech (WCAG Label in Name).  

### Don’t

- Don’t call mic APIs during SSR.  
- Don’t log raw audio buffers.  
- Don’t claim “fully private” when using Native cloud-backed STT.  
- Don’t auto-click payment/delete without confirmation.  
- Don’t rely on transcript wake word for always-on production KWS without Porcupine (or similar).  
- Don’t import the entire kit if you only need `addCommand`.  

### Recommended production checklist

- [ ] HTTPS + permission UX  
- [ ] Engine choice documented for privacy reviewers  
- [ ] Destructive commands scoped + confirmed  
- [ ] Error + unsupported-browser UI  
- [ ] CI: `npm test` + `npm run test:e2e`  
- [ ] Security review of voice→DOM surface  

---

## 7. Contributing / Development Guide

### Setup

```bash
git clone https://github.com/VoiceUI-js/VoiceUI.git
cd VoiceUI   # or your fork
npm install
npm run build
npm test
npm run test:e2e    # requires Playwright browsers once: npx playwright install chromium
npm run storybook
```

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Rollup multi-entry dist |
| `npm test` | Jest unit/integration |
| `npm run test:e2e` | Playwright |
| `npm run storybook` | Component stories |
| `npm run lint` | ESLint |

### Code style

- Keep **public API stable** (`JSVoice` facade).  
- New DOM behaviors: prefer `src/modules/actions/`.  
- Plugins: use public voice methods.  
- Clear commit messages (`feat:`, `fix:`, `docs:`).  

### Pull requests

1. Fork + branch (`feat/…`, `fix/…`)  
2. Add tests when fixing core behavior  
3. Update docs if API changes  
4. Ensure `npm test` and `npm run build` pass  

See [CONTRIBUTING.md](CONTRIBUTING.md) for community notes (e.g. Hacktoberfest).

### Adding an example

Place runnable demos under `examples/` and link them from the README or docs.

---

## 8. Changelog / Version History

Current package version: **1.1.0** (see `package.json`).

### Template for future releases

```markdown
## [x.y.z] - YYYY-MM-DD

### Added
- …

### Changed
- …

### Fixed
- …

### Security
- …
```

### Recent highlights (1.1.x era)

- Hyper Voice UI Kit (dock, palette, assistant, devtools, widgets, …)  
- Public API: `listCommands`, `processText`, `getEngineInfo`  
- FakeSpeechEngine test harness; full Jest suite green  
- Playwright E2E harness  
- Multi-entry dist (core, react, kit, ui-kit)  
- Optional Porcupine wake adapter  
- Storybook flagship stories  
- Security & privacy documentation  

Maintain a root `CHANGELOG.md` if you publish tagged releases (`v1.1.0`, …).

---

## 9. Glossary

| Term | Meaning |
|------|---------|
| **STT** | Speech-to-text (recognition) |
| **TTS** | Text-to-speech (synthesis) |
| **Web Speech API** | Browser API for STT/TTS |
| **Engine** | Adapter implementing recognition lifecycle |
| **Hybrid** | Native engine first, local fallback when needed |
| **Wake word** | Phrase that arms command listening |
| **Pattern command** | Phrase with `{variables}` / typed entities |
| **Scope** | Namespace limiting which commands are active |
| **Plugin** | Function installed via `voice.use` |
| **Pack** | Bundle of related commands (`install(voice)`) |
| **Hyper UI Kit** | React product UI on top of JSVoice |
| **Snapshot** | Reactive state object for UI bindings |
| **VAD** | Voice activity detection (silence handling) |
| **FakeSpeechEngine** | Deterministic test engine without mic |

---

## 10. Contact / Support

| Channel | Use |
|---------|-----|
| **GitHub Issues** | Bugs, feature requests: [repo issues](https://github.com/VoiceUI-js/VoiceUI/issues) |
| **GitHub Discussions** | (If enabled) questions and ideas |
| **Security** | Prefer private advisory for sensitive reports; see [docs/SECURITY_AND_PRIVACY.md](docs/SECURITY_AND_PRIVACY.md) |
| **npm** | Package page: [jsvoice](https://www.npmjs.com/package/jsvoice) |

When filing a bug, include:

- Browser + OS  
- JSVoice version  
- Minimal repro (`processText` if possible)  
- Whether Hybrid/Native/local engine  
- Console errors  

---

## 11. Related docs

| Doc | Topic |
|-----|--------|
| [README.md](README.md) | Marketing + quick start |
| [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | Non-developer user manual |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | API-only reference |
| [docs/SECURITY_AND_PRIVACY.md](docs/SECURITY_AND_PRIVACY.md) | Privacy & voice→DOM risk |
| [docs/HYPER_VOICE_UI_KIT.md](docs/HYPER_VOICE_UI_KIT.md) | Kit overview |
| [docs/HYPER_VOICE_COMPONENTS.md](docs/HYPER_VOICE_COMPONENTS.md) | Component catalog |
| [docs/HYPER_VOICE_THEMING.md](docs/HYPER_VOICE_THEMING.md) | Themes |
| [docs/PORCUPINE_WAKE.md](docs/PORCUPINE_WAKE.md) | On-device wake |
| [docs/E2E.md](docs/E2E.md) | Playwright |
| [docs/STORYBOOK.md](docs/STORYBOOK.md) | Storybook |
| [docs/QA_HARNESS.md](docs/QA_HARNESS.md) | Demo-app QA harness |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributors |

---

*End of JSVoice documentation (v1.1.0).*

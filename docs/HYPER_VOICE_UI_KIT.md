# Hyper Voice UI Kit

Production-grade, premium **voice-first UI system** for JSVoice.

**Phase 2 docs:** [Components](HYPER_VOICE_COMPONENTS.md) · [Theming](HYPER_VOICE_THEMING.md) · [Commands](HYPER_VOICE_COMMANDS.md) · [DevTools](HYPER_VOICE_DEVTOOLS.md) · [Plugins](HYPER_VOICE_PLUGINS.md) · [Workflows](HYPER_VOICE_WORKFLOWS.md) · [Widgets](HYPER_VOICE_WIDGETS.md) · [Rules](HYPER_VOICE_RULES.md) · [A11y](HYPER_VOICE_ACCESSIBILITY.md) · [Settings](HYPER_VOICE_SETTINGS.md) · [Analytics](HYPER_VOICE_ANALYTICS.md) · [Templates](HYPER_VOICE_TEMPLATES.md) · [Migration](HYPER_VOICE_MIGRATION.md)

Think of it as:

- **shadcn/ui for voice interfaces**
- **developer console for speech commands**
- **accessibility + AI assistant shell**
- **debug lab for browser speech apps**

---

## Install / imports

```js
import { createVoice } from 'jsvoice';
import {
  VoiceKitProvider,
  VoiceDock,
  VoiceHUD,
  VoiceCommandPalette,
  VoiceTranscript,
  VoiceDebugPanel,
  VoiceOnboarding,
  VoiceOrb,
  VoiceKitWorkbench,
} from 'jsvoice/react/kit';

import {
  createVoiceTheme,
  createVoiceKitStore,
  createVoiceKitController,
  VoiceKitActions,
} from 'jsvoice/ui-kit';
```

React is required only for `jsvoice/react/kit`.  
Core store/theme/utils live in `jsvoice/ui-kit` (framework-agnostic logic + optional React store hook).

---

## Quick start

```bash
npm install jsvoice @xenova/transformers react react-dom
```

`createVoice()` defaults to **on-device Whisper tiny**. See [LOCAL_BROWSER_WHISPER.md](LOCAL_BROWSER_WHISPER.md).

```jsx
'use client';
import { createVoice } from 'jsvoice';
import { VoiceKitProvider, VoiceDock, VoiceCommandPalette, VoiceHUD } from 'jsvoice/react/kit';

const voice = createVoice({
  onModelLoadProgress: (p) => console.log(p),
});
voice.addCommand('hello', () => voice.speak('Hello'));

export function App() {
  return (
    <VoiceKitProvider voice={voice} theme="glassDark" persistKey="my-app-voice-kit">
      <YourApp />
      <VoiceDock placement="bottom-right" />
      <VoiceHUD />
      <VoiceCommandPalette hotkey="mod+k" />
    </VoiceKitProvider>
  );
}
```

Full playground:

```jsx
import { VoiceKitProvider, VoiceKitWorkbench } from 'jsvoice/react/kit';

<VoiceKitProvider voice={voice} theme="neon">
  <VoiceKitWorkbench />
</VoiceKitProvider>
```

---

## Themes

Built-in:

- `defaultDark` / `defaultLight`
- `glassDark` / `glassLight`
- `neon`
- `minimal`
- `highContrast`

Also accepts legacy aliases: `dark`, `light`, `glass`, `cyberpunk`, `premium_dark_orange`.

```js
import { createVoiceTheme } from 'jsvoice/ui-kit';

const theme = createVoiceTheme({
  name: 'brand',
  base: 'glassDark',
  tokens: {
    primary: '#7c3aed',
    surfaceGlass: 'rgba(255,255,255,0.08)',
  },
});
```

CSS variables use the `--jsv-*` prefix (e.g. `--jsv-primary`).  
Legacy `--jv-*` aliases are emitted for existing kit components.

Override in app CSS:

```css
.my-app {
  --jsv-primary: #7c3aed;
}
```

---

## Core components

| Component | Purpose |
|-----------|---------|
| `VoiceOrb` | Animated status orb (toggle / long-press PTT) |
| `VoiceDock` | Floating control dock |
| `VoiceHUD` | Live status + transcript HUD |
| `VoiceCommandPalette` | ⌘K command search & run |
| `VoiceTranscript` | Transcript log, pin, export |
| `VoicePermissionCard` | Mic / secure context / API guidance |
| `VoiceEngineSwitcher` | Engine status display |
| `VoiceScopeSwitcher` | Command scope selector |
| `PushToTalkButton` / `HoldToSpeakButton` | Hold-to-speak |
| `VoiceWaveform` / `VoiceAmplitudeMeter` | Visual feedback |
| `VoiceDebugPanel` | Timeline, traces, snapshot, replay |
| `VoiceOnboarding` | Permissions + support wizard |
| `CommandCenter` | Browse / build / test commands |
| `RuleBuilder` | Structured voice rules UI |
| `WidgetPanel` / `WidgetCanvas` | Voice widget workspace |
| `PluginCenter` | Plugin metadata UI |
| `VoiceModeOverlay` | Full voice-mode layer |

Primitives: `VoiceButton`, `VoiceCard`, `VoiceInput`, `VoiceSelect`, `VoiceTabs`, `VoiceModal`, `VoiceDrawer`, `VoiceTable`, empty/error/loading states, toasts, confirm dialog.

---

## Hooks

```js
useVoiceKit()
useVoiceKitStore(selector)
useVoiceCommands()
useVoiceTranscript({ maxItems, query })
useVoiceTheme()
useVoiceDebug()
useVoicePermissions()
useVoicePlugins()
useVoiceWidgets()
useVoiceRules()
useVoiceUi()
```

---

## Provider options

```jsx
<VoiceKitProvider
  voice={voice}
  theme="glassDark"
  debug
  initialOpen={false}
  persistKey="my-app-voice-kit"
  plugins={[]}
  commandGroups={['navigation', 'forms']}
>
  {children}
</VoiceKitProvider>
```

Persists **UI preferences only** (theme, dock, placement, debug open).  
Does **not** persist raw audio or transcripts by default.

---

## Demo

Next demo app:

```bash
cd demo-app
npm run dev
```

Open:

- `/ui/hyper` — Hyper Voice UI Kit workbench  
- `/ui` — classic command center  
- `/ui/kit` — widget playground  

---

## Architecture notes

- Existing `uikitStore` + `VoiceUIController` preserved and extended.
- New actions: `VoiceKitActions` (palette, debug, transcript log, toasts, structured rules).
- React components live under `src/react/kit`.
- Theme/utils/store under `src/ui-kit`.
- SSR-safe: browser APIs guarded; no mic stream leaks from permission probes (tracks stopped).
- Keyboard: palette arrows/enter/esc; orb/buttons focusable; dialogs close on Escape.

---

## Tests

```bash
npm test -- test/ui-kit/hyper-kit.test.js
npm test
npm run build
```

---

## Limitations / follow-ups

- Engine **switcher UI** reflects status; swapping live engine instances still done via `createVoice` / injected engines.
- Plugin center tracks **UI enablement metadata**; load real plugins with `voice.use(Plugin)`.
- Session replay is **text/command** replay (not audio).
- Optional drag-to-reposition dock can be added later.
- Visual regression snapshots not included yet.

# Settings

```jsx
import { VoiceSettingsPanel, VoiceSettingsDrawer } from 'jsvoice/react/kit';
```

Tabs: general, mic, engine, theme, commands, plugins, privacy, debug, accessibility, persistence.

**Engine note:** `createVoice()` defaults to **local Whisper tiny** (`engineMode: 'local'`). Settings UI may show the active engine name; switching modes is done in host code via `createVoice({ engineMode: 'native' | 'local' | 'auto' })`. Model download progress can be shown with `VoiceModelLoadCard` / `onModelLoadProgress`. See [LOCAL_BROWSER_WHISPER.md](LOCAL_BROWSER_WHISPER.md).

Persistence via `VoiceKitProvider persistKey` stores **UI prefs only** (theme, dock, density, etc.), never raw audio. Transcript persistence in sessions is **opt-in**.

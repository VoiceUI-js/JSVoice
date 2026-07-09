# Settings

```jsx
import { VoiceSettingsPanel, VoiceSettingsDrawer } from 'jsvoice/react/kit';
```

Tabs: general, mic, engine, theme, commands, plugins, privacy, debug, accessibility, persistence.

Persistence via `VoiceKitProvider persistKey` stores **UI prefs only** (theme, dock, density, etc.), never raw audio. Transcript persistence in sessions is **opt-in**.

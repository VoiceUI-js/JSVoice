# Kit command packs

```js
import { installKitCommandPacks, VoiceSettingsCommandPack } from 'jsvoice/packs/kit';
// or from 'jsvoice/react/kit'
```

```jsx
<VoiceKitProvider voice={voice} enableKitCommands commandPacks={['settings', 'debug', 'kit']} />
```

Packs are **not** auto-installed unless `enableKitCommands` or `commandPacks` is set.

## Packs

| Pack | Examples |
|------|----------|
| `kit` | open/close palette, start/stop listening, mute |
| `settings` | open settings, switch themes, high contrast |
| `debug` | open debug, clear transcript, save session |
| `widgets` | create widget/metric, undo |
| `workflow` | create workflow, open builder |
| `a11y` | help, reduced motion, voice mode |

## Manual install

```js
VoiceSettingsCommandPack.install(voice);
installKitCommandPacks(voice, true); // all
```

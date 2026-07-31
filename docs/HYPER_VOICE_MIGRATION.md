# Migration

## Default speech engine (createVoice)

| Before | After |
|--------|--------|
| `createVoice()` preferred **Native** Web Speech | `createVoice()` defaults to **local Whisper tiny** (`engineMode: 'local'`) |
| Local was opt-in | Local is default; install peer `@xenova/transformers` |
| Firefox needed special hybrid fallback | Firefox works on the default local path |

**Restore previous Native-first preference:**

```js
createVoice({ engineMode: 'native' })
```

**Docs:** [LOCAL_BROWSER_WHISPER.md](LOCAL_BROWSER_WHISPER.md) · [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md)

### Kit UI additions

- `VoiceModelLoadCard` — first-load model progress  
- `VoiceTransformersMissingCard` — missing `@xenova/transformers` peer  

---

## Hyper Kit Phase 1 → Phase 2

## Safe upgrades

- Existing imports from `jsvoice/react/kit` still work.
- `kitStore`, `useKitState`, `KitActions`, classic components preserved.
- `jsvoice/react/kit/store` remains available.
- `uikitStore` / `VoiceUIController` APIs preserved; new fields are additive.

## New optional props

```jsx
<VoiceKitProvider
  enableKitCommands
  commandPacks={['settings', 'debug', 'kit']}
/>
```

## Breaking changes

None intended. If you imported `useUiKitState` from `jsvoice/ui-kit/core/store`, use:

```js
import { useUiKitState } from 'jsvoice/ui-kit/core/useUiKitState';
// or from 'jsvoice/react/kit'
```

## React peer

React remains optional for core `jsvoice` / `jsvoice/ui-kit` logic. Required only for React kit UI.

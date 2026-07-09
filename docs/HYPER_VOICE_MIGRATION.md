# Migration (Phase 1 → Phase 2)

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

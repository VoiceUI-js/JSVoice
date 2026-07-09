# Theming

```js
import { createVoiceTheme, builtInThemes, themeNames } from 'jsvoice/ui-kit';

const theme = createVoiceTheme({
  name: 'brand',
  base: 'glassDark',
  tokens: { primary: '#7c3aed', blurMd: '14px' },
});
```

```jsx
<VoiceKitProvider theme="neon" />
// or theme={theme}
```

## Built-in themes

`defaultDark`, `defaultLight`, `glassDark`, `glassLight`, `neon`, `minimal`, `highContrast`

Aliases: `dark`, `light`, `glass`, `cyberpunk`, `premium_dark_orange`

## Tokens (selected)

Colors, spacing, radius, shadows, typography, motion, z-index, plus Phase 2:

`--jsv-blur-*`, `--jsv-glow-primary`, `--jsv-overlay`, `--jsv-status-listening`, etc.

Legacy `--jv-*` aliases still emitted.

## Density

`comfortable` | `compact` | `spacious` via settings / `VoiceKitActions.setDensity`.

## CSS override

```css
.my-app {
  --jsv-primary: #7c3aed;
}
```

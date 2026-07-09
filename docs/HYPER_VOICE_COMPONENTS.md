# Hyper Voice UI Kit — Components

## Import

```js
import {
  VoiceDock,
  VoiceOrb,
  VoiceCommandPalette,
  VoiceAssistantPanel,
  VoiceWidgetDashboard,
  VoiceWorkflowBuilder,
  VoiceDevTools,
  VoiceSettingsPanel,
  VoiceAnalyticsDashboard,
} from 'jsvoice/react/kit';
```

Subpaths:

```js
import { VoiceWidgetDashboard } from 'jsvoice/react/kit/widgets';
import { VoiceWorkflowBuilder } from 'jsvoice/react/kit/workflows';
import { VoiceDevTools } from 'jsvoice/react/kit/debug';
import { VoiceAssistantPanel } from 'jsvoice/react/kit/assistant';
```

## Categories

### Controls
`VoiceFloatingButton`, `VoiceMiniDock`, `VoiceFullDock`, `VoiceControlBar`, `VoiceStatusPill`, `VoiceStatusRing`, indicators, mic/mute/stop/restart/wake, volume/speed/language/engine/scope selects, compact/mobile controls.

### Assistant
`VoiceAssistantLayout`, `VoiceAssistantPanel`, chat, composer, suggestions, memory/context panels, cards.

### Commands
`VoiceCommandGrid`, cards, favorites, history, details, import/export, confidence meter.

### Transcript
`VoiceTranscriptPanel`, feed, filters, export, privacy notice, timeline, inspector.

### Debug
`VoiceDevTools`, snapshot, traces, permissions, latency, log export, circuit breaker panel.

### Plugins
`VoicePluginMarketplace`, grid, details, settings, health, compatibility.

### Workflows
`VoiceWorkflowBuilder`, canvas, nodes, edges, toolbar, run panel.

### Widgets
`VoiceWidgetDashboard`, built-in metric/text/list/status/… widgets, library, inspector.

### Voice mode
Scanner, number tags, safe click confirm, region map, reading panel.

### Accessibility
`VoiceA11yPanel`, checklist, keyboard help, reduced motion / high contrast toggles.

### Settings
`VoiceSettingsPanel` / drawer / modal + section panels.

### Analytics
Dashboard, usage charts (SVG/CSS bars), export (non-sensitive).

### Layouts & templates
Shells + `VoiceDashboardTemplate`, `VoiceAssistantTemplate`, `VoiceDebugLabTemplate`, etc.

## Accessibility notes

- Icon-only controls include `aria-label`
- Palette: arrows, Enter, Esc
- Modals/drawers: Escape close + focus
- Live regions for status / last command
- `prefers-reduced-motion` CSS overrides

## SSR

Do not call mic/speech APIs at module top level. Components guard browser APIs. Prefer mounting kit under client components in Next.js (`'use client'`).

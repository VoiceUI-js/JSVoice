# DevTools

```jsx
import { VoiceDevTools, VoiceDebugReportButton } from 'jsvoice/react/kit';

<VoiceDevTools />
```

Panels: snapshot, UI state, timeline, command trace, errors, engine + permission diagnostics, latency/perf, log search/export, session replay.

Export:

```js
VoiceKitActions.exportDebugReport();
```

Does not include raw audio. Transcripts only appear in session export when privacy opt-in is enabled.

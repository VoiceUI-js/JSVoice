# Analytics

In-memory by default:

- recognized / not recognized / failed
- top commands
- latency samples
- engine usage
- unrecognized phrases (short list)

```jsx
import { VoiceAnalyticsDashboard } from 'jsvoice/react/kit';
```

```js
VoiceKitActions.trackAnalytics({ type: 'recognized', phrase: 'go back', latency: 32 });
VoiceKitActions.resetAnalytics();
```

No chart library — CSS bar visualizations only.

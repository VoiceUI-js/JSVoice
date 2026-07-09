# Workflows

```jsx
import { VoiceWorkflowBuilder } from 'jsvoice/react/kit';
```

Node types: `trigger`, `command`, `speak`, `action`, `condition`, `delay`, `end`.

Simple CSS/SVG canvas — no external diagram library.

```js
VoiceKitActions.createWorkflow({ name: 'Morning' });
VoiceKitActions.addWorkflowNode(id, { type: 'speak', label: 'Hello' });
```

Execution is simulated in UI; wire app callbacks for production runs.

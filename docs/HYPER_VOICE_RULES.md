# Rules

```jsx
import { RuleBuilder } from 'jsvoice/react/kit';
```

```js
VoiceKitActions.addStructuredRule({
  description: 'Greet on hello',
  condition: { type: 'command', value: 'hello kit' },
  action: { type: 'speak', value: 'Hi' },
});

VoiceKitActions.detectRuleConflicts();
```

Expanded condition/action types live in `RULE_CONDITION_TYPES` / `RULE_ACTION_TYPES`.

# Plugins UI

```jsx
import { VoicePluginMarketplace } from 'jsvoice/react/kit';
```

Supports:

- Legacy function plugins
- Rich metadata objects (`name`, `version`, `description`, `category`, `commands`, `settings`, `permissions`, `install`)

Marketplace tracks enablement in UI state. Real loading still uses:

```js
voice.use(MyPlugin);
```

Recommended catalog is shown when no custom `pluginCatalog` is set on the store.

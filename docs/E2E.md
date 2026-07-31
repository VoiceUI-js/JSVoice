# Playwright E2E

Harness: `e2e/harness.html` (**FakeSpeechEngine** + JSVoice core).

The harness injects a fake engine so CI does **not** download Whisper weights.  
Unit tests cover default `createVoice({ engineMode: 'local' })` with a mocked worker.

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

CI runs the same suite after `npm run build` is optional (harness loads `/src/JSVoice.js`).

Scenarios:

- list commands  
- start / stop / toggle  
- simulate recognized + unknown  
- `processText`  
- keyboard focus on control  

Config: `playwright.config.js` (serves repo root on port 4173).

**Real browser Whisper** is validated manually (Chrome + Firefox) after installing `@xenova/transformers`. See [LOCAL_BROWSER_WHISPER.md](LOCAL_BROWSER_WHISPER.md).

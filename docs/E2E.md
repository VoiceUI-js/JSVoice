# Playwright E2E

Harness: `e2e/harness.html` (FakeSpeechEngine + JSVoice core).

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

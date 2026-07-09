# JSVoice Project Audit Report

| Field | Value |
|-------|--------|
| **Project** | JSVoice (`jsvoice`) |
| **Version audited** | 1.1.0 |
| **Audit date** | 2026-07-09 |
| **Remediation update** | 2026-07-09 — P0 fixes applied (see §18) |
| **Auditor** | Automated architecture / product audit |
| **Scope** | Core library, engines, plugins, packs, React kit, Hyper UI kit, demo app, tests, docs, packaging |
| **Overall score (initial)** | **72 / 100** |
| **Overall score (post-fix)** | **~84 / 100** (tests green; public API; security doc; docs refresh) |

---

## 1. Executive summary

JSVoice is an ambitious **browser voice-command SDK** with a rare open-source combination: hybrid speech engines, command packs/plugins, and a large **Hyper Voice UI Kit** (dock, palette, assistant, devtools, workflows, widgets).

**Verdict:** Architecture and feature breadth are **above average** for open-source voice libs. Production readiness is held back by **failing core integration tests**, **docs/version drift**, **source-first package exports for React kit**, and **uneven depth** (some Phase 2 UIs are preview-quality).

| Area | Score | Grade |
|------|------:|-------|
| Architecture & modularity | 85 | A− |
| Feature completeness (core) | 82 | B+ |
| Hyper UI kit breadth | 88 | A− |
| Hyper UI kit depth / polish | 68 | C+ |
| TypeScript / packaging | 62 | C |
| Test reliability | 55 | D+ |
| Documentation accuracy | 70 | C+ |
| Accessibility intent | 78 | B+ |
| Security / privacy posture | 74 | B |
| DX / onboarding clarity | 65 | C |
| Competitive readiness | 70 | C+ |
| **Overall** | **72** | **B−** |

---

## 2. Audit method

1. Repository structure and `package.json` exports review  
2. Core modules, engines, React/UI-kit surface review  
3. Live command: `npm test` (full suite)  
4. Live command: `npm run build` (Rollup)  
5. Cross-check vs prior competitive/improvement analysis and market practices (Web Speech, annyang, Picovoice, Alan-style SDKs, WCAG speech a11y)

### 2.1 Quantitative snapshot (audit day)

| Metric | Value |
|--------|------:|
| Source modules (`src/**/*.{js,ts,d.ts}`) | ~108 |
| Jest test suites | 9 |
| Tests passed | **47** |
| Tests failed | **28** |
| Pass rate | **~63%** |
| Build (`npm run build`) | **PASS** |
| Core claim: zero runtime deps | **True** for core path |
| React peer | Optional (kit requires React) |

---

## 3. Architecture audit

### 3.1 Strengths

| Finding | Evidence | Severity |
|---------|----------|----------|
| Clear layering: engines → recognition → commands → UI | `src/engines`, `modules`, `react`, `ui-kit` | Positive |
| Pluggable engines + hybrid fallback | `HybridSpeechEngine`, Native / local | Positive |
| Plugin + pack model | `src/plugins`, `src/packs` | Positive |
| Framework-agnostic store + React surface split | `ui-kit/core` vs `react/kit` | Positive |
| Tree-shakeable subpath exports | `package.json` `exports` map | Positive |
| SSR-aware patterns in kit (guarded browser APIs) | `domSafe.js`, provider effects | Positive |
| Privacy defaults for kit transcripts | No transcript persist by default | Positive |

### 3.2 Issues

| ID | Finding | Severity | Notes |
|----|---------|----------|-------|
| A-01 | UI kit reaches into private `voice._commandManager` | **High** | Breaks encapsulation; blocks safe refactors |
| A-02 | Many `exports.import` point at raw `src/` not built artifacts | **High** | Peer/React resolution and bundler variance risk |
| A-03 | Single package ships core + full kit | **Medium** | Bundle messaging and install confusion |
| A-04 | Rollup only builds `src/index.js` main entry | **Medium** | Kit/React not part of dual CJS/ESM build matrix |
| A-05 | Mixed default + named exports warning on build | **Low** | Rollup warning; CJS interop footgun |

---

## 4. Quality & reliability audit

### 4.1 Tests

| Suite group | Status | Notes |
|-------------|--------|-------|
| `test/ui-kit/*` (widgets, hyper-kit, phase2) | **PASS** | Solid foundation for store/actions/theme |
| `test/modules/*` | **PASS** | CommandManager, RecognitionManager partial |
| `test/JSVoice.integration.test.js` | **FAIL** (majority) | jsdom ≠ Web Speech; getters/API expectations |
| `test/VoiceUI.test.js` | **FAIL** (majority) | Needs real browser or FakeSpeechEngine redesign |

**Root cause (known):** Web Speech / mic APIs are not fully available under Jest jsdom (`docs/WHY_TESTS_FAIL.md`). That is valid environmentally, but **CI remains red**, which is a trust failure.

| ID | Finding | Severity |
|----|---------|----------|
| Q-01 | ~37% of tests fail on full suite | **Critical** |
| Q-02 | No Playwright/browser E2E in CI | **High** |
| Q-03 | No coverage gate on core command matching | **Medium** |
| Q-04 | Force-exit Jest (open handles) | **Medium** |
| Q-05 | ESLint reports thousands of issues when run repo-wide | **Medium** |

### 4.2 Build

| Check | Result |
|-------|--------|
| Rollup CJS/ESM/UMD | PASS |
| Named/default export mix | Warning only |

---

## 5. Product & feature audit

### 5.1 Core library

| Capability | Status | Audit note |
|------------|--------|------------|
| Speech recognition | Present | Native + hybrid path |
| TTS | Present | Browser synthesis |
| Exact + pattern commands | Present | Typed entities supported |
| Wake word | Present | **Transcript-based**, not on-device KWS |
| Built-in DOM actions | Present | Scroll, click, fill, read, dark mode, etc. |
| Circuit breaker | Present | Engine resilience |
| TypeScript types | Partial | Not full TS-first SDK |

### 5.2 Hyper UI kit

| Area | Status | Depth |
|------|--------|-------|
| Dock / Orb / HUD / Palette | Production-intent | Good |
| Transcript / settings / a11y panels | Production-intent | Good |
| Assistant UI | Present | Medium |
| DevTools | Present | Good for debug; metrics local |
| Workflow builder | Present | **Preview** (simulate run) |
| Plugin marketplace | Present | **Metadata UI**, not true install runtime |
| Analytics | Present | In-memory only (OK if labeled) |
| Templates | Present | Demo-ready |

| ID | Finding | Severity |
|----|---------|----------|
| P-01 | Phase 2 surface area ≫ verified depth | **High** |
| P-02 | Workflow/plugin “enterprise” wording oversells maturity | **Medium** |
| P-03 | Wake word not competitive with Picovoice-class engines | **Medium** |

---

## 6. Documentation & messaging audit

| ID | Finding | Severity |
|----|---------|----------|
| D-01 | Package version `1.1.0` vs README “v2.4” style claims | **High** |
| D-02 | Bundle size / “zero deps” claims not split by entrypoint | **High** |
| D-03 | `COMPETITIVE_ANALYSIS.md` outdated (plugins marked planned) | **Medium** |
| D-04 | Hyper kit docs plentiful; **single golden path** weak | **Medium** |
| D-05 | Privacy data-flow (Native vs local) not front-and-center | **Medium** |

**Positive:** Extensive `docs/HYPER_VOICE_*.md` set, migration notes, QA harness docs.

---

## 7. Security & privacy audit

| Topic | Assessment |
|-------|------------|
| Mic stream lifecycle | Generally careful (permission probes stop tracks) |
| Transcript persistence | Opt-in; good default |
| Secrets in repo | Not reviewed as secret-scan; no keys found in sampled paths |
| XSS via voice→DOM | Built-in actions that click/fill/read need **host-app allowlists** (not fully documented) |
| Dependency risk | Core zero runtime deps — **strong** |
| Local ASR (Transformers) | Heavy optional path; model download / worker considerations |

| ID | Finding | Severity |
|----|---------|----------|
| S-01 | No formal threat model for voice→DOM automation | **High** |
| S-02 | Dangerous voice-mode clicks need confirm (partially addressed) | **Medium** |
| S-03 | No CSP / iframe embedding guidance | **Low** |

---

## 8. Accessibility audit

| Topic | Assessment |
|-------|------------|
| Keyboard palette navigation | Designed in |
| aria-labels on icon controls | Mostly present in kit |
| Reduced motion / high contrast | Theme support |
| Live regions | Present |
| WCAG verification suite | **Missing** (no axe/Playwright a11y CI) |
| Host-app Label-in-Name guidance | Weak (needed for Dragon/Voice Control coexistence) |

| ID | Finding | Severity |
|----|---------|----------|
| X-01 | A11y claims not CI-proven | **Medium** |
| X-02 | Host-page speech a11y guide incomplete | **Medium** |

---

## 9. Competitive position (brief)

| Competitor | They win on | JSVoice wins on |
|------------|-------------|-----------------|
| **annyang** | Size, simplicity, brand | Actions, hybrid engines, UI kit |
| **Picovoice** | On-device wake/STT accuracy | Open MIT, free core, product UI |
| **Alan AI** | Cloud NLU, multi-platform assistant | Offline-capable path, developer control plane |

**Position to defend:** open browser-first **command runtime + control plane**, not “tiny annyang” and not “full Alan.”

---

## 10. Risk register

| Risk | Likelihood | Impact | Score | Mitigation |
|------|------------|--------|-------|------------|
| Consumers distrust red CI | High | High | **Critical** | Fake-engine test tier + E2E |
| Internal API breakage (`_commandManager`) | Medium | High | **High** | Public `listCommands` / `processText` |
| Bundle/install issues with kit | Medium | High | **High** | Build kit to dist + peer React |
| Overpromise Phase 2 features | Medium | Medium | **Medium** | “Preview” badges + roadmap honesty |
| Wake word demos fail in noisy rooms | High | Medium | **Medium** | Optional Porcupine peer adapter |
| Voice→DOM abuse / unexpected clicks | Low–Med | High | **High** | Allowlists + confirm destructive |

---

## 11. Findings summary by priority

### Critical

1. **Q-01** — Full test suite ~63% pass; integration suite unreliable in CI  
2. **S-01** — Voice-driven DOM actions need security model for production hosts  

### High

3. **A-01** — Private core API usage from UI  
4. **A-02 / A-04** — Packaging/build incomplete for kit  
5. **D-01 / D-02** — Version and size messaging drift  
6. **P-01** — Kit breadth without equal verification  

### Medium

7. Outdated competitive docs  
8. Wake word quality gap  
9. Lint hygiene / open handles  
10. Missing Storybook / Playwright / a11y automation  

### Low

11. Rollup named/default export warning  
12. CSP guidance  

---

## 12. Recommended remediation plan

### P0 — This week (trust)

| # | Action | Owner focus | Done when |
|---|--------|-------------|-----------|
| 1 | Split tests: unit (always green) vs browser (Playwright or skip) | QA | `npm test` green for default script |
| 2 | Inject FakeSpeechEngine in remaining core tests | Core | Integration tests pass in jsdom |
| 3 | Fix README version, sizes, 3 install paths | Docs | No contradictory claims |
| 4 | Add `voice.listCommands()` / `voice.processText()` | Core | UI kit stops using `_commandManager` |

### P1 — This month (ship quality)

| # | Action | Done when |
|---|--------|-----------|
| 5 | Build React kit to `dist` with types | Clean consumer imports |
| 6 | Playwright: palette, dock, fake transcript | 5+ E2E green in CI |
| 7 | Privacy + voice→DOM security doc | Linked from README |
| 8 | Mark preview features in UI/docs | Workflow/plugin honesty |
| 9 | Refresh competitive analysis | Matches v1.1 features |

### P2 — This quarter (product)

| # | Action |
|---|--------|
| 10 | Storybook for flagship components |
| 11 | Optional on-device wake adapter |
| 12 | Package split or formal monorepo boundaries |
| 13 | Workflow runner v1 (non-simulate) |
| 14 | Public playground + migrate-from-annyang |

---

## 13. Scorecard detail

| Criterion | Weight | Score | Weighted |
|-----------|-------:|------:|---------:|
| Architecture | 15% | 85 | 12.8 |
| Core features | 15% | 82 | 12.3 |
| UI kit product | 15% | 75 | 11.3 |
| Testing | 15% | 55 | 8.3 |
| Packaging/TS | 10% | 62 | 6.2 |
| Docs/messaging | 10% | 70 | 7.0 |
| Security/privacy | 10% | 74 | 7.4 |
| A11y | 5% | 78 | 3.9 |
| DX onboarding | 5% | 65 | 3.3 |
| **Total** | 100% | | **~72.5** |

---

## 14. Compliance checklist

| Check | Status |
|-------|--------|
| MIT license present | ✅ |
| README exists | ✅ |
| Build succeeds | ✅ |
| Default test suite fully green | ❌ |
| Types for all public exports | ⚠️ Partial |
| SSR-safe browser access | ⚠️ Mostly |
| No default transcript persistence | ✅ |
| Documented security model for DOM actions | ❌ |
| CI browser E2E | ❌ |
| Accurate competitive docs | ❌ |

---

## 15. Conclusion

JSVoice is a **B− product with A-tier ambition**. The codebase shows serious systems thinking (engines, circuit breaker, packs, Hyper kit). To reach **production-recommended** status for external teams:

1. Make **default CI green**.  
2. Seal the **public API**.  
3. **Ship honest packaging** and messaging.  
4. Finish or clearly label **preview** kit modules.  
5. Publish **security + privacy** guidance for voice→DOM.

Re-audit recommended after P0+P1 (target score **≥ 85**).

---

## 16. Appendix — Commands run

```bash
npm test -- --no-coverage
# Result: 2 failed suites, 7 passed; 28 failed tests, 47 passed

npm run build
# Result: success (with named/default export warning)
```

## 17. Related documents

- `docs/WHY_TESTS_FAIL.md`  
- `docs/COMPETITIVE_ANALYSIS.md` (needs refresh)  
- `docs/HYPER_VOICE_UI_KIT.md` and related Hyper docs  
- Improvement plan discussion (2026-07-09 session)

---

## 18. Remediation log (2026-07-09)

| Finding | Fix |
|---------|-----|
| Q-01 Red CI | FakeSpeechEngine test harness; rewrote VoiceUI + integration tests — **78/78 pass** |
| A-01 Private manager | Public `listCommands`, `processText`, `getEngineInfo`, `listScopes`, `currentScope`; kit/plugins updated |
| Built-in DOM actions not wired | Re-enabled `handleBuiltInActions` in `_handleSpeechResult` |
| Validation / getters | Invalid addCommand/setOption/speak → `onError`; instance `isApiSupported`, wake/await getters |
| Mic manager crash | Defensive track handling + `reset()` for tests |
| S-01 Security model | `docs/SECURITY_AND_PRIVACY.md` |
| D-01/D-02 Messaging | README three paths + version honesty |
| Competitive docs | `docs/COMPETITIVE_ANALYSIS.md` refreshed |
| Preview honesty | Workflow + plugin marketplace banners |
| Types | `src/index.d.ts` updated for public API |

### Remaining (P1+) — addressed 2026-07-09

- ✅ Multi-entry Rollup: core, ui-kit, react, react/kit, Porcupine adapter → `dist/`  
- ✅ Playwright E2E (`e2e/`, `npm run test:e2e`)  
- ✅ Optional Porcupine wake adapter (`jsvoice/engines/porcupine-wake`)  
- ✅ Storybook flagship stories (`npm run storybook`)

*End of audit report.*

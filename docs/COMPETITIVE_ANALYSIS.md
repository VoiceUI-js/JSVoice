# JSVoice — Competitive Analysis (Updated)

**Analysis Date:** 2026-07-09  
**Package version:** 1.1.0  

Comparing: **JSVoice** vs **annyang** vs **Picovoice (web)** vs **Alan AI** vs raw **Web Speech API**.

---

## Positioning

| Product | Positioning |
|---------|-------------|
| **JSVoice** | Open MIT **command runtime + Hybrid engines + Hyper Voice UI Kit** |
| **annyang** | Tiny (~2KB) command helper on Web Speech |
| **Picovoice** | On-device wake word / STT (WASM), multi-browser, commercial licensing |
| **Alan AI** | Cloud conversational assistant SDK |
| **Web Speech API** | Browser native STT/TTS platform |

---

## Feature matrix

| Feature | JSVoice | annyang | Picovoice | Alan AI | Raw API |
|---------|:-------:|:-------:|:---------:|:-------:|:-------:|
| Voice recognition | ✅ | ✅ | ✅ | ✅ | ✅ |
| Speech synthesis | ✅ | ❌ | ✅ (Orca) | ✅ | ✅ |
| Custom commands | ✅ | ✅ | Intent SDK | Scripts | Manual |
| Pattern / entities | ✅ | ✅ | Rhino | NLU | ❌ |
| Wake word | ✅ transcript* | ❌ | ✅ Porcupine | ✅ | ❌ |
| Hybrid / local fallback | ✅ | ❌ | On-device native | Cloud | ❌ |
| Built-in DOM actions | ✅ | ❌ | ❌ | App-specific | ❌ |
| Plugin system | ✅ | ❌ | Modules | Platform | N/A |
| React UI kit | ✅ Hyper | ❌ | React bindings | Widget | ❌ |
| Command palette / debug | ✅ | ❌ | Console | Studio | ❌ |
| Zero runtime deps (core) | ✅ | ✅ | WASM pkgs | Client SDK | N/A |
| MIT open core | ✅ | ✅ | Apache/commercial | Proprietary | Spec |

\*JSVoice wake word is **phrase-in-transcript** detection, not dedicated on-device KWS like Porcupine.

---

## Where JSVoice wins

1. **Product surface** — dock, palette, assistant, devtools, settings, analytics UI  
2. **Hybrid engine story** for unsupported browsers  
3. **Built-in accessibility-oriented DOM actions** + packs  
4. **Open MIT**, no account required for core path  
5. **Developer control plane** (processText, listCommands, FakeSpeechEngine tests)

## Where others win

| Competitor | Advantage | JSVoice response |
|------------|-----------|------------------|
| annyang | Extreme simplicity & brand | Keep core 5-line path front and center |
| Picovoice | Wake accuracy, privacy, browsers | Optional peer adapter; document limits |
| Alan | Full conversational NLU | Stay command/control focused; don’t fake NLU |

---

## Bundle messaging (honest)

| Entry | Notes |
|-------|--------|
| `jsvoice` core (`dist/voice-ui.*.js`) | Rollup build; measure with bundlephobia / source-map explorer |
| `jsvoice/react` | Requires React peer |
| `jsvoice/react/kit` | Large UI surface; import only what you need |

Do **not** claim a single “32KB for everything including kit” figure.

---

## Strategic recommendation

Own: **“Open browser voice command platform + premium control plane.”**  
Do not claim parity with Porcupine wake or Alan NLU unless adapters land.

See also: `docs/AUDIT_REPORT.md`, `docs/SECURITY_AND_PRIVACY.md`.

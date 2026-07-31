# Security & Privacy Guide

**Audience:** teams enabling JSVoice built-in DOM actions or Hyper Voice Mode in production apps.

> **Lead:** Default STT is **on-device Whisper** (audio stays on device; model may download once).  
> Native Web Speech (`engineMode: 'native'`) may send audio to the browser vendor.  
> Implementers: [AI_IMPLEMENTATION.md](./AI_IMPLEMENTATION.md) § security · [AGENTS.md](../AGENTS.md).

---

## Data flow summary

| Mode | Audio leaves the device? | Notes |
|------|--------------------------|--------|
| **Local / Transformers (default)** | **No** (on-device Whisper tiny) | First load downloads model weights (~30MB); audio is processed in a Worker. See [LOCAL_BROWSER_WHISPER.md](./LOCAL_BROWSER_WHISPER.md). |
| **Native Web Speech** | **Often yes** (browser / OS speech service) | Opt-in via `engineMode: 'native'`. Chrome/Edge typically use cloud-backed recognition. |
| **Hybrid `auto`** | Local first; Native only if local fails | Prefer pure `local` for guaranteed on-device. |
| **Server Whisper API** | **Yes** (your proxy / provider) | Separate engine: `jsvoice/engines/whisper`. |
| **Kit transcripts** | Not persisted by default | Opt-in only via settings / session export flags. |
| **Raw microphone audio** | Never stored by the kit | Permission probes stop tracks after check. |

### CSP (local model)

- Allow WASM as required by Transformers.js.
- Allow `connect-src` to your model host (Hugging Face or self-hosted).
- Restrict `worker-src` to your origin.
- Leave `localOptions.allowCdnFallback` **false** unless CDN + CSP are intentional.

---

## Voice → DOM automation risk

Built-in actions can **click**, **fill inputs**, **scroll**, **open tabs**, and more based on speech.

### Threats

1. Accidental destructive actions (delete, submit, purchase).  
2. Malicious page content crafting labels that voice matches.  
3. Over-broad “click X” matching the wrong control.

### Required host-app controls

1. **Allowlist critical pages** — only enable built-in actions where needed.  
2. **Prefer explicit `data-voice-*` attributes** on targets.  
3. **Confirm destructive actions** — kit voice-mode already flags dangerous labels; host apps should still gate payment/delete/logout.  
4. **Do not run untrusted third-party scripts** that rewrite labels while voice is active.  
5. **Scope commands** — use `setScope()` so admin-only phrases are inactive in public views.

### Recommended production pattern

```js
const voice = createVoice({
  // Avoid automatic broad DOM actions in sensitive flows
});

// Prefer explicit commands over free-form “click …”
voice.addCommand('submit order', () => {
  // your guarded business logic + confirm UI
});

// Optional: only process trusted phrases
voice.addCommand('scroll down', () => window.scrollBy(0, 400));
```

For Hyper Voice Mode number tags:

- Scan → number targets → **confirm** before dangerous clicks (`resolveSafeClick`).  
- Never auto-confirm delete/submit/purchase.

---

## Microphone lifecycle

- Use shared `microphoneManager` ref-counting.  
- Always release owners on unmount.  
- Permission probes must **stop tracks** (kit/UI permission helpers do this).  
- Do not log raw audio buffers.

---

## Persistence policy

| Data | Default | Opt-in |
|------|---------|--------|
| UI prefs (theme, dock) | Optional via `persistKey` | Yes |
| Transcript log | Memory only | Explicit `transcriptPersist` for sessions |
| Analytics | In-memory counters | Export JSON manually |
| Session replay | Event/text traces | No audio |

---

## Secure context

Microphone APIs require **HTTPS or localhost**. Insecure contexts will fail — show `VoiceInsecureContextCard` / recovery panel.

---

## Reporting issues

If you find a security issue in JSVoice, open a private security advisory on the GitHub repository (or contact maintainers) rather than a public issue with exploit details.

---

## Checklist before production

- [ ] Document engines for privacy reviewers (default = local Whisper; note if `engineMode: 'native'`)  
- [ ] Install `@xenova/transformers` for default path; document first-load model download (~30MB)  

- [ ] Disable or scope built-in DOM actions on checkout/admin  
- [ ] Confirm destructive voice actions  
- [ ] No transcript persistence unless required and disclosed  
- [ ] CSP compatible (no eval; models loaded from trusted origins if local ASR)  
- [ ] Automated tests with FakeSpeechEngine in CI  

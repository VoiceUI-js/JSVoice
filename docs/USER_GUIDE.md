# JSVoice — User Guide

**For:** product users, designers, QA, accessibility specialists, and anyone using a **voice-enabled app** built with JSVoice (not writing code).

**Version:** 1.1.0  
**Related:** [Full developer docs](../DOCUMENTATION.md) · [API reference](API_REFERENCE.md)

---

## Table of Contents

1. [What is this?](#1-what-is-this)
2. [What you need](#2-what-you-need)
3. [Using voice controls](#3-using-voice-controls)
4. [Common screens & panels](#4-common-screens--panels)
5. [Typical tasks](#5-typical-tasks)
6. [Tips for better recognition](#6-tips-for-better-recognition)
7. [Privacy & safety](#7-privacy--safety)
8. [Troubleshooting](#8-troubleshooting)
9. [Getting help](#9-getting-help)
10. [Glossary](#10-glossary)

---

## 1. What is this?

**JSVoice** lets websites and web apps respond to **spoken commands** and sometimes **talk back** (text-to-speech).

You might see:

- A **microphone** or glowing **orb**
- A **floating dock** with Start / Stop
- A **command palette** (searchable list of phrases)
- Status text like “Listening…” or “Microphone denied”

**You do not need to know programming** to use those controls. This guide explains what they do and how to use them safely.

---

## 2. What you need

| Requirement | Why |
|-------------|-----|
| **Modern browser** (Chrome, Edge, Firefox, Safari, …) | Default speech runs **in the browser** (private Whisper model) |
| **Microphone** | So the app can hear you |
| **Permission granted** | Browser will ask “Allow microphone?” |
| **Secure page** | Usually `https://…` or `http://localhost` |
| **First-time model load** (many apps) | App may download a speech model once (~30MB), then cache it |

If the page is not secure, the browser may **block** the microphone. That is normal browser security, not a broken app.

Some apps show **“Loading speech model…”** the first time — wait until it finishes, then try again.

---

## 3. Using voice controls

### Start listening

1. Click the **mic**, **orb**, or **Start** control.  
2. If asked, choose **Allow** for the microphone.  
3. Wait until status shows **Listening** (or a red pulse on the orb).  
4. Speak a short, clear command.

### Stop listening

- Click **Stop**, the orb again, or **mute** (if available).  
- Closing the tab also stops listening.

### Hold to talk (push-to-talk)

Some apps use **hold** on a button:

1. Press and hold.  
2. Speak.  
3. Release to stop.

### Command palette (if available)

Many JSVoice apps offer a **command list**:

1. Open it with the **⌘K / Ctrl+K** button or menu item.  
2. Type to **search** commands.  
3. Use **arrow keys** and **Enter** to run one **without speaking**.  
4. Press **Esc** to close.

This is useful in quiet offices or when the mic fails.

### When the app talks back

You may hear spoken replies (“Hello”, “Done”).  
Use **Mute** in the dock or system volume if you need silence.

---

## 4. Common screens & panels

Not every app includes all of these. Names may vary slightly.

| Screen / control | What it is for |
|------------------|----------------|
| **Dock / orb** | Start/stop listening, status, shortcuts |
| **HUD** | Live text of what the app thinks you said |
| **Transcript** | History of phrases (may be clearable) |
| **Command palette** | Browse and run phrases manually |
| **Settings** | Theme, sound, privacy options |
| **Onboarding** | First-time mic and browser checks |
| **Debug / DevTools** | For developers (safe to ignore as an end user) |
| **Help / Accessibility** | Keyboard shortcuts and voice phrase lists |

---

## 5. Typical tasks

### Task A — Navigate a page by voice

1. Start listening.  
2. Try phrases like:  
   - “Scroll down”  
   - “Scroll up”  
   - “Go back”  
   (Exact phrases depend on the app.)  
3. Watch the page move or change.

### Task B — Fill a form field

1. Focus or name the field if the app asks.  
2. Say something like: “Fill email with name at company dot com”  
   (Wording depends on the product.)  
3. Check the field visually; edit by keyboard if needed.

### Task C — Confirm a risky action

For **delete**, **pay**, **log out**, or **submit**, good apps will:

1. Ask you to **confirm** on screen, and/or  
2. Require a clear phrase like “yes confirm”

**Do not** confirm unless you intend the action.

### Task D — Use the app without speaking

1. Open the **command palette**.  
2. Search the phrase.  
3. Press **Enter** to run it.  

### Task E — Change appearance

1. Open **Settings** (or ask “open voice settings” if that command exists).  
2. Switch **theme** (dark / light / high contrast).  
3. Optionally enable **reduced motion** if animations bother you.

---

## 6. Tips for better recognition

| Tip | Why it helps |
|-----|----------------|
| Speak **clearly** and at normal speed | Fewer mis-hears |
| Use a **quiet room** or headset mic | Less background noise |
| Use the **exact phrases** from Help / palette | Matching is phrase-based |
| Wait for **Listening** (not “Loading model…”) before speaking | First visit may load the speech model |
| Pause briefly after a command | Default recognition often waits for a short silence, then “understands” |
| Prefer **short commands** | Long sentences often fail |
| Check language in Settings | Default on-device model is **English**; other languages may need app settings |

If the app shows what it heard (transcript) and it is wrong, try again or use the palette.

---

## 7. Privacy & safety

### What the app may hear

While listening is **on**, the app processes your microphone audio to turn speech into text.

| Mode (set by developers) | What to know |
|--------------------------|--------------|
| **On-device Whisper (default in JSVoice apps)** | Speech is processed **on your device**; first use may download a model once |
| Browser built-in speech (optional) | Audio may go to the browser/vendor (not always fully private) |
| Transcripts | Many apps **do not save** speech text unless you opt in |

### Good habits

- **Stop listening** when you are done.  
- Avoid saying **passwords**, card numbers, or secrets while the mic is on.  
- Read permission prompts carefully.  
- On shared computers, deny mic access when finished or use a guest profile.

### Safety

Voice can sometimes **click buttons** or **fill forms**. Only use voice control on sites you trust. Confirm before destructive actions.

More detail for technical teams: [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md).

---

## 8. Troubleshooting

| Problem | What to try |
|---------|-------------|
| “Loading speech model…” forever | Wait for progress; check network; reload; ask support if it fails |
| No sound / no response | Click Start; wait until status is **Listening** (not loading) |
| Browser blocks mic | Click the lock/info icon in the address bar → allow microphone → reload |
| “Not secure” / no mic | Open the site via HTTPS or ask your admin for a secure link |
| Wrong words in transcript | Speak slower; reduce noise; try the command palette |
| Works for others, not you | Try another modern browser (Chrome, Edge, Firefox, Safari); check OS mic privacy |
| Only works in Chrome, not Firefox | Ask the app team to use default **on-device** speech (not native-only) |
| App talks too much | Mute in dock or lower system volume |
| Nothing happens after a command | Phrase may not exist — open Help or palette for the list |
| Accidental action | Use Undo if offered; contact the product team for sensitive mistakes |

### Browser checklist

1. Address bar shows a **padlock** (HTTPS) or you are on **localhost**.  
2. Site permission: **Microphone = Allow**.  
3. OS settings: app/browser may use the microphone.  
4. Correct **input device** selected in OS sound settings.  
5. If prompted, allow the **speech model download** on first use.

---

## 9. Getting help

| Who you are | Where to go |
|-------------|-------------|
| **End user of a product** | That product’s support / help desk first |
| **Testing an internal demo** | Your project team or the person who shared the link |
| **Developer integrating JSVoice** | [DOCUMENTATION.md](../DOCUMENTATION.md), [API_REFERENCE.md](API_REFERENCE.md), GitHub issues |

When reporting a problem, note:

- Browser name and version  
- What you said (exact words)  
- What you expected vs what happened  
- Whether the mic permission was allowed  

---

## 10. Glossary

| Term | Plain meaning |
|------|----------------|
| **Listening** | The app is using the mic and waiting for speech |
| **Transcript** | Text version of what was heard |
| **Command** | A phrase that triggers an action |
| **Wake word** | Optional phrase (e.g. “hey assistant”) before commands |
| **Dock / orb** | On-screen control for the mic |
| **Command palette** | Searchable list of commands |
| **TTS** | Computer speaks text aloud |
| **STT** | Speech turned into text |

---

*JSVoice User Guide · for non-developers · v1.1.0*

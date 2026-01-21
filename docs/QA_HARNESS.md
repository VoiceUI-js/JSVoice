# QA Harness & Testing Guide

## Overview

Exceptional voice interfaces requires exceptional testing. JSVoice includes a dedicated **QA Harness** designed to test voice interactions deterministically, simulating speech input without needing a physical microphone or speaking aloud.

## Accessing the QA Lab

If running the demo app:
1. Navigate to `/qa/lab`.
2. You will see the **Voice QA Lab** interface.

## Components

### 1. FakeSpeechEngine
A mock engine that replaces the Web Speech API. It accepts text input programmatically and emits "speech" events exactly as the real engine would.

### 2. VoiceHarness
A utility class that wraps a JSVoice instance for testing. It provides methods to:
- Load modules.
- Inject scripts.
- Run assertions.
- Collect diagnostics.

## Writing Test Scripts

The QA Lab accepts JSON-based test scripts or immediate commands.

**Example Script:**
```json
[
  { "action": "say", "text": "create panel for data" },
  { "action": "wait", "ms": 500 },
  { "action": "expect", "scope": "widgets", "property": "length", "value": 1 },
  { "action": "say", "text": "rename widget data to analytics" },
  { "action": "expect", "scope": "lastEvent", "contains": "Renamed" }
]
```

### Supported Actions
*   `say`: Simulates user speech.
*   `wait`: Pauses execution.
*   `expect`: Asserts a condition on the UI Kit state.
*   `reset`: Resets the store.

## Diagnostics

If a test fails or a user reports a bug, use the **"Export Diagnostics"** button. This generates a JSON bundle containing:
*   Browser Environment (UA, Screen).
*   Active Modules & Config.
*   Recent Event Log (Ring Buffer).
*   Current Store Snapshot.
*   Memory Usage.

Attach this bundle to GitHub Issues for rapid debugging.

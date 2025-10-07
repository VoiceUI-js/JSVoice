# Wave Listening Visualization Demo — How It Works

This feature shows a real-time waveform beside the microphone button, so users can see their voice as they speak.

## How It Works

- An HTML <div id="wave"> is placed next to the mic button.
- When the mic is listening, the div displays a moving line that represents the audio waveform.
- When the mic is idle, the div is blank.

JavaScript handles the state and drawing:

- When you click the mic button, the app toggles listening.
- If listening, the app gets audio from your microphone and draws the waveform in real time inside the div.
- If idle, the div is cleared.

CSS makes the div look clean and fits it beside the mic button.

## Example

<button id="micBtn">🎤</button>

<div id="wave"></div>

When mic is listening:

- The div shows a moving line that reacts to your voice.

When mic is idle:

- The div is empty.

## Visual Feedback

- Empty Div: Mic is not listening.
- Moving Waveform: Mic is active, showing your speech visually.

## Why Use It?

- Lets users see their voice as they speak.
- Quick feedback that the mic is working and listening.

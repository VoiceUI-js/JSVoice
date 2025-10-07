# Listening Indicator Dot — How It Works

This feature adds a small visual dot beside the microphone button. The dot shows whether the mic is listening or idle, for clear user feedback.

## How It Works

- The dot is a <span> placed right next to the mic button.
- When idle, the dot is grey.
- When listening, the dot turns green and gently pulses.

State switching happens via JavaScript:

- When you click the mic button, the app toggles listening.
- The dot’s color and animation update instantly.

CSS handles visual changes:

- .idle class (grey) for idle.
- .listening class (green + pulse) for active.

## Example

<button id="micBtn">🎤</button> <span id="micIndicator" class="dot idle"></span>

When mic is listening:

<span id="micIndicator" class="dot listening"></span>

When mic is idle:

<span id="micIndicator" class="dot idle"></span>

## Visual Feedback

- Grey Dot: Mic is not listening, safe to click to start.
- Green Pulsing Dot: Mic is active, listening for commands.

## Why Use It?

- Helps users see at a glance if the mic is active.
- Simple, unobtrusive feedback for voice state.

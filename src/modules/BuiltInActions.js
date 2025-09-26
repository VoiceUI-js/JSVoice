// src/modules/BuiltInActions.js

import { handleScroll } from './actions/ScrollAction.js';
import { handleZoom } from './actions/ZoomAction.js';
import { handleFillInput } from './actions/FillInputAction.js';
import { handleClick } from './actions/ClickAction.js';

/**
 * Attempts to match and execute a built-in DOM action (Scroll, Zoom, Click, Fill Input).
 *
 * @param {string} rawTranscript - The original recognized speech.
 * @param {string} cleanedTranscript - The processed, cleaned speech.
 * @param {Function} updateStatus - Status update function from VoiceUI instance.
 * @param {Function} callCallback - Callback function from VoiceUI instance.
 * @returns {boolean} True if a built-in action was handled, false otherwise.
 */
export function handleBuiltInActions(rawTranscript, cleanedTranscript, updateStatus, callCallback) {
  // Pass all attempts through the individual action handlers.
  // The order here defines the priority if commands overlap.

  if (handleScroll(cleanedTranscript, updateStatus, callCallback)) return true;
  if (handleZoom(cleanedTranscript, updateStatus, callCallback)) return true;
  if (handleFillInput(rawTranscript, updateStatus, callCallback)) return true;
  if (handleClick(rawTranscript, updateStatus, callCallback)) return true;

  return false;
}
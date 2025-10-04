// src/modules/BuiltInActions.js

import { handleScroll } from './actions/ScrollAction.js';
import { handleZoom } from './actions/ZoomAction.js';
import { handleFillInput } from './actions/FillInputAction.js';
import { handleClick } from './actions/ClickAction.js';
import { handleReadContent } from './actions/ReadContentAction.js'; // NEW import
import { handleDarkMode } from './actions/ToggleDarkModeAction.js';


/**
 * Attempts to match and execute a built-in DOM action (Scroll, Zoom, Click, Fill Input, Read Content).
 * Adding 2 new folders
 *
 * @param {string} rawTranscript - The original recognized speech.
 * @param {string} cleanedTranscript - The processed, cleaned speech.
 * @param {Function} updateStatus - Status update function from JSVoice instance.
 * @param {Function} callCallback - Callback function from JSVoice instance.
 * @param {Function} jsVoiceSpeakMethod - The JSVoice instance's speak method, passed for read actions.
 * @returns {boolean} True if a built-in action was handled, false otherwise.
 */
export function handleBuiltInActions(rawTranscript, cleanedTranscript, updateStatus, callCallback, jsVoiceSpeakMethod) {
  // Order defines priority. Read content is placed high due to its common use.
  // Pass rawTranscript here, as some actions (like FillInput or ReadContent) might need it for exact phrasing.
  if (handleReadContent(rawTranscript, cleanedTranscript, updateStatus, callCallback, jsVoiceSpeakMethod)) return true;
  if (handleScroll(cleanedTranscript, updateStatus, callCallback)) return true;
  if (handleZoom(cleanedTranscript, updateStatus, callCallback)) return true;
  if (handleFillInput(rawTranscript, updateStatus, callCallback)) return true;
  if (handleClick(rawTranscript, updateStatus, callCallback)) return true;
  if (handleDarkMode(cleanedTranscript, updateStatus, callCallback)) return true;

  return false;
}
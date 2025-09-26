// src/modules/CommandProcessor.js

import { cleanText } from '../utils/helpers.js';
import { handleBuiltInActions } from './BuiltInActions.js';

/**
 * Processes the recognized speech transcript, trying to match commands.
 * @param {string} rawTranscript - The raw transcript from speech recognition.
 * @param {Object.<string, Function>} commands - The map of user-defined commands.
 * @param {Function} updateStatus - Status update function from VoiceUI instance.
 * @param {Function} callCallback - Callback function from VoiceUI instance.
 * @returns {Promise<boolean>} True if a command was handled, false otherwise.
 */
export async function processCommand(rawTranscript, commands, updateStatus, callCallback) {
  const s = cleanText(rawTranscript);

  // 1. Check for user-defined commands first
  for (const cleanedCommandPhrase in commands) {
    if (s.includes(cleanedCommandPhrase)) {
      try {
        const actionCallback = commands[cleanedCommandPhrase];
        const commandResult = await actionCallback(rawTranscript, s);
        callCallback('onCommandRecognized', cleanedCommandPhrase, rawTranscript, commandResult);
        updateStatus(`Command: "${cleanedCommandPhrase}" processed.`);
        return true;
      } catch (e) {
        console.error(`[JSVoice] Error executing command "${cleanedCommandPhrase}":`, e);
        callCallback('onError', new Error(`Command "${cleanedCommandPhrase}" failed: ${e.message}`));
        updateStatus(`Error with command "${cleanedCommandPhrase}".`);
        return true; // Command was "handled" even if it resulted in an error
      }
    }
  }

  // 2. Handle built-in, generic DOM manipulation commands
  // Note: The callback function is wrapped to align with how handleBuiltInActions expects it.
  if (handleBuiltInActions(rawTranscript, s, updateStatus, (name, ...args) => callCallback(name, ...args))) {
    return true;
  }

  // 3. Fallback: No command matched
  callCallback('onCommandNotRecognized', rawTranscript);
  updateStatus(`Unknown command: "${rawTranscript}"`);
  return false;
}
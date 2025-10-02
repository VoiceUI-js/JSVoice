// src/modules/CommandProcessor.js

import { cleanText } from '../utils/helpers.js';
import { handleBuiltInActions } from './BuiltInActions.js';

/**
 * Processes the recognized speech transcript, trying to match commands.
 * This module no longer handles wake word logic; that's moved to JSVoice.
 * @param {string} rawTranscript - The raw transcript from speech recognition.
 * @param {Object.<string, Function>} exactCommands - The map of user-defined exact phrase commands.
 * @param {Array.<{pattern: string, cleanedPattern: string, callback: Function}>} patternCommands - The array of user-defined pattern commands.
 * @param {Function} updateStatus - Status update function from JSVoice instance.
 * @param {Function} callCallback - Callback function from JSVoice instance.
 * @param {Function} jsVoiceSpeakMethod - The JSVoice instance's speak method, passed for read actions.
 * @returns {Promise<boolean>} True if a command was handled, false otherwise.
 */
export async function processCommand(rawTranscript, exactCommands, patternCommands, updateStatus, callCallback, jsVoiceSpeakMethod) {
  const s = cleanText(rawTranscript);

  // 1. Check for pattern-based commands first (more flexible, higher priority)
  for (const cmd of patternCommands) {
    // Generate regex from pattern: {argName} becomes a non-greedy capturing group (.+?)
    const patternRegex = new RegExp(
        "^" + cmd.cleanedPattern.replace(/{(\w+)}/g, '(.+?)') + "$", 
        "i" // Case-insensitive
    );
    const match = s.match(patternRegex);
    if (match) {
      try {
        const argNames = (cmd.pattern.match(/{(\w+)}/g) || []).map(arg => arg.slice(1, -1)); // Extract arg names from original pattern
        const extractedArgs = {};
        match.slice(1).forEach((val, index) => { // Skip full match, iterate through capture groups
            if (argNames[index]) {
                extractedArgs[argNames[index]] = val;
            } else {
                // Fallback for unnamed groups if pattern parsing is unexpected.
                // With {name} syntax, argNames should match capture groups.
                extractedArgs[`arg${index + 1}`] = val; 
            }
        });
        
        const commandResult = await cmd.callback(extractedArgs, rawTranscript, s, jsVoiceSpeakMethod);
        callCallback('onCommandRecognized', cmd.pattern, rawTranscript, commandResult, extractedArgs); // Pass extractedArgs
        updateStatus(`Pattern command: "${cmd.pattern}" processed.`);
        return true;
      } catch (e) {
        console.error(`[JSVoice] Error executing pattern command "${cmd.pattern}":`, e);
        callCallback('onError', new Error(`Pattern command "${cmd.pattern}" failed: ${e.message}`));
        updateStatus(`Error with pattern command "${cmd.pattern}".`);
        return true;
      }
    }
  }

  // 2. Check for exact phrase user-defined commands
  for (const cleanedCommandPhrase in exactCommands) {
    if (s.includes(cleanedCommandPhrase)) { // Use includes for flexibility
      try {
        const actionCallback = exactCommands[cleanedCommandPhrase];
        const commandResult = await actionCallback(rawTranscript, s, jsVoiceSpeakMethod); // Pass speak method
        callCallback('onCommandRecognized', cleanedCommandPhrase, rawTranscript, commandResult);
        updateStatus(`Command: "${cleanedCommandPhrase}" processed.`);
        return true;
      } catch (e) {
        console.error(`[JSVoice] Error executing command "${cleanedCommandPhrase}":`, e);
        callCallback('onError', new Error(`Command "${cleanedCommandPhrase}" failed: ${e.message}`));
        updateStatus(`Error with command "${cleanedCommandPhrase}".`);
        return true;
      }
    }
  }

  // 3. Handle built-in, generic DOM manipulation commands
  if (handleBuiltInActions(rawTranscript, s, updateStatus, (name, ...args) => callCallback(name, ...args), jsVoiceSpeakMethod)) {
    return true;
  }

  // 4. Fallback: No command matched
  callCallback('onCommandNotRecognized', rawTranscript);
  updateStatus(`Unknown command: "${rawTranscript}"`);
  return false;
}
// src/modules/actions/FillInputAction.js

import { cleanText, findInputField } from '../../utils/helpers.js';

/**
 * Handles the built-in 'type/fill X in Y' command.
 * @param {string} rawTranscript - The original recognized speech.
 * @param {Function} updateStatus - Status update function.
 * @param {Function} callCallback - Callback function.
 * @returns {boolean} True if a fill action was performed, false otherwise.
 */
export function handleFillInput(rawTranscript, updateStatus, callCallback) {
  const fillInputMatch = rawTranscript.match(/(?:type|fill)\s+(.+?)\s+(?:in|with)\s+(.+)/i);
  if (fillInputMatch) {
    const fieldIdentifierRaw = fillInputMatch[1].trim();
    let valueToType = fillInputMatch[2].trim();

    // Remove surrounding quotes if present
    if (valueToType.startsWith('"') && valueToType.endsWith('"') && valueToType.length > 1) {
      valueToType = valueToType.slice(1, -1);
    }
    const fieldIdentifierCleaned = cleanText(fieldIdentifierRaw);

    const findResult = findInputField(fieldIdentifierCleaned);

    if (findResult.success) {
      const targetInput = findResult.element;
      targetInput.value = valueToType;
      targetInput.dispatchEvent(new Event('input', { bubbles: true })); // Simulate user input
      targetInput.dispatchEvent(new Event('change', { bubbles: true })); // Simulate blur/change event
      callCallback('onActionPerformed', 'fillInput', { field: fieldIdentifierCleaned, value: valueToType, element: targetInput });
      updateStatus(`Filled "${fieldIdentifierCleaned}" with "${valueToType}".`); return true;
    }
    updateStatus(`Could not find input field "${fieldIdentifierCleaned}".`);
    return true;
  }

  return false;
}
// src/modules/actions/ClickAction.js

import { cleanText } from '../../utils/helpers.js';

/**
 * Handles the built-in 'click X' command.
 * @param {string} rawTranscript - The original recognized speech.
 * @param {Function} updateStatus - Status update function.
 * @param {Function} callCallback - Callback function.
 * @returns {boolean} True if a click action was performed, false otherwise.
 */
export function handleClick(rawTranscript, updateStatus, callCallback) {
  const clickButtonMatch = rawTranscript.match(/click (?:button )?(.+)/i);
  if (clickButtonMatch && clickButtonMatch[1]) {
    const targetTextCleaned = cleanText(clickButtonMatch[1]);
    const possibleButtons = document.querySelectorAll(
      'button, a, input[type="button"], input[type="submit"], [role="button"], [aria-label], [data-voice-command-click]'
    );

    for (const element of possibleButtons) {
      let elementText = cleanText(element.textContent || '');
      let ariaLabel = cleanText(element.getAttribute('aria-label') || '');
      let inputValue = (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit'))
        ? cleanText(element.value || '') : '';
      let dataCommand = cleanText(element.getAttribute('data-voice-command-click') || '');

      if (elementText.includes(targetTextCleaned) || ariaLabel.includes(targetTextCleaned) || inputValue.includes(targetTextCleaned) || dataCommand.includes(targetTextCleaned)) {
        element.click();
        callCallback('onActionPerformed', 'clickButton', { text: targetTextCleaned, element });
        updateStatus(`Clicked "${targetTextCleaned}".`); return true;
      }
    }
    updateStatus(`Could not find button "${targetTextCleaned}".`);
    return true;
  }

  return false;
}
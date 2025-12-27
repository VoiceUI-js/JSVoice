// src/modules/actions/ScrollAction.js

/**
 * Handles all built-in scroll commands.
 * @param {string} cleanedTranscript - The processed, cleaned speech.
 * @param {Function} updateStatus - Status update function.
 * @param {Function} callCallback - Callback function.
 * @returns {boolean} True if a scroll action was performed, false otherwise.
 */
export function handleScroll(cleanedTranscript, updateStatus, callCallback) {
  const s = cleanedTranscript;

  if (s.includes('scroll down')) {
    window.scrollBy({ top: 500, behavior: 'smooth' });
    callCallback('onActionPerformed', 'scrollDown', 500);
    updateStatus('Scrolled down.');
    return true;
  }
  if (s.includes('scroll up')) {
    window.scrollBy({ top: -500, behavior: 'smooth' });
    callCallback('onActionPerformed', 'scrollUp', 500);
    updateStatus('Scrolled up.');
    return true;
  }
  if (
    s.includes('scroll full down') ||
    s.includes('scroll to bottom') ||
    s.includes('scroll down full')
  ) {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    callCallback('onActionPerformed', 'scrollToBottom');
    updateStatus('Scrolled to bottom.');
    return true;
  }
  if (s.includes('scroll full up') || s.includes('scroll to top') || s.includes('scroll up full')) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    callCallback('onActionPerformed', 'scrollToTop');
    updateStatus('Scrolled to top.');
    return true;
  }

  return false;
}

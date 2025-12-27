// src/modules/actions/OpenTabAction.js

const DOMAIN_MAPPINGS = {
  google: 'https://google.com',
  github: 'https://github.com',
  youtube: 'https://youtube.com',
  facebook: 'https://facebook.com',
  twitter: 'https://twitter.com',
  linkedin: 'https://linkedin.com',
  chatGPT: 'https://chat.openai.com',
};

function getUrlFromSite(site) {
  site = site.toLowerCase().trim();
  if (DOMAIN_MAPPINGS[site]) {
    return DOMAIN_MAPPINGS[site];
  }
  return `https://${site}.com`;
}

/**
 * Handles voice commands to open a new browser tab.
 * @param {string} rawTranscript - The original recognized speech.
 * @param {string} cleanedTranscript - The processed, cleaned speech.
 * @param {Function} updateStatus - Status update function.
 * @param {Function} callCallback - Callback function.
 * @returns {boolean} True if handled, false otherwise.
 */
export function OpenTabAction(rawTranscript, cleanedTranscript, updateStatus, callCallback) {
  const phrase = cleanedTranscript.toLowerCase().trim();

  if (phrase === 'open new tab') {
    window.open('about:blank', '_blank');
    updateStatus && updateStatus('Opened a new tab.');
    callCallback && callCallback();
    return true;
  }

  if (phrase === 'open google') {
    window.open(DOMAIN_MAPPINGS['google'], '_blank');
    updateStatus && updateStatus('Opened Google in new tab.');
    callCallback && callCallback();
    return true;
  }

  const goToMatch = phrase.match(/^go to (.+)$/);
  if (goToMatch) {
    const site = goToMatch[1];
    const url = getUrlFromSite(site);
    window.open(url, '_blank');
    updateStatus && updateStatus(`Opened ${site} in new tab.`);
    callCallback && callCallback();
    return true;
  }

  return false;
}

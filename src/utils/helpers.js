// src/utils/helpers.js

/**
 * Helper to call callbacks safely.
 * @param {import('../JSVoice').JSVoiceOptions} options - The JSVoice library options object.
 * @param {string} callbackName - Name of the callback in options.
 * @param {...any} args - Arguments to pass to the callback.
 */
export function callCallback(options, callbackName, ...args) {
  if (typeof options[callbackName] === 'function') {
    options[callbackName](...args);
  }
}

/**
 * Cleans a string by removing common punctuation, consolidating spaces, and converting to lowercase.
 * This is crucial for consistent command matching.
 * @param {string} text
 * @returns {string} Cleaned text.
 */
export function cleanText(text) {
  if (typeof text !== 'string') {
    return '';
  }
  // IMPROVED: Added more whitespace characters and common symbols, including unicode whitespace
  // This version handles a broader range of punctuation and ensures consistent spacing.
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()\[\]<>+@?|\\]/g, '') // Remove a wider range of punctuation
    .replace(/\s+/g, ' ') // Replace all whitespace (including newlines, tabs) with a single space
    .trim(); // Trim leading/trailing whitespace
}

/**
 * Helper to check if an element is a valid input type (input, textarea, select).
 * @param {Element|null} element
 * @returns {boolean}
 */
function isValidInputField(element) {
  if (!element) return false;
  const tagName = element.tagName;
  // Ensure it's a field the user can type into or select from
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}

/**
 * Attempts to find an input (or textarea or select) element in the DOM based on various attributes.
 * Prioritizes explicit voice commands via data attributes.
 *
 * @param {string} rawIdentifier The original text spoken by the user to identify the field (e.g., "username", "email")
 * @returns {{success: boolean, element?: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, reason?: string}} Result object.
 */
export function findInputField(rawIdentifier) {
  const identifier = cleanText(rawIdentifier); // Clean identifier once

  // Query all potential input fields (inputs, textareas, selects, excluding specific types)
  const allPotentialFields = document.querySelectorAll(
    'input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), textarea, select'
  );

  let element = null;

  // --- Search Precedence (from most specific to least) ---

  // 1. data-voice-command-fill attribute (most explicit voice control, exact match)
  for (const field of allPotentialFields) {
    const dataCommand = cleanText(field.getAttribute('data-voice-command-fill') || '');
    if (dataCommand === identifier) { // Exact match for explicit command
      return { success: true, element: field };
    }
  }

  // 2. Associated Label text (exact match after cleaning of label text)
  const labels = document.querySelectorAll('label');
  for (const label of labels) {
    const labelText = cleanText(label.textContent || '');
    if (labelText === identifier) { // Exact label match
      if (label.htmlFor) {
        element = document.getElementById(label.htmlFor);
        if (isValidInputField(element)) return { success: true, element };
      }
      // Check for nested input/textarea/select within the label
      element = label.querySelector('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), textarea, select');
      if (isValidInputField(element)) return { success: true, element };
    }
  }
  
  // 3. ID attribute (exact match after cleaning, and if it's a valid field)
  for (const field of allPotentialFields) {
      const fieldId = cleanText(field.id || '');
      if (fieldId === identifier) {
          return { success: true, element: field };
      }
  }

  // 4. Placeholder text, Aria-label, Name attribute (contains, case-insensitive after cleaning)
  // This is handled by iterating through all potential fields and comparing cleaned versions
  for (const field of allPotentialFields) {
    const placeholder = cleanText(field.placeholder || '');
    const ariaLabel = cleanText(field.getAttribute('aria-label') || '');
    const name = cleanText(field.name || '');

    if (placeholder.includes(identifier) || ariaLabel.includes(identifier) || name.includes(identifier)) {
      return { success: true, element: field };
    }
  }

  // Fallback: No element found
  return { success: false, reason: "field not found" };
}
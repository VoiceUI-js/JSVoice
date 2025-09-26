// src/utils/helpers.js

/**
 * Helper to call callbacks safely.
 * @param {Object} options - The library options object.
 * @param {string} callbackName - Name of the callback in options.
 * @param {...any} args - Arguments to pass to the callback.
 */
export function callCallback(options, callbackName, ...args) {
  if (typeof options[callbackName] === 'function') {
    options[callbackName](...args);
  }
}

/**
 * Cleans a string by removing common punctuation and converting to lowercase.
 * @param {string} text
 * @returns {string} Cleaned text.
 */
export function cleanText(text) {
  return text.replace(/[.,!?"]+/g, '').trim().toLowerCase();
}

/**
 * Attempts to find an input (or textarea) element in the DOM based on various attributes.
 * @param {string} identifier The cleaned text to search for (e.g., "username", "email")
 * @returns {{success: boolean, element?: HTMLInputElement | HTMLTextAreaElement, reason?: string}} Result object.
 */
export function findInputField(identifier) {
  let element = null;

  // 1. Exact ID match (cleaned)
  const potentialByIdCleaned = document.getElementById(cleanText(identifier));
  if (potentialByIdCleaned && (potentialByIdCleaned.tagName === 'INPUT' || potentialByIdCleaned.tagName === 'TEXTAREA')) {
    return { success: true, element: potentialByIdCleaned };
  }

  // 2. Placeholder text
  element = document.querySelector(`input[placeholder*="${identifier}" i], textarea[placeholder*="${identifier}" i]`);
  if (element) return { success: true, element };

  // 3. Aria-label
  element = document.querySelector(`input[aria-label*="${identifier}" i], textarea[aria-label*="${identifier}" i]`);
  if (element) return { success: true, element };

  // 4. Associated Label text
  const labels = document.querySelectorAll('label');
  for (const label of labels) {
    const labelText = cleanText(label.textContent || '');
    if (labelText.includes(identifier)) {
      if (label.htmlFor) {
        element = document.getElementById(label.htmlFor);
        if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) return { success: true, element };
      }
      element = label.querySelector('input, textarea'); // Check for nested input/textarea
      if (element) return { success: true, element };
    }
  }

  // 5. Name attribute
  element = document.querySelector(`input[name*="${identifier}" i], textarea[name*="${identifier}" i]`);
  if (element) return { success: true, element };

  // 6. Specific email input types
  if (identifier.includes("email") || identifier.includes("e-mail")) {
    element = document.querySelector('input[type="email" i], input[inputmode="email" i], input[id*="email" i], input[name*="email" i]');
    if (element) return { success: true, element };
  }

  return { success: false, reason: "field not found" };
}
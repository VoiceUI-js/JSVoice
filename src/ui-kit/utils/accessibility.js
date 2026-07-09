/**
 * Accessibility helpers for voice UI kit components.
 */

/**
 * Build ARIA live region props.
 * @param {'polite'|'assertive'|'off'} [politeness]
 */
export function liveRegion(politeness = 'polite') {
  return {
    'aria-live': politeness,
    'aria-atomic': 'true',
    role: politeness === 'assertive' ? 'alert' : 'status',
  };
}

/**
 * Status → human-readable label for screen readers.
 * @param {string} status
 */
export function statusAriaLabel(status) {
  const map = {
    idle: 'Voice idle',
    listening: 'Listening for speech',
    processing: 'Processing speech',
    speaking: 'Speaking',
    error: 'Voice error',
    disabled: 'Voice disabled',
    starting: 'Starting microphone',
    stopping: 'Stopping microphone',
  };
  return map[status] || `Voice status: ${status || 'unknown'}`;
}

/**
 * Focus an element if available.
 * @param {HTMLElement|null|undefined} el
 */
export function focusElement(el) {
  if (el && typeof el.focus === 'function') {
    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }
  }
}

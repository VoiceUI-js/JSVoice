/**
 * Keyboard helpers for palette / list navigation.
 */

/**
 * Parse a hotkey string like "mod+k" or "ctrl+shift+p".
 * @param {string} hotkey
 * @param {KeyboardEvent} event
 * @returns {boolean}
 */
export function matchesHotkey(hotkey, event) {
  if (!hotkey || !event) return false;
  const parts = hotkey.toLowerCase().split('+').map((p) => p.trim());
  const key = parts[parts.length - 1];
  const needMod = parts.includes('mod') || parts.includes('meta') || parts.includes('cmd');
  const needCtrl = parts.includes('ctrl') || parts.includes('control');
  const needAlt = parts.includes('alt') || parts.includes('option');
  const needShift = parts.includes('shift');

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '');
  const modPressed = isMac ? event.metaKey : event.ctrlKey;

  if (needMod && !modPressed) return false;
  if (needCtrl && !event.ctrlKey) return false;
  if (needAlt && !event.altKey) return false;
  if (needShift && !event.shiftKey) return false;

  const eventKey = (event.key || '').toLowerCase();
  return eventKey === key || event.code?.toLowerCase() === `key${key}`;
}

/**
 * Move index within a list.
 * @param {number} current
 * @param {number} delta
 * @param {number} length
 */
export function moveIndex(current, delta, length) {
  if (length <= 0) return 0;
  return (current + delta + length) % length;
}

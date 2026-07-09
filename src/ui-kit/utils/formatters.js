/**
 * Format a timestamp for UI display.
 * @param {number|Date} ts
 * @returns {string}
 */
export function formatTime(ts) {
  const d = ts instanceof Date ? ts : new Date(ts || Date.now());
  if (Number.isNaN(d.getTime())) return '--:--:--';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * @param {number|null|undefined} confidence 0..1
 * @returns {string}
 */
export function formatConfidence(confidence) {
  if (confidence == null || Number.isNaN(confidence)) return '—';
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Truncate string with ellipsis.
 * @param {string} str
 * @param {number} max
 */
export function truncate(str, max = 80) {
  if (!str) return '';
  const s = String(str);
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

/**
 * Title-case a status string.
 * @param {string} status
 */
export function formatStatus(status) {
  if (!status) return 'Idle';
  return String(status).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

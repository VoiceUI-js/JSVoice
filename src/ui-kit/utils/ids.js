/**
 * Generate a unique id (SSR-safe).
 * @param {string} [prefix]
 * @returns {string}
 */
export function createId(prefix = 'jsv') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export default createId;

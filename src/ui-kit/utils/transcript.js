/**
 * Transcript list helpers.
 */

import { createId } from './ids.js';

/**
 * @typedef {Object} TranscriptEntry
 * @property {string} id
 * @property {string} text
 * @property {boolean} isFinal
 * @property {number} timestamp
 * @property {string|null} [command]
 * @property {string} [status] recognized|not_recognized|interim|final
 * @property {number|null} [confidence]
 * @property {string|null} [engine]
 * @property {boolean} [pinned]
 */

/**
 * @param {Partial<TranscriptEntry>} partial
 * @returns {TranscriptEntry}
 */
export function createTranscriptEntry(partial = {}) {
  return {
    id: partial.id || createId('tx'),
    text: partial.text || '',
    isFinal: !!partial.isFinal,
    timestamp: partial.timestamp || Date.now(),
    command: partial.command ?? null,
    status: partial.status || (partial.isFinal ? 'final' : 'interim'),
    confidence: partial.confidence ?? null,
    engine: partial.engine ?? null,
    pinned: !!partial.pinned,
  };
}

/**
 * Append entry and cap list size; preserve pinned items.
 * @param {TranscriptEntry[]} list
 * @param {TranscriptEntry} entry
 * @param {number} maxItems
 */
export function appendTranscript(list, entry, maxItems = 50) {
  const next = [...list, entry];
  if (next.length <= maxItems) return next;
  const pinned = next.filter((e) => e.pinned);
  const unpinned = next.filter((e) => !e.pinned);
  const room = Math.max(0, maxItems - pinned.length);
  return [...pinned, ...unpinned.slice(-room)];
}

/**
 * Filter transcript entries by query.
 * @param {TranscriptEntry[]} list
 * @param {string} query
 */
export function filterTranscript(list, query) {
  if (!query) return list;
  const q = query.toLowerCase();
  return list.filter(
    (e) =>
      (e.text && e.text.toLowerCase().includes(q)) ||
      (e.command && e.command.toLowerCase().includes(q)) ||
      (e.status && e.status.toLowerCase().includes(q))
  );
}

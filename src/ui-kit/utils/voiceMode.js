/**
 * Voice mode element scanning helpers (SSR-safe).
 */
import { isBrowser } from './domSafe.js';
import { DANGEROUS_ACTION_PATTERNS } from '../core/constants.js';

/**
 * @param {string} text
 */
export function isDangerousLabel(text) {
  if (!text) return false;
  return DANGEROUS_ACTION_PATTERNS.some((re) => re.test(String(text)));
}

/**
 * Scan interactive elements and produce numbered tags.
 * @param {ParentNode|null} [root]
 * @param {number} [limit]
 */
export function scanInteractiveElements(root, limit = 40) {
  if (!isBrowser()) return [];
  const scope = root || globalThis.document;
  if (!scope?.querySelectorAll) return [];

  const selector = 'a[href], button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';
  const nodes = Array.from(scope.querySelectorAll(selector)).slice(0, limit);

  return nodes.map((el, i) => {
    const label =
      el.getAttribute('aria-label') ||
      el.getAttribute('title') ||
      (el.innerText || el.textContent || el.getAttribute('placeholder') || el.tagName || '').trim().slice(0, 60);
    const rect = typeof el.getBoundingClientRect === 'function' ? el.getBoundingClientRect() : null;
    return {
      id: `tag_${i + 1}`,
      index: i + 1,
      label: label || `${el.tagName}`,
      tagName: el.tagName?.toLowerCase(),
      dangerous: isDangerousLabel(label) || isDangerousLabel(el.getAttribute?.('type')),
      x: rect ? Math.round(rect.left + rect.width / 2) : 0,
      y: rect ? Math.round(rect.top + rect.height / 2) : 0,
    };
  });
}

/**
 * Safe click: requires confirmation for dangerous elements.
 * @param {object} tag
 * @param {{ confirm?: (msg: string) => boolean }} [opts]
 */
export function resolveSafeClick(tag, opts = {}) {
  if (!tag) return { ok: false, reason: 'missing' };
  if (tag.dangerous) {
    const confirm = opts.confirm || (() => false);
    const approved = confirm(`Confirm dangerous action: ${tag.label}?`);
    return approved
      ? { ok: true, requiresConfirm: true, approved: true }
      : { ok: false, requiresConfirm: true, approved: false, reason: 'needs_confirmation' };
  }
  return { ok: true, requiresConfirm: false };
}

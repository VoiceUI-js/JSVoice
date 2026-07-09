/**
 * SSR-safe DOM helpers. Never touch window/document during SSR.
 */

export function isBrowser() {
  return typeof globalThis !== 'undefined' && typeof globalThis.window !== 'undefined' && typeof globalThis.document !== 'undefined';
}

export function getWindow() {
  return isBrowser() ? globalThis.window : null;
}

export function getDocument() {
  return isBrowser() ? globalThis.document : null;
}

export function getNavigator() {
  return isBrowser() ? globalThis.navigator : null;
}

/**
 * @param {string} key
 * @param {*} fallback
 */
export function safeLocalStorageGet(key, fallback = null) {
  if (!isBrowser()) return fallback;
  try {
    const raw = globalThis.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * @param {string} key
 * @param {*} value
 */
export function safeLocalStorageSet(key, value) {
  if (!isBrowser()) return false;
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} key
 */
export function safeLocalStorageRemove(key) {
  if (!isBrowser()) return;
  try {
    globalThis.localStorage.removeItem(key);
  } catch { /* ignore */ }
}

/**
 * @returns {boolean}
 */
export function isSecureContext() {
  const w = getWindow();
  if (!w) return false;
  return !!w.isSecureContext;
}

/**
 * @returns {boolean}
 */
export function isSpeechRecognitionSupported() {
  const w = getWindow();
  if (!w) return false;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

/**
 * @returns {boolean}
 */
export function isSpeechSynthesisSupported() {
  const w = getWindow();
  if (!w) return false;
  return !!w.speechSynthesis;
}

/**
 * Copy text to clipboard (SSR-safe).
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  if (!isBrowser()) return false;
  try {
    if (globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(text);
      return true;
    }
    const el = globalThis.document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    globalThis.document.body.appendChild(el);
    el.select();
    const ok = globalThis.document.execCommand('copy');
    globalThis.document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Download a JSON blob.
 * @param {string} filename
 * @param {*} data
 */
export function downloadJson(filename, data) {
  if (!isBrowser()) return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = globalThis.document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

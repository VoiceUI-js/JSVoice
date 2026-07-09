import { resolveTheme } from './createTheme.js';
import { isBrowser } from '../utils/domSafe.js';

/**
 * Convert CSS vars map to a CSS declaration string.
 * @param {Record<string, string>} cssVars
 */
export function cssVarsToString(cssVars) {
  return Object.entries(cssVars)
    .map(([k, v]) => `${k}: ${v};`)
    .join('\n  ');
}

/**
 * Build a <style> tag body for a theme scoped to a selector.
 * @param {string|object} theme
 * @param {string} [selector]
 */
export function buildThemeStyleText(theme, selector = ':root, [data-jsvoice-kit-root]') {
  const resolved = resolveTheme(theme);
  const body = cssVarsToString(resolved.cssVars);
  return `
${selector} {
  ${body}
  font-family: var(--jsv-font-family);
  color: var(--jsv-text);
  box-sizing: border-box;
}
[data-jsvoice-kit], [data-jsvoice-kit] *, [data-jsvoice-kit-root], [data-jsvoice-kit-root] * {
  box-sizing: border-box;
}
@keyframes jsv-pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.75; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes jsv-ring {
  0% { transform: scale(0.92); opacity: 0.7; }
  70% { transform: scale(1.25); opacity: 0; }
  100% { transform: scale(1.25); opacity: 0; }
}
@keyframes jsv-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes jsv-spin {
  to { transform: rotate(360deg); }
}
@keyframes jsv-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes jsv-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}
@keyframes jsv-lift {
  from { transform: translateY(0); }
  to { transform: translateY(-2px); }
}
[data-jsvoice-kit][data-density="compact"] {
  --jsv-space-md: 8px;
  --jsv-space-lg: 12px;
  font-size: 13px;
}
[data-jsvoice-kit][data-density="spacious"] {
  --jsv-space-md: 16px;
  --jsv-space-lg: 20px;
}
[data-jsvoice-kit] .jsv-hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--jsv-shadow-md);
}
[data-jsvoice-kit] .jsv-processing-shimmer {
  background: linear-gradient(90deg, transparent, var(--jsv-primary-soft), transparent);
  background-size: 200% 100%;
  animation: jsv-shimmer 1.4s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  [data-jsvoice-kit], [data-jsvoice-kit] * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  [data-jsvoice-kit] .jsv-hover-lift:hover {
    transform: none;
  }
}
`.trim();
}

/**
 * Apply theme CSS variables to an HTMLElement.
 * @param {HTMLElement|null} el
 * @param {string|object} theme
 */
export function applyThemeToElement(el, theme) {
  if (!el || !el.style) return;
  const resolved = resolveTheme(theme);
  Object.entries(resolved.cssVars).forEach(([k, v]) => {
    el.style.setProperty(k, v);
  });
}

/**
 * Inject a global style tag (idempotent by id).
 * @param {string|object} theme
 * @param {string} [id]
 */
export function injectThemeStyles(theme, id = 'jsvoice-ui-kit-theme') {
  if (!isBrowser()) return null;
  const doc = globalThis.document;
  let style = doc.getElementById(id);
  if (!style) {
    style = doc.createElement('style');
    style.id = id;
    doc.head.appendChild(style);
  }
  style.textContent = buildThemeStyleText(theme);
  return style;
}

import { defaultTokens, tokensToCssVars } from './tokens.js';
import { builtInThemes } from './themes.js';

/**
 * Create a voice theme object.
 * @param {{ name?: string, tokens?: Partial<typeof defaultTokens>, base?: string }} options
 * @returns {{ name: string, tokens: object, cssVars: Record<string,string> }}
 */
export function createVoiceTheme(options = {}) {
  const name = options.name || 'custom';
  const baseName = options.base || 'defaultDark';
  const base = builtInThemes[baseName] || builtInThemes.defaultDark || defaultTokens;
  const tokens = { ...base, ...(options.tokens || {}) };
  return {
    name,
    tokens,
    cssVars: tokensToCssVars(tokens),
  };
}

/**
 * Resolve a theme by name, object, or createVoiceTheme result.
 * @param {string|object} theme
 */
export function resolveTheme(theme = 'defaultDark') {
  if (!theme) return createVoiceTheme({ name: 'defaultDark', base: 'defaultDark' });
  if (typeof theme === 'string') {
    if (builtInThemes[theme]) {
      return createVoiceTheme({ name: theme, base: theme });
    }
    return createVoiceTheme({ name: 'defaultDark', base: 'defaultDark' });
  }
  if (theme.cssVars && theme.tokens) return theme;
  if (theme.tokens) return createVoiceTheme({ name: theme.name || 'custom', tokens: theme.tokens, base: theme.base });
  return createVoiceTheme({ name: 'custom', tokens: theme });
}

export default createVoiceTheme;

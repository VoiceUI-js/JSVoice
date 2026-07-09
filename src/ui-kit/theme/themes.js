import { defaultTokens } from './tokens.js';

function clone(base, overrides = {}) {
  return { ...base, ...overrides };
}

export const builtInThemes = {
  defaultDark: clone(defaultTokens),

  defaultLight: clone(defaultTokens, {
    background: '#f6f7fb',
    surface: '#ffffff',
    surfaceElevated: '#f1f3f9',
    surfaceGlass: 'rgba(255, 255, 255, 0.72)',
    text: '#0f172a',
    textMuted: 'rgba(15, 23, 42, 0.62)',
    border: 'rgba(15, 23, 42, 0.10)',
    borderStrong: 'rgba(15, 23, 42, 0.18)',
    primary: '#6d28d9',
    primarySoft: 'rgba(109, 40, 217, 0.12)',
    shadowSm: '0 2px 8px rgba(15,23,42,0.08)',
    shadowMd: '0 8px 24px rgba(15,23,42,0.12)',
    shadowLg: '0 16px 48px rgba(15,23,42,0.16)',
    shadowGlow: '0 0 24px rgba(109, 40, 217, 0.2)',
  }),

  glassDark: clone(defaultTokens, {
    background: 'transparent',
    surface: 'rgba(12, 16, 28, 0.72)',
    surfaceElevated: 'rgba(20, 26, 42, 0.65)',
    surfaceGlass: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.14)',
    primary: '#8b7bff',
    shadowMd: '0 12px 40px rgba(0,0,0,0.45)',
  }),

  glassLight: clone(defaultTokens, {
    background: 'transparent',
    surface: 'rgba(255, 255, 255, 0.7)',
    surfaceElevated: 'rgba(255, 255, 255, 0.82)',
    surfaceGlass: 'rgba(255, 255, 255, 0.55)',
    text: '#0f172a',
    textMuted: 'rgba(15, 23, 42, 0.6)',
    border: 'rgba(15, 23, 42, 0.12)',
    primary: '#6366f1',
    shadowMd: '0 12px 40px rgba(15,23,42,0.12)',
  }),

  neon: clone(defaultTokens, {
    background: '#050510',
    surface: '#0a0a20',
    surfaceElevated: '#101030',
    border: '#00ffcc55',
    text: '#eaffff',
    textMuted: '#00ffcc99',
    primary: '#ff00ff',
    primarySoft: 'rgba(255, 0, 255, 0.15)',
    listening: '#ff0066',
    speaking: '#00ffcc',
    processing: '#00aaff',
    shadowGlow: '0 0 28px rgba(255, 0, 255, 0.45)',
    radiusSm: '4px',
    radiusMd: '6px',
    radiusLg: '8px',
  }),

  minimal: clone(defaultTokens, {
    background: '#111',
    surface: '#181818',
    surfaceElevated: '#202020',
    surfaceGlass: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    primary: '#a3a3a3',
    primarySoft: 'rgba(163,163,163,0.12)',
    listening: '#d4d4d4',
    shadowGlow: 'none',
    radiusSm: '6px',
    radiusMd: '8px',
    radiusLg: '10px',
  }),

  highContrast: clone(defaultTokens, {
    background: '#000000',
    surface: '#000000',
    surfaceElevated: '#0a0a0a',
    surfaceGlass: '#000000',
    text: '#ffffff',
    textMuted: '#ffff00',
    border: '#ffffff',
    borderStrong: '#ffffff',
    primary: '#ffff00',
    primarySoft: 'rgba(255, 255, 0, 0.2)',
    success: '#00ff00',
    warning: '#ffaa00',
    danger: '#ff0000',
    info: '#00ffff',
    listening: '#ff0000',
    speaking: '#00ff00',
    processing: '#00ffff',
    idle: '#ffffff',
    shadowRing: '0 0 0 3px #ffff00',
  }),

  // Back-compat aliases for existing theme names
  dark: null, // filled below
  light: null,
  glass: null,
  cyberpunk: null,
  premium_dark_orange: null,
};

builtInThemes.dark = builtInThemes.defaultDark;
builtInThemes.light = builtInThemes.defaultLight;
builtInThemes.glass = builtInThemes.glassDark;
builtInThemes.cyberpunk = builtInThemes.neon;
builtInThemes.premium_dark_orange = clone(defaultTokens, {
  surface: 'rgba(20, 20, 25, 0.85)',
  surfaceElevated: 'rgba(30, 30, 35, 0.6)',
  border: 'rgba(255, 140, 0, 0.2)',
  primary: '#ff8c00',
  primarySoft: 'rgba(255, 140, 0, 0.15)',
  shadowGlow: '0 0 15px rgba(255, 140, 0, 0.15)',
});

export const themeNames = Object.keys(builtInThemes).filter(
  (n) => !['dark', 'light', 'glass', 'cyberpunk', 'premium_dark_orange'].includes(n)
);

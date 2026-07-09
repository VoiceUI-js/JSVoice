/**
 * Default design tokens for the Hyper Voice UI Kit.
 * Mapped to CSS variables with --jsv- prefix.
 */

export const defaultTokens = {
  // Color
  background: '#0b0d12',
  surface: '#141821',
  surfaceElevated: '#1c2230',
  surfaceGlass: 'rgba(255, 255, 255, 0.06)',
  text: '#f4f6fb',
  textMuted: 'rgba(244, 246, 251, 0.62)',
  border: 'rgba(255, 255, 255, 0.10)',
  borderStrong: 'rgba(255, 255, 255, 0.22)',
  primary: '#7c5cff',
  primarySoft: 'rgba(124, 92, 255, 0.18)',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#38bdf8',
  listening: '#ef4444',
  speaking: '#22c55e',
  processing: '#3b82f6',
  idle: '#64748b',

  // Spacing
  spaceXs: '4px',
  spaceSm: '8px',
  spaceMd: '12px',
  spaceLg: '16px',
  spaceXl: '24px',
  space2xl: '32px',

  // Radius
  radiusSm: '8px',
  radiusMd: '12px',
  radiusLg: '16px',
  radiusXl: '24px',
  radiusFull: '9999px',

  // Shadow
  shadowSm: '0 2px 8px rgba(0,0,0,0.25)',
  shadowMd: '0 8px 24px rgba(0,0,0,0.35)',
  shadowLg: '0 16px 48px rgba(0,0,0,0.45)',
  shadowGlow: '0 0 24px rgba(124, 92, 255, 0.35)',
  shadowRing: '0 0 0 3px rgba(124, 92, 255, 0.35)',

  // Typography
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  fontSizeXs: '11px',
  fontSizeSm: '12px',
  fontSizeMd: '14px',
  fontSizeLg: '16px',
  fontSizeXl: '20px',
  lineHeight: '1.45',

  // Motion
  durationFast: '120ms',
  durationNormal: '200ms',
  durationSlow: '360ms',
  easingStandard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  easingSoft: 'cubic-bezier(0.16, 1, 0.3, 1)',

  // Z-index
  zDock: '9500',
  zHud: '9600',
  zOverlay: '9700',
  zModal: '9800',
  zToast: '9900',

  // Phase 2 visual tokens
  blurSm: '6px',
  blurMd: '12px',
  blurLg: '20px',
  glowPrimary: '0 0 24px rgba(124, 92, 255, 0.4)',
  glowDanger: '0 0 20px rgba(239, 68, 68, 0.35)',
  overlay: 'rgba(0, 0, 0, 0.55)',
  backdrop: 'rgba(8, 10, 16, 0.72)',
  ringFocus: '0 0 0 3px rgba(124, 92, 255, 0.4)',
  statusIdle: '#64748b',
  statusListening: '#ef4444',
  statusProcessing: '#3b82f6',
  statusSpeaking: '#22c55e',
  statusError: '#ef4444',
  densityComfortable: '1',
  densityCompact: '0.85',
  densitySpacious: '1.15',
};

/**
 * Convert token object to CSS variable map (--jsv-*).
 * Also emits legacy --jv-* aliases for existing kit components.
 * @param {Record<string, string>} tokens
 * @returns {Record<string, string>}
 */
export function tokensToCssVars(tokens) {
  const map = {};
  const kebab = (k) => k.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

  for (const [key, value] of Object.entries(tokens)) {
    map[`--jsv-${kebab(key)}`] = value;
  }

  // Legacy aliases used by existing components
  map['--jv-bg-surface'] = tokens.surface;
  map['--jv-bg-panel'] = tokens.surfaceElevated;
  map['--jv-bg-canvas'] = tokens.background;
  map['--jv-border'] = tokens.border;
  map['--jv-text-primary'] = tokens.text;
  map['--jv-text-secondary'] = tokens.textMuted;
  map['--jv-accent'] = tokens.primary;
  map['--jv-danger'] = tokens.danger;
  map['--jv-focus-ring'] = tokens.shadowRing;
  map['--jv-radius-sm'] = tokens.radiusSm;
  map['--jv-radius-md'] = tokens.radiusMd;
  map['--jv-radius-lg'] = tokens.radiusLg;
  map['--jv-shadow-sm'] = tokens.shadowSm;
  map['--jv-shadow-glow'] = tokens.shadowGlow;
  map['--jv-backdrop-blur'] = '12px';

  return map;
}

/**
 * Shared inline style helpers for kit components (zero CSS deps).
 */

export const baseFont = {
  fontFamily: 'var(--jsv-font-family, system-ui, sans-serif)',
  fontSize: 'var(--jsv-font-size-md, 14px)',
  lineHeight: 'var(--jsv-line-height, 1.45)',
  color: 'var(--jsv-text, #f4f6fb)',
};

export const glassPanel = {
  background: 'var(--jsv-surface-glass, var(--jsv-surface, #141821))',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid var(--jsv-border, rgba(255,255,255,0.1))',
  borderRadius: 'var(--jsv-radius-lg, 16px)',
  boxShadow: 'var(--jsv-shadow-md, 0 8px 24px rgba(0,0,0,0.35))',
};

export const elevatedPanel = {
  background: 'var(--jsv-surface-elevated, #1c2230)',
  border: '1px solid var(--jsv-border, rgba(255,255,255,0.1))',
  borderRadius: 'var(--jsv-radius-md, 12px)',
  boxShadow: 'var(--jsv-shadow-sm, 0 2px 8px rgba(0,0,0,0.25))',
};

export function statusColor(status) {
  const map = {
    idle: 'var(--jsv-idle, #64748b)',
    listening: 'var(--jsv-listening, #ef4444)',
    processing: 'var(--jsv-processing, #3b82f6)',
    speaking: 'var(--jsv-speaking, #22c55e)',
    error: 'var(--jsv-danger, #ef4444)',
    disabled: 'var(--jsv-text-muted, #888)',
    starting: 'var(--jsv-info, #38bdf8)',
    stopping: 'var(--jsv-warning, #f59e0b)',
  };
  return map[status] || map.idle;
}

export const btnBase = {
  ...baseFont,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  border: '1px solid var(--jsv-border)',
  borderRadius: 'var(--jsv-radius-md, 12px)',
  padding: '8px 14px',
  cursor: 'pointer',
  background: 'var(--jsv-surface-elevated, #1c2230)',
  color: 'var(--jsv-text)',
  transition: 'background var(--jsv-duration-fast, 120ms) var(--jsv-easing-standard, ease), transform 120ms ease',
  outline: 'none',
};

export const btnPrimary = {
  ...btnBase,
  background: 'var(--jsv-primary, #7c5cff)',
  borderColor: 'transparent',
  color: '#fff',
  boxShadow: 'var(--jsv-shadow-glow)',
};

export const inputBase = {
  ...baseFont,
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--jsv-radius-md, 12px)',
  border: '1px solid var(--jsv-border)',
  background: 'var(--jsv-surface, #141821)',
  color: 'var(--jsv-text)',
  outline: 'none',
};

export function placementStyle(placement = 'bottom-right', offset = 20) {
  const base = { position: 'fixed', zIndex: 'var(--jsv-z-dock, 9500)' };
  switch (placement) {
    case 'bottom-left':
      return { ...base, bottom: offset, left: offset };
    case 'bottom-center':
      return { ...base, bottom: offset, left: '50%', transform: 'translateX(-50%)' };
    case 'top-left':
      return { ...base, top: offset, left: offset };
    case 'top-right':
      return { ...base, top: offset, right: offset };
    case 'bottom-right':
    default:
      return { ...base, bottom: offset, right: offset };
  }
}

export function focusRing(e) {
  if (e?.currentTarget) {
    e.currentTarget.style.boxShadow = 'var(--jsv-shadow-ring)';
  }
}

export function blurRing(e, restore = 'none') {
  if (e?.currentTarget) {
    e.currentTarget.style.boxShadow = restore;
  }
}

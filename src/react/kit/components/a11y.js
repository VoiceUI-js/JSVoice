/**
 * Accessibility-focused kit surfaces.
 */
import React, { useEffect, useState } from 'react';
import { useVoiceKitStore, useVoiceCommands } from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { isBrowser } from '../../../ui-kit/utils/domSafe.js';
import { baseFont } from '../styles.js';
import { VoiceButton, VoiceCard, VoiceDrawer, VoiceEmptyState } from './primitives.js';

export function VoiceA11yLiveRegion({ message }) {
  return React.createElement(
    'div',
    {
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      style: {
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        border: 0,
      },
    },
    message || ''
  );
}

export function VoiceA11yStatus() {
  const ui = useVoiceKitStore((s) => s.ui || {});
  return React.createElement(
    VoiceCard,
    { title: 'A11y status' },
    React.createElement('ul', { style: { margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--jsv-text-muted)' } },
      React.createElement('li', null, `Reduced motion: ${ui.reducedMotion ? 'on' : 'off'}`),
      React.createElement('li', null, `High contrast: ${ui.highContrast ? 'on' : 'off'}`),
      React.createElement('li', null, `Density: ${ui.density || 'comfortable'}`)
    )
  );
}

export function VoiceA11yReducedMotionToggle() {
  const on = useVoiceKitStore((s) => !!s.ui?.reducedMotion);
  return React.createElement(
    VoiceButton,
    {
      'aria-pressed': on,
      onClick: () => VoiceKitActions.setReducedMotion(!on),
    },
    on ? 'Reduced motion on' : 'Reduced motion off'
  );
}

export function VoiceA11yHighContrastToggle() {
  const on = useVoiceKitStore((s) => !!s.ui?.highContrast);
  return React.createElement(
    VoiceButton,
    {
      'aria-pressed': on,
      onClick: () => {
        if (!on) VoiceKitActions.setHighContrast(true);
        else {
          VoiceKitActions.updateSettings({ highContrast: false });
          VoiceKitActions.setTheme('glassDark');
        }
      },
    },
    on ? 'High contrast on' : 'High contrast off'
  );
}

export function VoiceA11yKeyboardHelp() {
  return React.createElement(
    VoiceCard,
    { title: 'Keyboard shortcuts' },
    React.createElement('ul', { style: { margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.7 } },
      React.createElement('li', null, React.createElement('kbd', null, '⌘/Ctrl+K'), ' Open command palette'),
      React.createElement('li', null, React.createElement('kbd', null, 'Esc'), ' Close modal / drawer / palette'),
      React.createElement('li', null, React.createElement('kbd', null, '↑ ↓'), ' Navigate command list'),
      React.createElement('li', null, React.createElement('kbd', null, 'Enter'), ' Run selected command'),
      React.createElement('li', null, React.createElement('kbd', null, '?'), ' Open this help')
    )
  );
}

export function VoiceA11yScreenReaderHints() {
  return React.createElement(
    VoiceCard,
    { title: 'Screen reader hints' },
    React.createElement(
      'p',
      { style: { fontSize: 13, color: 'var(--jsv-text-muted)', margin: 0 } },
      'Voice status updates use aria-live regions. Interactive controls expose accessible names. Prefer saying exact command phrases listed in Command Center.'
    )
  );
}

export function VoiceA11yFocusPreview() {
  const [focused, setFocused] = useState('');
  useEffect(() => {
    if (!isBrowser()) return undefined;
    const onFocus = (e) => {
      const t = e.target;
      const label = t?.getAttribute?.('aria-label') || t?.tagName || '';
      setFocused(String(label));
    };
    globalThis.document.addEventListener('focusin', onFocus);
    return () => globalThis.document.removeEventListener('focusin', onFocus);
  }, []);
  return React.createElement(
    VoiceCard,
    { title: 'Focus preview' },
    React.createElement('div', { style: { fontSize: 13 } }, focused || 'Focus an element…')
  );
}

export function VoiceA11yTapTargetInspector() {
  return React.createElement(
    VoiceCard,
    { title: 'Tap targets' },
    React.createElement(
      'p',
      { style: { fontSize: 13, color: 'var(--jsv-text-muted)', margin: 0 } },
      'Kit buttons use minimum comfortable padding. Prefer size="md" or larger on touch devices. Use VoiceMobileControls for thumb-friendly layouts.'
    )
  );
}

export function VoiceA11yChecklist() {
  const items = [
    'Icon-only buttons have aria-label',
    'Modals trap focus and close on Escape',
    'Palette supports arrow + enter',
    'Status changes announced via live regions',
    'Reduced motion respected',
    'High contrast theme available',
  ];
  return React.createElement(
    VoiceCard,
    { title: 'A11y checklist' },
    React.createElement(
      'ul',
      { style: { margin: 0, paddingLeft: 18, fontSize: 13 } },
      items.map((it) => React.createElement('li', { key: it }, it))
    )
  );
}

export function VoiceA11yPanel({ style }) {
  const commands = useVoiceCommands().slice(0, 10);
  const helpOpen = useVoiceKitStore((s) => !!s.ui?.helpOpen);
  const liveMsg = useVoiceKitStore((s) => s.ui?.lastCommand || '');

  useEffect(() => {
    if (!isBrowser()) return undefined;
    const onKey = (e) => {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = e.target?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        VoiceKitActions.setHelpOpen(true);
      }
    };
    globalThis.window.addEventListener('keydown', onKey);
    return () => globalThis.window.removeEventListener('keydown', onKey);
  }, []);

  return React.createElement(
    'div',
    { style: { display: 'grid', gap: 12, ...baseFont, ...style } },
    React.createElement('h2', { style: { margin: 0 } }, 'Accessibility'),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
      React.createElement(VoiceA11yReducedMotionToggle, null),
      React.createElement(VoiceA11yHighContrastToggle, null),
      React.createElement(VoiceButton, { onClick: () => VoiceKitActions.setHelpOpen(true) }, 'Keyboard help')
    ),
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 } },
      React.createElement(VoiceA11yStatus, null),
      React.createElement(VoiceA11yChecklist, null),
      React.createElement(VoiceA11yKeyboardHelp, null),
      React.createElement(VoiceA11yScreenReaderHints, null),
      React.createElement(VoiceA11yFocusPreview, null),
      React.createElement(VoiceA11yTapTargetInspector, null),
      React.createElement(
        VoiceCard,
        { title: 'Available voice phrases' },
        commands.length === 0
          ? React.createElement(VoiceEmptyState, { title: 'No commands registered' })
          : React.createElement(
              'ul',
              { style: { margin: 0, paddingLeft: 18, fontSize: 13 } },
              commands.map((c) => React.createElement('li', { key: c.id || c.phrase }, c.phrase))
            )
      )
    ),
    React.createElement(
      VoiceDrawer,
      {
        open: helpOpen,
        onClose: () => VoiceKitActions.setHelpOpen(false),
        title: 'Help',
      },
      React.createElement(VoiceA11yKeyboardHelp, null),
      React.createElement('div', { style: { height: 12 } }),
      React.createElement(VoiceA11yScreenReaderHints, null)
    ),
    React.createElement(VoiceA11yLiveRegion, { message: liveMsg })
  );
}

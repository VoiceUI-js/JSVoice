/**
 * Voice mode overlays and page control helpers.
 */
import React, { useEffect, useState } from 'react';
import { useVoiceKitStore, useVoiceCommands } from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { scanInteractiveElements, resolveSafeClick } from '../../../ui-kit/utils/voiceMode.js';
import { isBrowser } from '../../../ui-kit/utils/domSafe.js';
import { baseFont, glassPanel } from '../styles.js';
import { VoiceButton, VoiceCard, VoiceConfirmDialog, VoiceEmptyState } from './primitives.js';
import {
  VoiceModeOverlay as BaseOverlay,
  VoiceFocusRing,
  VoiceHintLayer,
  VoiceNumberTags as BaseNumberTags,
} from './panels.js';

export { VoiceHintLayer as VoiceModeHintLayer, VoiceFocusRing as VoiceModeFocusRing };

export function VoiceModeShell({ children, style }) {
  const active = useVoiceKitStore((s) => !!s.voiceMode);
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      'data-voice-mode': active ? 'on' : 'off',
      style: { position: 'relative', ...style },
    },
    children,
    active && React.createElement(VoiceModeOverlay, null)
  );
}

export function VoiceModeToolbar() {
  const active = useVoiceKitStore((s) => !!s.voiceMode);
  return React.createElement(
    'div',
    { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 } },
    React.createElement(
      VoiceButton,
      {
        variant: active ? 'danger' : 'primary',
        'aria-pressed': active,
        onClick: () => VoiceKitActions.setVoiceMode?.(!active),
      },
      active ? 'Exit voice mode' : 'Enter voice mode'
    ),
    React.createElement(
      VoiceButton,
      {
        onClick: () => {
          const tags = scanInteractiveElements(null, 30);
          VoiceKitActions.setVoiceModeTags(tags);
          VoiceKitActions.pushToast({ title: 'Scanned', message: `${tags.length} targets`, tone: 'info' });
        },
      },
      'Scan page'
    ),
    React.createElement(VoiceButton, { onClick: () => VoiceKitActions.setHelpOpen(true) }, 'Keyboard help')
  );
}

export function VoiceModeCommandHints() {
  const commands = useVoiceCommands().slice(0, 6);
  const hints = useVoiceKitStore((s) => s.ui?.voiceModeHints !== false);
  if (!hints) return null;
  return React.createElement(VoiceHintLayer, {
    hints: ['Voice mode', ...commands.map((c) => `Say “${c.phrase}”`), 'Say “click 3” after scan'],
  });
}

export function VoiceModeNumberTags({ tags: tagsProp }) {
  const storeTags = useVoiceKitStore((s) => s.voiceModeTags || []);
  const tags = tagsProp || storeTags;
  return React.createElement(BaseNumberTags, {
    items: tags.map((t) => ({ id: t.id, label: `${t.index}. ${t.label}` })),
  });
}

export function VoiceModeElementScanner({ style }) {
  const tags = useVoiceKitStore((s) => s.voiceModeTags || []);
  return React.createElement(
    VoiceCard,
    { title: 'Element scanner', style },
    React.createElement(
      VoiceButton,
      {
        onClick: () => VoiceKitActions.setVoiceModeTags(scanInteractiveElements(null, 40)),
      },
      'Rescan'
    ),
    React.createElement('div', { style: { height: 8 } }),
    tags.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No tags — scan the page' })
      : tags.map((t) =>
          React.createElement(
            'div',
            {
              key: t.id,
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
                fontSize: 12,
                padding: '4px 0',
                color: t.dangerous ? 'var(--jsv-danger)' : 'var(--jsv-text-muted)',
              },
            },
            React.createElement('span', null, `${t.index}. ${t.label}`),
            t.dangerous && React.createElement('span', null, 'needs confirm')
          )
        )
  );
}

export function VoiceModeRegionMap() {
  const tags = useVoiceKitStore((s) => s.voiceModeTags || []);
  return React.createElement(
    VoiceCard,
    { title: 'Region map' },
    React.createElement(
      'div',
      { style: { position: 'relative', height: 160, background: 'var(--jsv-background)', borderRadius: 8 } },
      tags.slice(0, 20).map((t) =>
        React.createElement('span', {
          key: t.id,
          title: t.label,
          style: {
            position: 'absolute',
            left: `${Math.min(95, (t.x / (isBrowser() ? globalThis.innerWidth || 1 : 1)) * 100)}%`,
            top: `${Math.min(90, (t.y / (isBrowser() ? globalThis.innerHeight || 1 : 1)) * 100)}%`,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: t.dangerous ? 'var(--jsv-danger)' : 'var(--jsv-primary)',
          },
        })
      )
    )
  );
}

export function VoiceModeActionMenu({ onClickTag }) {
  const tags = useVoiceKitStore((s) => s.voiceModeTags || []);
  const [pending, setPending] = useState(null);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      VoiceCard,
      { title: 'Actions' },
      tags.slice(0, 12).map((t) =>
        React.createElement(
          VoiceButton,
          {
            key: t.id,
            size: 'sm',
            style: { marginRight: 6, marginBottom: 6 },
            onClick: () => {
              const res = resolveSafeClick(t, { confirm: () => false });
              if (res.requiresConfirm && !res.approved) {
                setPending(t);
                return;
              }
              onClickTag?.(t);
              VoiceKitActions.pushToast({ title: 'Click', message: t.label, tone: 'info' });
            },
          },
          `Click ${t.index}`
        )
      )
    ),
    React.createElement(VoiceConfirmDialog, {
      open: !!pending,
      title: 'Confirm dangerous action',
      message: pending ? `“${pending.label}” may be destructive. Confirm?` : '',
      onCancel: () => setPending(null),
      onConfirm: () => {
        onClickTag?.(pending);
        VoiceKitActions.pushToast({ title: 'Confirmed', message: pending?.label, tone: 'warning' });
        setPending(null);
      },
    })
  );
}

export function VoiceModeKeyboardHelp() {
  return React.createElement(
    VoiceCard,
    { title: 'Voice mode help' },
    React.createElement('ul', { style: { margin: 0, paddingLeft: 18, fontSize: 13 } },
      React.createElement('li', null, 'Scan page to number targets'),
      React.createElement('li', null, 'Say or click “click N”'),
      React.createElement('li', null, 'Dangerous actions require confirmation'),
      React.createElement('li', null, 'Esc / disable voice mode to exit')
    )
  );
}

export function VoiceModeSafeClickConfirm(props) {
  return React.createElement(VoiceConfirmDialog, props);
}

export function VoiceModePageSummary() {
  const tags = useVoiceKitStore((s) => s.voiceModeTags || []);
  return React.createElement(
    VoiceCard,
    { title: 'Page summary' },
    React.createElement('div', { style: { fontSize: 13 } }, `${tags.length} interactive targets`),
    React.createElement('div', { style: { fontSize: 13, color: 'var(--jsv-text-muted)' } },
      `${tags.filter((t) => t.dangerous).length} require confirmation`)
  );
}

export function VoiceModeReadingPanel({ text }) {
  return React.createElement(
    VoiceCard,
    { title: 'Reading mode' },
    React.createElement(
      'p',
      { style: { margin: 0, fontSize: 15, lineHeight: 1.6 } },
      text || 'Select content or use built-in “read content” voice actions.'
    )
  );
}

export function VoiceModeNavigationHints() {
  return React.createElement(
    VoiceCard,
    { title: 'Navigation hints' },
    React.createElement('div', { style: { fontSize: 13, color: 'var(--jsv-text-muted)' } },
      'Try: go back, scroll down, open command palette, show help')
  );
}

export function VoiceModeOverlay(props) {
  const active = useVoiceKitStore((s) => !!s.voiceMode);
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(BaseOverlay, props),
    React.createElement(VoiceFocusRing, { active }),
    active && React.createElement(VoiceModeCommandHints, null),
    active &&
      React.createElement(
        'div',
        {
          style: {
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 'var(--jsv-z-overlay)',
            ...glassPanel,
            padding: 8,
            ...baseFont,
          },
        },
        React.createElement(VoiceModeNumberTags, null)
      )
  );
}

export function VoiceModePanel({ style }) {
  return React.createElement(
    'div',
    { style: { display: 'grid', gap: 12, ...baseFont, ...style } },
    React.createElement('h2', { style: { margin: 0 } }, 'Voice mode'),
    React.createElement(VoiceModeToolbar, null),
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 } },
      React.createElement(VoiceModeElementScanner, null),
      React.createElement(VoiceModeRegionMap, null),
      React.createElement(VoiceModeActionMenu, null),
      React.createElement(VoiceModePageSummary, null),
      React.createElement(VoiceModeKeyboardHelp, null),
      React.createElement(VoiceModeNavigationHints, null),
      React.createElement(VoiceModeReadingPanel, null)
    ),
    React.createElement(VoiceModeOverlay, null)
  );
}

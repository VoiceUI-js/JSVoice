/**
 * Layout shells for product UIs.
 */
import React, { useState } from 'react';
import { baseFont, glassPanel } from '../styles.js';
import { VoiceButton } from './primitives.js';
import { useVoiceKitStore } from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { VoiceStatusPill } from './controls-extra.js';

export function VoiceTopbar({ title = 'JSVoice', actions, style }) {
  return React.createElement(
    'header',
    {
      'data-jsvoice-kit': true,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 16px',
        borderBottom: '1px solid var(--jsv-border)',
        background: 'var(--jsv-surface-glass)',
        backdropFilter: 'blur(var(--jsv-blur-md))',
        ...baseFont,
        ...style,
      },
    },
    React.createElement(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 10 } },
      React.createElement('strong', { style: { fontSize: 16 } }, title),
      React.createElement(VoiceStatusPill, null)
    ),
    React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } }, actions)
  );
}

export function VoiceSidebar({ items = [], active, onChange, style }) {
  return React.createElement(
    'nav',
    {
      'aria-label': 'Sidebar',
      style: {
        width: 220,
        borderRight: '1px solid var(--jsv-border)',
        padding: 12,
        background: 'var(--jsv-surface)',
        ...baseFont,
        ...style,
      },
    },
    items.map((item) => {
      const id = typeof item === 'string' ? item : item.id;
      const label = typeof item === 'string' ? item : item.label;
      const selected = active === id;
      return React.createElement(
        'button',
        {
          key: id,
          type: 'button',
          onClick: () => onChange?.(id),
          style: {
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: '10px 12px',
            marginBottom: 4,
            borderRadius: 10,
            border: '1px solid transparent',
            background: selected ? 'var(--jsv-primary-soft)' : 'transparent',
            color: 'var(--jsv-text)',
            cursor: 'pointer',
            fontWeight: selected ? 600 : 400,
          },
        },
        label
      );
    })
  );
}

export function VoiceBottombar({ children, style }) {
  return React.createElement(
    'footer',
    {
      style: {
        padding: '10px 16px',
        borderTop: '1px solid var(--jsv-border)',
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        ...style,
      },
    },
    children
  );
}

export function VoiceSplitPanel({ left, right, leftWidth = 280, style }) {
  return React.createElement(
    'div',
    {
      style: {
        display: 'grid',
        gridTemplateColumns: `${leftWidth}px 1fr`,
        minHeight: 0,
        flex: 1,
        ...style,
      },
    },
    React.createElement('div', { style: { borderRight: '1px solid var(--jsv-border)', overflow: 'auto' } }, left),
    React.createElement('div', { style: { overflow: 'auto', minWidth: 0 } }, right)
  );
}

export function VoiceResizablePanel({ children, style }) {
  // Lightweight: CSS resize without external deps
  return React.createElement(
    'div',
    {
      style: {
        resize: 'horizontal',
        overflow: 'auto',
        minWidth: 200,
        maxWidth: '80%',
        borderRight: '1px solid var(--jsv-border)',
        ...style,
      },
    },
    children
  );
}

export function VoicePanelStack({ children, style }) {
  return React.createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: 12, ...style } },
    children
  );
}

export function VoiceFloatingLayer({ children, style }) {
  return React.createElement(
    'div',
    {
      style: {
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 'var(--jsv-z-overlay)',
        ...style,
      },
    },
    React.createElement('div', { style: { pointerEvents: 'auto' } }, children)
  );
}

export function VoiceKitShell({
  title = 'Hyper Voice UI Kit',
  nav = [],
  active,
  onNavigate,
  children,
  style,
}) {
  const density = useVoiceKitStore((s) => s.ui?.density || 'comfortable');
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      'data-density': density,
      style: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--jsv-background)',
        color: 'var(--jsv-text)',
        ...baseFont,
        ...style,
      },
    },
    React.createElement(VoiceTopbar, {
      title,
      actions: [
        React.createElement(
          VoiceButton,
          { key: 'k', size: 'sm', onClick: () => VoiceKitActions.setPaletteOpen(true) },
          '⌘K'
        ),
        React.createElement(
          VoiceButton,
          { key: 'd', size: 'sm', onClick: () => VoiceKitActions.toggleDebug() },
          'Debug'
        ),
        React.createElement(
          VoiceButton,
          { key: 's', size: 'sm', onClick: () => VoiceKitActions.setSettingsOpen(true) },
          'Settings'
        ),
      ],
    }),
    React.createElement(
      'div',
      { style: { display: 'flex', flex: 1, minHeight: 0 } },
      nav.length > 0 &&
        React.createElement(VoiceSidebar, {
          items: nav,
          active,
          onChange: onNavigate,
        }),
      React.createElement(
        'main',
        { style: { flex: 1, overflow: 'auto', padding: 20, minWidth: 0 } },
        children
      )
    )
  );
}

export function VoiceDashboardLayout({ children, style }) {
  return React.createElement(
    'div',
    {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        ...style,
      },
    },
    children
  );
}

export function VoiceWorkbenchLayout({ sidebar, children, style }) {
  return React.createElement(VoiceSplitPanel, {
    left: sidebar,
    right: children,
    leftWidth: 240,
    style: { minHeight: '70vh', ...glassPanel, ...style },
  });
}

export function VoiceDevToolsLayout({ children, style }) {
  return React.createElement(
    'div',
    {
      style: {
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        minHeight: 480,
        ...glassPanel,
        overflow: 'hidden',
        ...style,
      },
    },
    children
  );
}

export function VoiceSettingsLayout({ tabs, active, onChange, children, style }) {
  return React.createElement(
    'div',
    { style: { display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, ...style } },
    React.createElement(VoiceSidebar, { items: tabs, active, onChange }),
    React.createElement('div', null, children)
  );
}

export { VoiceAssistantLayout } from './assistant.js';

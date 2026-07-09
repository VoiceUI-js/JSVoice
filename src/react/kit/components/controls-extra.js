/**
 * Phase 2 expanded voice control components.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useVoiceOptional, useVoiceKitStore, useVoiceUi } from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { formatStatus } from '../../../ui-kit/utils/formatters.js';
import { statusAriaLabel } from '../../../ui-kit/utils/accessibility.js';
import { baseFont, glassPanel, elevatedPanel, statusColor, placementStyle, btnBase, btnPrimary } from '../styles.js';
import { VoiceButton, VoiceSelect } from './primitives.js';
import { VoiceOrb, VoiceWaveform, VoiceDock } from './voice-controls.js';

function useSnap() {
  const voice = useVoiceOptional();
  const [snap, setSnap] = useState(() => voice?.getSnapshot?.() || { status: 'idle', transcript: {}, engine: {} });
  useEffect(() => {
    if (!voice?.subscribe) return undefined;
    setSnap(voice.getSnapshot?.() || snap);
    return voice.subscribe((s) => setSnap(s || {}));
  }, [voice]);
  return { voice, snap };
}

export function VoiceStatusPill({ status: statusProp, style }) {
  const { snap } = useSnap();
  const status = statusProp || snap.status || 'idle';
  return React.createElement(
    'span',
    {
      'data-jsvoice-kit': true,
      role: 'status',
      'aria-label': statusAriaLabel(status),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 999,
        background: 'var(--jsv-primary-soft)',
        border: '1px solid var(--jsv-border)',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        ...baseFont,
        ...style,
      },
    },
    React.createElement('span', {
      'aria-hidden': true,
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: statusColor(status),
        boxShadow: `0 0 8px ${statusColor(status)}`,
        animation: status === 'listening' ? 'jsv-pulse 1.2s ease-in-out infinite' : 'none',
      },
    }),
    formatStatus(status)
  );
}

export function VoiceStatusRing({ size = 48, style }) {
  const { snap } = useSnap();
  const status = snap.status || 'idle';
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'img',
      'aria-label': statusAriaLabel(status),
      style: {
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid ${statusColor(status)}`,
        boxShadow: `0 0 0 4px var(--jsv-primary-soft), var(--jsv-glow-primary)`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: status === 'listening' ? 'jsv-pulse 1.4s ease-in-out infinite' : 'none',
        ...style,
      },
    },
    React.createElement('span', {
      style: { width: size * 0.35, height: size * 0.35, borderRadius: '50%', background: statusColor(status) },
    })
  );
}

export function VoiceListeningIndicator({ style }) {
  const { snap } = useSnap();
  if (snap.status !== 'listening') return null;
  return React.createElement(VoiceStatusPill, { status: 'listening', style });
}

export function VoiceSpeakingIndicator({ style }) {
  const { snap } = useSnap();
  if (snap.status !== 'speaking') return null;
  return React.createElement(
    'div',
    { style: { display: 'inline-flex', alignItems: 'center', gap: 8, ...style } },
    React.createElement(VoiceStatusPill, { status: 'speaking' }),
    React.createElement(VoiceWaveform, { bars: 8 })
  );
}

export function VoiceProcessingIndicator({ style }) {
  const { snap } = useSnap();
  if (snap.status !== 'processing') return null;
  return React.createElement(
    'div',
    {
      role: 'status',
      className: 'jsv-processing-shimmer',
      style: {
        padding: '6px 12px',
        borderRadius: 8,
        fontSize: 12,
        color: 'var(--jsv-text-muted)',
        ...style,
      },
    },
    'Processing…'
  );
}

export function VoiceMicButton({ style, label = 'Microphone' }) {
  const { voice, snap } = useSnap();
  const listening = snap.status === 'listening';
  return React.createElement(
    VoiceButton,
    {
      variant: listening ? 'danger' : 'primary',
      'aria-label': listening ? `${label}: stop` : `${label}: start`,
      'aria-pressed': listening,
      onClick: () => voice?.toggle?.(),
      style,
    },
    listening ? 'Stop mic' : 'Start mic'
  );
}

export function VoiceMuteButton({ style }) {
  const muted = useVoiceKitStore((s) => !!s.ui?.speechMuted);
  return React.createElement(
    VoiceButton,
    {
      'aria-label': muted ? 'Unmute speech' : 'Mute speech',
      'aria-pressed': muted,
      onClick: () => VoiceKitActions.setMuted(!muted),
      style,
    },
    muted ? 'Unmute' : 'Mute'
  );
}

export function VoiceStopButton({ style }) {
  const { voice } = useSnap();
  return React.createElement(
    VoiceButton,
    { 'aria-label': 'Stop listening', onClick: () => voice?.stop?.(), style },
    'Stop'
  );
}

export function VoiceRestartButton({ style }) {
  const { voice } = useSnap();
  return React.createElement(
    VoiceButton,
    {
      'aria-label': 'Restart listening',
      onClick: async () => {
        await voice?.stop?.();
        await voice?.start?.();
      },
      style,
    },
    'Restart'
  );
}

export function VoiceWakeButton({ style }) {
  const { voice } = useSnap();
  const wake = voice?.options?.wakeWord;
  return React.createElement(
    VoiceButton,
    {
      'aria-label': wake ? `Wake word ${wake}` : 'No wake word configured',
      disabled: !wake,
      style,
      onClick: () => VoiceKitActions.pushToast({ title: 'Wake word', message: wake || 'Not set', tone: 'info' }),
    },
    wake ? `Wake: ${wake}` : 'Wake off'
  );
}

export function VoiceVolumeControl({ style }) {
  const vol = useVoiceKitStore((s) => s.ui?.volume ?? 1);
  return React.createElement(
    'label',
    { style: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, ...baseFont, ...style } },
    React.createElement('span', { style: { color: 'var(--jsv-text-muted)' } }, `Volume ${Math.round(vol * 100)}%`),
    React.createElement('input', {
      type: 'range',
      min: 0,
      max: 1,
      step: 0.05,
      value: vol,
      'aria-label': 'Speech volume',
      onChange: (e) => VoiceKitActions.updateSettings({ volume: Number(e.target.value) }),
    })
  );
}

export function VoiceSpeedControl({ style }) {
  const rate = useVoiceKitStore((s) => s.ui?.speechRate ?? 1);
  return React.createElement(
    'label',
    { style: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, ...baseFont, ...style } },
    React.createElement('span', { style: { color: 'var(--jsv-text-muted)' } }, `Speed ${rate.toFixed(1)}x`),
    React.createElement('input', {
      type: 'range',
      min: 0.5,
      max: 2,
      step: 0.1,
      value: rate,
      'aria-label': 'Speech rate',
      onChange: (e) => VoiceKitActions.updateSettings({ speechRate: Number(e.target.value) }),
    })
  );
}

export function VoiceLanguageSelect({ style }) {
  const lang = useVoiceKitStore((s) => s.ui?.language || 'en-US');
  const { voice } = useSnap();
  return React.createElement(VoiceSelect, {
    label: 'Language',
    value: lang,
    options: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN'],
    style,
    onChange: (v) => {
      VoiceKitActions.updateSettings({ language: v });
      voice?.setOption?.('lang', v);
    },
  });
}

export function VoiceEngineSelect({ style }) {
  const { snap } = useSnap();
  const name = snap.engine?.name || snap.engine?.mode || 'auto';
  return React.createElement(
    'div',
    { style: { fontSize: 13, ...baseFont, ...style } },
    React.createElement('div', { style: { color: 'var(--jsv-text-muted)', marginBottom: 4 } }, 'Engine'),
    React.createElement('div', { style: { ...elevatedPanel, padding: '8px 10px' } }, name)
  );
}

export function VoiceScopeSelect(props) {
  // re-export pattern via dynamic use of store scope
  const scope = useVoiceKitStore((s) => s.ui?.scope || 'global');
  const { voice } = useSnap();
  return React.createElement(VoiceSelect, {
    label: 'Scope',
    value: scope,
    options: ['global', ...(voice?.listScopes?.() || [])],
    ...props,
    onChange: (v) => {
      VoiceKitActions.updateSettings({ scope: v });
      voice?.setScope?.(v);
    },
  });
}

export function VoiceModeToggle({ style }) {
  const active = useVoiceKitStore((s) => !!s.voiceMode);
  return React.createElement(
    VoiceButton,
    {
      'aria-pressed': active,
      'aria-label': active ? 'Disable voice mode' : 'Enable voice mode',
      onClick: () => VoiceKitActions.setVoiceMode?.(!active),
      style,
    },
    active ? 'Voice mode on' : 'Voice mode off'
  );
}

export function VoiceCompactControls({ style }) {
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      style: { display: 'inline-flex', gap: 6, alignItems: 'center', ...style },
    },
    React.createElement(VoiceMicButton, null),
    React.createElement(VoiceMuteButton, null),
    React.createElement(VoiceStatusPill, null)
  );
}

export function VoiceMobileControls({ style }) {
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      style: {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        padding: 12,
        display: 'flex',
        justifyContent: 'space-around',
        gap: 8,
        ...glassPanel,
        borderRadius: '16px 16px 0 0',
        zIndex: 'var(--jsv-z-dock)',
        ...style,
      },
    },
    React.createElement(VoiceMicButton, null),
    React.createElement(VoiceButton, {
      'aria-label': 'Open command palette',
      onClick: () => VoiceKitActions.setPaletteOpen(true),
    }, 'Commands'),
    React.createElement(VoiceMuteButton, null),
    React.createElement(VoiceButton, {
      'aria-label': 'Open settings',
      onClick: () => VoiceKitActions.setSettingsOpen(true),
    }, 'Settings')
  );
}

export function VoiceControlBar({ showEngine = true, showScope = true, showTranscript = true, style }) {
  const { snap } = useSnap();
  const partial = snap.transcript?.partial || snap.transcript?.final || '';
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'toolbar',
      'aria-label': 'Voice control bar',
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        padding: '10px 14px',
        ...glassPanel,
        ...baseFont,
        ...style,
      },
    },
    React.createElement(VoiceOrb, { size: 'sm' }),
    React.createElement(VoiceStatusPill, null),
    React.createElement(VoiceMicButton, null),
    React.createElement(VoiceStopButton, null),
    React.createElement(VoiceMuteButton, null),
    showEngine && React.createElement(VoiceEngineSelect, { style: { minWidth: 120 } }),
    showScope && React.createElement(VoiceScopeSelect, { style: { minWidth: 120 } }),
    showTranscript &&
      React.createElement(
        'span',
        {
          style: {
            flex: 1,
            minWidth: 120,
            color: 'var(--jsv-text-muted)',
            fontSize: 13,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        },
        partial || '…'
      ),
    React.createElement(VoiceButton, {
      size: 'sm',
      'aria-label': 'Open command palette',
      onClick: () => VoiceKitActions.setPaletteOpen(true),
    }, '⌘K')
  );
}

export function VoiceFloatingButton({ placement = 'bottom-right', style }) {
  return React.createElement(
    'div',
    { style: { ...placementStyle(placement, 24), ...style } },
    React.createElement(VoiceOrb, { size: 'lg', variant: 'glass' })
  );
}

export function VoiceMiniDock({ placement = 'bottom-right', style }) {
  const { snap } = useSnap();
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'region',
      'aria-label': 'Mini voice dock',
      style: {
        ...placementStyle(placement),
        ...glassPanel,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        ...style,
      },
    },
    React.createElement(VoiceOrb, { size: 'sm' }),
    React.createElement(VoiceStatusPill, { status: snap.status }),
    React.createElement(VoiceMicButton, null)
  );
}

export function VoiceFullDock(props) {
  return React.createElement(VoiceDock, { collapsed: false, ...props });
}

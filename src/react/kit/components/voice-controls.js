/**
 * Core voice controls: Orb, Dock, HUD, PTT, waveform, badges, etc.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  useVoiceOptional,
  useVoiceKitStore,
  useVoiceCommands,
  useVoicePermissions,
  useVoiceUi,
  useVoiceTranscript,
} from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { ORB_SIZES } from '../../../ui-kit/core/constants.js';
import { statusAriaLabel } from '../../../ui-kit/utils/accessibility.js';
import { formatConfidence, formatStatus, formatTime, truncate } from '../../../ui-kit/utils/formatters.js';
import {
  isSpeechRecognitionSupported,
  isSecureContext,
  copyToClipboard,
  downloadJson,
} from '../../../ui-kit/utils/domSafe.js';
import { matchesHotkey, moveIndex } from '../../../ui-kit/utils/keyboard.js';
import {
  baseFont,
  glassPanel,
  elevatedPanel,
  statusColor,
  placementStyle,
  btnBase,
  btnPrimary,
} from '../styles.js';
import { VoiceButton, VoiceCard, VoiceEmptyState, VoiceInput, VoiceSelect, VoiceToastHost } from './primitives.js';
import { themeNames } from '../../../ui-kit/theme/themes.js';
import { uikitStore } from '../../../ui-kit/core/store.js';

function useLiveSnapshot() {
  const voice = useVoiceOptional();
  const [snap, setSnap] = useState(() => voice?.getSnapshot?.() || { status: 'idle', transcript: {}, engine: {}, permissions: {} });

  useEffect(() => {
    if (!voice) return undefined;
    setSnap(voice.getSnapshot?.() || snap);
    if (typeof voice.subscribe !== 'function') return undefined;
    return voice.subscribe((s) => setSnap(s || {}));
  }, [voice]);

  return { voice, snap };
}

export function VoiceStatusBadge({ status: statusProp, style }) {
  const { snap } = useLiveSnapshot();
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
        padding: '4px 10px',
        borderRadius: 'var(--jsv-radius-full)',
        background: 'var(--jsv-primary-soft)',
        border: '1px solid var(--jsv-border)',
        fontSize: 'var(--jsv-font-size-xs)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: 'var(--jsv-text)',
        ...baseFont,
        ...style,
      },
    },
    React.createElement('span', {
      'aria-hidden': true,
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: statusColor(status),
        boxShadow: status === 'listening' ? `0 0 8px ${statusColor(status)}` : 'none',
        animation: status === 'listening' ? 'jsv-pulse 1.4s ease-in-out infinite' : 'none',
      },
    }),
    formatStatus(status)
  );
}

export function VoiceOrb({
  size = 'lg',
  variant = 'glass',
  disabled = false,
  longPressPtt = false,
  onToggle,
  style,
}) {
  const { voice, snap } = useLiveSnapshot();
  const status = disabled ? 'disabled' : snap.status || 'idle';
  const px = ORB_SIZES[size] || ORB_SIZES.lg;
  const pressTimer = useRef(null);
  const pttActive = useRef(false);

  const toggle = useCallback(() => {
    if (disabled) return;
    if (onToggle) return onToggle();
    if (!voice) return;
    if (typeof voice.toggle === 'function') voice.toggle();
    else if (voice.isListening) voice.stop?.();
    else voice.start?.();
  }, [disabled, onToggle, voice]);

  const onPointerDown = () => {
    if (!longPressPtt || disabled) return;
    pressTimer.current = setTimeout(() => {
      pttActive.current = true;
      voice?.start?.();
    }, 280);
  };
  const onPointerUp = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (pttActive.current) {
      pttActive.current = false;
      voice?.stop?.();
      return;
    }
    toggle();
  };

  const variants = {
    solid: { background: statusColor(status), border: 'none' },
    glass: {
      background: 'var(--jsv-surface-glass)',
      border: '1px solid var(--jsv-border-strong, var(--jsv-border))',
      backdropFilter: 'blur(10px)',
    },
    minimal: { background: 'transparent', border: `2px solid ${statusColor(status)}` },
    neon: {
      background: '#0a0a20',
      border: `2px solid ${statusColor(status)}`,
      boxShadow: `0 0 20px ${statusColor(status)}`,
    },
  };

  return React.createElement(
    'button',
    {
      type: 'button',
      'data-jsvoice-kit': true,
      'aria-label': `${statusAriaLabel(status)}. Activate to toggle listening`,
      'aria-pressed': status === 'listening',
      disabled,
      title: formatStatus(status),
      onClick: longPressPtt ? undefined : toggle,
      onPointerDown,
      onPointerUp,
      onPointerLeave: () => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
      },
      onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      },
      style: {
        width: px,
        height: px,
        borderRadius: '50%',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform var(--jsv-duration-fast), box-shadow var(--jsv-duration-normal)',
        outline: 'none',
        opacity: disabled ? 0.5 : 1,
        ...(variants[variant] || variants.glass),
        ...style,
      },
    },
    status === 'listening' &&
      React.createElement('span', {
        'aria-hidden': true,
        style: {
          position: 'absolute',
          inset: -6,
          borderRadius: '50%',
          border: `2px solid ${statusColor(status)}`,
          animation: 'jsv-ring 1.6s ease-out infinite',
        },
      }),
    React.createElement('span', {
      'aria-hidden': true,
      style: {
        width: px * 0.38,
        height: px * 0.38,
        borderRadius: '50%',
        background: statusColor(status),
        boxShadow: `0 0 16px ${statusColor(status)}`,
        animation: status === 'listening' || status === 'speaking' ? 'jsv-pulse 1.2s ease-in-out infinite' : 'none',
      },
    })
  );
}

export function WakeWordIndicator({ style }) {
  const { voice, snap } = useLiveSnapshot();
  const wake = voice?.options?.wakeWord;
  if (!wake) return null;
  const active = snap.status === 'listening';
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'status',
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 'var(--jsv-radius-full)',
        ...elevatedPanel,
        fontSize: 'var(--jsv-font-size-sm)',
        ...baseFont,
        ...style,
      },
    },
    React.createElement('span', {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: active ? 'var(--jsv-success)' : 'var(--jsv-idle)',
      },
    }),
    `Wake word: “${wake}”`
  );
}

export function PushToTalkButton({ label = 'Hold to Speak', style }) {
  const { voice } = useLiveSnapshot();
  return React.createElement(
    'button',
    {
      type: 'button',
      'data-jsvoice-kit': true,
      'aria-label': label,
      onMouseDown: () => voice?.start?.(),
      onMouseUp: () => voice?.stop?.(),
      onMouseLeave: () => voice?.stop?.(),
      onTouchStart: (e) => {
        e.preventDefault();
        voice?.start?.();
      },
      onTouchEnd: () => voice?.stop?.(),
      onKeyDown: (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          voice?.start?.();
        }
      },
      onKeyUp: (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          voice?.stop?.();
        }
      },
      style: { ...btnPrimary, borderRadius: 'var(--jsv-radius-full)', ...style },
    },
    label
  );
}

export function HoldToSpeakButton(props) {
  return React.createElement(PushToTalkButton, props);
}

export function VoiceWaveform({ bars = 16, style }) {
  const { snap } = useLiveSnapshot();
  const active = snap.status === 'listening' || snap.status === 'speaking';
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'img',
      'aria-label': active ? 'Audio waveform active' : 'Audio waveform idle',
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        height: 28,
        ...style,
      },
    },
    Array.from({ length: bars }).map((_, i) =>
      React.createElement('span', {
        key: i,
        style: {
          width: 3,
          borderRadius: 2,
          background: statusColor(snap.status || 'idle'),
          height: active ? `${8 + ((i * 17) % 18)}px` : '4px',
          opacity: active ? 0.5 + (i % 5) * 0.1 : 0.35,
          transition: 'height 120ms ease',
          animation: active ? `jsv-pulse ${0.8 + (i % 5) * 0.1}s ease-in-out infinite` : 'none',
          animationDelay: `${i * 40}ms`,
        },
      })
    )
  );
}

export function VoiceAmplitudeMeter({ value, style }) {
  const { snap } = useLiveSnapshot();
  const level =
    typeof value === 'number'
      ? value
      : snap.status === 'listening'
        ? 0.55
        : snap.status === 'speaking'
          ? 0.4
          : 0.08;
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'meter',
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': Math.round(level * 100),
      'aria-label': 'Voice amplitude',
      style: {
        height: 8,
        borderRadius: 999,
        background: 'var(--jsv-surface-elevated)',
        border: '1px solid var(--jsv-border)',
        overflow: 'hidden',
        ...style,
      },
    },
    React.createElement('div', {
      style: {
        width: `${Math.max(4, Math.min(100, level * 100))}%`,
        height: '100%',
        background: statusColor(snap.status || 'idle'),
        transition: 'width 100ms linear',
      },
    })
  );
}

export function VoiceHUD({
  showTranscript = true,
  showEngine = true,
  showScope = true,
  showConfidence = false,
  placement = 'bottom-right',
  style,
}) {
  const { snap } = useLiveSnapshot();
  const ui = useVoiceKitStore((s) => s.ui || {});
  const lastCommand = ui.lastCommand;
  const status = snap.status || 'idle';
  if (status === 'idle' && !snap.transcript?.partial && !lastCommand) return null;

  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'status',
      'aria-live': 'polite',
      style: {
        ...placementStyle(placement, 88),
        ...glassPanel,
        padding: '12px 14px',
        minWidth: 220,
        maxWidth: 340,
        zIndex: 'var(--jsv-z-hud, 9600)',
        animation: 'jsv-fade-in 160ms ease',
        ...baseFont,
        ...style,
      },
    },
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 } },
      React.createElement(VoiceStatusBadge, { status }),
      showEngine &&
        React.createElement(
          'span',
          { style: { fontSize: 'var(--jsv-font-size-xs)', color: 'var(--jsv-text-muted)' } },
          snap.engine?.name || snap.engine?.mode || 'engine'
        )
    ),
    showTranscript &&
      React.createElement(
        'div',
        { style: { fontWeight: 500, minHeight: 20 } },
        snap.transcript?.partial || snap.transcript?.final || 'Listening…'
      ),
    lastCommand &&
      React.createElement(
        'div',
        { style: { marginTop: 6, fontSize: 'var(--jsv-font-size-sm)', color: 'var(--jsv-success)' } },
        `⌘ ${lastCommand}`
      ),
    showScope &&
      React.createElement(
        'div',
        { style: { marginTop: 6, fontSize: 'var(--jsv-font-size-xs)', color: 'var(--jsv-text-muted)' } },
        `Scope: ${ui.scope || 'global'}`
      ),
    showConfidence &&
      React.createElement(
        'div',
        { style: { marginTop: 4, fontSize: 'var(--jsv-font-size-xs)', color: 'var(--jsv-text-muted)' } },
        `Confidence: ${formatConfidence(snap.metrics?.confidence)}`
      ),
    ui.lastError &&
      React.createElement(
        'div',
        { style: { marginTop: 6, color: 'var(--jsv-danger)', fontSize: 'var(--jsv-font-size-sm)' } },
        ui.lastError
      )
  );
}

export function VoiceDock({
  placement: placementProp,
  collapsed: collapsedProp,
  style,
}) {
  const { voice, snap } = useLiveSnapshot();
  const ui = useVoiceKitStore((s) => s.ui || {});
  const placement = placementProp || ui.placement || 'bottom-right';
  const collapsed = collapsedProp ?? !!ui.dockCollapsed;
  const muted = !!ui.speechMuted;
  const partial = snap.transcript?.partial || snap.transcript?.final || '';

  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'region',
      'aria-label': 'Voice control dock',
      style: {
        ...placementStyle(placement),
        ...glassPanel,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: collapsed ? 10 : '12px 14px',
        maxWidth: collapsed ? 72 : 420,
        ...baseFont,
        ...style,
      },
    },
    React.createElement(VoiceOrb, { size: collapsed ? 'sm' : 'md', variant: 'glass' }),
    !collapsed &&
      React.createElement(
        'div',
        { style: { flex: 1, minWidth: 0 } },
        React.createElement(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 } },
          React.createElement(VoiceStatusBadge, null),
          React.createElement(VoiceWaveform, { bars: 10, style: { height: 18 } })
        ),
        React.createElement(
          'div',
          {
            style: {
              fontSize: 'var(--jsv-font-size-sm)',
              color: 'var(--jsv-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          },
          truncate(partial || 'Say a command or press the orb', 48)
        )
      ),
    !collapsed &&
      React.createElement(
        'div',
        { style: { display: 'flex', gap: 6 } },
        React.createElement(
          VoiceButton,
          {
            size: 'sm',
            'aria-label': snap.status === 'listening' ? 'Stop listening' : 'Start listening',
            onClick: () => voice?.toggle?.(),
          },
          snap.status === 'listening' ? 'Stop' : 'Start'
        ),
        React.createElement(
          VoiceButton,
          {
            size: 'sm',
            'aria-label': 'Open command palette',
            onClick: () => VoiceKitActions.setPaletteOpen(true),
          },
          '⌘K'
        ),
        React.createElement(
          VoiceButton,
          {
            size: 'sm',
            'aria-label': muted ? 'Unmute speech' : 'Mute speech',
            onClick: () => VoiceKitActions.setMuted(!muted),
          },
          muted ? 'Unmute' : 'Mute'
        ),
        React.createElement(
          VoiceButton,
          {
            size: 'sm',
            'aria-label': 'Open debug panel',
            onClick: () => VoiceKitActions.toggleDebug(),
          },
          'Debug'
        ),
        React.createElement(
          VoiceButton,
          {
            size: 'sm',
            variant: 'ghost',
            'aria-label': 'Collapse dock',
            onClick: () => VoiceKitActions.setDockCollapsed(true),
          },
          '–'
        )
      ),
    collapsed &&
      React.createElement(
        VoiceButton,
        {
          size: 'sm',
          variant: 'ghost',
          'aria-label': 'Expand dock',
          onClick: () => VoiceKitActions.setDockCollapsed(false),
        },
        '+'
      ),
    React.createElement(VoiceToastHost, null)
  );
}

export function VoicePermissionCard({ style }) {
  const perms = useVoicePermissions();
  const { voice } = useLiveSnapshot();

  return React.createElement(
    VoiceCard,
    { title: 'Microphone & browser', style },
    React.createElement(
      'ul',
      { style: { margin: '0 0 12px', paddingLeft: 18, color: 'var(--jsv-text-muted)' } },
      React.createElement('li', null, `Microphone: ${perms.microphone}`),
      React.createElement('li', null, `Secure context: ${perms.secureContext ? 'yes' : 'no (HTTPS required)'}`),
      React.createElement(
        'li',
        null,
        `Native Web Speech API: ${perms.speechRecognition ? 'supported' : 'not supported'} (default local Whisper does not require it)`
      ),
      React.createElement('li', null, `Speech synthesis: ${perms.speechSynthesis ? 'supported' : 'not supported'}`),
      React.createElement(
        'li',
        null,
        isSpeechRecognitionSupported()
          ? 'Native recognition available'
          : 'Native recognition unavailable — Hybrid engine can fall back to local ASR'
      )
    ),
    !perms.secureContext &&
      React.createElement(
        'p',
        { style: { color: 'var(--jsv-warning)' } },
        'Microphone access requires a secure context (localhost or HTTPS).'
      ),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
      React.createElement(
        VoiceButton,
        { variant: 'primary', onClick: () => perms.requestMicrophone() },
        'Request microphone'
      ),
      React.createElement(
        VoiceButton,
        {
          onClick: () => voice?.start?.(),
          disabled: !isSecureContext(),
        },
        'Try start listening'
      )
    )
  );
}

export function VoiceEngineSwitcher({ style }) {
  const { voice, snap } = useLiveSnapshot();
  const name = snap.engine?.name || snap.engine?.mode || 'auto';
  return React.createElement(
    VoiceCard,
    { title: 'Speech engine', style },
    React.createElement(
      'p',
      { style: { margin: '0 0 10px', color: 'var(--jsv-text-muted)' } },
      `Active: ${name}`
    ),
    React.createElement(
      'p',
      { style: { margin: 0, fontSize: 'var(--jsv-font-size-sm)', color: 'var(--jsv-text-muted)' } },
      'Engine switching is controlled via createVoice({ engineMode }). Default is local Whisper tiny; use "native" for vendor Web Speech, or "auto" for local-first with native fallback.'
    ),
    voice?.options?.engineMode &&
      React.createElement(
        'div',
        { style: { marginTop: 8, fontSize: 'var(--jsv-font-size-sm)' } },
        `Mode option: ${voice.options.engineMode}`
      )
  );
}

export function setUiScope(scope) {
  uikitStore.setState((s) => ({
    ui: { ...(s.ui || {}), scope },
  }));
}

export function VoiceScopeSwitcher({ scopes = ['global'], style }) {
  const { voice } = useLiveSnapshot();
  const ui = useVoiceKitStore((s) => s.ui || {});
  const current = ui.scope || voice?.currentScope || 'global';
  const allScopes = Array.from(
    new Set([
      ...scopes,
      ...(voice?.listScopes?.() || []),
      'global',
    ])
  );

  return React.createElement(VoiceSelect, {
    label: 'Command scope',
    value: current,
    options: allScopes,
    style,
    onChange: (v) => {
      setUiScope(v);
      voice?.setScope?.(v);
    },
  });
}

export function VoiceCommandItem({ command, active, onSelect, onRun, onCopy }) {
  return React.createElement(
    'div',
    {
      role: 'option',
      'aria-selected': !!active,
      tabIndex: -1,
      onClick: () => onSelect?.(command),
      onDoubleClick: () => onRun?.(command),
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 'var(--jsv-radius-md)',
        background: active ? 'var(--jsv-primary-soft)' : 'transparent',
        border: active ? '1px solid var(--jsv-primary)' : '1px solid transparent',
        cursor: 'pointer',
        ...baseFont,
      },
    },
    React.createElement(
      'div',
      { style: { minWidth: 0 } },
      React.createElement('div', { style: { fontWeight: 600 } }, command.phrase),
      React.createElement(
        'div',
        { style: { fontSize: 'var(--jsv-font-size-xs)', color: 'var(--jsv-text-muted)' } },
        `${command.type} · ${command.scope}${command.group ? ` · ${command.group}` : ''}`
      )
    ),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: 4 } },
      React.createElement(
        VoiceButton,
        {
          size: 'sm',
          'aria-label': `Copy ${command.phrase}`,
          onClick: (e) => {
            e.stopPropagation();
            onCopy?.(command);
          },
        },
        'Copy'
      ),
      React.createElement(
        VoiceButton,
        {
          size: 'sm',
          variant: 'primary',
          'aria-label': `Run ${command.phrase}`,
          onClick: (e) => {
            e.stopPropagation();
            onRun?.(command);
          },
        },
        'Run'
      )
    )
  );
}

export function VoiceCommandList({ commands = [], activeIndex = 0, onSelect, onRun, onCopy, style }) {
  if (!commands.length) {
    return React.createElement(VoiceEmptyState, {
      title: 'No commands',
      description: 'Register commands on your JSVoice instance to see them here.',
    });
  }
  return React.createElement(
    'div',
    {
      role: 'listbox',
      'aria-label': 'Voice commands',
      'data-jsvoice-kit': true,
      style: { display: 'flex', flexDirection: 'column', gap: 4, ...style },
    },
    commands.map((cmd, i) =>
      React.createElement(VoiceCommandItem, {
        key: cmd.id || cmd.phrase + i,
        command: cmd,
        active: i === activeIndex,
        onSelect,
        onRun,
        onCopy,
      })
    )
  );
}

export function VoiceCommandPalette({
  hotkey = 'mod+k',
  groups,
  open: openProp,
  onOpenChange,
  style,
}) {
  const { voice } = useLiveSnapshot();
  const storeOpen = useVoiceKitStore((s) => !!s.ui?.paletteOpen);
  const open = openProp ?? storeOpen;
  const setOpen = (v) => {
    VoiceKitActions.setPaletteOpen(v);
    onOpenChange?.(v);
  };
  const commands = useVoiceCommands();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const filtered = commands.filter((c) => {
    if (groups?.length && c.group && !groups.includes(c.group) && c.group !== 'custom') {
      // soft filter — still show if query matches
    }
    if (!query) return true;
    return c.phrase.toLowerCase().includes(query.toLowerCase());
  });

  useEffect(() => {
    const onKey = (e) => {
      if (matchesHotkey(hotkey, e)) {
        e.preventDefault();
        setOpen(!open);
      } else if (open && e.key === 'Escape') {
        setOpen(false);
      }
    };
    globalThis.window?.addEventListener('keydown', onKey);
    return () => globalThis.window?.removeEventListener('keydown', onKey);
  }, [hotkey, open]);

  useEffect(() => {
    if (open) {
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const runCommand = async (cmd) => {
    if (!cmd || !voice) return;
    try {
      if (typeof voice.processText === 'function') {
        await voice.processText(cmd.phrase);
      } else if (typeof voice.speak === 'function') {
        voice.speak(`Running ${cmd.phrase}`);
      }
      VoiceKitActions.pushToast({ title: 'Command', message: cmd.phrase, tone: 'success' });
      setOpen(false);
    } catch (err) {
      VoiceKitActions.pushToast({ title: 'Failed', message: String(err), tone: 'danger' });
    }
  };

  const copyCmd = async (cmd) => {
    await copyToClipboard(cmd.phrase);
    VoiceKitActions.pushToast({ title: 'Copied', message: cmd.phrase, tone: 'info' });
  };

  if (!open) return null;

  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      role: 'presentation',
      onClick: () => setOpen(false),
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        zIndex: 'var(--jsv-z-modal, 9800)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      },
    },
    React.createElement(
      'div',
      {
        role: 'combobox',
        'aria-expanded': true,
        'aria-haspopup': 'listbox',
        'aria-label': 'Command palette',
        onClick: (e) => e.stopPropagation(),
        style: {
          ...glassPanel,
          width: 'min(560px, 94vw)',
          maxHeight: '70vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          ...baseFont,
          ...style,
        },
      },
      React.createElement('input', {
        ref: inputRef,
        role: 'searchbox',
        'aria-autocomplete': 'list',
        placeholder: 'Search voice commands…',
        value: query,
        onChange: (e) => {
          setQuery(e.target.value);
          setActive(0);
        },
        onKeyDown: (e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => moveIndex(i, 1, filtered.length));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => moveIndex(i, -1, filtered.length));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            runCommand(filtered[active]);
          }
        },
        style: {
          border: 'none',
          borderBottom: '1px solid var(--jsv-border)',
          background: 'transparent',
          padding: '14px 16px',
          fontSize: 'var(--jsv-font-size-lg)',
          color: 'var(--jsv-text)',
          outline: 'none',
        },
      }),
      React.createElement(
        'div',
        { style: { overflow: 'auto', padding: 8, maxHeight: '50vh' } },
        React.createElement(VoiceCommandList, {
          commands: filtered,
          activeIndex: active,
          onSelect: (c) => setActive(filtered.indexOf(c)),
          onRun: runCommand,
          onCopy: copyCmd,
        })
      ),
      React.createElement(
        'div',
        {
          style: {
            padding: '8px 12px',
            borderTop: '1px solid var(--jsv-border)',
            fontSize: 'var(--jsv-font-size-xs)',
            color: 'var(--jsv-text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
          },
        },
        React.createElement('span', null, `${filtered.length} commands`),
        React.createElement('span', null, '↑↓ navigate · Enter run · Esc close')
      )
    )
  );
}

export function VoiceTranscriptLine({ entry, onPin, compact }) {
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      style: {
        display: 'flex',
        gap: 10,
        padding: compact ? '6px 0' : '10px 0',
        borderBottom: '1px solid var(--jsv-border)',
        ...baseFont,
      },
    },
    React.createElement(
      'span',
      { style: { color: 'var(--jsv-text-muted)', fontSize: 'var(--jsv-font-size-xs)', minWidth: 72 } },
      formatTime(entry.timestamp)
    ),
    React.createElement(
      'div',
      { style: { flex: 1, minWidth: 0 } },
      React.createElement('div', null, entry.text),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 } },
        entry.status &&
          React.createElement(
            'span',
            {
              style: {
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 999,
                background: 'var(--jsv-primary-soft)',
              },
            },
            entry.status
          ),
        entry.command &&
          React.createElement(
            'span',
            {
              style: {
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 999,
                background: 'rgba(34,197,94,0.15)',
                color: 'var(--jsv-success)',
              },
            },
            entry.command
          ),
        entry.engine &&
          React.createElement(
            'span',
            { style: { fontSize: 10, color: 'var(--jsv-text-muted)' } },
            entry.engine
          )
      )
    ),
    React.createElement(
      VoiceButton,
      {
        size: 'sm',
        variant: 'ghost',
        'aria-label': entry.pinned ? 'Unpin' : 'Pin',
        onClick: () => onPin?.(entry),
      },
      entry.pinned ? 'Unpin' : 'Pin'
    )
  );
}

export function VoiceTranscript({ maxItems = 50, compact = false, style }) {
  const [query, setQuery] = useState('');
  const { entries, partial, clear, pin } = useVoiceTranscript({ maxItems, query });

  return React.createElement(
    VoiceCard,
    {
      title: 'Transcript',
      style,
      footer: React.createElement(
        'div',
        { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
        React.createElement(
          VoiceButton,
          {
            size: 'sm',
            onClick: async () => {
              await copyToClipboard(entries.map((e) => e.text).join('\n'));
            },
          },
          'Copy'
        ),
        React.createElement(
          VoiceButton,
          {
            size: 'sm',
            onClick: () => downloadJson(`jsvoice-transcript-${Date.now()}.json`, entries),
          },
          'Export JSON'
        ),
        React.createElement(VoiceButton, { size: 'sm', variant: 'danger', onClick: () => clear() }, 'Clear')
      ),
    },
    React.createElement(VoiceInput, {
      label: 'Filter',
      value: query,
      onChange: setQuery,
      placeholder: 'Filter transcript…',
      style: { marginBottom: 8 },
    }),
    partial &&
      React.createElement(
        'div',
        {
          style: {
            padding: 8,
            marginBottom: 8,
            borderRadius: 'var(--jsv-radius-md)',
            background: 'var(--jsv-primary-soft)',
            fontStyle: 'italic',
            color: 'var(--jsv-text-muted)',
          },
        },
        `Interim: ${partial}`
      ),
    entries.length === 0
      ? React.createElement(VoiceEmptyState, {
          title: 'No transcript yet',
          description: 'Start listening to capture speech here.',
        })
      : entries
          .slice()
          .reverse()
          .map((e) =>
            React.createElement(VoiceTranscriptLine, {
              key: e.id,
              entry: e,
              compact,
              onPin: (entry) => pin(entry.id, !entry.pinned),
            })
          )
  );
}

export function VoiceThemeSwitcher({ style }) {
  const ui = useVoiceUi();
  const { setTheme } = (() => {
    try {
      // dynamic import avoided — use store + actions
      return {
        setTheme: (name) => {
          VoiceKitActions.setTheme(name);
          ui.toast?.({ title: 'Theme', message: name, tone: 'info' });
        },
      };
    } catch {
      return { setTheme: VoiceKitActions.setTheme };
    }
  })();
  const current = ui.ui?.theme || 'glassDark';
  return React.createElement(VoiceSelect, {
    label: 'Theme',
    value: current,
    options: themeNames,
    style,
    onChange: (v) => setTheme(v),
  });
}


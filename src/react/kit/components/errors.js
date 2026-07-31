/**
 * Error / permission / recovery surfaces.
 */
import React, { Component } from 'react';
import {
  isBrowser,
  isSecureContext,
  isSpeechRecognitionSupported,
} from '../../../ui-kit/utils/domSafe.js';
import { useVoicePermissions } from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { baseFont, elevatedPanel } from '../styles.js';
import { VoiceButton, VoiceCard } from './primitives.js';

export class VoiceErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    if (typeof console !== 'undefined') console.error('[VoiceErrorBoundary]', error);
  }

  render() {
    if (this.state.error) {
      return React.createElement(VoiceErrorCard, {
        title: 'UI crashed',
        description: this.state.error.message || String(this.state.error),
        onRetry: () => this.setState({ error: null }),
        details: this.state.error.stack,
      });
    }
    return this.props.children;
  }
}

export function VoiceErrorCard({
  title = 'Something went wrong',
  description,
  onRetry,
  onFallback,
  details,
  style,
}) {
  const [open, setOpen] = React.useState(false);
  return React.createElement(
    'div',
    {
      role: 'alert',
      'data-jsvoice-kit': true,
      style: {
        ...elevatedPanel,
        padding: 16,
        borderColor: 'var(--jsv-danger)',
        ...baseFont,
        ...style,
      },
    },
    React.createElement('h3', { style: { margin: '0 0 8px', color: 'var(--jsv-danger)' } }, title),
    description && React.createElement('p', { style: { margin: '0 0 12px', color: 'var(--jsv-text-muted)' } }, description),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
      onRetry && React.createElement(VoiceButton, { variant: 'danger', onClick: onRetry }, 'Retry'),
      onFallback && React.createElement(VoiceButton, { onClick: onFallback }, 'Use fallback'),
      details &&
        React.createElement(
          VoiceButton,
          { variant: 'ghost', onClick: () => setOpen((v) => !v) },
          open ? 'Hide details' : 'Developer details'
        )
    ),
    open &&
      details &&
      React.createElement(
        'pre',
        {
          style: {
            marginTop: 12,
            fontSize: 11,
            overflow: 'auto',
            maxHeight: 160,
            color: 'var(--jsv-text-muted)',
          },
        },
        details
      )
  );
}

export function VoiceErrorToast({ message }) {
  React.useEffect(() => {
    if (message) {
      VoiceKitActions.pushToast({ title: 'Error', message, tone: 'danger' });
    }
  }, [message]);
  return null;
}

export function VoicePermissionErrorCard({ style }) {
  const perms = useVoicePermissions();
  return React.createElement(VoiceErrorCard, {
    title: 'Microphone permission',
    description: `Current state: ${perms.microphone}. Grant access to use voice recognition.`,
    onRetry: () => perms.requestMicrophone(),
    style,
  });
}

export function VoiceUnsupportedBrowserCard({ style }) {
  // Local Whisper-tiny is the default understander — lack of Web Speech is OK.
  if (!isBrowser()) return null;
  const hasMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  const hasWorker = typeof Worker !== 'undefined';
  if (hasMedia && hasWorker) return null;
  return React.createElement(VoiceErrorCard, {
    title: 'Browser not supported',
    description:
      'JSVoice needs microphone access and Web Workers for on-device Whisper. Try a modern browser over HTTPS.',
    style,
  });
}

/**
 * First-load progress for browser Whisper-tiny model (~30MB, cached after).
 */
export function VoiceModelLoadCard({
  progress = 0,
  status = 'loading',
  file,
  onRetry,
  onConfirmDownload,
  needsConfirm,
  error,
  style,
}) {
  if (status === 'ready' && !error) return null;

  const pct =
    typeof progress === 'number' && progress > 0 && progress <= 1
      ? Math.round(progress * 100)
      : typeof progress === 'number' && progress > 1
        ? Math.round(progress)
        : null;

  const title =
    status === 'error'
      ? 'Speech model failed'
      : needsConfirm
        ? 'Download speech model?'
        : 'Loading speech model';

  const description = error
    ? String(error)
    : needsConfirm
      ? 'On-device Whisper tiny (~30MB) understands your voice privately in any browser. Confirm download on this network.'
      : file
        ? `Downloading ${file}${pct != null ? ` (${pct}%)` : ''}…`
        : pct != null
          ? `Preparing private browser model… ${pct}%`
          : 'Preparing private browser model (Whisper tiny). First load may take a moment; then it is cached.';

  return React.createElement(
    'div',
    {
      role: 'status',
      'aria-live': 'polite',
      'data-jsvoice-kit': true,
      'data-jsvoice-model-load': status,
      style: {
        ...elevatedPanel,
        padding: 16,
        ...baseFont,
        ...style,
      },
    },
    React.createElement('h3', { style: { margin: '0 0 8px' } }, title),
    React.createElement(
      'p',
      { style: { margin: '0 0 12px', color: 'var(--jsv-text-muted)', fontSize: 13 } },
      description
    ),
    pct != null &&
      status !== 'error' &&
      !needsConfirm &&
      React.createElement(
        'div',
        {
          style: {
            height: 6,
            borderRadius: 4,
            background: 'var(--jsv-bg-panel, #222)',
            overflow: 'hidden',
            marginBottom: 12,
          },
        },
        React.createElement('div', {
          style: {
            width: `${Math.min(100, pct)}%`,
            height: '100%',
            background: 'var(--jsv-accent, #3b82f6)',
            transition: 'width 0.2s ease',
          },
        })
      ),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
      needsConfirm &&
        onConfirmDownload &&
        React.createElement(
          VoiceButton,
          { onClick: onConfirmDownload },
          'Download model'
        ),
      status === 'error' &&
        onRetry &&
        React.createElement(VoiceButton, { variant: 'danger', onClick: onRetry }, 'Retry'),
      React.createElement(
        'span',
        { style: { fontSize: 12, color: 'var(--jsv-text-muted)', alignSelf: 'center' } },
        '100% private · works offline after cache'
      )
    )
  );
}

/**
 * Missing optional peer @xenova/transformers for default local ASR.
 */
export function VoiceTransformersMissingCard({ onUseNative, style }) {
  return React.createElement(VoiceErrorCard, {
    title: 'Local speech package missing',
    description:
      'Default recognition uses on-device Whisper. Install: npm install @xenova/transformers — or switch to native Web Speech if available.',
    onRetry: undefined,
    onFallback: onUseNative,
    style,
  });
}

export function VoiceInsecureContextCard({ style }) {
  if (!isBrowser() || isSecureContext()) return null;
  return React.createElement(VoiceErrorCard, {
    title: 'Insecure context',
    description: 'Microphone access requires HTTPS or localhost.',
    style,
  });
}

export function VoiceMicBlockedCard({ style }) {
  const perms = useVoicePermissions();
  if (perms.microphone !== 'denied') return null;
  return React.createElement(VoicePermissionErrorCard, { style });
}

export function VoiceEngineUnavailableCard({ style }) {
  return React.createElement(VoiceErrorCard, {
    title: 'Engine unavailable',
    description: 'No speech engine could be initialized. Inject NativeSpeechEngine or use createVoice().',
    style,
  });
}

export function VoiceFallbackNotice({ message, style }) {
  return React.createElement(
    VoiceCard,
    { title: 'Fallback active', style },
    React.createElement('p', { style: { margin: 0, fontSize: 13, color: 'var(--jsv-text-muted)' } }, message || 'Using local/fallback recognition path.')
  );
}

export function VoiceTroubleshootingSteps({ style }) {
  const steps = [
    'Confirm HTTPS or localhost',
    'Allow microphone permission',
    'Install peer: npm install @xenova/transformers (default on-device Whisper)',
    'Wait for first model download (~30MB, then cached)',
    'Or set engineMode: "native" for vendor Web Speech',
    'Use FakeSpeechEngine for offline demos / CI',
    'Open Debug panel for snapshot/errors',
  ];
  return React.createElement(
    VoiceCard,
    { title: 'Troubleshooting', style },
    React.createElement(
      'ol',
      { style: { margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 } },
      steps.map((s) => React.createElement('li', { key: s }, s))
    )
  );
}

export function VoiceRecoveryPanel({ style, modelLoad }) {
  return React.createElement(
    'div',
    { style: { display: 'grid', gap: 12, ...style } },
    React.createElement(VoiceInsecureContextCard, null),
    React.createElement(VoiceUnsupportedBrowserCard, null),
    React.createElement(VoiceMicBlockedCard, null),
    modelLoad &&
      React.createElement(VoiceModelLoadCard, {
        progress: modelLoad.progress,
        status: modelLoad.status,
        file: modelLoad.file,
        error: modelLoad.error,
        needsConfirm: modelLoad.needsConfirm,
        onConfirmDownload: modelLoad.onConfirmDownload,
        onRetry: modelLoad.onRetry,
      }),
    React.createElement(VoiceTroubleshootingSteps, null)
  );
}

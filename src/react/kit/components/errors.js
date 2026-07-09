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
  const ok = isBrowser() && isSpeechRecognitionSupported();
  if (ok) return null;
  return React.createElement(VoiceErrorCard, {
    title: 'Limited browser support',
    description: 'Native Web Speech API is unavailable. Hybrid/local engines may still work.',
    onFallback: () =>
      VoiceKitActions.pushToast({
        title: 'Fallback',
        message: 'Use createVoice Hybrid mode or FakeSpeechEngine in demos',
        tone: 'info',
      }),
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
    'Check browser Web Speech support',
    'Try createVoice Hybrid mode',
    'Use FakeSpeechEngine for offline demos',
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

export function VoiceRecoveryPanel({ style }) {
  return React.createElement(
    'div',
    { style: { display: 'grid', gap: 12, ...style } },
    React.createElement(VoiceInsecureContextCard, null),
    React.createElement(VoiceUnsupportedBrowserCard, null),
    React.createElement(VoiceMicBlockedCard, null),
    React.createElement(VoiceTroubleshootingSteps, null)
  );
}

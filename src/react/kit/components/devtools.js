/**
 * Expanded developer tools UI.
 */
import React, { useState } from 'react';
import { useVoiceDebug, useVoiceKitStore, useVoicePermissions } from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { downloadJson } from '../../../ui-kit/utils/domSafe.js';
import { formatTime } from '../../../ui-kit/utils/formatters.js';
import {
  isSpeechRecognitionSupported,
  isSecureContext,
  isBrowser,
} from '../../../ui-kit/utils/domSafe.js';
import { baseFont, glassPanel } from '../styles.js';
import { VoiceButton, VoiceCard, VoiceEmptyState, VoiceInput, VoiceTabs, VoiceTable } from './primitives.js';
import {
  VoiceDebugPanel,
  RecognitionTimeline,
  CommandTrace,
  SnapshotViewer,
  EngineStatusPanel,
  EventLogViewer,
  SessionReplayPanel,
} from './panels.js';
import { VoiceStatusPill } from './controls-extra.js';

export function VoiceSnapshotPanel() {
  return React.createElement(SnapshotViewer, null);
}

export function VoiceStateInspector() {
  const ui = useVoiceKitStore((s) => s.ui || {});
  return React.createElement(
    VoiceCard,
    { title: 'UI state inspector' },
    React.createElement('pre', {
      style: { margin: 0, fontSize: 11, maxHeight: 220, overflow: 'auto' },
    }, JSON.stringify(ui, null, 2))
  );
}

export function VoiceEventTimeline() {
  return React.createElement(RecognitionTimeline, null);
}

export function VoiceErrorConsole() {
  const err = useVoiceKitStore((s) => s.ui?.lastError);
  const events = useVoiceKitStore((s) => (s.timeline || []).filter((e) => e.type === 'error').slice(-20));
  return React.createElement(
    VoiceCard,
    { title: 'Error console' },
    err && React.createElement('div', { style: { color: 'var(--jsv-danger)', marginBottom: 8 } }, err),
    events.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No errors' })
      : events.map((e) =>
          React.createElement(
            'div',
            { key: e.id, style: { fontSize: 12, color: 'var(--jsv-danger)', padding: '4px 0' } },
            `${formatTime(e.at)} — ${e.message || e.text || 'error'}`
          )
        )
  );
}

export function VoiceCommandTracePanel() {
  return React.createElement(CommandTrace, null);
}

export function VoiceRecognitionTrace() {
  return React.createElement(RecognitionTimeline, null);
}

export function VoiceEngineDiagnostics() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(EngineStatusPanel, null),
    React.createElement(
      VoiceCard,
      { title: 'Engine diagnostics', style: { marginTop: 12 } },
      React.createElement('ul', { style: { margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--jsv-text-muted)' } },
        React.createElement('li', null, `SpeechRecognition: ${isSpeechRecognitionSupported() ? 'yes' : 'no'}`),
        React.createElement('li', null, `Secure context: ${isSecureContext() ? 'yes' : 'no'}`),
        React.createElement('li', null, `Browser env: ${isBrowser() ? 'yes' : 'no'}`)
      )
    )
  );
}

export function VoicePermissionDiagnostics() {
  const perms = useVoicePermissions();
  return React.createElement(
    VoiceCard,
    { title: 'Permission diagnostics' },
    React.createElement('div', null, `Microphone: ${perms.microphone}`),
    React.createElement('div', null, `Secure: ${perms.secureContext ? 'yes' : 'no'}`),
    React.createElement('div', null, `Speech API: ${perms.speechRecognition ? 'yes' : 'no'}`),
    React.createElement(VoiceButton, { style: { marginTop: 8 }, onClick: () => perms.requestMicrophone() }, 'Retry permission')
  );
}

export function VoiceLatencyMeter() {
  const latencies = useVoiceKitStore((s) => s.analytics?.latencies || []);
  const last = latencies[latencies.length - 1];
  const avg = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
  return React.createElement(
    VoiceCard,
    { title: 'Latency meter' },
    React.createElement('div', { style: { fontSize: 24, fontWeight: 700 } }, last != null ? `${last}ms` : '—'),
    React.createElement('div', { style: { fontSize: 12, color: 'var(--jsv-text-muted)' } }, `Average ${avg}ms`)
  );
}

export function VoicePerformancePanel() {
  const a = useVoiceKitStore((s) => s.analytics || {});
  return React.createElement(
    VoiceCard,
    { title: 'Performance' },
    React.createElement(VoiceLatencyMeter, null),
    React.createElement('div', { style: { marginTop: 8, fontSize: 13, color: 'var(--jsv-text-muted)' } },
      `Recognized ${a.recognized || 0} · Failures ${a.failed || 0} · Fallbacks ${a.fallbacks || 0}`)
  );
}

export function VoiceTelemetryChart() {
  const a = useVoiceKitStore((s) => s.analytics || {});
  return React.createElement(
    VoiceCard,
    { title: 'Telemetry' },
    React.createElement('pre', { style: { margin: 0, fontSize: 11 } }, JSON.stringify({
      recognized: a.recognized,
      notRecognized: a.notRecognized,
      failed: a.failed,
      fallbacks: a.fallbacks,
    }, null, 2))
  );
}

export function VoiceCircuitBreakerPanel() {
  return React.createElement(
    VoiceCard,
    { title: 'Circuit breaker' },
    React.createElement(
      'p',
      { style: { margin: 0, fontSize: 13, color: 'var(--jsv-text-muted)' } },
      'Core CircuitBreaker protects recognition restarts. Watch error console + engine diagnostics when trips occur.'
    )
  );
}

export function VoiceLogSearch() {
  const [q, setQ] = useState('');
  const events = useVoiceKitStore((s) => s.events || []);
  const filtered = events.filter((e) => !q || (e.msg || '').toLowerCase().includes(q.toLowerCase()));
  return React.createElement(
    VoiceCard,
    { title: 'Log search' },
    React.createElement(VoiceInput, { label: 'Query', value: q, onChange: setQ, placeholder: 'Filter events…' }),
    filtered.slice(-30).reverse().map((e, i) =>
      React.createElement('div', { key: i, style: { fontSize: 12, padding: '4px 0', color: 'var(--jsv-text-muted)' } },
        `${formatTime(e.timestamp)} — ${e.msg}`)
    )
  );
}

export function VoiceLogExport() {
  return React.createElement(
    VoiceButton,
    {
      onClick: () => {
        const report = VoiceKitActions.exportDebugReport();
        downloadJson(`jsvoice-debug-${Date.now()}.json`, report);
      },
    },
    'Export logs'
  );
}

export function VoiceDebugReportButton() {
  return React.createElement(
    VoiceButton,
    {
      variant: 'primary',
      onClick: () => {
        const report = VoiceKitActions.exportDebugReport();
        downloadJson(`jsvoice-debug-report-${Date.now()}.json`, report);
        VoiceKitActions.pushToast({ title: 'Debug report', message: 'Exported JSON', tone: 'success' });
      },
    },
    'Export debug report'
  );
}

export function VoiceDevToolsPanel({ style }) {
  const [tab, setTab] = useState('snapshot');
  return React.createElement(
    'div',
    { style: { display: 'grid', gap: 12, ...baseFont, ...style } },
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' } },
      React.createElement('h2', { style: { margin: 0 } }, 'Voice DevTools'),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: 8 } },
        React.createElement(VoiceStatusPill, null),
        React.createElement(VoiceDebugReportButton, null)
      )
    ),
    React.createElement(VoiceTabs, {
      tabs: [
        { id: 'snapshot', label: 'Snapshot' },
        { id: 'timeline', label: 'Timeline' },
        { id: 'trace', label: 'Trace' },
        { id: 'errors', label: 'Errors' },
        { id: 'engine', label: 'Engine' },
        { id: 'perf', label: 'Perf' },
        { id: 'logs', label: 'Logs' },
        { id: 'replay', label: 'Replay' },
      ],
      value: tab,
      onChange: setTab,
    }),
    tab === 'snapshot' && React.createElement(React.Fragment, null, React.createElement(VoiceSnapshotPanel, null), React.createElement(VoiceStateInspector, null)),
    tab === 'timeline' && React.createElement(VoiceEventTimeline, null),
    tab === 'trace' && React.createElement(VoiceCommandTracePanel, null),
    tab === 'errors' && React.createElement(VoiceErrorConsole, null),
    tab === 'engine' && React.createElement(React.Fragment, null, React.createElement(VoiceEngineDiagnostics, null), React.createElement(VoicePermissionDiagnostics, null)),
    tab === 'perf' && React.createElement(React.Fragment, null, React.createElement(VoicePerformancePanel, null), React.createElement(VoiceTelemetryChart, null), React.createElement(VoiceCircuitBreakerPanel, null)),
    tab === 'logs' && React.createElement(React.Fragment, null, React.createElement(VoiceLogSearch, null), React.createElement(EventLogViewer, null), React.createElement(VoiceLogExport, null)),
    tab === 'replay' && React.createElement(SessionReplayPanel, null)
  );
}

export function VoiceDevToolsDock() {
  return React.createElement(VoiceDebugPanel, null);
}

export function VoiceDevTools({ style }) {
  return React.createElement(
    'div',
    { style: { ...glassPanel, padding: 16, ...style } },
    React.createElement(VoiceDevToolsPanel, null),
    React.createElement(VoiceDevToolsDock, null)
  );
}

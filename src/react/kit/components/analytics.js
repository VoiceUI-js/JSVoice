/**
 * Non-sensitive analytics UI (in-memory by default).
 */
import React from 'react';
import { useVoiceKitStore } from '../hooks.js';
import { selectSuccessRate, selectTopCommands } from '../../../ui-kit/core/selectors.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { downloadJson } from '../../../ui-kit/utils/domSafe.js';
import { baseFont, elevatedPanel } from '../styles.js';
import { VoiceButton, VoiceCard, VoiceEmptyState, VoiceTable } from './primitives.js';

function StatCard({ label, value }) {
  return React.createElement(
    'div',
    { style: { ...elevatedPanel, padding: 16, ...baseFont } },
    React.createElement('div', { style: { fontSize: 12, color: 'var(--jsv-text-muted)' } }, label),
    React.createElement('div', { style: { fontSize: 28, fontWeight: 700, marginTop: 4 } }, value)
  );
}

function MiniBars({ values = [], color = 'var(--jsv-primary)' }) {
  const max = Math.max(1, ...values);
  return React.createElement(
    'div',
    {
      role: 'img',
      'aria-label': 'Chart',
      style: { display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 },
    },
    values.map((v, i) =>
      React.createElement('div', {
        key: i,
        style: {
          flex: 1,
          height: `${Math.max(4, (v / max) * 100)}%`,
          background: color,
          borderRadius: 4,
          opacity: 0.85,
        },
      })
    )
  );
}

export function VoiceAnalyticsCards() {
  const analytics = useVoiceKitStore((s) => s.analytics || {});
  const rate = useVoiceKitStore((s) => Math.round(selectSuccessRate(s) * 100));
  const started = analytics.sessionStartedAt;
  const duration = started ? Math.round((Date.now() - started) / 1000) : 0;
  return React.createElement(
    'div',
    { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 } },
    React.createElement(StatCard, { label: 'Recognized', value: analytics.recognized || 0 }),
    React.createElement(StatCard, { label: 'Not recognized', value: analytics.notRecognized || 0 }),
    React.createElement(StatCard, { label: 'Failed', value: analytics.failed || 0 }),
    React.createElement(StatCard, { label: 'Success rate', value: `${rate}%` }),
    React.createElement(StatCard, { label: 'Fallbacks', value: analytics.fallbacks || 0 }),
    React.createElement(StatCard, { label: 'Session (s)', value: duration })
  );
}

export function VoiceCommandUsageChart() {
  const top = useVoiceKitStore((s) => selectTopCommands(s, 8));
  return React.createElement(
    VoiceCard,
    { title: 'Top commands' },
    top.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No usage yet' })
      : React.createElement(
          React.Fragment,
          null,
          React.createElement(MiniBars, { values: top.map((t) => t.count) }),
          React.createElement(VoiceTable, {
            columns: [
              { key: 'phrase', label: 'Command' },
              { key: 'count', label: 'Count' },
            ],
            rows: top,
            style: { marginTop: 12 },
          })
        )
  );
}

export function VoiceRecognitionSuccessRate() {
  const rate = useVoiceKitStore((s) => selectSuccessRate(s));
  return React.createElement(StatCard, {
    label: 'Recognition success',
    value: `${Math.round(rate * 100)}%`,
  });
}

export function VoiceFailureBreakdown() {
  const a = useVoiceKitStore((s) => s.analytics || {});
  return React.createElement(
    VoiceCard,
    { title: 'Failure breakdown' },
    React.createElement(MiniBars, {
      values: [a.notRecognized || 0, a.failed || 0, a.permissionFailures || 0],
      color: 'var(--jsv-danger)',
    }),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: 'var(--jsv-text-muted)' } },
      React.createElement('span', null, `Not recognized: ${a.notRecognized || 0}`),
      React.createElement('span', null, `Failed: ${a.failed || 0}`),
      React.createElement('span', null, `Permissions: ${a.permissionFailures || 0}`)
    )
  );
}

export function VoiceLatencyChart() {
  const latencies = useVoiceKitStore((s) => s.analytics?.latencies || []);
  const avg = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : 0;
  return React.createElement(
    VoiceCard,
    { title: `Latency (avg ${avg}ms)` },
    latencies.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No latency samples' })
      : React.createElement(MiniBars, { values: latencies.slice(-20), color: 'var(--jsv-info)' })
  );
}

export function VoiceEngineUsageChart() {
  const usage = useVoiceKitStore((s) => s.analytics?.engineUsage || {});
  const entries = Object.entries(usage);
  return React.createElement(
    VoiceCard,
    { title: 'Engine usage' },
    entries.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No engine events' })
      : React.createElement(MiniBars, { values: entries.map(([, v]) => v) })
  );
}

export function VoiceSessionStats() {
  return React.createElement(VoiceAnalyticsCards, null);
}

export function VoiceTopCommands() {
  return React.createElement(VoiceCommandUsageChart, null);
}

export function VoiceUnrecognizedPhrases() {
  const list = useVoiceKitStore((s) => s.analytics?.unrecognizedPhrases || []);
  return React.createElement(
    VoiceCard,
    { title: 'Unrecognized phrases' },
    list.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'None recorded' })
      : React.createElement(
          'ul',
          { style: { margin: 0, paddingLeft: 18, color: 'var(--jsv-text-muted)', fontSize: 13 } },
          list.slice(0, 20).map((p, i) => React.createElement('li', { key: i }, p))
        )
  );
}

export function VoiceAnalyticsExport() {
  const analytics = useVoiceKitStore((s) => s.analytics || {});
  return React.createElement(
    VoiceButton,
    {
      onClick: () => downloadJson(`jsvoice-analytics-${Date.now()}.json`, analytics),
    },
    'Export analytics JSON'
  );
}

export function VoiceAnalyticsDashboard({ style }) {
  return React.createElement(
    'div',
    { style: { display: 'grid', gap: 16, ...baseFont, ...style } },
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 } },
      React.createElement('h2', { style: { margin: 0 } }, 'Voice analytics'),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: 8 } },
        React.createElement(VoiceAnalyticsExport, null),
        React.createElement(VoiceButton, { onClick: () => VoiceKitActions.resetAnalytics() }, 'Reset')
      )
    ),
    React.createElement(
      'p',
      { style: { margin: 0, color: 'var(--jsv-text-muted)', fontSize: 13 } },
      'In-memory metrics only. Sensitive transcripts are not stored here by default.'
    ),
    React.createElement(VoiceAnalyticsCards, null),
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 } },
      React.createElement(VoiceCommandUsageChart, null),
      React.createElement(VoiceFailureBreakdown, null),
      React.createElement(VoiceLatencyChart, null),
      React.createElement(VoiceEngineUsageChart, null),
      React.createElement(VoiceUnrecognizedPhrases, null)
    )
  );
}

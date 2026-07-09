/**
 * Expanded transcript UI.
 */
import React, { useMemo, useState } from 'react';
import { useVoiceTranscript, useVoiceKitStore } from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { copyToClipboard, downloadJson } from '../../../ui-kit/utils/domSafe.js';
import { formatConfidence, formatTime } from '../../../ui-kit/utils/formatters.js';
import { baseFont } from '../styles.js';
import { VoiceButton, VoiceCard, VoiceEmptyState, VoiceInput, VoiceSelect, VoiceTable } from './primitives.js';
import { VoiceTranscript } from './voice-controls.js';

export function VoiceTranscriptSearch({ value, onChange }) {
  return React.createElement(VoiceInput, {
    label: 'Search transcript',
    value,
    onChange,
    placeholder: 'Filter text…',
  });
}

export function VoiceTranscriptFilters({ status, onStatus, engine, onEngine }) {
  return React.createElement(
    'div',
    { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
    React.createElement(VoiceSelect, {
      label: 'Status',
      value: status || 'all',
      options: ['all', 'recognized', 'not_recognized', 'final', 'interim'],
      onChange: onStatus,
      style: { minWidth: 140 },
    }),
    React.createElement(VoiceSelect, {
      label: 'Engine',
      value: engine || 'all',
      options: ['all', 'native', 'hybrid', 'whisper', 'local', 'unknown'],
      onChange: onEngine,
      style: { minWidth: 140 },
    })
  );
}

export function VoiceTranscriptPrivacyNotice() {
  const persist = useVoiceKitStore((s) => !!s.ui?.transcriptPersist);
  if (!persist) return null;
  return React.createElement(
    'div',
    {
      role: 'note',
      style: {
        padding: 10,
        borderRadius: 8,
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid var(--jsv-warning)',
        color: 'var(--jsv-warning)',
        fontSize: 12,
        marginBottom: 10,
      },
    },
    'Transcript persistence is enabled. Disable in Privacy settings if this surface may contain sensitive speech.'
  );
}

export function VoiceTranscriptStats() {
  const log = useVoiceKitStore((s) => s.transcriptLog || []);
  const recognized = log.filter((e) => e.status === 'recognized').length;
  const failed = log.filter((e) => e.status === 'not_recognized').length;
  return React.createElement(
    'div',
    { style: { display: 'flex', gap: 16, fontSize: 13, color: 'var(--jsv-text-muted)' } },
    React.createElement('span', null, `Lines: ${log.length}`),
    React.createElement('span', null, `Recognized: ${recognized}`),
    React.createElement('span', null, `Not recognized: ${failed}`)
  );
}

export function VoiceTranscriptCard({ entry, onPin, onBookmark }) {
  return React.createElement(
    'div',
    {
      style: {
        padding: 12,
        borderRadius: 12,
        border: '1px solid var(--jsv-border)',
        background: 'var(--jsv-surface-elevated)',
        marginBottom: 8,
        ...baseFont,
      },
    },
    React.createElement('div', { style: { fontSize: 11, color: 'var(--jsv-text-muted)' } }, formatTime(entry.timestamp)),
    React.createElement('div', { style: { marginTop: 4 } }, entry.text),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' } },
      entry.status && React.createElement('span', { style: { fontSize: 10 } }, entry.status),
      entry.confidence != null && React.createElement(VoiceTranscriptConfidence, { value: entry.confidence }),
      React.createElement(VoiceButton, { size: 'sm', onClick: () => onPin?.(entry) }, entry.pinned ? 'Unpin' : 'Pin'),
      React.createElement(VoiceButton, { size: 'sm', onClick: () => onBookmark?.(entry) }, 'Bookmark')
    )
  );
}

export function VoiceTranscriptConfidence({ value }) {
  return React.createElement('span', { style: { fontSize: 11, color: 'var(--jsv-text-muted)' } }, formatConfidence(value));
}

export function VoiceTranscriptFeed({ maxItems = 50, style }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const { entries, pin } = useVoiceTranscript({ maxItems, query });
  const filtered = entries.filter((e) => status === 'all' || e.status === status);

  return React.createElement(
    'div',
    { style },
    React.createElement(VoiceTranscriptPrivacyNotice, null),
    React.createElement(VoiceTranscriptSearch, { value: query, onChange: setQuery }),
    React.createElement('div', { style: { height: 8 } }),
    React.createElement(VoiceTranscriptFilters, {
      status,
      onStatus: setStatus,
      engine: 'all',
      onEngine: () => {},
    }),
    React.createElement('div', { style: { height: 8 } }),
    React.createElement(VoiceTranscriptStats, null),
    React.createElement('div', { style: { height: 8 } }),
    filtered.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No transcript lines' })
      : filtered.slice().reverse().map((e) =>
          React.createElement(VoiceTranscriptCard, {
            key: e.id,
            entry: e,
            onPin: (entry) => pin(entry.id, !entry.pinned),
            onBookmark: (entry) =>
              VoiceKitActions.saveBookmark?.(`tx-${entry.id}`) ||
              VoiceKitActions.pushToast({ title: 'Bookmarked', message: entry.text, tone: 'info' }),
          })
        )
  );
}

export function VoiceTranscriptTimeline() {
  const log = useVoiceKitStore((s) => s.transcriptLog || []);
  return React.createElement(
    VoiceCard,
    { title: 'Transcript timeline' },
    React.createElement(VoiceTable, {
      columns: [
        { key: 'timestamp', label: 'Time', render: (r) => formatTime(r.timestamp) },
        { key: 'text', label: 'Text' },
        { key: 'status', label: 'Status' },
      ],
      rows: log.slice().reverse().slice(0, 40),
    })
  );
}

export function VoiceTranscriptInspector({ entry }) {
  if (!entry) return React.createElement(VoiceEmptyState, { title: 'Select a line' });
  return React.createElement(
    VoiceCard,
    { title: 'Inspector' },
    React.createElement('pre', { style: { margin: 0, fontSize: 11 } }, JSON.stringify(entry, null, 2)),
    React.createElement(
      'p',
      { style: { fontSize: 12, color: 'var(--jsv-text-muted)' } },
      'Normalization is handled by core cleanText before command matching.'
    )
  );
}

export function VoiceTranscriptDiff() {
  return React.createElement(
    VoiceCard,
    { title: 'Transcript diff' },
    React.createElement(
      'p',
      { style: { margin: 0, fontSize: 13, color: 'var(--jsv-text-muted)' } },
      'Compare interim vs final lines in the feed (interim shown separately in VoiceTranscript).'
    )
  );
}

export function VoiceTranscriptExport() {
  const log = useVoiceKitStore((s) => s.transcriptLog || []);
  return React.createElement(
    'div',
    { style: { display: 'flex', gap: 8 } },
    React.createElement(VoiceButton, {
      onClick: async () => copyToClipboard(log.map((e) => e.text).join('\n')),
    }, 'Copy all'),
    React.createElement(VoiceButton, {
      onClick: () => downloadJson(`transcript-${Date.now()}.json`, log),
    }, 'Export JSON')
  );
}

export function VoiceTranscriptClearButton() {
  return React.createElement(
    VoiceButton,
    {
      variant: 'danger',
      'aria-label': 'Clear transcript',
      onClick: () => VoiceKitActions.clearTranscript({ keepPinned: false }),
    },
    'Clear'
  );
}

export function VoiceTranscriptBookmarkButton({ entry }) {
  return React.createElement(
    VoiceButton,
    {
      size: 'sm',
      'aria-label': 'Bookmark transcript line',
      onClick: () =>
        VoiceKitActions.pushToast({ title: 'Bookmarked', message: entry?.text || '', tone: 'info' }),
    },
    'Bookmark'
  );
}

export function VoiceTranscriptReplayButton({ entry }) {
  return React.createElement(
    VoiceButton,
    {
      size: 'sm',
      'aria-label': 'Replay transcript as command',
      onClick: () => {
        if (!entry?.text) return;
        VoiceKitActions.addCommandHistory({ phrase: entry.text, status: 'replay' });
        VoiceKitActions.pushToast({ title: 'Replay', message: entry.text, tone: 'info' });
      },
    },
    'Replay'
  );
}

export function VoiceTranscriptPanel({ style }) {
  return React.createElement(
    'div',
    { style: { display: 'grid', gap: 12, ...baseFont, ...style } },
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' } },
      React.createElement('h2', { style: { margin: 0 } }, 'Transcript'),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: 8 } },
        React.createElement(VoiceTranscriptExport, null),
        React.createElement(VoiceTranscriptClearButton, null)
      )
    ),
    React.createElement(VoiceTranscriptFeed, null),
    React.createElement(VoiceTranscriptTimeline, null),
    React.createElement(VoiceTranscript, { compact: true })
  );
}

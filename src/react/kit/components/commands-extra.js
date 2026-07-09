/**
 * Expanded command discovery UI.
 */
import React, { useMemo, useState } from 'react';
import { useVoiceCommands, useVoiceKitStore, useVoiceOptional } from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { copyToClipboard, downloadJson } from '../../../ui-kit/utils/domSafe.js';
import { formatTime } from '../../../ui-kit/utils/formatters.js';
import { baseFont, elevatedPanel } from '../styles.js';
import {
  VoiceButton,
  VoiceCard,
  VoiceEmptyState,
  VoiceInput,
  VoiceTabs,
  VoiceTable,
} from './primitives.js';

export function VoiceCommandSearch({ value, onChange, style }) {
  return React.createElement(VoiceInput, {
    label: 'Search commands',
    value,
    onChange,
    placeholder: 'Search phrases…',
    style,
  });
}

export function VoiceCommandFilterBar({ group, onGroup, groups = [] }) {
  return React.createElement(VoiceTabs, {
    tabs: ['all', ...groups].map((g) => ({ id: g, label: g })),
    value: group || 'all',
    onChange: onGroup,
  });
}

export function VoiceCommandCategoryTabs(props) {
  return React.createElement(VoiceCommandFilterBar, props);
}

export function VoiceCommandSourceBadge({ source = 'custom' }) {
  return React.createElement(
    'span',
    {
      style: {
        fontSize: 10,
        padding: '2px 6px',
        borderRadius: 999,
        background: 'var(--jsv-primary-soft)',
        textTransform: 'uppercase',
      },
    },
    source
  );
}

export function VoiceCommandScopeBadge({ scope = 'global' }) {
  return React.createElement(
    'span',
    {
      style: {
        fontSize: 10,
        padding: '2px 6px',
        borderRadius: 999,
        border: '1px solid var(--jsv-border)',
        color: 'var(--jsv-text-muted)',
      },
    },
    scope
  );
}

export function VoiceCommandConfidenceMeter({ value = 0 }) {
  const pct = Math.round((value || 0) * 100);
  return React.createElement(
    'div',
    {
      role: 'meter',
      'aria-valuenow': pct,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-label': 'Confidence',
      style: { height: 6, background: 'var(--jsv-surface)', borderRadius: 99, overflow: 'hidden' },
    },
    React.createElement('div', {
      style: {
        width: `${pct}%`,
        height: '100%',
        background: pct > 80 ? 'var(--jsv-success)' : pct > 50 ? 'var(--jsv-warning)' : 'var(--jsv-danger)',
      },
    })
  );
}

export function VoiceCommandCopyButton({ phrase }) {
  return React.createElement(
    VoiceButton,
    {
      size: 'sm',
      'aria-label': `Copy ${phrase}`,
      onClick: async () => {
        await copyToClipboard(phrase);
        VoiceKitActions.pushToast({ title: 'Copied', message: phrase, tone: 'info' });
      },
    },
    'Copy'
  );
}

export function VoiceCommandRunButton({ phrase, onRun }) {
  const voice = useVoiceOptional();
  return React.createElement(
    VoiceButton,
    {
      size: 'sm',
      variant: 'primary',
      'aria-label': `Run ${phrase}`,
      onClick: async () => {
        if (onRun) return onRun(phrase);
        if (typeof voice?.processText === 'function') {
          await voice.processText(phrase);
          VoiceKitActions.addCommandHistory({ phrase, status: 'run' });
          VoiceKitActions.trackAnalytics({ type: 'recognized', phrase });
        }
      },
    },
    'Run'
  );
}

export function VoiceCommandExamples({ examples = [] }) {
  if (!examples.length) return React.createElement('span', { style: { color: 'var(--jsv-text-muted)', fontSize: 12 } }, 'No examples');
  return React.createElement(
    'ul',
    { style: { margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--jsv-text-muted)' } },
    examples.map((e) => React.createElement('li', { key: e }, e))
  );
}

export function VoiceCommandVariables({ args = [] }) {
  if (!args.length) return null;
  return React.createElement(
    'div',
    { style: { display: 'flex', gap: 4, flexWrap: 'wrap' } },
    args.map((a, i) =>
      React.createElement(
        'code',
        {
          key: i,
          style: {
            fontSize: 11,
            padding: '2px 6px',
            borderRadius: 6,
            background: 'var(--jsv-primary-soft)',
          },
        },
        a.name || a.type || JSON.stringify(a)
      )
    )
  );
}

export function VoiceCommandCard({ command, selected, onSelect }) {
  const favs = useVoiceKitStore((s) => s.favorites || []);
  const isFav = favs.includes(command.phrase);
  return React.createElement(
    'div',
    {
      role: 'button',
      tabIndex: 0,
      onClick: () => onSelect?.(command),
      onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(command);
        }
      },
      style: {
        ...elevatedPanel,
        padding: 12,
        cursor: 'pointer',
        borderColor: selected ? 'var(--jsv-primary)' : 'var(--jsv-border)',
        boxShadow: selected ? 'var(--jsv-shadow-ring)' : undefined,
        ...baseFont,
      },
    },
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', gap: 8 } },
      React.createElement('strong', null, command.phrase),
      React.createElement(
        VoiceButton,
        {
          size: 'sm',
          variant: 'ghost',
          'aria-label': isFav ? 'Remove favorite' : 'Add favorite',
          onClick: (e) => {
            e.stopPropagation();
            VoiceKitActions.toggleFavorite(command.phrase);
          },
        },
        isFav ? '★' : '☆'
      )
    ),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' } },
      React.createElement(VoiceCommandSourceBadge, { source: command.group || command.type }),
      React.createElement(VoiceCommandScopeBadge, { scope: command.scope }),
    ),
    command.args?.length > 0 &&
      React.createElement('div', { style: { marginTop: 8 } }, React.createElement(VoiceCommandVariables, { args: command.args })),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: 6, marginTop: 10 } },
      React.createElement(VoiceCommandRunButton, { phrase: command.phrase }),
      React.createElement(VoiceCommandCopyButton, { phrase: command.phrase })
    )
  );
}

export function VoiceCommandGroup({ title, commands = [], onSelect, selectedId }) {
  return React.createElement(
    'section',
    { style: { marginBottom: 16 } },
    React.createElement('h4', { style: { margin: '0 0 8px', color: 'var(--jsv-text-muted)' } }, title),
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 } },
      commands.map((c) =>
        React.createElement(VoiceCommandCard, {
          key: c.id || c.phrase,
          command: c,
          selected: selectedId === (c.id || c.phrase),
          onSelect,
        })
      )
    )
  );
}

export function VoiceCommandGrid({ style }) {
  const commands = useVoiceCommands();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [selected, setSelected] = useState(null);
  const groups = useMemo(() => Array.from(new Set(commands.map((c) => c.group || 'custom'))), [commands]);
  const filtered = commands.filter((c) => {
    if (group !== 'all' && (c.group || 'custom') !== group) return false;
    if (!query) return true;
    return c.phrase.toLowerCase().includes(query.toLowerCase());
  });

  const byGroup = useMemo(() => {
    const map = {};
    filtered.forEach((c) => {
      const g = c.group || 'custom';
      if (!map[g]) map[g] = [];
      map[g].push(c);
    });
    return map;
  }, [filtered]);

  return React.createElement(
    'div',
    { style: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, ...style } },
    React.createElement(
      'div',
      null,
      React.createElement(VoiceCommandSearch, { value: query, onChange: setQuery }),
      React.createElement('div', { style: { height: 8 } }),
      React.createElement(VoiceCommandCategoryTabs, { group, onGroup: setGroup, groups }),
      React.createElement('div', { style: { height: 12 } }),
      filtered.length === 0
        ? React.createElement(VoiceEmptyState, { title: 'No commands match' })
        : Object.entries(byGroup).map(([g, list]) =>
            React.createElement(VoiceCommandGroup, {
              key: g,
              title: g,
              commands: list,
              selectedId: selected?.id || selected?.phrase,
              onSelect: setSelected,
            })
          )
    ),
    React.createElement(VoiceCommandDetailsPanel, { command: selected })
  );
}

export function VoiceCommandDetailsPanel({ command, commandId, style }) {
  const commands = useVoiceCommands();
  const cmd = command || commands.find((c) => c.id === commandId || c.phrase === commandId);
  if (!cmd) return React.createElement(VoiceEmptyState, { title: 'Select a command', style });
  return React.createElement(
    VoiceCard,
    { title: 'Command details', style },
    React.createElement('h3', { style: { marginTop: 0 } }, cmd.phrase),
    React.createElement(VoiceCommandPreview, { command: cmd }),
    React.createElement('div', { style: { height: 8 } }),
    React.createElement(VoiceCommandVariables, { args: cmd.args || [] }),
    React.createElement('div', { style: { height: 8 } }),
    React.createElement(VoiceCommandExamples, { examples: [cmd.phrase] }),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: 8, marginTop: 12 } },
      React.createElement(VoiceCommandRunButton, { phrase: cmd.phrase }),
      React.createElement(VoiceCommandCopyButton, { phrase: cmd.phrase })
    )
  );
}

export function VoiceCommandPreview({ command }) {
  return React.createElement(
    'div',
    { style: { fontSize: 13, color: 'var(--jsv-text-muted)' } },
    `${command.type} · scope ${command.scope} · priority ${command.priority || 0}`
  );
}

export function VoiceCommandHistory({ style }) {
  const history = useVoiceKitStore((s) => s.commandHistory || []);
  return React.createElement(
    VoiceCard,
    { title: 'Command history', style },
    history.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No history yet' })
      : React.createElement(VoiceTable, {
          columns: [
            { key: 'at', label: 'Time', render: (r) => formatTime(r.at) },
            { key: 'phrase', label: 'Phrase' },
            { key: 'status', label: 'Status' },
          ],
          rows: history.slice(0, 30),
        })
  );
}

export function VoiceCommandFavorites({ style }) {
  const favs = useVoiceKitStore((s) => s.favorites || []);
  return React.createElement(
    VoiceCard,
    { title: 'Favorites', style },
    favs.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No favorites' })
      : favs.map((phrase) =>
          React.createElement(
            'div',
            {
              key: phrase,
              style: { display: 'flex', justifyContent: 'space-between', gap: 8, padding: '6px 0' },
            },
            React.createElement('span', null, phrase),
            React.createElement(
              'div',
              { style: { display: 'flex', gap: 4 } },
              React.createElement(VoiceCommandRunButton, { phrase }),
              React.createElement(
                VoiceButton,
                { size: 'sm', onClick: () => VoiceKitActions.toggleFavorite(phrase) },
                'Unfav'
              )
            )
          )
        )
  );
}

export function VoiceCommandShortcutRecorder({ onRecord }) {
  const [hotkey, setHotkey] = useState('');
  return React.createElement(
    VoiceCard,
    { title: 'Shortcut recorder' },
    React.createElement(
      'p',
      { style: { fontSize: 12, color: 'var(--jsv-text-muted)' } },
      'Focus and press a key combo (display only — wire in app).'
    ),
    React.createElement('input', {
      'aria-label': 'Record shortcut',
      value: hotkey,
      readOnly: true,
      placeholder: 'Press keys…',
      onKeyDown: (e) => {
        e.preventDefault();
        const parts = [];
        if (e.metaKey || e.ctrlKey) parts.push('mod');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        parts.push(e.key.toLowerCase());
        const hk = parts.join('+');
        setHotkey(hk);
        onRecord?.(hk);
      },
      style: {
        width: '100%',
        padding: 10,
        borderRadius: 8,
        border: '1px solid var(--jsv-border)',
        background: 'var(--jsv-surface)',
        color: 'var(--jsv-text)',
      },
    })
  );
}

export function VoiceCommandImportExport({ style }) {
  const commands = useVoiceCommands();
  return React.createElement(
    'div',
    { style: { display: 'flex', gap: 8, ...style } },
    React.createElement(
      VoiceButton,
      {
        onClick: () =>
          downloadJson(
            `jsvoice-commands-${Date.now()}.json`,
            commands.map((c) => ({ phrase: c.phrase, type: c.type, scope: c.scope, group: c.group }))
          ),
      },
      'Export commands'
    ),
    React.createElement(
      VoiceButton,
      {
        onClick: () =>
          VoiceKitActions.pushToast({
            title: 'Import',
            message: 'Pass command configs via app code or file picker integration',
            tone: 'info',
          }),
      },
      'Import info'
    )
  );
}

/**
 * Expanded widget builder UI + built-in widget renderers.
 */
import React, { useState } from 'react';
import { useVoiceWidgets, useVoiceKitStore } from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { WIDGET_TYPES } from '../../../ui-kit/core/constants.js';
import { baseFont, elevatedPanel, glassPanel } from '../styles.js';
import { VoiceButton, VoiceCard, VoiceEmptyState, VoiceInput, VoiceSelect, VoiceTabs } from './primitives.js';
import { WidgetCanvas } from './panels.js';
import { formatTime } from '../../../ui-kit/utils/formatters.js';
import { downloadJson } from '../../../ui-kit/utils/domSafe.js';

function BaseWidgetShell({ title, children, style }) {
  return React.createElement(
    'div',
    {
      style: {
        ...elevatedPanel,
        padding: 12,
        minHeight: 100,
        ...baseFont,
        ...style,
      },
    },
    React.createElement('div', { style: { fontSize: 11, color: 'var(--jsv-text-muted)', marginBottom: 6 } }, title),
    children
  );
}

export function MetricWidget({ widget }) {
  return React.createElement(BaseWidgetShell, { title: widget?.name || 'Metric' },
    React.createElement('div', { style: { fontSize: 28, fontWeight: 700 } }, widget?.data?.value ?? '—'),
    React.createElement('div', { style: { fontSize: 12, color: 'var(--jsv-text-muted)' } }, widget?.data?.label || 'metric')
  );
}

export function TextWidget({ widget }) {
  return React.createElement(BaseWidgetShell, { title: widget?.name || 'Text' },
    React.createElement('p', { style: { margin: 0, fontSize: 13 } }, widget?.data?.text || 'Empty text widget')
  );
}

export function ListWidget({ widget }) {
  const items = widget?.data?.items || [];
  return React.createElement(BaseWidgetShell, { title: widget?.name || 'List' },
    items.length === 0
      ? React.createElement('span', { style: { color: 'var(--jsv-text-muted)', fontSize: 12 } }, 'No items')
      : React.createElement('ul', { style: { margin: 0, paddingLeft: 16, fontSize: 13 } },
        items.map((it, i) => React.createElement('li', { key: i }, it))
      )
  );
}

export function TableWidget({ widget }) {
  return React.createElement(BaseWidgetShell, { title: widget?.name || 'Table' },
    React.createElement('div', { style: { fontSize: 12, color: 'var(--jsv-text-muted)' } }, 'Table data in widget.data.rows')
  );
}

export function StatusWidget({ widget }) {
  return React.createElement(BaseWidgetShell, { title: widget?.name || 'Status' },
    React.createElement('strong', null, widget?.data?.status || 'idle')
  );
}

export function TranscriptWidget() {
  const log = useVoiceKitStore((s) => (s.transcriptLog || []).slice(-5));
  return React.createElement(BaseWidgetShell, { title: 'Transcript' },
    log.map((e) => React.createElement('div', { key: e.id, style: { fontSize: 11, color: 'var(--jsv-text-muted)' } }, e.text))
  );
}

export function CommandWidget() {
  const last = useVoiceKitStore((s) => s.ui?.lastCommand);
  return React.createElement(BaseWidgetShell, { title: 'Last command' },
    React.createElement('div', null, last || '—')
  );
}

export function ShortcutWidget() {
  return React.createElement(BaseWidgetShell, { title: 'Shortcuts' },
    React.createElement('div', { style: { fontSize: 12 } }, '⌘K palette · Esc close')
  );
}

export function ActionWidget({ widget }) {
  return React.createElement(BaseWidgetShell, { title: widget?.name || 'Action' },
    React.createElement(VoiceButton, { size: 'sm' }, widget?.data?.label || 'Run')
  );
}

export function BookmarkWidget() {
  const bms = useVoiceKitStore((s) => s.bookmarks || []);
  return React.createElement(BaseWidgetShell, { title: 'Bookmarks' },
    bms.slice(0, 5).map((b) => React.createElement('div', { key: b.id, style: { fontSize: 12 } }, b.name))
  );
}

export function SummaryWidget() {
  const events = useVoiceKitStore((s) => (s.events || []).slice(-3));
  return React.createElement(BaseWidgetShell, { title: 'Summary' },
    events.map((e, i) => React.createElement('div', { key: i, style: { fontSize: 11, color: 'var(--jsv-text-muted)' } }, e.msg))
  );
}

export function DebugWidget() {
  const status = useVoiceKitStore((s) => s.ui?.lastError || 'ok');
  return React.createElement(BaseWidgetShell, { title: 'Debug' }, React.createElement('code', null, String(status)));
}

export function PluginWidget() {
  const plugins = useVoiceKitStore((s) => s.activePlugins || []);
  return React.createElement(BaseWidgetShell, { title: 'Plugins' }, React.createElement('div', null, `${plugins.length} active`));
}

export function RuleWidget() {
  const rules = useVoiceKitStore((s) => s.rules || []);
  return React.createElement(BaseWidgetShell, { title: 'Rules' }, React.createElement('div', null, `${rules.length} rules`));
}

export function WorkflowWidget() {
  const wfs = useVoiceKitStore((s) => s.workflows || []);
  return React.createElement(BaseWidgetShell, { title: 'Workflows' }, React.createElement('div', null, `${wfs.length} workflows`));
}

export function AssistantWidget() {
  const msgs = useVoiceKitStore((s) => s.assistantMessages || []);
  return React.createElement(BaseWidgetShell, { title: 'Assistant' }, React.createElement('div', null, `${msgs.length} messages`));
}

export function NotificationWidget() {
  const toasts = useVoiceKitStore((s) => s.toasts || []);
  return React.createElement(BaseWidgetShell, { title: 'Notifications' }, React.createElement('div', null, `${toasts.length} toasts`));
}

const RENDERERS = {
  metric: MetricWidget,
  text: TextWidget,
  list: ListWidget,
  table: TableWidget,
  status: StatusWidget,
  transcript: TranscriptWidget,
  command: CommandWidget,
  shortcut: ShortcutWidget,
  action: ActionWidget,
  bookmark: BookmarkWidget,
  summary: SummaryWidget,
  debug: DebugWidget,
  plugin: PluginWidget,
  rule: RuleWidget,
  workflow: WorkflowWidget,
  assistant: AssistantWidget,
  notification: NotificationWidget,
};

export function VoiceWidgetCard({ widget, onSelect, selected }) {
  const Comp = RENDERERS[widget.type] || TextWidget;
  return React.createElement(
    'div',
    {
      role: 'button',
      tabIndex: 0,
      onClick: () => onSelect?.(widget),
      onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(widget);
        }
      },
      style: {
        outline: selected ? '2px solid var(--jsv-primary)' : 'none',
        borderRadius: 12,
      },
    },
    React.createElement(Comp, { widget })
  );
}

export function VoiceWidgetGrid({ style }) {
  const { widgets } = useVoiceWidgets();
  const [selected, setSelected] = useState(null);
  return React.createElement(
    'div',
    {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 12,
        ...style,
      },
    },
    widgets.map((w) =>
      React.createElement(VoiceWidgetCard, {
        key: w.id,
        widget: w,
        selected: selected?.id === w.id,
        onSelect: setSelected,
      })
    )
  );
}

export function VoiceWidgetToolbar({ onCreate }) {
  const [type, setType] = useState('metric');
  const [name, setName] = useState('Widget');
  return React.createElement(
    'div',
    { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end', marginBottom: 12 } },
    React.createElement(VoiceSelect, {
      label: 'Type',
      value: type,
      options: WIDGET_TYPES,
      onChange: setType,
      style: { minWidth: 140 },
    }),
    React.createElement(VoiceInput, { label: 'Name', value: name, onChange: setName, style: { minWidth: 140 } }),
    React.createElement(
      VoiceButton,
      {
        variant: 'primary',
        onClick: () => {
          VoiceKitActions.createWidget(type, name);
          onCreate?.(type, name);
        },
      },
      'Create'
    )
  );
}

export function VoiceWidgetSearch({ value, onChange }) {
  return React.createElement(VoiceInput, {
    label: 'Search widgets',
    value,
    onChange,
    placeholder: 'Filter by name…',
  });
}

export function VoiceWidgetCategoryTabs({ value, onChange }) {
  return React.createElement(VoiceTabs, {
    tabs: ['all', 'metric', 'text', 'list', 'debug', 'assistant'].map((t) => ({ id: t, label: t })),
    value: value || 'all',
    onChange,
  });
}

export function VoiceWidgetEmptyState() {
  return React.createElement(VoiceEmptyState, {
    title: 'No widgets',
    description: 'Create a metric, text, or list widget to start your dashboard.',
  });
}

export function VoiceWidgetLinkPanel() {
  const links = useVoiceKitStore((s) => s.links || []);
  return React.createElement(VoiceCard, { title: 'Links' },
    links.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No links' })
      : links.map((l, i) => React.createElement('div', { key: i, style: { fontSize: 12 } }, `${l.fromId} → ${l.toId}`))
  );
}

export function VoiceWidgetBookmarkPanel() {
  const bms = useVoiceKitStore((s) => s.bookmarks || []);
  return React.createElement(VoiceCard, { title: 'Bookmarks' },
    bms.map((b) => React.createElement('div', { key: b.id, style: { fontSize: 12 } }, `${b.name} · ${formatTime(b.timestamp)}`))
  );
}

export function VoiceWidgetRulePanel() {
  const rules = useVoiceKitStore((s) => s.rules || []);
  return React.createElement(VoiceCard, { title: 'Rules' },
    rules.map((r) => React.createElement('div', { key: r.id, style: { fontSize: 12 } }, r.description))
  );
}

export function VoiceWidgetHistoryPanel() {
  const events = useVoiceKitStore((s) => (s.events || []).slice(-10).reverse());
  return React.createElement(VoiceCard, { title: 'History' },
    events.map((e, i) => React.createElement('div', { key: i, style: { fontSize: 11, color: 'var(--jsv-text-muted)' } }, e.msg))
  );
}

export function VoiceWidgetImportExport() {
  const widgets = useVoiceKitStore((s) => s.widgets || []);
  return React.createElement(VoiceButton, {
    onClick: () => downloadJson(`widgets-${Date.now()}.json`, widgets),
  }, 'Export widgets');
}

export function VoiceWidgetLibrary({ onAdd }) {
  return React.createElement(
    VoiceCard,
    { title: 'Library' },
    React.createElement(
      'div',
      { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
      ['metric', 'text', 'list', 'status', 'transcript', 'command', 'assistant', 'debug'].map((t) =>
        React.createElement(
          VoiceButton,
          {
            key: t,
            size: 'sm',
            onClick: () => {
              VoiceKitActions.createWidget(t, t.charAt(0).toUpperCase() + t.slice(1));
              onAdd?.(t);
            },
          },
          t
        )
      )
    )
  );
}

export function VoiceWidgetInspector({ widget, onRemove }) {
  if (!widget) return React.createElement(VoiceEmptyState, { title: 'Select a widget' });
  return React.createElement(
    VoiceCard,
    { title: 'Inspector' },
    React.createElement('strong', null, widget.name),
    React.createElement('div', { style: { fontSize: 12, color: 'var(--jsv-text-muted)' } }, widget.type),
    React.createElement(
      VoiceButton,
      { size: 'sm', variant: 'danger', style: { marginTop: 10 }, onClick: () => onRemove?.(widget.name) },
      'Delete'
    )
  );
}

export function VoiceWidgetCanvas(props) {
  return React.createElement(WidgetCanvas, props);
}

export function VoiceWidgetDashboard({ style }) {
  const { widgets, remove } = useVoiceWidgets();
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const filtered = widgets.filter((w) => {
    if (cat !== 'all' && w.type !== cat) return false;
    if (!query) return true;
    return w.name.toLowerCase().includes(query.toLowerCase());
  });

  return React.createElement(
    'div',
    { style: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, ...baseFont, ...style } },
    React.createElement(
      'div',
      null,
      React.createElement('h2', { style: { marginTop: 0 } }, 'Widget dashboard'),
      React.createElement(VoiceWidgetToolbar, null),
      React.createElement(VoiceWidgetSearch, { value: query, onChange: setQuery }),
      React.createElement('div', { style: { height: 8 } }),
      React.createElement(VoiceWidgetCategoryTabs, { value: cat, onChange: setCat }),
      React.createElement('div', { style: { height: 12 } }),
      React.createElement(VoiceWidgetCanvas, null),
      React.createElement('div', { style: { height: 12 } }),
      filtered.length === 0
        ? React.createElement(VoiceWidgetEmptyState, null)
        : React.createElement(
            'div',
            { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 } },
            filtered.map((w) =>
              React.createElement(VoiceWidgetCard, {
                key: w.id,
                widget: w,
                selected: selected?.id === w.id,
                onSelect: setSelected,
              })
            )
          )
    ),
    React.createElement(
      'div',
      { style: { display: 'grid', gap: 12, alignContent: 'start' } },
      React.createElement(VoiceWidgetLibrary, null),
      React.createElement(VoiceWidgetInspector, {
        widget: selected,
        onRemove: (n) => {
          remove(n);
          setSelected(null);
        },
      }),
      React.createElement(VoiceWidgetLinkPanel, null),
      React.createElement(VoiceWidgetBookmarkPanel, null),
      React.createElement(VoiceWidgetImportExport, null)
    )
  );
}

export function VoiceWidgetMoveHandle() {
  return React.createElement('span', { 'aria-hidden': true, style: { cursor: 'grab', opacity: 0.5 } }, '⠿');
}

export function VoiceWidgetResizeHandle() {
  return React.createElement('span', { 'aria-hidden': true, style: { cursor: 'nwse-resize', opacity: 0.5 } }, ' Rem');
}

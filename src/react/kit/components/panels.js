/**
 * Advanced panels: Command Center, Debug, Onboarding, Plugins, Rules, Widgets, Voice Mode.
 */
import React, { useMemo, useState } from 'react';
import {
  useVoiceOptional,
  useVoiceCommands,
  useVoiceDebug,
  useVoiceKitStore,
  useVoicePermissions,
  useVoicePlugins,
  useVoiceRules,
  useVoiceWidgets,
} from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { formatTime } from '../../../ui-kit/utils/formatters.js';
import { isSpeechRecognitionSupported, isSecureContext } from '../../../ui-kit/utils/domSafe.js';
import { RULE_ACTION_TYPES, RULE_CONDITION_TYPES, WIDGET_TYPES } from '../../../ui-kit/core/constants.js';
import { globalRegistry } from '../../../ui-kit/core/registry.js';
import { baseFont, elevatedPanel, glassPanel } from '../styles.js';
import {
  VoiceButton,
  VoiceCard,
  VoiceDrawer,
  VoiceEmptyState,
  VoiceInput,
  VoiceSelect,
  VoiceTabs,
  VoiceTable,
  VoiceAccordion,
} from './primitives.js';
import {
  VoiceCommandList,
  VoiceDock,
  VoiceHUD,
  VoiceCommandPalette,
  VoiceEngineSwitcher,
  VoicePermissionCard,
  VoiceScopeSwitcher,
  VoiceStatusBadge,
  VoiceThemeSwitcher,
  VoiceTranscript,
  VoiceWaveform,
} from './voice-controls.js';
import { WidgetCanvas as BaseWidgetCanvas } from '../../../ui-kit/modules/widgets/components.js';
import { VoiceModeOverlay as BaseVoiceModeOverlay } from '../../../ui-kit/modules/voice-mode/components.js';

/* ───────── Command Center ───────── */

export function CommandSearch({ value, onChange, style }) {
  return React.createElement(VoiceInput, {
    label: 'Search commands',
    value,
    onChange,
    placeholder: 'Filter by phrase…',
    style,
  });
}

export function CommandGroups({ groups = [], value, onChange }) {
  return React.createElement(VoiceTabs, {
    tabs: ['all', ...groups].map((g) => ({ id: g, label: g })),
    value: value || 'all',
    onChange,
  });
}

export function CommandInspector({ command }) {
  if (!command) {
    return React.createElement(VoiceEmptyState, {
      title: 'Select a command',
      description: 'Inspect phrase, type, scope, and arguments.',
    });
  }
  return React.createElement(
    VoiceCard,
    { title: 'Inspector' },
    React.createElement('pre', {
      style: {
        margin: 0,
        whiteSpace: 'pre-wrap',
        fontSize: 12,
        color: 'var(--jsv-text-muted)',
      },
    }, JSON.stringify(command, null, 2))
  );
}

export function CommandBuilder({ onCreated }) {
  const voice = useVoiceOptional();
  const [phrase, setPhrase] = useState('');
  const [response, setResponse] = useState('OK');

  return React.createElement(
    VoiceCard,
    { title: 'Command builder' },
    React.createElement(VoiceInput, { label: 'Phrase', value: phrase, onChange: setPhrase, placeholder: 'e.g. hello world' }),
    React.createElement(VoiceInput, {
      label: 'Speak response',
      value: response,
      onChange: setResponse,
      style: { marginTop: 8 },
    }),
    React.createElement(
      VoiceButton,
      {
        variant: 'primary',
        style: { marginTop: 12 },
        onClick: () => {
          if (!phrase || !voice) return;
          const id = voice.addCommand?.(phrase, () => voice.speak?.(response));
          VoiceKitActions.pushToast({ title: 'Command added', message: phrase, tone: 'success' });
          onCreated?.({ phrase, id });
          setPhrase('');
        },
      },
      'Add command'
    )
  );
}

export function PatternCommandBuilder({ onCreated }) {
  const voice = useVoiceOptional();
  const [pattern, setPattern] = useState('set volume to {level:int}');
  return React.createElement(
    VoiceCard,
    { title: 'Pattern command builder' },
    React.createElement(VoiceInput, {
      label: 'Pattern',
      value: pattern,
      onChange: setPattern,
      placeholder: 'open {page}',
    }),
    React.createElement(
      'p',
      { style: { fontSize: 12, color: 'var(--jsv-text-muted)' } },
      'Supports typed entities like {level:int}.'
    ),
    React.createElement(
      VoiceButton,
      {
        variant: 'primary',
        onClick: () => {
          if (!pattern || !voice) return;
          voice.addPatternCommand?.(pattern, (args) => {
            voice.speak?.(`Pattern matched ${JSON.stringify(args)}`);
          });
          onCreated?.({ pattern });
          VoiceKitActions.pushToast({ title: 'Pattern added', message: pattern, tone: 'success' });
        },
      },
      'Add pattern'
    )
  );
}

export function EntityEditor({ value = '', onChange }) {
  return React.createElement(VoiceInput, {
    label: 'Entity pattern snippet',
    value,
    onChange,
    placeholder: '{name} or {count:int}',
  });
}

export function ScopeManager(props) {
  return React.createElement(VoiceScopeSwitcher, props);
}

export function CommandTester() {
  const voice = useVoiceOptional();
  const [text, setText] = useState('');
  return React.createElement(
    VoiceCard,
    { title: 'Command tester' },
    React.createElement(VoiceInput, {
      label: 'Simulate transcript',
      value: text,
      onChange: setText,
      placeholder: 'Type a phrase to process…',
    }),
    React.createElement(
      VoiceButton,
      {
        variant: 'primary',
        style: { marginTop: 10 },
        onClick: async () => {
          if (!text || typeof voice?.processText !== 'function') return;
          await voice.processText(text);
          VoiceKitActions.addTranscript({ text, isFinal: true, status: 'final' });
          VoiceKitActions.pushCommandTrace({ phrase: text, status: 'manual_test' });
        },
      },
      'Process'
    )
  );
}

export function CommandCenter({ style }) {
  const commands = useVoiceCommands();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [selected, setSelected] = useState(null);
  const groups = useMemo(
    () => Array.from(new Set(commands.map((c) => c.group || 'custom'))),
    [commands]
  );
  const filtered = commands.filter((c) => {
    if (group !== 'all' && (c.group || 'custom') !== group) return false;
    if (!query) return true;
    return c.phrase.toLowerCase().includes(query.toLowerCase());
  });

  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
        gap: 16,
        ...baseFont,
        ...style,
      },
    },
    React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      React.createElement('h2', { style: { margin: 0 } }, 'Command Center'),
      React.createElement(CommandSearch, { value: query, onChange: setQuery }),
      React.createElement(CommandGroups, { groups, value: group, onChange: setGroup }),
      React.createElement(
        'div',
        { style: { ...elevatedPanel, padding: 8, maxHeight: 360, overflow: 'auto' } },
        React.createElement(VoiceCommandList, {
          commands: filtered,
          onSelect: setSelected,
          onRun: (cmd) => setSelected(cmd),
        })
      ),
      React.createElement(CommandTester, null)
    ),
    React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      React.createElement(CommandInspector, { command: selected }),
      React.createElement(CommandBuilder, null),
      React.createElement(PatternCommandBuilder, null),
      React.createElement(ScopeManager, null)
    )
  );
}

/* ───────── Debug ───────── */

export function RecognitionTimeline({ style }) {
  const timeline = useVoiceKitStore((s) => s.timeline || []);
  return React.createElement(
    VoiceCard,
    { title: 'Recognition timeline', style },
    timeline.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No events yet' })
      : timeline
          .slice()
          .reverse()
          .slice(0, 40)
          .map((e) =>
            React.createElement(
              'div',
              {
                key: e.id,
                style: {
                  display: 'flex',
                  gap: 8,
                  padding: '6px 0',
                  borderBottom: '1px solid var(--jsv-border)',
                  fontSize: 12,
                },
              },
              React.createElement('span', { style: { color: 'var(--jsv-text-muted)', minWidth: 72 } }, formatTime(e.at)),
              React.createElement('strong', null, e.type),
              React.createElement(
                'span',
                { style: { color: 'var(--jsv-text-muted)' } },
                e.text || e.phrase || e.message || ''
              )
            )
          )
  );
}

export function EventLogViewer({ style }) {
  const events = useVoiceKitStore((s) => s.events || []);
  return React.createElement(
    VoiceCard,
    { title: 'Event log', style },
    events.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No kit events' })
      : events
          .slice()
          .reverse()
          .slice(0, 50)
          .map((e, i) =>
            React.createElement(
              'div',
              { key: i, style: { fontSize: 12, padding: '4px 0', color: 'var(--jsv-text-muted)' } },
              `${formatTime(e.timestamp)} — ${e.msg}`
            )
          )
  );
}

export function TelemetryPanel({ style }) {
  const debug = useVoiceDebug();
  return React.createElement(
    VoiceCard,
    { title: 'Telemetry', style },
    React.createElement('pre', {
      style: { margin: 0, fontSize: 11, overflow: 'auto', maxHeight: 200 },
    }, JSON.stringify(debug.snapshot?.metrics || {}, null, 2))
  );
}

export function EngineStatusPanel({ style }) {
  const debug = useVoiceDebug();
  return React.createElement(
    VoiceCard,
    { title: 'Engine status', style },
    React.createElement(VoiceStatusBadge, { status: debug.snapshot?.status }),
    React.createElement(
      'div',
      { style: { marginTop: 8, color: 'var(--jsv-text-muted)', fontSize: 13 } },
      `Engine: ${debug.snapshot?.engine?.name || debug.snapshot?.engine?.mode || 'unknown'}`
    ),
    React.createElement(
      'div',
      { style: { color: 'var(--jsv-text-muted)', fontSize: 13 } },
      `Mic: ${debug.snapshot?.permissions?.microphone || 'unknown'}`
    ),
    React.createElement(VoiceWaveform, { style: { marginTop: 12 } })
  );
}

export function CommandTrace({ style }) {
  const traces = useVoiceKitStore((s) => s.commandTrace || []);
  return React.createElement(
    VoiceCard,
    { title: 'Command trace', style },
    traces.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No command traces' })
      : React.createElement(VoiceTable, {
          columns: [
            { key: 'at', label: 'Time', render: (r) => formatTime(r.at) },
            { key: 'phrase', label: 'Phrase' },
            { key: 'status', label: 'Status' },
          ],
          rows: traces.slice().reverse().slice(0, 30),
        })
  );
}

export function SessionReplayPanel({ style }) {
  const traces = useVoiceKitStore((s) => s.commandTrace || []);
  const voice = useVoiceOptional();
  const [idx, setIdx] = useState(0);

  return React.createElement(
    VoiceCard,
    { title: 'Session replay', style },
    React.createElement(
      'p',
      { style: { color: 'var(--jsv-text-muted)', fontSize: 13 } },
      'Replays recorded command phrases through the command manager (text only — no audio).'
    ),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 } },
      React.createElement(
        VoiceButton,
        {
          onClick: async () => {
            const item = traces[idx];
            if (!item?.phrase || typeof voice?.processText !== 'function') return;
            await voice.processText(item.phrase);
          },
        },
        'Replay current'
      ),
      React.createElement(
        VoiceButton,
        {
          onClick: () => setIdx((i) => Math.min(traces.length - 1, i + 1)),
          disabled: idx >= traces.length - 1,
        },
        'Next'
      ),
      React.createElement(
        VoiceButton,
        {
          onClick: () => setIdx((i) => Math.max(0, i - 1)),
          disabled: idx <= 0,
        },
        'Prev'
      )
    ),
    traces[idx] &&
      React.createElement(
        'div',
        { style: { marginTop: 10, ...elevatedPanel, padding: 10, fontSize: 13 } },
        `${idx + 1}/${traces.length}: ${traces[idx].phrase} (${traces[idx].status})`
      )
  );
}

export function SnapshotViewer({ style }) {
  const debug = useVoiceDebug();
  return React.createElement(
    VoiceCard,
    { title: 'Live snapshot', style },
    React.createElement('pre', {
      style: {
        margin: 0,
        fontSize: 11,
        maxHeight: 280,
        overflow: 'auto',
        color: 'var(--jsv-text-muted)',
      },
    }, JSON.stringify(debug.snapshot || {}, null, 2))
  );
}

export function VoiceDebugPanel({ open: openProp, style }) {
  const debug = useVoiceDebug();
  const open = openProp ?? debug.open;
  const [tab, setTab] = useState('engine');

  return React.createElement(
    VoiceDrawer,
    {
      open,
      onClose: () => debug.setOpen(false),
      title: 'Voice debug',
      side: 'right',
    },
    React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 12, ...style } },
      React.createElement(VoiceTabs, {
        tabs: [
          { id: 'engine', label: 'Engine' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'trace', label: 'Trace' },
          { id: 'events', label: 'Events' },
          { id: 'snapshot', label: 'Snapshot' },
          { id: 'replay', label: 'Replay' },
        ],
        value: tab,
        onChange: setTab,
      }),
      tab === 'engine' && React.createElement(EngineStatusPanel, null),
      tab === 'timeline' && React.createElement(RecognitionTimeline, null),
      tab === 'trace' && React.createElement(CommandTrace, null),
      tab === 'events' && React.createElement(EventLogViewer, null),
      tab === 'snapshot' && React.createElement(SnapshotViewer, null),
      tab === 'replay' && React.createElement(SessionReplayPanel, null),
      debug.lastError &&
        React.createElement(
          'div',
          { style: { color: 'var(--jsv-danger)', fontSize: 13 } },
          debug.lastError
        )
    )
  );
}

/* ───────── Onboarding ───────── */

export function BrowserSupportStep() {
  const ok = isSpeechRecognitionSupported();
  const secure = isSecureContext();
  return React.createElement(
    'div',
    null,
    React.createElement('h4', { style: { marginTop: 0 } }, 'Browser support'),
    React.createElement(
      'ul',
      { style: { color: 'var(--jsv-text-muted)' } },
      React.createElement('li', null, `Speech recognition: ${ok ? 'Yes' : 'Limited / fallback'}`),
      React.createElement('li', null, `Secure context: ${secure ? 'Yes' : 'No'}`),
      React.createElement('li', null, 'Hybrid engine can fall back to local models when native API is unavailable.')
    )
  );
}

export function PermissionStep() {
  return React.createElement(VoicePermissionCard, null);
}

export function WakeWordStep() {
  const voice = useVoiceOptional();
  const [wake, setWake] = useState(voice?.options?.wakeWord || 'hey assistant');
  return React.createElement(
    'div',
    null,
    React.createElement('h4', { style: { marginTop: 0 } }, 'Wake word (optional)'),
    React.createElement(VoiceInput, {
      label: 'Wake word',
      value: wake,
      onChange: setWake,
    }),
    React.createElement(
      'p',
      { style: { fontSize: 13, color: 'var(--jsv-text-muted)' } },
      'Configure at createVoice({ wakeWord }) time for best results.'
    )
  );
}

export function TestCommandStep() {
  return React.createElement(CommandTester, null);
}

export function CompletionStep({ onDone }) {
  return React.createElement(
    'div',
    { style: { textAlign: 'center' } },
    React.createElement('h4', null, 'You are ready'),
    React.createElement(
      'p',
      { style: { color: 'var(--jsv-text-muted)' } },
      'Use the dock to start listening, ⌘K for the command palette, and Debug for traces.'
    ),
    React.createElement(VoiceButton, { variant: 'primary', onClick: onDone }, 'Finish')
  );
}

export function VoiceOnboarding({ open = true, onComplete, style }) {
  const step = useVoiceKitStore((s) => s.ui?.onboardingStep ?? 0);
  const complete = useVoiceKitStore((s) => !!s.ui?.onboardingComplete);
  const [localOpen, setLocalOpen] = useState(open && !complete);
  const steps = [
    { id: 0, title: 'Browser', node: React.createElement(BrowserSupportStep, null) },
    { id: 1, title: 'Permissions', node: React.createElement(PermissionStep, null) },
    { id: 2, title: 'Wake word', node: React.createElement(WakeWordStep, null) },
    { id: 3, title: 'Test', node: React.createElement(TestCommandStep, null) },
    {
      id: 4,
      title: 'Done',
      node: React.createElement(CompletionStep, {
        onDone: () => {
          VoiceKitActions.completeOnboarding();
          setLocalOpen(false);
          onComplete?.();
        },
      }),
    },
  ];
  const current = typeof step === 'number' ? step : 0;

  if (!localOpen) return null;

  return React.createElement(
    VoiceCard,
    {
      title: `Voice onboarding · ${steps[current]?.title || ''}`,
      style: { maxWidth: 560, ...style },
      footer: React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between' } },
        React.createElement(
          VoiceButton,
          {
            disabled: current <= 0,
            onClick: () => VoiceKitActions.setOnboardingStep(Math.max(0, current - 1)),
          },
          'Back'
        ),
        current < steps.length - 1 &&
          React.createElement(
            VoiceButton,
            {
              variant: 'primary',
              onClick: () => VoiceKitActions.setOnboardingStep(current + 1),
            },
            'Next'
          )
      ),
    },
    steps[current]?.node
  );
}

/* ───────── Plugin center ───────── */

export function PluginStatusBadge({ active }) {
  return React.createElement(
    'span',
    {
      style: {
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 999,
        background: active ? 'rgba(34,197,94,0.15)' : 'var(--jsv-primary-soft)',
        color: active ? 'var(--jsv-success)' : 'var(--jsv-text-muted)',
      },
    },
    active ? 'active' : 'available'
  );
}

export function PluginCard({ plugin, onToggle }) {
  return React.createElement(
    'div',
    {
      style: {
        ...elevatedPanel,
        padding: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      },
    },
    React.createElement(
      'div',
      null,
      React.createElement('div', { style: { fontWeight: 600 } }, plugin.name),
      React.createElement(
        'div',
        { style: { fontSize: 12, color: 'var(--jsv-text-muted)' } },
        plugin.description || ''
      )
    ),
    React.createElement(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 8 } },
      React.createElement(PluginStatusBadge, { active: plugin.active }),
      onToggle &&
        React.createElement(
          VoiceButton,
          { size: 'sm', onClick: () => onToggle(plugin) },
          plugin.active ? 'Disable' : 'Enable'
        )
    )
  );
}

export function PluginSettingsPanel({ plugin }) {
  if (!plugin) return React.createElement(VoiceEmptyState, { title: 'Select a plugin' });
  return React.createElement(
    VoiceCard,
    { title: `${plugin.name} settings` },
    React.createElement(
      'p',
      { style: { color: 'var(--jsv-text-muted)', fontSize: 13 } },
      plugin.description || 'No configurable settings exposed for this plugin.'
    )
  );
}

export function PluginCenter({ style }) {
  const { plugins, setPlugins } = useVoicePlugins();
  const catalog = [
    { id: 'vad', name: 'VAD', description: 'Stop on silence' },
    { id: 'hotkeys', name: 'Hotkeys', description: 'Push-to-talk shortcuts' },
    { id: 'fuzzy', name: 'Fuzzy match', description: 'Synonyms & close phrases' },
    { id: 'recorder', name: 'Session recorder', description: 'Debug / replay sessions' },
    { id: 'help', name: 'Help', description: 'Help commands' },
    { id: 'kit', name: 'UI Kit plugin', description: 'Voice-driven kit commands' },
  ].map((p) => ({ ...p, active: plugins.includes(p.id) }));

  return React.createElement(
    'div',
    { style: { display: 'grid', gap: 10, ...style } },
    React.createElement('h2', { style: { margin: 0 } }, 'Plugin center'),
    catalog.map((p) =>
      React.createElement(PluginCard, {
        key: p.id,
        plugin: p,
        onToggle: (pl) => {
          const next = pl.active ? plugins.filter((x) => x !== pl.id) : [...plugins, pl.id];
          setPlugins(next);
          VoiceKitActions.pushToast({
            title: pl.active ? 'Marked inactive' : 'Marked active',
            message: pl.name,
            tone: 'info',
          });
        },
      })
    ),
    React.createElement(
      'p',
      { style: { fontSize: 12, color: 'var(--jsv-text-muted)' } },
      'Load real plugins with voice.use(Plugin) at app bootstrap. This panel tracks UI-level enablement metadata.'
    )
  );
}

/* ───────── Rules ───────── */

export function RuleConditionEditor({ value, onChange }) {
  const condition = value || { type: 'command', value: '' };
  return React.createElement(
    'div',
    { style: { display: 'grid', gap: 8 } },
    React.createElement(VoiceSelect, {
      label: 'Condition type',
      value: condition.type,
      options: RULE_CONDITION_TYPES,
      onChange: (type) => onChange({ ...condition, type }),
    }),
    React.createElement(VoiceInput, {
      label: 'Value',
      value: condition.value || '',
      onChange: (v) => onChange({ ...condition, value: v }),
      placeholder: 'e.g. go back',
    })
  );
}

export function RuleActionEditor({ value, onChange }) {
  const action = value || { type: 'speak', value: '' };
  return React.createElement(
    'div',
    { style: { display: 'grid', gap: 8 } },
    React.createElement(VoiceSelect, {
      label: 'Action type',
      value: action.type,
      options: RULE_ACTION_TYPES,
      onChange: (type) => onChange({ ...action, type }),
    }),
    React.createElement(VoiceInput, {
      label: 'Value',
      value: action.value || '',
      onChange: (v) => onChange({ ...action, value: v }),
      placeholder: 'e.g. Done',
    })
  );
}

export function RulePreview({ rule, errors = [] }) {
  return React.createElement(
    VoiceCard,
    { title: 'Rule preview' },
    React.createElement('pre', {
      style: { margin: 0, fontSize: 12, color: 'var(--jsv-text-muted)' },
    }, JSON.stringify(rule, null, 2)),
    errors.length > 0 &&
      React.createElement(
        'ul',
        { style: { color: 'var(--jsv-danger)', margin: '8px 0 0' } },
        errors.map((e) => React.createElement('li', { key: e }, e))
      )
  );
}

export function RuleBuilder({ style }) {
  const { rules, addStructured, remove, validate } = useVoiceRules();
  const [name, setName] = useState('');
  const [condition, setCondition] = useState({ type: 'command', value: '' });
  const [action, setAction] = useState({ type: 'speak', value: '' });
  const draft = { description: name, condition, action, active: true };
  const check = validate(draft);

  return React.createElement(
    'div',
    { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...style } },
    React.createElement(
      'div',
      { style: { display: 'grid', gap: 10 } },
      React.createElement('h2', { style: { margin: 0 } }, 'Rule builder'),
      React.createElement(VoiceInput, { label: 'Rule name', value: name, onChange: setName }),
      React.createElement(RuleConditionEditor, { value: condition, onChange: setCondition }),
      React.createElement(RuleActionEditor, { value: action, onChange: setAction }),
      React.createElement(
        VoiceButton,
        {
          variant: 'primary',
          onClick: () => {
            const res = addStructured(draft);
            if (res.valid) {
              VoiceKitActions.pushToast({ title: 'Rule added', message: name, tone: 'success' });
              setName('');
            }
          },
        },
        'Add rule'
      ),
      React.createElement(RulePreview, { rule: draft, errors: check.errors })
    ),
    React.createElement(
      VoiceCard,
      { title: `Rules (${rules.length})` },
      rules.length === 0
        ? React.createElement(VoiceEmptyState, { title: 'No rules yet' })
        : rules.map((r) =>
            React.createElement(
              'div',
              {
                key: r.id,
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '8px 0',
                  borderBottom: '1px solid var(--jsv-border)',
                },
              },
              React.createElement(
                'div',
                null,
                React.createElement('div', { style: { fontWeight: 600 } }, r.description),
                React.createElement(
                  'div',
                  { style: { fontSize: 12, color: 'var(--jsv-text-muted)' } },
                  r.condition
                    ? `${r.condition.type}: ${r.condition.value} → ${r.action?.type}`
                    : r.active
                      ? 'active'
                      : 'inactive'
                )
              ),
              React.createElement(
                VoiceButton,
                { size: 'sm', variant: 'danger', onClick: () => remove(r.id) },
                'Remove'
              )
            )
          )
    )
  );
}

/* ───────── Widgets ───────── */

export function WidgetLibrary({ onAdd }) {
  const types = globalRegistry.listWidgetTypes();
  return React.createElement(
    VoiceCard,
    { title: 'Widget library' },
    React.createElement(
      'div',
      { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
      types.map((t) =>
        React.createElement(
          VoiceButton,
          {
            key: t.type,
            size: 'sm',
            onClick: () => onAdd?.(t.type),
          },
          t.label || t.type
        )
      )
    )
  );
}

export function WidgetInspector({ widget, onRemove }) {
  if (!widget) return React.createElement(VoiceEmptyState, { title: 'Select a widget' });
  return React.createElement(
    VoiceCard,
    { title: 'Widget inspector' },
    React.createElement('div', null, React.createElement('strong', null, widget.name)),
    React.createElement(
      'div',
      { style: { fontSize: 12, color: 'var(--jsv-text-muted)', marginTop: 4 } },
      `${widget.type} · (${widget.x}, ${widget.y})`
    ),
    React.createElement(
      VoiceButton,
      {
        size: 'sm',
        variant: 'danger',
        style: { marginTop: 10 },
        onClick: () => onRemove?.(widget.name),
      },
      'Remove'
    )
  );
}

export function WidgetPanel({ style }) {
  const { widgets, create, remove } = useVoiceWidgets();
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('Panel');
  const [type, setType] = useState('panel');

  return React.createElement(
    'div',
    { style: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, ...style } },
    React.createElement(
      'div',
      { style: { display: 'grid', gap: 12 } },
      React.createElement('h2', { style: { margin: 0 } }, 'Widget canvas'),
      React.createElement(
        'div',
        {
          onClick: (e) => {
            // crude select via name in title - canvas is visual only
            void e;
          },
        },
        React.createElement(BaseWidgetCanvas, null)
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' } },
        React.createElement(VoiceSelect, {
          label: 'Type',
          value: type,
          options: WIDGET_TYPES,
          onChange: setType,
          style: { minWidth: 120 },
        }),
        React.createElement(VoiceInput, {
          label: 'Name',
          value: name,
          onChange: setName,
          style: { minWidth: 160 },
        }),
        React.createElement(
          VoiceButton,
          {
            variant: 'primary',
            onClick: () => {
              create(type, name);
              VoiceKitActions.pushToast({ title: 'Widget created', message: name, tone: 'success' });
            },
          },
          'Create'
        )
      )
    ),
    React.createElement(
      'div',
      { style: { display: 'grid', gap: 12, alignContent: 'start' } },
      React.createElement(WidgetLibrary, {
        onAdd: (t) => create(t, t.charAt(0).toUpperCase() + t.slice(1)),
      }),
      React.createElement(
        VoiceCard,
        { title: 'Widgets' },
        widgets.map((w) =>
          React.createElement(
            'button',
            {
              key: w.id,
              type: 'button',
              onClick: () => setSelected(w),
              style: {
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: selected?.id === w.id ? 'var(--jsv-primary-soft)' : 'transparent',
                border: '1px solid var(--jsv-border)',
                color: 'var(--jsv-text)',
                borderRadius: 8,
                padding: 8,
                marginBottom: 6,
                cursor: 'pointer',
              },
            },
            `${w.name} (${w.type})`
          )
        )
      ),
      React.createElement(WidgetInspector, {
        widget: selected,
        onRemove: (n) => {
          remove(n);
          setSelected(null);
        },
      })
    )
  );
}

export function WidgetCanvas(props) {
  return React.createElement(BaseWidgetCanvas, props);
}

export function WidgetRenderer({ widget }) {
  if (!widget) return null;
  return React.createElement(
    'div',
    {
      style: {
        ...elevatedPanel,
        padding: 12,
        minHeight: 80,
      },
    },
    React.createElement('strong', null, widget.name),
    React.createElement(
      'div',
      { style: { fontSize: 12, color: 'var(--jsv-text-muted)' } },
      widget.type
    )
  );
}

/* ───────── Voice mode ───────── */

export function VoiceFocusRing({ active, style }) {
  if (!active) return null;
  return React.createElement('div', {
    'aria-hidden': true,
    style: {
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      boxShadow: 'inset 0 0 0 3px var(--jsv-primary)',
      zIndex: 'var(--jsv-z-overlay)',
      ...style,
    },
  });
}

export function VoiceHintLayer({ hints = [], style }) {
  if (!hints.length) return null;
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      style: {
        position: 'fixed',
        bottom: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        ...glassPanel,
        padding: '10px 14px',
        zIndex: 'var(--jsv-z-overlay)',
        ...baseFont,
        ...style,
      },
    },
    hints.map((h, i) =>
      React.createElement(
        'div',
        { key: i, style: { fontSize: 13, color: 'var(--jsv-text-muted)' } },
        h
      )
    )
  );
}

export function VoiceNumberTags({ items = [], style }) {
  return React.createElement(
    'div',
    { 'data-jsvoice-kit': true, style: { display: 'flex', gap: 8, flexWrap: 'wrap', ...style } },
    items.map((item, i) =>
      React.createElement(
        'span',
        {
          key: item.id || i,
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 8px',
            borderRadius: 999,
            background: 'var(--jsv-primary-soft)',
            border: '1px solid var(--jsv-border)',
            fontSize: 12,
          },
        },
        React.createElement(
          'span',
          {
            style: {
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'var(--jsv-primary)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
            },
          },
          i + 1
        ),
        item.label || item.name
      )
    )
  );
}

export function VoiceGuidedTour({ steps = [], style }) {
  return React.createElement(VoiceAccordion, {
    style,
    items: steps.map((s, i) => ({
      id: String(i),
      title: s.title || `Step ${i + 1}`,
      content: s.content || s.description || '',
    })),
  });
}

export function VoiceModeOverlay(props) {
  const voiceMode = useVoiceKitStore((s) => !!s.voiceMode);
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(BaseVoiceModeOverlay, props),
    React.createElement(VoiceFocusRing, { active: voiceMode }),
    voiceMode &&
      React.createElement(VoiceHintLayer, {
        hints: ['Voice mode on', 'Say “exit voice mode” to leave'],
      })
  );
}

/* ───────── Shell ───────── */

export function HyperVoiceShell({
  showDock = true,
  showHud = true,
  showPalette = true,
  showDebug = true,
  showOnboarding = false,
  children,
}) {
  return React.createElement(
    React.Fragment,
    null,
    children,
    showDock && React.createElement(VoiceDock, null),
    showHud && React.createElement(VoiceHUD, null),
    showPalette && React.createElement(VoiceCommandPalette, null),
    showDebug && React.createElement(VoiceDebugPanel, null),
    showOnboarding && React.createElement(VoiceOnboarding, { open: true })
  );
}

export function VoiceKitWorkbench({ style }) {
  const [tab, setTab] = useState('overview');
  return React.createElement(
    'div',
    {
      'data-jsvoice-kit': true,
      style: {
        minHeight: '100vh',
        background: 'var(--jsv-background, #0b0d12)',
        padding: 24,
        ...baseFont,
        ...style,
      },
    },
    React.createElement(
      'header',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
          flexWrap: 'wrap',
        },
      },
      React.createElement(
        'div',
        null,
        React.createElement('h1', { style: { margin: 0, fontSize: 28 } }, 'Hyper Voice UI Kit'),
        React.createElement(
          'p',
          { style: { margin: '6px 0 0', color: 'var(--jsv-text-muted)' } },
          'Premium voice-first controls, command center, debug lab, and builders.'
        )
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
        React.createElement(VoiceThemeSwitcher, null),
        React.createElement(
          VoiceButton,
          { onClick: () => VoiceKitActions.setPaletteOpen(true) },
          'Command palette'
        ),
        React.createElement(
          VoiceButton,
          { onClick: () => VoiceKitActions.toggleDebug() },
          'Debug'
        )
      )
    ),
    React.createElement(VoiceTabs, {
      tabs: [
        { id: 'overview', label: 'Overview' },
        { id: 'commands', label: 'Commands' },
        { id: 'transcript', label: 'Transcript' },
        { id: 'widgets', label: 'Widgets' },
        { id: 'rules', label: 'Rules' },
        { id: 'plugins', label: 'Plugins' },
        { id: 'onboarding', label: 'Onboarding' },
      ],
      value: tab,
      onChange: setTab,
      style: { marginBottom: 16 },
    }),
    tab === 'overview' &&
      React.createElement(
        'div',
        { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 } },
        React.createElement(VoicePermissionCard, null),
        React.createElement(VoiceEngineSwitcher, null),
        React.createElement(EngineStatusPanel, null),
        React.createElement(RecognitionTimeline, null)
      ),
    tab === 'commands' && React.createElement(CommandCenter, null),
    tab === 'transcript' &&
      React.createElement(
        React.Fragment,
        null,
        React.createElement(VoiceTranscript, null),
        React.createElement(CommandTrace, { style: { marginTop: 16 } })
      ),
    tab === 'widgets' && React.createElement(WidgetPanel, null),
    tab === 'rules' && React.createElement(RuleBuilder, null),
    tab === 'plugins' && React.createElement(PluginCenter, null),
    tab === 'onboarding' && React.createElement(VoiceOnboarding, { open: true }),
    React.createElement(VoiceDock, null),
    React.createElement(VoiceHUD, null),
    React.createElement(VoiceCommandPalette, null),
    React.createElement(VoiceDebugPanel, null),
    React.createElement(VoiceModeOverlay, null)
  );
}

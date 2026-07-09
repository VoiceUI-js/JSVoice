/**
 * Plugin marketplace / management UI.
 */
import React, { useMemo, useState } from 'react';
import { useVoiceKitStore, useVoicePlugins } from '../hooks.js';
import { VoiceKitActions } from '../../../ui-kit/core/actions.js';
import { normalizePluginMeta, parsePluginCatalog, RECOMMENDED_PLUGINS } from '../../../ui-kit/utils/plugins.js';
import { baseFont, elevatedPanel } from '../styles.js';
import { VoiceButton, VoiceCard, VoiceEmptyState, VoiceInput } from './primitives.js';
import { PluginStatusBadge as LegacyPluginStatusBadge } from './panels.js';

export function VoicePluginStatusBadge({ active, health }) {
  return React.createElement(
    'span',
    {
      style: {
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 999,
        background: active ? 'rgba(34,197,94,0.15)' : 'var(--jsv-primary-soft)',
        color: health === 'error' ? 'var(--jsv-danger)' : active ? 'var(--jsv-success)' : 'var(--jsv-text-muted)',
      },
    },
    active ? `active${health ? ` · ${health}` : ''}` : 'available'
  );
}

export function VoicePluginCard({ plugin, onSelect, onToggle }) {
  return React.createElement(
    'div',
    {
      style: {
        ...elevatedPanel,
        padding: 14,
        display: 'grid',
        gap: 8,
        ...baseFont,
      },
    },
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', gap: 8 } },
      React.createElement(
        'div',
        null,
        React.createElement('strong', null, plugin.name),
        React.createElement('div', { style: { fontSize: 11, color: 'var(--jsv-text-muted)' } }, `v${plugin.version} · ${plugin.category}`)
      ),
      React.createElement(VoicePluginStatusBadge, { active: plugin.active, health: plugin.health })
    ),
    React.createElement('p', { style: { margin: 0, fontSize: 13, color: 'var(--jsv-text-muted)' } }, plugin.description),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
      React.createElement(VoiceButton, { size: 'sm', onClick: () => onSelect?.(plugin) }, 'Details'),
      React.createElement(
        VoiceButton,
        { size: 'sm', variant: plugin.active ? 'ghost' : 'primary', onClick: () => onToggle?.(plugin) },
        plugin.active ? 'Disable' : 'Enable'
      )
    )
  );
}

export function VoicePluginGrid({ plugins = [], onSelect, onToggle }) {
  return React.createElement(
    'div',
    { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 } },
    plugins.map((p) =>
      React.createElement(VoicePluginCard, { key: p.id || p.name, plugin: p, onSelect, onToggle })
    )
  );
}

export function VoicePluginDetails({ plugin }) {
  if (!plugin) return React.createElement(VoiceEmptyState, { title: 'Select a plugin' });
  return React.createElement(
    VoiceCard,
    { title: plugin.name },
    React.createElement('p', { style: { fontSize: 13, color: 'var(--jsv-text-muted)' } }, plugin.description),
    React.createElement('div', { style: { fontSize: 12 } }, `Version ${plugin.version}`),
    React.createElement('div', { style: { fontSize: 12 } }, `Category ${plugin.category}`),
    React.createElement('div', { style: { fontSize: 12 } }, `Compatibility ${plugin.compatibility || 'compatible'}`)
  );
}

export function VoicePluginSettings({ plugin }) {
  if (!plugin) return React.createElement(VoiceEmptyState, { title: 'No plugin selected' });
  const keys = Object.keys(plugin.settings || {});
  return React.createElement(
    VoiceCard,
    { title: 'Settings' },
    keys.length === 0
      ? React.createElement('p', { style: { margin: 0, fontSize: 13, color: 'var(--jsv-text-muted)' } }, 'No settings schema exposed.')
      : keys.map((k) => React.createElement('div', { key: k, style: { fontSize: 12 } }, `${k}: ${String(plugin.settings[k])}`))
  );
}

export function VoicePluginPermissions({ plugin }) {
  const list = plugin?.permissions || [];
  return React.createElement(
    VoiceCard,
    { title: 'Permissions' },
    list.length === 0
      ? React.createElement('span', { style: { fontSize: 13, color: 'var(--jsv-text-muted)' } }, 'None declared')
      : React.createElement('ul', { style: { margin: 0, paddingLeft: 18, fontSize: 13 } },
        list.map((p) => React.createElement('li', { key: p }, p)))
  );
}

export function VoicePluginEvents() {
  const events = useVoiceKitStore((s) => (s.timeline || []).filter((e) => e.type === 'plugin').slice(-20));
  return React.createElement(
    VoiceCard,
    { title: 'Plugin events' },
    events.length === 0
      ? React.createElement(VoiceEmptyState, { title: 'No plugin events' })
      : events.map((e) => React.createElement('div', { key: e.id, style: { fontSize: 12 } }, e.message || e.type))
  );
}

export function VoicePluginLogs() {
  return React.createElement(VoicePluginEvents, null);
}

export function VoicePluginCommandList({ plugin }) {
  const cmds = plugin?.commands || [];
  return React.createElement(
    VoiceCard,
    { title: 'Plugin commands' },
    cmds.length === 0
      ? React.createElement('span', { style: { fontSize: 13, color: 'var(--jsv-text-muted)' } }, 'No declared commands')
      : cmds.map((c, i) => React.createElement('div', { key: i, style: { fontSize: 12 } }, typeof c === 'string' ? c : c.phrase))
  );
}

export function VoicePluginInstallButton({ plugin, onInstall }) {
  return React.createElement(
    VoiceButton,
    {
      variant: 'primary',
      onClick: () => {
        onInstall?.(plugin);
        VoiceKitActions.pushToast({ title: 'Install', message: `Wire voice.use(${plugin?.name}) in app bootstrap`, tone: 'info' });
      },
    },
    'Install guide'
  );
}

export function VoicePluginToggle({ plugin, onToggle }) {
  return React.createElement(
    VoiceButton,
    {
      'aria-pressed': !!plugin?.active,
      onClick: () => onToggle?.(plugin),
    },
    plugin?.active ? 'Enabled' : 'Disabled'
  );
}

export function VoicePluginHealthCheck({ plugin }) {
  return React.createElement(
    VoiceCard,
    { title: 'Health' },
    React.createElement('div', null, plugin?.health || 'unknown')
  );
}

export function VoicePluginCompatibility({ plugin }) {
  return React.createElement(
    VoiceCard,
    { title: 'Compatibility' },
    React.createElement('div', null, plugin?.compatibility || 'compatible with JSVoice 1.x')
  );
}

export function VoicePluginMarketplace({ style }) {
  const { plugins, setPlugins } = useVoicePlugins();
  const catalogState = useVoiceKitStore((s) => s.pluginCatalog || []);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const catalog = useMemo(() => {
    const base = catalogState.length
      ? parsePluginCatalog(catalogState)
      : parsePluginCatalog(RECOMMENDED_PLUGINS);
    return base.map((p) => ({
      ...p,
      active: plugins.includes(p.id) || plugins.includes(p.name),
    }));
  }, [catalogState, plugins]);

  const filtered = catalog.filter((p) =>
    !query || p.name.toLowerCase().includes(query.toLowerCase()) || (p.description || '').toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (pl) => {
    const key = pl.id || pl.name;
    const next = pl.active ? plugins.filter((x) => x !== key && x !== pl.name) : [...plugins, key];
    setPlugins(next);
  };

  return React.createElement(
    'div',
    { style: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, ...baseFont, ...style } },
    React.createElement(
      'div',
      null,
      React.createElement('h2', { style: { marginTop: 0 } }, 'Plugin marketplace'),
      React.createElement(
        'p',
        {
          style: {
            margin: '0 0 12px',
            fontSize: 12,
            color: 'var(--jsv-warning)',
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid var(--jsv-warning)',
            background: 'rgba(245,158,11,0.08)',
          },
        },
        'Preview: metadata & enablement UI. Load real plugins with voice.use(Plugin) at bootstrap.'
      ),
      React.createElement(VoiceInput, {
        label: 'Search',
        value: query,
        onChange: setQuery,
        placeholder: 'Search plugins…',
      }),
      React.createElement('div', { style: { height: 12 } }),
      React.createElement(VoicePluginGrid, {
        plugins: filtered,
        onSelect: setSelected,
        onToggle: toggle,
      })
    ),
    React.createElement(
      'div',
      { style: { display: 'grid', gap: 12, alignContent: 'start' } },
      React.createElement(VoicePluginDetails, { plugin: selected }),
      React.createElement(VoicePluginSettings, { plugin: selected }),
      React.createElement(VoicePluginPermissions, { plugin: selected }),
      React.createElement(VoicePluginCommandList, { plugin: selected }),
      React.createElement(VoicePluginHealthCheck, { plugin: selected }),
      React.createElement(VoicePluginCompatibility, { plugin: selected }),
      selected && React.createElement(VoicePluginInstallButton, { plugin: selected })
    )
  );
}

// preserve alias used elsewhere
export { LegacyPluginStatusBadge };

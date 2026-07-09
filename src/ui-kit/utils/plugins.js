/**
 * Plugin metadata normalization — supports legacy function plugins and rich metadata objects.
 */

export function normalizePluginMeta(plugin, index = 0) {
  if (!plugin) {
    return {
      id: `plugin_${index}`,
      name: 'Unknown',
      version: '0.0.0',
      description: '',
      category: 'custom',
      icon: 'plugin',
      commands: [],
      settings: {},
      permissions: [],
      active: false,
      health: 'unknown',
    };
  }

  if (typeof plugin === 'function') {
    return {
      id: plugin.name || `plugin_${index}`,
      name: plugin.name || `Plugin ${index + 1}`,
      version: plugin.version || '1.0.0',
      description: plugin.description || 'Function plugin',
      category: plugin.category || 'custom',
      icon: plugin.icon || 'plugin',
      commands: plugin.commands || [],
      settings: plugin.settings || {},
      permissions: plugin.permissions || [],
      active: true,
      health: 'ok',
      install: plugin,
    };
  }

  return {
    id: plugin.id || plugin.name || `plugin_${index}`,
    name: plugin.name || `Plugin ${index + 1}`,
    version: plugin.version || '1.0.0',
    description: plugin.description || '',
    category: plugin.category || 'custom',
    icon: plugin.icon || 'plugin',
    commands: plugin.commands || [],
    settings: plugin.settings || {},
    permissions: plugin.permissions || [],
    active: plugin.active !== false,
    health: plugin.health || 'ok',
    compatibility: plugin.compatibility || 'compatible',
    install: plugin.install || plugin,
  };
}

export function parsePluginCatalog(list = []) {
  return list.map((p, i) => normalizePluginMeta(p, i));
}

export const RECOMMENDED_PLUGINS = [
  {
    name: 'VadPlugin',
    version: '1.0.0',
    description: 'Voice activity detection — stop on silence.',
    category: 'audio',
    icon: 'mic',
    permissions: ['microphone'],
  },
  {
    name: 'HotkeysPlugin',
    version: '1.0.0',
    description: 'Push-to-talk and keyboard shortcuts.',
    category: 'input',
    icon: 'keyboard',
  },
  {
    name: 'FuzzyMatchPlugin',
    version: '1.0.0',
    description: 'Synonym and fuzzy command matching.',
    category: 'matching',
    icon: 'sparkles',
  },
  {
    name: 'SessionRecorderPlugin',
    version: '1.0.0',
    description: 'Record and replay text sessions for debug.',
    category: 'debug',
    icon: 'record',
  },
  {
    name: 'HelpPlugin',
    version: '1.0.0',
    description: 'Built-in help commands.',
    category: 'assist',
    icon: 'help',
  },
];

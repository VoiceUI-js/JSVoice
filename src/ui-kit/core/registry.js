/**
 * Component / command metadata registry for the kit.
 */

export function createRegistry() {
  const commands = new Map();
  const plugins = new Map();
  const widgets = new Map();

  return {
    registerCommandMeta(id, meta) {
      commands.set(id, { id, ...meta });
      return id;
    },
    unregisterCommandMeta(id) {
      commands.delete(id);
    },
    listCommandMeta() {
      return Array.from(commands.values());
    },
    registerPluginMeta(id, meta) {
      plugins.set(id, { id, ...meta });
    },
    listPlugins() {
      return Array.from(plugins.values());
    },
    registerWidgetType(type, meta) {
      widgets.set(type, { type, ...meta });
    },
    listWidgetTypes() {
      return Array.from(widgets.values());
    },
    clear() {
      commands.clear();
      plugins.clear();
      widgets.clear();
    },
  };
}

export const globalRegistry = createRegistry();

// Default widget types
['panel', 'graph', 'metric', 'list', 'table', 'note', 'custom'].forEach((type) => {
  globalRegistry.registerWidgetType(type, {
    label: type.charAt(0).toUpperCase() + type.slice(1),
    description: `Voice-created ${type} widget`,
  });
});

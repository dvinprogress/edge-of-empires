import type { PluginDefinition } from '../types';

export interface PluginRegistry {
  register(plugin: PluginDefinition): void;
  get(pluginId: string): PluginDefinition | undefined;
  getAll(): PluginDefinition[];
  has(pluginId: string): boolean;
}

export function createPluginRegistry(): PluginRegistry {
  const plugins = new Map<string, PluginDefinition>();

  return {
    register(plugin: PluginDefinition) {
      if (!plugin.meta?.id) throw new Error('Plugin must have a meta.id');
      if (!plugin.meta?.name) throw new Error('Plugin must have a meta.name');
      if (!plugin.appearance) throw new Error(`Plugin "${plugin.meta.id}" must define appearance states`);
      if (!plugin.connections) throw new Error(`Plugin "${plugin.meta.id}" must define connections`);
      if (plugins.has(plugin.meta.id)) throw new Error(`Plugin "${plugin.meta.id}" is already registered`);
      plugins.set(plugin.meta.id, plugin);
    },

    get(pluginId: string) {
      return plugins.get(pluginId);
    },

    getAll() {
      return [...plugins.values()];
    },

    has(pluginId: string) {
      return plugins.has(pluginId);
    },
  };
}

import type { WorldConfig, WorldState, CityRenderData } from '../types';
import type { PluginRegistry } from '../plugins/plugin-registry';
import { computeLayout } from './layout-engine';
import { resolveRoutes } from './route-resolver';

export function parseWorld(config: WorldConfig, registry: PluginRegistry): WorldState {
  // Valider que tous les plugins references existent dans le registry
  for (const city of config.cities) {
    if (!registry.has(city.plugin)) {
      throw new Error(`Plugin "${city.plugin}" not found for city "${city.id}"`);
    }
  }

  // Calculer les positions (layout auto ou manuelles)
  const positions = computeLayout(config.cities, registry);

  // Construire les CityRenderData
  const cities: CityRenderData[] = config.cities.map(city => {
    const plugin = registry.get(city.plugin)!;
    const position = positions.get(city.id)!;
    return {
      id: city.id,
      name: city.name,
      state: 'idle',
      position,
      spriteAlias: plugin.appearance.idle,
      plugin,
    };
  });

  // Resoudre les routes (auto + manuelles)
  const routes = resolveRoutes(config, registry, positions);

  return {
    meta: { name: config.world.name, theme: config.world.theme },
    cities,
    routes,
  };
}

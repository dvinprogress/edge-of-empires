import type { WorldConfig, RouteRenderData, RouteType, GridPosition } from '../types';
import type { PluginRegistry } from '../plugins/plugin-registry';

// Map event prefix -> route type visuel
const EVENT_TO_ROUTE_TYPE: Record<string, RouteType> = {
  code: 'code',
  git: 'code',
  deployment: 'deployment',
  build: 'deployment',
  query: 'data',
  auth: 'security',
  storage: 'data',
  cache: 'cache',
  error: 'error',
  ddos: 'security',
  ssl: 'security',
};

function inferRouteType(eventType: string): RouteType {
  const prefix = eventType.split('.')[0] ?? '';
  return EVENT_TO_ROUTE_TYPE[prefix] ?? 'data';
}

export function resolveRoutes(
  config: WorldConfig,
  registry: PluginRegistry,
  positions: Map<string, GridPosition>
): RouteRenderData[] {
  const routes: RouteRenderData[] = [];
  const seen = new Set<string>();

  // Auto-resolve depuis les connexions des plugins
  for (const cityA of config.cities) {
    const pluginA = registry.get(cityA.plugin);
    if (!pluginA) continue;

    for (const cityB of config.cities) {
      if (cityA.id === cityB.id) continue;
      const pluginB = registry.get(cityB.plugin);
      if (!pluginB) continue;

      // Check si A sends quelque chose que B receives
      for (const sendEvent of pluginA.connections.sends) {
        if (pluginB.connections.receives.includes(sendEvent)) {
          const routeKey = `${cityA.id}->${cityB.id}`;
          if (seen.has(routeKey)) continue;
          seen.add(routeKey);

          const from = positions.get(cityA.id);
          const to = positions.get(cityB.id);
          if (!from || !to) continue;

          routes.push({
            id: routeKey,
            from,
            to,
            type: inferRouteType(sendEvent),
            active: false,
          });
        }
      }
    }
  }

  // Ajouter les routes manuelles de la config
  if (config.routes) {
    for (const route of config.routes) {
      const routeKey = `${route.from}->${route.to}`;
      if (seen.has(routeKey)) continue;
      seen.add(routeKey);

      const from = positions.get(route.from);
      const to = positions.get(route.to);
      if (!from || !to) continue;

      routes.push({
        id: routeKey,
        from,
        to,
        type: route.type,
        active: false,
      });
    }
  }

  return routes;
}

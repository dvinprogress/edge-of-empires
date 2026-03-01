/** Metadata du monde */
export interface WorldMeta {
  name: string;
  theme: string;
}

/** Position sur la grille isometrique */
export interface GridPosition {
  col: number;
  row: number;
}

/** Types de routes entre villes */
export type RouteType = 'code' | 'data' | 'deployment' | 'security' | 'error' | 'cache';

/** Configuration d'une ville dans le monde */
export interface CityConfig {
  id: string;
  plugin: string;
  name: string;
  config: Record<string, unknown>;
  position?: GridPosition;
}

/** Configuration d'une route manuelle */
export interface RouteConfig {
  from: string;
  to: string;
  type: RouteType;
}

/** Configuration complete du monde (world.config.json) */
export interface WorldConfig {
  world: WorldMeta;
  cities: CityConfig[];
  routes?: RouteConfig[];
}

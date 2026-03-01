import type { CityState, PluginDefinition } from './plugin';
import type { GridPosition, RouteType } from './world';

/** Point en coordonnees ecran isometriques */
export interface IsoPoint {
  x: number;
  y: number;
}

/** Donnees de rendu d'une ville */
export interface CityRenderData {
  id: string;
  name: string;
  state: CityState;
  position: GridPosition;
  spriteAlias: string;
  plugin: PluginDefinition;
}

/** Donnees de rendu d'une route */
export interface RouteRenderData {
  id: string;
  from: GridPosition;
  to: GridPosition;
  type: RouteType;
  active: boolean;
}

/** Configuration du renderer */
export interface RendererConfig {
  containerId: string;
  tileWidth: number;
  tileHeight: number;
  theme: string;
}

/** Etat complet du monde pour le rendu */
export interface WorldState {
  meta: { name: string; theme: string };
  cities: CityRenderData[];
  routes: RouteRenderData[];
}

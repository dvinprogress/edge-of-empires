import type { CityConfig, GridPosition } from '../types';
import type { PluginRegistry } from '../plugins/plugin-registry';

// Positions en anneau autour du centre (offsets relatifs)
const RING_OFFSETS: GridPosition[] = [
  { col: -2, row: 0 },   // gauche
  { col: 2, row: 0 },    // droite
  { col: 0, row: -2 },   // haut
  { col: 0, row: 2 },    // bas
  { col: -2, row: -2 },  // haut-gauche
  { col: 2, row: -2 },   // haut-droite
  { col: -2, row: 2 },   // bas-gauche
  { col: 2, row: 2 },    // bas-droite
];

const CENTER: GridPosition = { col: 4, row: 4 };

export function computeLayout(
  cities: CityConfig[],
  registry: PluginRegistry
): Map<string, GridPosition> {
  const positions = new Map<string, GridPosition>();

  // Respecter les positions manuelles
  const unplaced: CityConfig[] = [];
  for (const city of cities) {
    if (city.position) {
      positions.set(city.id, city.position);
    } else {
      unplaced.push(city);
    }
  }

  if (unplaced.length === 0) return positions;

  // Trouver la ville source (plus de sends, moins de receives)
  const scored = unplaced.map(city => {
    const plugin = registry.get(city.plugin);
    const sends = plugin?.connections.sends.length ?? 0;
    const receives = plugin?.connections.receives.length ?? 0;
    return { city, score: sends - receives };
  }).sort((a, b) => b.score - a.score);

  // Placer la source au centre
  const source = scored.shift();
  if (source) {
    positions.set(source.city.id, CENTER);
  }

  // Placer les autres en anneau
  let ringIndex = 0;
  for (const { city } of scored) {
    if (ringIndex < RING_OFFSETS.length) {
      const offset = RING_OFFSETS[ringIndex]!;
      positions.set(city.id, {
        col: CENTER.col + offset.col,
        row: CENTER.row + offset.row,
      });
    } else {
      // Fallback : placer sur un 2e anneau plus large
      positions.set(city.id, {
        col: CENTER.col + (ringIndex - RING_OFFSETS.length) * 3,
        row: CENTER.row + 4,
      });
    }
    ringIndex++;
  }

  return positions;
}

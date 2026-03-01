import type { WorldConfig, CityConfig } from '@edge-of-empires/core';
import type { ScanResult } from './types.js';

// Plugin ID → medieval city name mapping
const CITY_NAMES: Record<string, string> = {
  'local-machine': 'La Citadelle',
  'github': 'Les Archives',
  'vercel': 'La Forge',
  'supabase': 'Le Grand Marché',
  'cloudflare': 'Les Remparts',
};

const KNOWN_PLUGINS = ['local-machine', 'github', 'vercel', 'supabase', 'cloudflare'] as const;

type KnownPlugin = (typeof KNOWN_PLUGINS)[number];

function isKnownPlugin(id: string): id is KnownPlugin {
  return (KNOWN_PLUGINS as readonly string[]).includes(id);
}

export function generateWorldConfig(scan: ScanResult): WorldConfig & {
  _metadata: {
    unknownServices: Array<{ id: string; sources: string[] }>;
    scannedAt: string;
  };
} {
  const cities: CityConfig[] = [];

  // Always inject local-machine first
  cities.push({
    id: 'local-machine',
    plugin: 'local-machine',
    name: CITY_NAMES['local-machine'] ?? 'La Citadelle',
    config: {},
  });

  // Add detected plugins that exist in KNOWN_PLUGINS (skip local-machine, already added)
  for (const detection of scan.detections) {
    if (!isKnownPlugin(detection.pluginId)) continue;
    if (detection.pluginId === 'local-machine') continue;

    cities.push({
      id: detection.pluginId,
      plugin: detection.pluginId,
      name: CITY_NAMES[detection.pluginId] ?? detection.pluginId,
      config: {},
    });
  }

  return {
    world: {
      name: scan.projectName,
      theme: 'medieval',
    },
    cities,
    // DON'T generate routes — resolveRoutes handles that
    _metadata: {
      unknownServices: scan.unknownServices,
      scannedAt: new Date().toISOString(),
    },
  };
}

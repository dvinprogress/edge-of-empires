import type { PluginDefinition, SimulationScenario } from '@edge-of-empires/core';

export const cloudflarePlugin: PluginDefinition = {
  meta: {
    id: 'cloudflare',
    name: 'Cloudflare',
    description: 'Les remparts celestes — protection et acceleration pour le monde entier',
    version: '1.0.0',
    icon: 'wall',
    defaultCityName: 'Les Remparts',
  },
  appearance: {
    idle: 'wall-idle',
    building: 'wall-build',
    success: 'wall-banner',
    error: 'wall-smoke',
    offline: 'wall-ruins',
  },
  events: ['cache.hit', 'cache.miss', 'ddos.blocked', 'ssl.renewed'],
  connections: {
    receives: ['deployment.succeeded'],
    sends: ['cache.hit'],
  },
  humanReadable: {
    'cache.hit': '⚡ {cityName} sert un visiteur depuis ses reserves',
    'cache.miss': '🔄 {cityName} doit chercher les ressources a la source',
    'ddos.blocked': "🛡️ {cityName} repousse une horde d'envahisseurs !",
    'ssl.renewed': '🔒 {cityName} renouvelle ses sceaux de protection',
  },
};

export const cloudflareScenarios: SimulationScenario[] = [
  {
    name: 'cache-and-protection',
    description: 'Cache et protection',
    steps: [
      {
        delay: 0,
        event: {
          sourceCity: 'cloudflare',
          type: 'cache.hit',
          humanMessage: '⚡ Les Remparts servent un visiteur depuis leurs reserves',
        },
        cityStateChange: { cityId: 'cloudflare', newState: 'success' },
      },
    ],
  },
];

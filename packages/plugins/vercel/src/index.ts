import type { PluginDefinition, SimulationScenario } from '@edge-of-empires/core';

export const vercelPlugin: PluginDefinition = {
  meta: {
    id: 'vercel',
    name: 'Vercel',
    description: "L'atelier de construction — ou le code prend vie pour le monde",
    version: '1.0.0',
    icon: 'forge',
    defaultCityName: "L'Atelier",
  },
  appearance: {
    idle: 'forge-idle',
    building: 'forge-build',
    success: 'forge-banner',
    error: 'forge-smoke',
    offline: 'forge-ruins',
  },
  events: ['deployment.started', 'deployment.succeeded', 'deployment.failed', 'preview.created'],
  connections: {
    receives: ['git.push', 'ci.passed'],
    sends: ['deployment.succeeded', 'deployment.failed'],
  },
  humanReadable: {
    'deployment.started': '🏗️ {cityName} commence a construire une nouvelle version',
    'deployment.succeeded': '🎉 {cityName} a termine ! La nouvelle version est en ligne',
    'deployment.failed': '🔥 {cityName} a rencontre un probleme lors de la construction',
    'preview.created': "🏕️ Un avant-poste de previsualisation vient d'etre cree",
  },
};

export const vercelScenarios: SimulationScenario[] = [
  {
    name: 'deployment',
    description: 'Deploiement complet',
    steps: [
      {
        delay: 0,
        event: {
          sourceCity: 'vercel',
          type: 'deployment.started',
          humanMessage: "🏗️ L'Atelier commence a construire une nouvelle version",
        },
        cityStateChange: { cityId: 'vercel', newState: 'building' },
      },
      {
        delay: 2500,
        event: {
          sourceCity: 'vercel',
          type: 'deployment.succeeded',
          routeType: 'deployment',
          targetCity: 'supabase',
          humanMessage: "🎉 L'Atelier a termine ! La nouvelle version est en ligne",
        },
        cityStateChange: { cityId: 'vercel', newState: 'success' },
      },
    ],
  },
];

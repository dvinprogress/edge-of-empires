import type { PluginDefinition, SimulationScenario } from '@edge-of-empires/core';

export const supabasePlugin: PluginDefinition = {
  meta: {
    id: 'supabase',
    name: 'Supabase',
    description: 'Le grand marche des ressources — ou les donnees sont stockees et echangees',
    version: '1.0.0',
    icon: 'market',
    defaultCityName: 'Le Marche',
  },
  appearance: {
    idle: 'market-idle',
    building: 'market-build',
    success: 'market-banner',
    error: 'market-smoke',
    offline: 'market-ruins',
  },
  events: ['query.executed', 'migration.applied', 'auth.login', 'storage.upload'],
  connections: {
    receives: ['deployment.succeeded'],
    sends: ['query.executed', 'auth.login'],
  },
  humanReadable: {
    'query.executed': '📊 Les marchands de {cityName} echangent des ressources',
    'migration.applied': '🏛️ {cityName} reorganise ses entrepots',
    'auth.login': '🛡️ Un voyageur presente ses lettres de passage a {cityName}',
    'storage.upload': '📦 De nouvelles marchandises arrivent aux entrepots de {cityName}',
  },
};

export const supabaseScenarios: SimulationScenario[] = [
  {
    name: 'data-exchange',
    description: 'Echange de donnees',
    steps: [
      {
        delay: 0,
        event: {
          sourceCity: 'supabase',
          type: 'query.executed',
          humanMessage: '📊 Les marchands du Marche echangent des ressources',
        },
        cityStateChange: { cityId: 'supabase', newState: 'building' },
      },
      {
        delay: 500,
        event: {
          sourceCity: 'supabase',
          type: 'auth.login',
          humanMessage: '🛡️ Un voyageur presente ses lettres de passage au Marche',
        },
        cityStateChange: { cityId: 'supabase', newState: 'success' },
      },
    ],
  },
];

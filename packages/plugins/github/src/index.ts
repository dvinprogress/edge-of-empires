import type { PluginDefinition, SimulationScenario } from '@edge-of-empires/core';

export const githubPlugin: PluginDefinition = {
  meta: {
    id: 'github',
    name: 'GitHub',
    description: 'La memoire de la civilisation — ou le code est archive et versionne',
    version: '1.0.0',
    icon: 'temple',
    defaultCityName: 'La Bibliotheque',
  },
  appearance: {
    idle: 'temple-idle',
    building: 'temple-build',
    success: 'temple-banner',
    error: 'temple-smoke',
    offline: 'temple-ruins',
  },
  events: ['git.push', 'pr.opened', 'pr.merged', 'ci.started', 'ci.passed', 'ci.failed'],
  connections: {
    receives: ['code.saved', 'terminal.command'],
    sends: ['git.push', 'ci.passed', 'ci.failed'],
  },
  humanReadable: {
    'git.push': '📜 De nouveaux parchemins arrivent a {cityName}',
    'pr.opened': '📋 Une proposition de modification est soumise a {cityName}',
    'pr.merged': '✅ La proposition est acceptee et archivee dans {cityName}',
    'ci.started': '🔍 Les scribes de {cityName} verifient les parchemins...',
    'ci.passed': '✨ Les scribes de {cityName} ont valide les parchemins !',
    'ci.failed': '❌ Les scribes de {cityName} ont trouve des erreurs !',
  },
};

export const githubScenarios: SimulationScenario[] = [
  {
    name: 'ci-pipeline',
    description: 'Push et CI pipeline',
    steps: [
      {
        delay: 0,
        event: {
          sourceCity: 'github',
          type: 'git.push',
          humanMessage: '📜 De nouveaux parchemins arrivent a La Bibliotheque',
        },
        cityStateChange: { cityId: 'github', newState: 'building' },
      },
      {
        delay: 1000,
        event: {
          sourceCity: 'github',
          type: 'ci.started',
          humanMessage: '🔍 Les scribes de La Bibliotheque verifient les parchemins...',
        },
      },
      {
        delay: 2000,
        event: {
          sourceCity: 'github',
          type: 'ci.passed',
          routeType: 'deployment',
          targetCity: 'vercel',
          humanMessage: '✨ Les scribes de La Bibliotheque ont valide les parchemins !',
        },
        cityStateChange: { cityId: 'github', newState: 'success' },
      },
    ],
  },
];

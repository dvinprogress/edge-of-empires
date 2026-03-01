import type { PluginDefinition, SimulationScenario } from '@edge-of-empires/core';

export const localMachinePlugin: PluginDefinition = {
  meta: {
    id: 'local-machine',
    name: 'Machine Locale',
    description: 'Le QG du developpeur — ou le code est ecrit et les commandes executees',
    version: '1.0.0',
    icon: 'castle',
    defaultCityName: 'La Citadelle',
  },
  appearance: {
    idle: 'castle-idle',
    building: 'castle-build',
    success: 'castle-banner',
    error: 'castle-smoke',
    offline: 'castle-ruins',
  },
  events: ['code.saved', 'terminal.command', 'claude.thinking', 'claude.response'],
  connections: {
    receives: [],
    sends: ['code.saved', 'terminal.command'],
  },
  humanReadable: {
    'code.saved': "📝 Un parchemin vient d'etre modifie dans {cityName}",
    'terminal.command': '⚡ Un ordre vient d\'etre envoye depuis {cityName}',
    'claude.thinking': '🤔 Le sage de {cityName} reflechit...',
    'claude.response': '💡 Le sage de {cityName} a parle !',
  },
};

export const localMachineScenarios: SimulationScenario[] = [
  {
    name: 'code-change',
    description: 'Le developpeur modifie du code',
    steps: [
      {
        delay: 0,
        event: {
          sourceCity: 'local-machine',
          type: 'code.saved',
          humanMessage: "📝 Un parchemin vient d'etre modifie dans La Citadelle",
        },
        cityStateChange: { cityId: 'local-machine', newState: 'building' },
      },
      {
        delay: 500,
        event: {
          sourceCity: 'local-machine',
          type: 'terminal.command',
          routeType: 'code',
          targetCity: 'github',
          humanMessage: '⚡ Un messager part de La Citadelle vers La Bibliotheque',
        },
        cityStateChange: { cityId: 'local-machine', newState: 'success' },
      },
    ],
  },
];

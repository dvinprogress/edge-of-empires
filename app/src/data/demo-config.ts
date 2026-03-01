import type { WorldConfig } from '@edge-of-empires/core';

export const demoConfig: WorldConfig = {
  world: {
    name: 'Mon Infrastructure',
    theme: 'medieval',
  },
  cities: [
    {
      id: 'local-machine',
      plugin: 'local-machine',
      name: 'La Citadelle',
      config: {},
    },
    {
      id: 'github',
      plugin: 'github',
      name: 'La Bibliotheque',
      config: {},
    },
    {
      id: 'vercel',
      plugin: 'vercel',
      name: "L'Atelier",
      config: {},
    },
    {
      id: 'supabase',
      plugin: 'supabase',
      name: 'Le Marche',
      config: {},
    },
    {
      id: 'cloudflare',
      plugin: 'cloudflare',
      name: 'Les Remparts',
      config: {},
    },
  ],
};

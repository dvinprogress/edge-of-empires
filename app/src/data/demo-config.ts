import type { WorldConfig } from '@edge-of-empires/core';

/** Configuration generee par le scanner sur ~/Documents/muchlove */
export const demoConfig: WorldConfig = {
  world: {
    name: 'MuchLove',
    theme: 'medieval',
  },
  cities: [
    {
      id: 'local-machine',
      plugin: 'local-machine',
      name: 'La Citadelle',
      config: { projectName: 'muchlove' },
    },
    {
      id: 'supabase',
      plugin: 'supabase',
      name: 'Le Grand Marche',
      config: { detectedVia: ['@supabase/supabase-js', 'NEXT_PUBLIC_SUPABASE_URL'] },
    },
    {
      id: 'vercel',
      plugin: 'vercel',
      name: 'La Forge',
      config: { region: 'cdg1', framework: 'nextjs' },
    },
    {
      id: 'github',
      plugin: 'github',
      name: 'Les Archives',
      config: { repo: 'dvinprogress/muchlove' },
    },
  ],
};

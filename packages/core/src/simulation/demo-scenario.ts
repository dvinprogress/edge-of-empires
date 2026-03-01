import type { SimulationScenario } from '../types';

/** Scenario complet de deploiement — combine tous les plugins dans l'ordre */
export const fullDeploymentScenario: SimulationScenario = {
  name: 'full-deployment',
  description: 'Simulation complete : du code au deploiement en passant par la CI',
  steps: [
    // 1. Le developpeur sauvegarde du code
    {
      delay: 0,
      event: {
        sourceCity: 'local-machine',
        type: 'code.saved',
        humanMessage: "📝 Un parchemin vient d'etre modifie dans La Citadelle",
      },
      cityStateChange: { cityId: 'local-machine', newState: 'building' },
    },
    // 2. Push vers GitHub
    {
      delay: 800,
      event: {
        sourceCity: 'local-machine',
        targetCity: 'github',
        type: 'terminal.command',
        routeType: 'code',
        humanMessage: '⚡ Un messager part de La Citadelle vers La Bibliotheque',
      },
      cityStateChange: { cityId: 'local-machine', newState: 'success' },
    },
    // 3. GitHub recoit le push
    {
      delay: 1000,
      event: {
        sourceCity: 'github',
        type: 'git.push',
        humanMessage: '📜 De nouveaux parchemins arrivent a La Bibliotheque',
      },
      cityStateChange: { cityId: 'github', newState: 'building' },
    },
    // 4. CI demarre
    {
      delay: 1500,
      event: {
        sourceCity: 'github',
        type: 'ci.started',
        humanMessage: '🔍 Les scribes de La Bibliotheque verifient les parchemins...',
      },
    },
    // 5. CI passe
    {
      delay: 3000,
      event: {
        sourceCity: 'github',
        targetCity: 'vercel',
        type: 'ci.passed',
        routeType: 'deployment',
        humanMessage: '✨ Les scribes de La Bibliotheque ont valide les parchemins !',
      },
      cityStateChange: { cityId: 'github', newState: 'success' },
    },
    // 6. Deploiement Vercel demarre
    {
      delay: 3500,
      event: {
        sourceCity: 'vercel',
        type: 'deployment.started',
        humanMessage: "🏗️ L'Atelier commence a construire une nouvelle version",
      },
      cityStateChange: { cityId: 'vercel', newState: 'building' },
    },
    // 7. Deploiement reussi
    {
      delay: 6000,
      event: {
        sourceCity: 'vercel',
        type: 'deployment.succeeded',
        humanMessage: "🎉 L'Atelier a termine ! La nouvelle version est en ligne",
      },
      cityStateChange: { cityId: 'vercel', newState: 'success' },
    },
    // 8. Supabase recoit des requetes
    {
      delay: 6500,
      event: {
        sourceCity: 'supabase',
        type: 'query.executed',
        humanMessage: '📊 Les marchands du Marche echangent des ressources',
      },
      cityStateChange: { cityId: 'supabase', newState: 'building' },
    },
    {
      delay: 7000,
      event: {
        sourceCity: 'supabase',
        type: 'auth.login',
        humanMessage: '🛡️ Un voyageur presente ses lettres de passage au Marche',
      },
      cityStateChange: { cityId: 'supabase', newState: 'success' },
    },
    // 9. Cloudflare cache
    {
      delay: 7500,
      event: {
        sourceCity: 'cloudflare',
        type: 'cache.hit',
        humanMessage: '⚡ Les Remparts servent un visiteur depuis leurs reserves',
      },
      cityStateChange: { cityId: 'cloudflare', newState: 'success' },
    },
  ],
};

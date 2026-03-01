import type { SimulationScenario } from '../types';

/** Scenario complet de deploiement — adapte a une stack Next.js + Supabase + Vercel + GitHub */
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
        humanMessage: '⚡ Un messager part de La Citadelle vers Les Archives',
      },
      cityStateChange: { cityId: 'local-machine', newState: 'success' },
    },
    // 3. GitHub recoit le push
    {
      delay: 1000,
      event: {
        sourceCity: 'github',
        type: 'git.push',
        humanMessage: '📜 De nouveaux parchemins arrivent aux Archives',
      },
      cityStateChange: { cityId: 'github', newState: 'building' },
    },
    // 4. CI demarre
    {
      delay: 1500,
      event: {
        sourceCity: 'github',
        type: 'ci.started',
        humanMessage: '🔍 Les scribes des Archives verifient les parchemins...',
      },
    },
    // 5. CI passe → deploiement
    {
      delay: 3000,
      event: {
        sourceCity: 'github',
        targetCity: 'vercel',
        type: 'ci.passed',
        routeType: 'deployment',
        humanMessage: '✨ Les scribes des Archives ont valide les parchemins !',
      },
      cityStateChange: { cityId: 'github', newState: 'success' },
    },
    // 6. Deploiement Vercel demarre
    {
      delay: 3500,
      event: {
        sourceCity: 'vercel',
        type: 'deployment.started',
        humanMessage: '🏗️ La Forge commence a construire une nouvelle version',
      },
      cityStateChange: { cityId: 'vercel', newState: 'building' },
    },
    // 7. Deploiement reussi
    {
      delay: 6000,
      event: {
        sourceCity: 'vercel',
        targetCity: 'supabase',
        type: 'deployment.succeeded',
        routeType: 'data',
        humanMessage: '🎉 La Forge a termine ! La nouvelle version est en ligne',
      },
      cityStateChange: { cityId: 'vercel', newState: 'success' },
    },
    // 8. Supabase recoit des requetes
    {
      delay: 6500,
      event: {
        sourceCity: 'supabase',
        type: 'query.executed',
        humanMessage: '📊 Les marchands du Grand Marche echangent des ressources',
      },
      cityStateChange: { cityId: 'supabase', newState: 'building' },
    },
    // 9. Auth Supabase
    {
      delay: 7000,
      event: {
        sourceCity: 'supabase',
        type: 'auth.login',
        humanMessage: '🛡️ Un voyageur presente ses lettres de passage au Grand Marche',
      },
      cityStateChange: { cityId: 'supabase', newState: 'success' },
    },
  ],
};

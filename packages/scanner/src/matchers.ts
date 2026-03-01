import type { DetectionResult } from './types.js';

const PACKAGE_TO_PLUGIN: Record<string, string> = {
  '@supabase/supabase-js': 'supabase',
  '@supabase/ssr': 'supabase',
  '@supabase/auth-helpers-nextjs': 'supabase',
  'vercel': 'vercel',
  '@vercel/analytics': 'vercel',
  '@vercel/speed-insights': 'vercel',
  'cloudflare': 'cloudflare',
  '@cloudflare/workers-types': 'cloudflare',
  'wrangler': 'cloudflare',
  '@octokit/rest': 'github',
  '@octokit/core': 'github',
};

const PACKAGE_TO_UNKNOWN: Record<string, string> = {
  '@ai-sdk/anthropic': 'anthropic',
  '@ai-sdk/openai': 'openai',
  'openai': 'openai',
  'stripe': 'stripe',
};

const ENV_PATTERNS: Array<{ pattern: RegExp; plugin: string }> = [
  { pattern: /^NEXT_PUBLIC_SUPABASE_URL$/, plugin: 'supabase' },
  { pattern: /^NEXT_PUBLIC_SUPABASE_ANON_KEY$/, plugin: 'supabase' },
  { pattern: /^SUPABASE_SERVICE_ROLE_KEY$/, plugin: 'supabase' },
  { pattern: /^SUPABASE_ACCESS_TOKEN$/, plugin: 'supabase' },
  { pattern: /^VERCEL_TOKEN$/, plugin: 'vercel' },
  { pattern: /^VERCEL_ORG_ID$/, plugin: 'vercel' },
  { pattern: /^VERCEL_PROJECT_ID$/, plugin: 'vercel' },
  { pattern: /^GITHUB_TOKEN$/, plugin: 'github' },
  { pattern: /^GITHUB_REPO$/, plugin: 'github' },
  { pattern: /^GH_TOKEN$/, plugin: 'github' },
  { pattern: /^CLOUDFLARE_API_TOKEN$/, plugin: 'cloudflare' },
  { pattern: /^CF_API_TOKEN$/, plugin: 'cloudflare' },
];

const ENV_UNKNOWN_PATTERNS: Array<{ pattern: RegExp; service: string }> = [
  { pattern: /^ANTHROPIC_API_KEY$/, service: 'anthropic' },
  { pattern: /^OPENAI_API_KEY$/, service: 'openai' },
  { pattern: /^GOOGLE_CALENDAR_/, service: 'google-calendar' },
  { pattern: /^STRIPE_/, service: 'stripe' },
  { pattern: /^VPS_WEBHOOK_/, service: 'vps-webhook' },
];

const CONFIG_FILE_RULES: Array<{
  file: string;
  plugin: string;
  confidence: 'high' | 'medium';
}> = [
  { file: 'vercel.json', plugin: 'vercel', confidence: 'high' },
  { file: '.vercel/project.json', plugin: 'vercel', confidence: 'high' },
  { file: 'supabase/config.toml', plugin: 'supabase', confidence: 'high' },
  { file: 'wrangler.toml', plugin: 'cloudflare', confidence: 'high' },
  { file: 'wrangler.jsonc', plugin: 'cloudflare', confidence: 'high' },
  { file: '.github/workflows', plugin: 'github', confidence: 'medium' },
  { file: '.github', plugin: 'github', confidence: 'medium' },
];

export function matchPackageDeps(
  deps: string[]
): { known: DetectionResult[]; unknown: Array<{ id: string; sources: string[] }> } {
  const knownMap = new Map<string, DetectionResult>();
  const unknownMap = new Map<string, string[]>();

  for (const dep of deps) {
    const plugin = PACKAGE_TO_PLUGIN[dep];
    if (plugin !== undefined) {
      const source = `package.json#${dep}`;
      const existing = knownMap.get(plugin);
      if (existing !== undefined) {
        existing.sources.push(source);
      } else {
        knownMap.set(plugin, { pluginId: plugin, confidence: 'high', sources: [source] });
      }
    }

    const unknownService = PACKAGE_TO_UNKNOWN[dep];
    if (unknownService !== undefined) {
      const source = `package.json#${dep}`;
      const existing = unknownMap.get(unknownService);
      if (existing !== undefined) {
        existing.push(source);
      } else {
        unknownMap.set(unknownService, [source]);
      }
    }
  }

  return {
    known: Array.from(knownMap.values()),
    unknown: Array.from(unknownMap.entries()).map(([id, sources]) => ({ id, sources })),
  };
}

export function matchEnvKeys(
  keys: string[]
): { known: DetectionResult[]; unknown: Array<{ id: string; sources: string[] }> } {
  const knownMap = new Map<string, DetectionResult>();
  const unknownMap = new Map<string, string[]>();

  for (const key of keys) {
    for (const { pattern, plugin } of ENV_PATTERNS) {
      if (pattern.test(key)) {
        const source = `env#${key}`;
        const existing = knownMap.get(plugin);
        if (existing !== undefined) {
          existing.sources.push(source);
        } else {
          knownMap.set(plugin, { pluginId: plugin, confidence: 'high', sources: [source] });
        }
        break;
      }
    }

    for (const { pattern, service } of ENV_UNKNOWN_PATTERNS) {
      if (pattern.test(key)) {
        const source = `env#${key}`;
        const existing = unknownMap.get(service);
        if (existing !== undefined) {
          existing.push(source);
        } else {
          unknownMap.set(service, [source]);
        }
        break;
      }
    }
  }

  return {
    known: Array.from(knownMap.values()),
    unknown: Array.from(unknownMap.entries()).map(([id, sources]) => ({ id, sources })),
  };
}

export function matchConfigFiles(
  files: string[]
): DetectionResult[] {
  const resultMap = new Map<string, DetectionResult>();

  for (const file of files) {
    const rule = CONFIG_FILE_RULES.find((r) => r.file === file);
    if (rule === undefined) continue;

    const source = `config#${file}`;
    const existing = resultMap.get(rule.plugin);
    if (existing !== undefined) {
      existing.sources.push(source);
    } else {
      resultMap.set(rule.plugin, {
        pluginId: rule.plugin,
        confidence: rule.confidence,
        sources: [source],
      });
    }
  }

  return Array.from(resultMap.values());
}

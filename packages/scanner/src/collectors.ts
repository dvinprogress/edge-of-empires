import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export function collectPackageDeps(projectPath: string): string[] {
  const pkgPath = join(projectPath, 'package.json');
  if (!existsSync(pkgPath)) return [];

  try {
    const raw = readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = Object.keys(pkg.dependencies ?? {});
    const devDeps = Object.keys(pkg.devDependencies ?? {});
    return [...deps, ...devDeps];
  } catch {
    return [];
  }
}

export function collectEnvKeys(projectPath: string): string[] {
  const candidates = ['.env.local', '.env.example', '.env'];
  const keys: string[] = [];

  for (const filename of candidates) {
    const filePath = join(projectPath, filename);
    if (!existsSync(filePath)) continue;

    try {
      const content = readFileSync(filePath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith('#')) continue;

        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;

        const key = trimmed.slice(0, eqIndex).trim();
        if (key) {
          keys.push(key);
        }
      }
    } catch {
      // Skip unreadable files silently
    }
  }

  return [...new Set(keys)];
}

export function collectConfigFiles(projectPath: string): string[] {
  const candidates = [
    'vercel.json',
    '.vercel/project.json',
    'supabase/config.toml',
    'wrangler.toml',
    'wrangler.jsonc',
    '.github/workflows',
    '.github',
  ];

  return candidates.filter((file) => existsSync(join(projectPath, file)));
}

import { Assets } from 'pixi.js';
import type { ThemeManifest } from '@edge-of-empires/core';

export async function loadTheme(manifest: ThemeManifest, basePath: string): Promise<void> {
  const bundles: { alias: string; src: string }[] = [];

  for (const [alias, path] of Object.entries(manifest.assets.buildings)) {
    bundles.push({ alias, src: `${basePath}/${path}` });
  }
  for (const [alias, path] of Object.entries(manifest.assets.terrain)) {
    bundles.push({ alias, src: `${basePath}/${path}` });
  }
  for (const [alias, path] of Object.entries(manifest.assets.caravans)) {
    bundles.push({ alias, src: `${basePath}/${path}` });
  }

  if (bundles.length > 0) {
    for (const bundle of bundles) {
      Assets.add(bundle);
    }
    await Assets.load(bundles.map((b) => b.alias));
  }
}

export function hasTexture(alias: string): boolean {
  try {
    return Assets.cache.has(alias);
  } catch {
    return false;
  }
}

/** Bundle d'assets d'un theme */
export interface ThemeAssetBundle {
  terrain: Record<string, string>;
  buildings: Record<string, string>;
  caravans: Record<string, string>;
  sounds: Record<string, string>;
  ui: Record<string, string>;
}

/** Manifest d'un theme */
export interface ThemeManifest {
  id: string;
  name: string;
  description: string;
  tileWidth: number;
  tileHeight: number;
  assets: ThemeAssetBundle;
}

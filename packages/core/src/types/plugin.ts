/** Metadata d'un plugin */
export interface PluginMeta {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
  defaultCityName: string;
}

/** Connexions declarees par un plugin */
export interface PluginConnections {
  receives: string[];
  sends: string[];
}

/** Etats possibles d'une ville */
export type CityState = 'idle' | 'building' | 'success' | 'error' | 'offline';

/** Definition complete d'un plugin — contrat que TOUT plugin doit respecter */
export interface PluginDefinition {
  meta: PluginMeta;
  appearance: Record<CityState, string>;
  events: string[];
  connections: PluginConnections;
  humanReadable: Record<string, string>;
}

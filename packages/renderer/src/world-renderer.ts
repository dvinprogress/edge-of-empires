import { Application, Container } from 'pixi.js';
import type { WorldState, RendererConfig, CityState, RouteType, GridPosition } from '@edge-of-empires/core';
import { Camera } from './iso/camera';
import { gridPositionToIso } from './iso/iso-math';
import { TerrainLayer } from './layers/terrain-layer';
import { CityLayer } from './layers/city-layer';
import { RouteLayer } from './layers/route-layer';
import { CaravanLayer } from './layers/caravan-layer';
import { UIOverlayLayer } from './layers/ui-overlay-layer';
import { SoundManager } from './sound/sound-manager';
import { loadTheme } from './theme/theme-loader';

// Manifest medieval inline — evite un fetch() supplementaire au demarrage
const MEDIEVAL_MANIFEST = {
  id: 'medieval',
  name: 'Medieval',
  description: 'Theme medieval isometrique',
  tileWidth: 128,
  tileHeight: 64,
  assets: {
    terrain: {
      'terrain-tileset': 'assets/terrain/tileset.png',
    },
    buildings: {
      'building-castle':  'assets/buildings/castle.png',
      'building-temple':  'assets/buildings/barracks.png',
      'building-forge':   'assets/buildings/blacksmith.png',
      'building-market':  'assets/buildings/inn.png',
      'building-wall':    'assets/buildings/guard-tower.png',
      'building-generic': 'assets/buildings/houses.png',
    },
    caravans: {
      'caravan-default': 'assets/caravans/medieval_props_128x64_shaded_18.png',
    },
    sounds: {},
    ui: {},
  },
} as const;

export class WorldRenderer {
  private app: Application | null = null;
  private stage: Container | null = null;
  private camera: Camera | null = null;
  private terrainLayer: TerrainLayer | null = null;
  private cityLayer: CityLayer | null = null;
  private routeLayer: RouteLayer | null = null;
  private caravanLayer: CaravanLayer | null = null;
  private uiOverlay: UIOverlayLayer | null = null;
  readonly soundManager = new SoundManager();
  private config: RendererConfig | null = null;

  async init(config: RendererConfig): Promise<void> {
    this.config = config;
    const container = document.getElementById(config.containerId);
    if (!container) throw new Error(`Container #${config.containerId} not found`);

    this.app = new Application();
    await this.app.init({
      background: 0x1a1a2e,
      resizeTo: container,
      antialias: true,
    });
    container.appendChild(this.app.canvas);

    // Stage principal avec tri par zIndex
    this.stage = new Container();
    this.stage.sortableChildren = true;
    this.app.stage.addChild(this.stage);

    // Camera
    this.camera = new Camera(this.stage, this.app.canvas);
    this.camera.enable();

    // Layers
    this.terrainLayer = new TerrainLayer();
    this.routeLayer = new RouteLayer();
    this.cityLayer = new CityLayer();
    this.caravanLayer = new CaravanLayer(this.app.ticker);
    this.uiOverlay = new UIOverlayLayer();

    this.routeLayer.setTileSize(config.tileWidth, config.tileHeight);
    this.cityLayer.setTileSize(config.tileWidth, config.tileHeight);
    this.caravanLayer.setTileSize(config.tileWidth, config.tileHeight);

    this.stage.addChild(this.terrainLayer.container);
    this.stage.addChild(this.routeLayer.container);
    this.stage.addChild(this.cityLayer.container);
    this.stage.addChild(this.caravanLayer.container);
    this.stage.addChild(this.uiOverlay.container);

    // Chargement des sprites du theme avant le premier rendu
    // Le dossier themes/ est expose via app/public/themes (symlink)
    const themePath = this.resolveThemePath(config.theme ?? 'medieval');
    await loadTheme(MEDIEVAL_MANIFEST, themePath);
  }

  /**
   * Resout le chemin de base du theme selon l'environnement.
   * En dev Vite : /themes/medieval
   * En prod (base: '/edge-of-empires/') : /edge-of-empires/themes/medieval
   * import.meta.env est injecte par Vite au build — on y accede via unknown pour eviter
   * les problemes de typage dans le package renderer (pas de vite/client dans ses deps).
   */
  private resolveThemePath(theme: string): string {
    const metaEnv = (import.meta as unknown as { env?: { BASE_URL?: string } }).env;
    const base = metaEnv?.BASE_URL ?? '/';
    // Supprimer le slash final pour eviter les doubles slashes
    const cleanBase = base.replace(/\/$/, '');
    return `${cleanBase}/themes/${theme}`;
  }

  renderWorld(state: WorldState): void {
    if (!this.config) return;
    const { tileWidth, tileHeight } = this.config;

    // Terrain — grille 12x12 pour couvrir l'ecran
    this.terrainLayer?.render(12, tileWidth, tileHeight);

    // Routes
    this.routeLayer?.renderRoutes(state.routes);

    // Villes
    for (const city of state.cities) {
      this.cityLayer?.addCity(city);
    }

    // Centrer la camera sur le milieu de la grille
    const center = gridPositionToIso({ col: 5, row: 5 }, tileWidth, tileHeight);
    this.camera?.centerOn(center.x, center.y);
  }

  updateCityState(cityId: string, state: CityState): void {
    this.cityLayer?.updateCityState(cityId, state);
  }

  triggerCaravan(from: GridPosition, to: GridPosition, type: RouteType): void {
    this.caravanLayer?.spawnCaravan(from, to, type);
  }

  onCityClick(handler: (cityId: string) => void): void {
    this.cityLayer?.onCityClick(handler);
  }

  destroy(): void {
    this.camera?.destroy();
    this.terrainLayer?.destroy();
    this.routeLayer?.destroy();
    this.cityLayer?.destroy();
    this.caravanLayer?.destroy();
    this.uiOverlay?.destroy();
    this.soundManager.destroy();
    if (this.app) {
      // Retirer le canvas du DOM avant destroy pour eviter les erreurs en StrictMode
      this.app.canvas.parentElement?.removeChild(this.app.canvas);
      try { this.app.destroy(true); } catch { /* ignore destroy errors on unmount */ }
    }
    this.app = null;
  }
}

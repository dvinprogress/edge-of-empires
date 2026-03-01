import { Container, Graphics, Text, TextStyle, Rectangle } from 'pixi.js';
import type { CityRenderData, CityState } from '@edge-of-empires/core';
import { gridPositionToIso } from '../iso/iso-math';

const STATE_COLORS: Record<CityState, number> = {
  idle: 0x8b7355,
  building: 0xe6a817,
  success: 0x2ecc71,
  error: 0xe74c3c,
  offline: 0x555555,
};

const LABEL_STYLE = new TextStyle({
  fontFamily: 'serif',
  fontSize: 14,
  fill: 0xf5e6c8,
  dropShadow: {
    color: 0x000000,
    blur: 2,
    distance: 1,
  },
});

export class CityLayer {
  readonly container = new Container();
  private cityContainers = new Map<string, Container>();
  private cityGraphics = new Map<string, Graphics>();
  private cityIcons = new Map<string, string>();
  private clickHandler?: (cityId: string) => void;
  private tileW = 128;
  private tileH = 64;

  constructor() {
    this.container.zIndex = 20;
    this.container.sortableChildren = true;
  }

  setTileSize(tileW: number, tileH: number): void {
    this.tileW = tileW;
    this.tileH = tileH;
  }

  addCity(data: CityRenderData): void {
    const iso = gridPositionToIso(data.position, this.tileW, this.tileH);
    const cityContainer = new Container();
    cityContainer.x = iso.x;
    cityContainer.y = iso.y;
    cityContainer.zIndex = data.position.row * 10 + data.position.col;

    const building = new Graphics();
    const icon = data.plugin.meta.icon;
    this.drawBuildingByType(building, icon, STATE_COLORS[data.state]);
    cityContainer.addChild(building);

    // City name label
    const label = new Text({ text: data.name, style: LABEL_STYLE });
    label.anchor.set(0.5, 1);
    label.y = -85;
    cityContainer.addChild(label);

    // State indicator dot
    const indicator = new Graphics();
    indicator.circle(0, -95, 5).fill({ color: STATE_COLORS[data.state] });
    cityContainer.addChild(indicator);

    // Make clickable — hitArea explicite car les Graphics polygonaux ne detectent pas toujours les clics
    cityContainer.eventMode = 'static';
    cityContainer.cursor = 'pointer';
    cityContainer.hitArea = new Rectangle(-40, -90, 80, 100);
    cityContainer.on('pointerdown', () => {
      this.clickHandler?.(data.id);
    });

    this.container.addChild(cityContainer);
    this.cityContainers.set(data.id, cityContainer);
    this.cityGraphics.set(data.id, building);
    this.cityIcons.set(data.id, icon);
  }

  updateCityState(cityId: string, newState: CityState): void {
    const building = this.cityGraphics.get(cityId);
    if (!building) return;
    const icon = this.cityIcons.get(cityId) ?? 'generic';
    building.clear();
    this.drawBuildingByType(building, icon, STATE_COLORS[newState]);
  }

  getCityIsoPosition(cityId: string): { x: number; y: number } | undefined {
    const container = this.cityContainers.get(cityId);
    if (!container) return undefined;
    return { x: container.x, y: container.y };
  }

  onCityClick(handler: (cityId: string) => void): void {
    this.clickHandler = handler;
  }

  private drawBuildingByType(g: Graphics, icon: string, color: number): void {
    switch (icon) {
      case 'castle': this.drawCastle(g, color); break;
      case 'temple': this.drawTemple(g, color); break;
      case 'forge': this.drawForge(g, color); break;
      case 'market': this.drawMarket(g, color); break;
      case 'wall': this.drawWall(g, color); break;
      default: this.drawGenericBuilding(g, color); break;
    }
  }

  /** Castle — tour carree avec creneaux (local-machine) */
  private drawCastle(g: Graphics, color: number): void {
    const light = Math.min(color + 0x222222, 0xffffff);
    const dark = Math.max(color - 0x222222, 0x000000);

    // Base isometrique large
    g.poly([{ x: 0, y: -20 }, { x: 40, y: 0 }, { x: 0, y: 20 }, { x: -40, y: 0 }]).fill({ color, alpha: 0.9 });

    // Face droite (claire)
    g.poly([{ x: 0, y: -65 }, { x: 40, y: -45 }, { x: 40, y: 0 }, { x: 0, y: -20 }]).fill({ color: light, alpha: 0.9 });

    // Face gauche (sombre)
    g.poly([{ x: 0, y: -65 }, { x: -40, y: -45 }, { x: -40, y: 0 }, { x: 0, y: -20 }]).fill({ color: dark, alpha: 0.9 });

    // Creneaux droite — 3 blocs en haut de la face droite
    for (let i = 0; i < 3; i++) {
      const bx = 10 + i * 12;
      g.poly([{ x: bx, y: -65 }, { x: bx + 8, y: -60 }, { x: bx + 8, y: -72 }, { x: bx, y: -77 }]).fill({ color: light });
    }

    // Creneaux gauche
    for (let i = 0; i < 3; i++) {
      const bx = -10 - i * 12;
      g.poly([{ x: bx, y: -65 }, { x: bx - 8, y: -60 }, { x: bx - 8, y: -72 }, { x: bx, y: -77 }]).fill({ color: dark });
    }

    // Drapeau au sommet
    g.moveTo(0, -65).lineTo(0, -80).stroke({ color: 0x333333, width: 1.5 });
    g.poly([{ x: 0, y: -80 }, { x: 12, y: -75 }, { x: 0, y: -70 }]).fill({ color: 0xcc2222 });
  }

  /** Temple — colonnes + fronton triangulaire (github) */
  private drawTemple(g: Graphics, color: number): void {
    const light = Math.min(color + 0x222222, 0xffffff);
    const dark = Math.max(color - 0x222222, 0x000000);

    // Base isometrique
    g.poly([{ x: 0, y: -10 }, { x: 40, y: 10 }, { x: 0, y: 30 }, { x: -40, y: 10 }]).fill({ color, alpha: 0.9 });

    // Corps droite
    g.poly([{ x: 0, y: -55 }, { x: 40, y: -35 }, { x: 40, y: 10 }, { x: 0, y: -10 }]).fill({ color: light, alpha: 0.88 });

    // Corps gauche
    g.poly([{ x: 0, y: -55 }, { x: -40, y: -35 }, { x: -40, y: 10 }, { x: 0, y: -10 }]).fill({ color: dark, alpha: 0.88 });

    // Fronton triangulaire (toit)
    g.poly([{ x: 0, y: -75 }, { x: 40, y: -55 }, { x: -40, y: -55 }]).fill({ color: light, alpha: 0.95 });

    // 4 colonnes sur la face droite
    for (let i = 0; i < 4; i++) {
      const cx = 8 + i * 8;
      g.rect(cx - 2, -50, 3, 40).fill({ color: 0xf0e0b0 });
      g.circle(cx, -52, 3).fill({ color: 0xf5e6c8 });
    }
  }

  /** Forge — batiment avec cheminee fumante (vercel) */
  private drawForge(g: Graphics, color: number): void {
    const light = Math.min(color + 0x222222, 0xffffff);
    const dark = Math.max(color - 0x222222, 0x000000);

    // Base
    g.poly([{ x: 0, y: -15 }, { x: 38, y: 4 }, { x: 0, y: 23 }, { x: -38, y: 4 }]).fill({ color, alpha: 0.9 });

    // Toit incline droite
    g.poly([{ x: 0, y: -55 }, { x: 38, y: -35 }, { x: 38, y: 4 }, { x: 0, y: -15 }]).fill({ color: light, alpha: 0.88 });

    // Toit incline gauche
    g.poly([{ x: 0, y: -65 }, { x: -38, y: -40 }, { x: -38, y: 4 }, { x: 0, y: -15 }]).fill({ color: dark, alpha: 0.88 });

    // Cheminee
    g.rect(-22, -80, 10, 30).fill({ color: Math.max(color - 0x333333, 0x000000) });
    g.rect(-24, -82, 14, 5).fill({ color: dark });

    // Fumee (3 cercles de taille croissante)
    g.circle(-17, -92, 4).fill({ color: 0xaaaaaa, alpha: 0.6 });
    g.circle(-12, -102, 5).fill({ color: 0xbbbbbb, alpha: 0.45 });
    g.circle(-7, -114, 6).fill({ color: 0xcccccc, alpha: 0.3 });
  }

  /** Market — etals avec auvents en tissu (supabase) */
  private drawMarket(g: Graphics, color: number): void {
    const light = Math.min(color + 0x222222, 0xffffff);
    const dark = Math.max(color - 0x222222, 0x000000);

    // Base large
    g.poly([{ x: 0, y: -10 }, { x: 45, y: 12 }, { x: 0, y: 34 }, { x: -45, y: 12 }]).fill({ color, alpha: 0.9 });

    // Corps droite bas
    g.poly([{ x: 0, y: -45 }, { x: 45, y: -22 }, { x: 45, y: 12 }, { x: 0, y: -10 }]).fill({ color: light, alpha: 0.85 });

    // Corps gauche bas
    g.poly([{ x: 0, y: -45 }, { x: -45, y: -22 }, { x: -45, y: 12 }, { x: 0, y: -10 }]).fill({ color: dark, alpha: 0.85 });

    // Auvent droit (tente triangulaire)
    g.poly([{ x: 0, y: -60 }, { x: 38, y: -38 }, { x: 12, y: -32 }]).fill({ color: 0xdd6633, alpha: 0.9 });
    g.poly([{ x: 0, y: -60 }, { x: 38, y: -38 }, { x: 38, y: -42 }, { x: 0, y: -65 }]).fill({ color: 0xcc4422, alpha: 0.9 });

    // Auvent gauche
    g.poly([{ x: 0, y: -60 }, { x: -38, y: -38 }, { x: -12, y: -32 }]).fill({ color: 0x33aadd, alpha: 0.9 });
    g.poly([{ x: 0, y: -60 }, { x: -38, y: -38 }, { x: -38, y: -42 }, { x: 0, y: -65 }]).fill({ color: 0x2288bb, alpha: 0.9 });

    // Caisses au sol (petits carres)
    g.rect(10, 5, 8, 6).fill({ color: 0x8b6914 });
    g.rect(-20, 8, 8, 6).fill({ color: 0x7a5c10 });
  }

  /** Wall — muraille avec tour ronde (cloudflare) */
  private drawWall(g: Graphics, color: number): void {
    const light = Math.min(color + 0x222222, 0xffffff);
    const dark = Math.max(color - 0x222222, 0x000000);

    // Section de muraille (base longue et basse)
    g.poly([{ x: -45, y: 5 }, { x: 45, y: -15 }, { x: 45, y: 15 }, { x: -45, y: 35 }]).fill({ color, alpha: 0.9 });

    // Face superieure muraille
    g.poly([{ x: -45, y: -20 }, { x: 45, y: -40 }, { x: 45, y: -15 }, { x: -45, y: 5 }]).fill({ color: light, alpha: 0.85 });

    // Creneaux sur la muraille (4 blocs)
    for (let i = 0; i < 4; i++) {
      const cx = -32 + i * 18;
      g.poly([
        { x: cx, y: -22 - i * 0.5 }, { x: cx + 10, y: -26 - i * 0.5 },
        { x: cx + 10, y: -35 - i * 0.5 }, { x: cx, y: -31 - i * 0.5 },
      ]).fill({ color: light });
    }

    // Tour ronde a droite
    g.circle(38, -30, 14).fill({ color: dark, alpha: 0.95 });
    g.circle(38, -30, 14).stroke({ color: Math.max(color - 0x111111, 0), width: 2 });

    // Sommet de la tour
    g.circle(38, -45, 14).fill({ color: light, alpha: 0.9 });

    // Creneaux de la tour
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const tx = 38 + Math.cos(angle) * 10;
      const ty = -55 + Math.sin(angle) * 4;
      g.circle(tx, ty, 3).fill({ color: light });
    }
  }

  /** Generic — fallback si l'icone est inconnu */
  private drawGenericBuilding(g: Graphics, color: number): void {
    const light = Math.min(color + 0x222222, 0xffffff);
    const dark = Math.max(color - 0x222222, 0x000000);

    g.poly([{ x: 0, y: -20 }, { x: 35, y: -2 }, { x: 0, y: 16 }, { x: -35, y: -2 }]).fill({ color, alpha: 0.9 });
    g.poly([{ x: 0, y: -60 }, { x: 35, y: -42 }, { x: 35, y: -2 }, { x: 0, y: -20 }]).fill({ color: light, alpha: 0.85 });
    g.poly([{ x: 0, y: -60 }, { x: -35, y: -42 }, { x: -35, y: -2 }, { x: 0, y: -20 }]).fill({ color: dark, alpha: 0.85 });
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}

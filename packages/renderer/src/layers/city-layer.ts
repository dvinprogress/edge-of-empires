import { Container, Sprite, Graphics, Text, TextStyle, Rectangle, Assets, Texture } from 'pixi.js';
import type { CityRenderData, CityState } from '@edge-of-empires/core';
import { gridPositionToIso } from '../iso/iso-math';

const STATE_COLORS: Record<CityState, number> = {
  idle: 0x8b7355,
  building: 0xe6a817,
  success: 0x2ecc71,
  error: 0xe74c3c,
  offline: 0x555555,
};

// Teinte appliquee au sprite selon l'etat (blanc = aucune teinte)
const STATE_TINTS: Record<CityState, number> = {
  idle: 0xffffff,
  building: 0xffe88a,
  success: 0x90ffb0,
  error: 0xff9090,
  offline: 0x888888,
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

// Correspondance icone → alias texture + largeur d'affichage ciblee (en px)
const ICON_TO_TEXTURE: Record<string, { alias: string; displayWidth: number }> = {
  castle: { alias: 'building-castle', displayWidth: 160 },
  temple: { alias: 'building-temple', displayWidth: 130 },
  forge:  { alias: 'building-forge',  displayWidth: 130 },
  market: { alias: 'building-market', displayWidth: 110 },
  wall:   { alias: 'building-wall',   displayWidth: 120 },
};

const DEFAULT_TEXTURE = { alias: 'building-generic', displayWidth: 100 };

export class CityLayer {
  readonly container = new Container();
  private cityContainers = new Map<string, Container>();
  private citySprites = new Map<string, Sprite>();
  private cityGraphics = new Map<string, Graphics>();
  private cityIcons = new Map<string, string>();
  private cityLabelOffsets = new Map<string, number>();
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

    const icon = data.plugin.meta.icon;
    const texInfo = ICON_TO_TEXTURE[icon] ?? DEFAULT_TEXTURE;

    let usedSprite = false;
    let labelYOffset = -85; // position du label par defaut (mode Graphics)

    try {
      const texture = Assets.get(texInfo.alias) as Texture | undefined;
      if (texture) {
        const sprite = new Sprite(texture);
        // Ancre en bas au centre — le batiment pose sur la tuile
        sprite.anchor.set(0.5, 1.0);
        const scale = texInfo.displayWidth / texture.width;
        sprite.scale.set(scale);
        // Leger decalage vers le bas pour poser le batiment sur la tuile
        sprite.y = 10;
        sprite.tint = STATE_TINTS[data.state];
        cityContainer.addChild(sprite);
        this.citySprites.set(data.id, sprite);
        // Le label se place au-dessus de la hauteur totale du sprite
        labelYOffset = -(sprite.height - 10) - 8;
        usedSprite = true;
      }
    } catch {
      // Texture non disponible — fallback Graphics
    }

    if (!usedSprite) {
      const building = new Graphics();
      this.drawBuildingFallback(building, icon, STATE_COLORS[data.state]);
      cityContainer.addChild(building);
      this.cityGraphics.set(data.id, building);
    }

    // Label du nom de la ville
    const label = new Text({ text: data.name, style: LABEL_STYLE });
    label.anchor.set(0.5, 1);
    label.y = labelYOffset;
    cityContainer.addChild(label);
    this.cityLabelOffsets.set(data.id, labelYOffset);

    // Indicateur d'etat (petit point colore)
    const indicator = new Graphics();
    indicator.circle(0, labelYOffset - 12, 5).fill({ color: STATE_COLORS[data.state] });
    cityContainer.addChild(indicator);

    // Zone de clic explicite couvrant le batiment
    cityContainer.eventMode = 'static';
    cityContainer.cursor = 'pointer';
    const hitW = usedSprite ? texInfo.displayWidth + 20 : 80;
    const hitH = usedSprite ? Math.abs(labelYOffset) + 30 : 100;
    cityContainer.hitArea = new Rectangle(-hitW / 2, -hitH, hitW, hitH + 20);
    cityContainer.on('pointerdown', () => {
      this.clickHandler?.(data.id);
    });

    this.container.addChild(cityContainer);
    this.cityContainers.set(data.id, cityContainer);
    this.cityIcons.set(data.id, icon);
  }

  updateCityState(cityId: string, newState: CityState): void {
    // Mise a jour du sprite si disponible
    const sprite = this.citySprites.get(cityId);
    if (sprite) {
      sprite.tint = STATE_TINTS[newState];
    }

    // Mise a jour du Graphics fallback si utilise
    const building = this.cityGraphics.get(cityId);
    const icon = this.cityIcons.get(cityId) ?? 'generic';
    if (building) {
      building.clear();
      this.drawBuildingFallback(building, icon, STATE_COLORS[newState]);
    }

    // Mise a jour du point indicateur
    const cityContainer = this.cityContainers.get(cityId);
    if (cityContainer) {
      const lastChild = cityContainer.children[cityContainer.children.length - 1];
      if (lastChild instanceof Graphics) {
        lastChild.clear();
        const labelY = this.cityLabelOffsets.get(cityId) ?? -85;
        lastChild.circle(0, labelY - 12, 5).fill({ color: STATE_COLORS[newState] });
      }
    }
  }

  getCityIsoPosition(cityId: string): { x: number; y: number } | undefined {
    const container = this.cityContainers.get(cityId);
    if (!container) return undefined;
    return { x: container.x, y: container.y };
  }

  onCityClick(handler: (cityId: string) => void): void {
    this.clickHandler = handler;
  }

  /** Batiment generique en Graphics — fallback quand la texture est absente */
  private drawBuildingFallback(g: Graphics, icon: string, color: number): void {
    switch (icon) {
      case 'castle': this.drawCastle(g, color); break;
      case 'temple': this.drawTemple(g, color); break;
      case 'forge':  this.drawForge(g, color);  break;
      case 'market': this.drawMarket(g, color); break;
      case 'wall':   this.drawWall(g, color);   break;
      default:       this.drawGenericBuilding(g, color); break;
    }
  }

  private drawCastle(g: Graphics, color: number): void {
    const light = Math.min(color + 0x222222, 0xffffff);
    const dark = Math.max(color - 0x222222, 0x000000);
    g.poly([{ x: 0, y: -20 }, { x: 40, y: 0 }, { x: 0, y: 20 }, { x: -40, y: 0 }]).fill({ color, alpha: 0.9 });
    g.poly([{ x: 0, y: -65 }, { x: 40, y: -45 }, { x: 40, y: 0 }, { x: 0, y: -20 }]).fill({ color: light, alpha: 0.9 });
    g.poly([{ x: 0, y: -65 }, { x: -40, y: -45 }, { x: -40, y: 0 }, { x: 0, y: -20 }]).fill({ color: dark, alpha: 0.9 });
    for (let i = 0; i < 3; i++) {
      const bx = 10 + i * 12;
      g.poly([{ x: bx, y: -65 }, { x: bx + 8, y: -60 }, { x: bx + 8, y: -72 }, { x: bx, y: -77 }]).fill({ color: light });
    }
    for (let i = 0; i < 3; i++) {
      const bx = -10 - i * 12;
      g.poly([{ x: bx, y: -65 }, { x: bx - 8, y: -60 }, { x: bx - 8, y: -72 }, { x: bx, y: -77 }]).fill({ color: dark });
    }
    g.moveTo(0, -65).lineTo(0, -80).stroke({ color: 0x333333, width: 1.5 });
    g.poly([{ x: 0, y: -80 }, { x: 12, y: -75 }, { x: 0, y: -70 }]).fill({ color: 0xcc2222 });
  }

  private drawTemple(g: Graphics, color: number): void {
    const light = Math.min(color + 0x222222, 0xffffff);
    const dark = Math.max(color - 0x222222, 0x000000);
    g.poly([{ x: 0, y: -10 }, { x: 40, y: 10 }, { x: 0, y: 30 }, { x: -40, y: 10 }]).fill({ color, alpha: 0.9 });
    g.poly([{ x: 0, y: -55 }, { x: 40, y: -35 }, { x: 40, y: 10 }, { x: 0, y: -10 }]).fill({ color: light, alpha: 0.88 });
    g.poly([{ x: 0, y: -55 }, { x: -40, y: -35 }, { x: -40, y: 10 }, { x: 0, y: -10 }]).fill({ color: dark, alpha: 0.88 });
    g.poly([{ x: 0, y: -75 }, { x: 40, y: -55 }, { x: -40, y: -55 }]).fill({ color: light, alpha: 0.95 });
    for (let i = 0; i < 4; i++) {
      const cx = 8 + i * 8;
      g.rect(cx - 2, -50, 3, 40).fill({ color: 0xf0e0b0 });
      g.circle(cx, -52, 3).fill({ color: 0xf5e6c8 });
    }
  }

  private drawForge(g: Graphics, color: number): void {
    const light = Math.min(color + 0x222222, 0xffffff);
    const dark = Math.max(color - 0x222222, 0x000000);
    g.poly([{ x: 0, y: -15 }, { x: 38, y: 4 }, { x: 0, y: 23 }, { x: -38, y: 4 }]).fill({ color, alpha: 0.9 });
    g.poly([{ x: 0, y: -55 }, { x: 38, y: -35 }, { x: 38, y: 4 }, { x: 0, y: -15 }]).fill({ color: light, alpha: 0.88 });
    g.poly([{ x: 0, y: -65 }, { x: -38, y: -40 }, { x: -38, y: 4 }, { x: 0, y: -15 }]).fill({ color: dark, alpha: 0.88 });
    g.rect(-22, -80, 10, 30).fill({ color: Math.max(color - 0x333333, 0x000000) });
    g.rect(-24, -82, 14, 5).fill({ color: dark });
    g.circle(-17, -92, 4).fill({ color: 0xaaaaaa, alpha: 0.6 });
    g.circle(-12, -102, 5).fill({ color: 0xbbbbbb, alpha: 0.45 });
    g.circle(-7, -114, 6).fill({ color: 0xcccccc, alpha: 0.3 });
  }

  private drawMarket(g: Graphics, color: number): void {
    const light = Math.min(color + 0x222222, 0xffffff);
    const dark = Math.max(color - 0x222222, 0x000000);
    g.poly([{ x: 0, y: -10 }, { x: 45, y: 12 }, { x: 0, y: 34 }, { x: -45, y: 12 }]).fill({ color, alpha: 0.9 });
    g.poly([{ x: 0, y: -45 }, { x: 45, y: -22 }, { x: 45, y: 12 }, { x: 0, y: -10 }]).fill({ color: light, alpha: 0.85 });
    g.poly([{ x: 0, y: -45 }, { x: -45, y: -22 }, { x: -45, y: 12 }, { x: 0, y: -10 }]).fill({ color: dark, alpha: 0.85 });
    g.poly([{ x: 0, y: -60 }, { x: 38, y: -38 }, { x: 12, y: -32 }]).fill({ color: 0xdd6633, alpha: 0.9 });
    g.poly([{ x: 0, y: -60 }, { x: 38, y: -38 }, { x: 38, y: -42 }, { x: 0, y: -65 }]).fill({ color: 0xcc4422, alpha: 0.9 });
    g.poly([{ x: 0, y: -60 }, { x: -38, y: -38 }, { x: -12, y: -32 }]).fill({ color: 0x33aadd, alpha: 0.9 });
    g.poly([{ x: 0, y: -60 }, { x: -38, y: -38 }, { x: -38, y: -42 }, { x: 0, y: -65 }]).fill({ color: 0x2288bb, alpha: 0.9 });
    g.rect(10, 5, 8, 6).fill({ color: 0x8b6914 });
    g.rect(-20, 8, 8, 6).fill({ color: 0x7a5c10 });
  }

  private drawWall(g: Graphics, color: number): void {
    const light = Math.min(color + 0x222222, 0xffffff);
    const dark = Math.max(color - 0x222222, 0x000000);
    g.poly([{ x: -45, y: 5 }, { x: 45, y: -15 }, { x: 45, y: 15 }, { x: -45, y: 35 }]).fill({ color, alpha: 0.9 });
    g.poly([{ x: -45, y: -20 }, { x: 45, y: -40 }, { x: 45, y: -15 }, { x: -45, y: 5 }]).fill({ color: light, alpha: 0.85 });
    for (let i = 0; i < 4; i++) {
      const cx = -32 + i * 18;
      g.poly([
        { x: cx, y: -22 - i * 0.5 }, { x: cx + 10, y: -26 - i * 0.5 },
        { x: cx + 10, y: -35 - i * 0.5 }, { x: cx, y: -31 - i * 0.5 },
      ]).fill({ color: light });
    }
    g.circle(38, -30, 14).fill({ color: dark, alpha: 0.95 });
    g.circle(38, -30, 14).stroke({ color: Math.max(color - 0x111111, 0), width: 2 });
    g.circle(38, -45, 14).fill({ color: light, alpha: 0.9 });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const tx = 38 + Math.cos(angle) * 10;
      const ty = -55 + Math.sin(angle) * 4;
      g.circle(tx, ty, 3).fill({ color: light });
    }
  }

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

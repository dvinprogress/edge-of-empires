import { Container, Graphics, Text, TextStyle } from 'pixi.js';
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

    // Placeholder building shape
    const building = new Graphics();
    this.drawBuilding(building, STATE_COLORS[data.state]);
    cityContainer.addChild(building);

    // City name label
    const label = new Text({ text: data.name, style: LABEL_STYLE });
    label.anchor.set(0.5, 1);
    label.y = -50;
    cityContainer.addChild(label);

    // State indicator dot
    const indicator = new Graphics();
    indicator.circle(0, -60, 5).fill({ color: STATE_COLORS[data.state] });
    cityContainer.addChild(indicator);

    // Make clickable
    cityContainer.eventMode = 'static';
    cityContainer.cursor = 'pointer';
    cityContainer.on('pointerdown', () => {
      this.clickHandler?.(data.id);
    });

    this.container.addChild(cityContainer);
    this.cityContainers.set(data.id, cityContainer);
    this.cityGraphics.set(data.id, building);
  }

  updateCityState(cityId: string, newState: CityState): void {
    const building = this.cityGraphics.get(cityId);
    if (!building) return;
    building.clear();
    this.drawBuilding(building, STATE_COLORS[newState]);
  }

  getCityIsoPosition(cityId: string): { x: number; y: number } | undefined {
    const container = this.cityContainers.get(cityId);
    if (!container) return undefined;
    return { x: container.x, y: container.y };
  }

  onCityClick(handler: (cityId: string) => void): void {
    this.clickHandler = handler;
  }

  private drawBuilding(g: Graphics, color: number): void {
    // Base isometrique
    g.poly([
      { x: 0, y: -20 },
      { x: 30, y: -5 },
      { x: 0, y: 10 },
      { x: -30, y: -5 },
    ]).fill({ color, alpha: 0.9 });

    // Toit / elevation — face droite plus claire
    g.poly([
      { x: 0, y: -45 },
      { x: 30, y: -30 },
      { x: 30, y: -5 },
      { x: 0, y: -20 },
    ]).fill({ color: Math.min(color + 0x111111, 0xffffff), alpha: 0.85 });

    // Face gauche plus sombre
    g.poly([
      { x: 0, y: -45 },
      { x: -30, y: -30 },
      { x: -30, y: -5 },
      { x: 0, y: -20 },
    ]).fill({ color: Math.max(color - 0x111111, 0x000000), alpha: 0.85 });
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}

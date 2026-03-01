import { Container, Graphics, Ticker } from 'pixi.js';
import type { RouteType, GridPosition } from '@edge-of-empires/core';
import { gridPositionToIso } from '../iso/iso-math';

const CARAVAN_COLORS: Record<RouteType, number> = {
  code: 0x3498db,
  data: 0x2ecc71,
  deployment: 0xe67e22,
  security: 0xf1c40f,
  error: 0xe74c3c,
  cache: 0xecf0f1,
};

interface ActiveCaravan {
  graphic: Graphics;
  t: number;
  speed: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  cpX: number;
  cpY: number;
  onComplete?: () => void;
}

export class CaravanLayer {
  readonly container = new Container();
  private caravans: ActiveCaravan[] = [];
  private tileW = 128;
  private tileH = 64;
  private tickerFn: ((time: { deltaTime: number }) => void) | null = null;

  constructor(private readonly ticker: Ticker) {
    this.container.zIndex = 30;
    this.tickerFn = (time) => this.update(time.deltaTime);
    this.ticker.add(this.tickerFn);
  }

  setTileSize(tileW: number, tileH: number): void {
    this.tileW = tileW;
    this.tileH = tileH;
  }

  spawnCaravan(
    from: GridPosition,
    to: GridPosition,
    type: RouteType,
    onComplete?: () => void
  ): void {
    const fromIso = gridPositionToIso(from, this.tileW, this.tileH);
    const toIso = gridPositionToIso(to, this.tileW, this.tileH);

    const g = new Graphics();
    g.circle(0, 0, 6).fill({ color: CARAVAN_COLORS[type] });
    g.circle(0, 0, 3).fill({ color: 0xffffff, alpha: 0.8 });

    this.container.addChild(g);

    this.caravans.push({
      graphic: g,
      t: 0,
      speed: 0.008, // ~2 secondes pour le trajet complet a 60fps
      fromX: fromIso.x,
      fromY: fromIso.y,
      toX: toIso.x,
      toY: toIso.y,
      cpX: (fromIso.x + toIso.x) / 2,
      cpY: (fromIso.y + toIso.y) / 2 - 30,
      onComplete,
    });
  }

  clearAll(): void {
    for (const c of this.caravans) {
      c.graphic.destroy();
    }
    this.caravans = [];
  }

  private update(deltaTime: number): void {
    const completed: number[] = [];

    for (let i = 0; i < this.caravans.length; i++) {
      const c = this.caravans[i];
      if (!c) continue;
      c.t += c.speed * deltaTime;

      if (c.t >= 1) {
        completed.push(i);
        c.onComplete?.();
        continue;
      }

      // Quadratic bezier interpolation
      const t = c.t;
      const mt = 1 - t;
      c.graphic.x = mt * mt * c.fromX + 2 * mt * t * c.cpX + t * t * c.toX;
      c.graphic.y = mt * mt * c.fromY + 2 * mt * t * c.cpY + t * t * c.toY;
    }

    // Supprimer les caravanes terminees (ordre inverse pour preserver les indices)
    for (let i = completed.length - 1; i >= 0; i--) {
      const idx = completed[i];
      if (idx === undefined) continue;
      const c = this.caravans[idx];
      if (c) c.graphic.destroy();
      this.caravans.splice(idx, 1);
    }
  }

  destroy(): void {
    if (this.tickerFn) this.ticker.remove(this.tickerFn);
    this.clearAll();
    this.container.destroy({ children: true });
  }
}

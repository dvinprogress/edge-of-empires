import { Container, Graphics } from 'pixi.js';
import type { RouteRenderData, RouteType } from '@edge-of-empires/core';
import { gridPositionToIso } from '../iso/iso-math';

const ROUTE_COLORS: Record<RouteType, number> = {
  code: 0x3498db,
  data: 0x2ecc71,
  deployment: 0xe67e22,
  security: 0xf1c40f,
  error: 0xe74c3c,
  cache: 0xecf0f1,
};

export class RouteLayer {
  readonly container = new Container();
  private tileW = 128;
  private tileH = 64;

  constructor() {
    this.container.zIndex = 10;
  }

  setTileSize(tileW: number, tileH: number): void {
    this.tileW = tileW;
    this.tileH = tileH;
  }

  renderRoutes(routes: RouteRenderData[]): void {
    this.container.removeChildren();

    for (const route of routes) {
      const from = gridPositionToIso(route.from, this.tileW, this.tileH);
      const to = gridPositionToIso(route.to, this.tileW, this.tileH);
      const color = ROUTE_COLORS[route.type];

      const g = new Graphics();

      // Quadratic bezier — control point au milieu, decale vers le haut
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2 - 30;

      g.moveTo(from.x, from.y)
        .quadraticCurveTo(midX, midY, to.x, to.y)
        .stroke({ width: 2, color, alpha: 0.5 });

      // Petits cercles aux extremites
      g.circle(from.x, from.y, 3).fill({ color, alpha: 0.7 });
      g.circle(to.x, to.y, 3).fill({ color, alpha: 0.7 });

      this.container.addChild(g);
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}

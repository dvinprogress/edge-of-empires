import { Container, Graphics } from 'pixi.js';
import { gridToIso } from '../iso/iso-math';

export class TerrainLayer {
  readonly container = new Container();

  constructor() {
    this.container.zIndex = 0;
  }

  render(gridSize: number, tileW: number, tileH: number): void {
    this.container.removeChildren();

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const iso = gridToIso(col, row, tileW, tileH);
        const tile = new Graphics();

        // Couleur alternee pour un effet damier subtil
        const color = (col + row) % 2 === 0 ? 0x2d5a27 : 0x306b2a;

        tile
          .poly([
            { x: 0, y: -tileH / 2 },
            { x: tileW / 2, y: 0 },
            { x: 0, y: tileH / 2 },
            { x: -tileW / 2, y: 0 },
          ])
          .fill({ color, alpha: 0.6 });

        tile.x = iso.x;
        tile.y = iso.y;
        this.container.addChild(tile);
      }
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}

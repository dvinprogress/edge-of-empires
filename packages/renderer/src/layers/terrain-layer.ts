import { Container, Sprite, Graphics, Texture, Rectangle, Assets } from 'pixi.js';
import { gridToIso } from '../iso/iso-math';

export class TerrainLayer {
  readonly container = new Container();
  private grassTextures: Texture[] = [];

  constructor() {
    this.container.zIndex = 0;
  }

  /**
   * Extrait les textures de tuiles depuis le tileset.
   * Le tileset est 640x1024, chaque tuile fait 64x64.
   * La premiere ligne contient 10 variantes de gazon.
   */
  private extractGrassTextures(): void {
    if (this.grassTextures.length > 0) return;
    try {
      const tileset = Assets.get('terrain-tileset') as Texture | undefined;
      if (!tileset) return;
      for (let i = 0; i < 10; i++) {
        const frame = new Rectangle(i * 64, 0, 64, 64);
        this.grassTextures.push(new Texture({ source: tileset.source, frame }));
      }
    } catch {
      // Tileset non charge — le rendu Graphics prendra le relai
    }
  }

  render(gridSize: number, tileW: number, tileH: number): void {
    this.container.removeChildren();
    this.extractGrassTextures();

    const hasSprites = this.grassTextures.length > 0;

    // Couche de fond : losanges colores pour combler les espaces entre sprites
    if (hasSprites) {
      const bg = new Graphics();
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const iso = gridToIso(col, row, tileW, tileH);
          const color = (col + row) % 2 === 0 ? 0x4a7a3a : 0x3d6a2f;
          bg.poly([
            { x: iso.x, y: iso.y - tileH / 2 },
            { x: iso.x + tileW / 2, y: iso.y },
            { x: iso.x, y: iso.y + tileH / 2 },
            { x: iso.x - tileW / 2, y: iso.y },
          ]).fill({ color });
        }
      }
      this.container.addChild(bg);
    }

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const iso = gridToIso(col, row, tileW, tileH);

        if (hasSprites) {
          // Alterner les variantes de gazon pour briser la repetition
          const texIdx = (col + row * 3) % this.grassTextures.length;
          const sprite = new Sprite(this.grassTextures[texIdx]!);
          sprite.anchor.set(0.5, 0.5);
          sprite.width = tileW;
          sprite.height = tileH;
          sprite.x = iso.x;
          sprite.y = iso.y;
          this.container.addChild(sprite);
        } else {
          // Fallback Graphics si le tileset n'est pas charge
          const tile = new Graphics();
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
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}

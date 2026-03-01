import { Container } from 'pixi.js';

export class UIOverlayLayer {
  readonly container = new Container();

  constructor() {
    this.container.zIndex = 40;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}

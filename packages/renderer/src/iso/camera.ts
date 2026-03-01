import { Container } from 'pixi.js';

export class Camera {
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;
  private scale = 1;
  private readonly minScale = 0.3;
  private readonly maxScale = 3;

  constructor(
    private readonly stage: Container,
    private readonly canvas: HTMLCanvasElement
  ) {}

  enable(): void {
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointerleave', this.onPointerUp);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
  }

  centerOn(x: number, y: number): void {
    this.stage.x = this.canvas.width / 2 - x * this.scale;
    this.stage.y = this.canvas.height / 2 - y * this.scale;
  }

  destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointerleave', this.onPointerUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
  }

  private onPointerDown = (e: PointerEvent): void => {
    this.isDragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isDragging) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.stage.x += dx;
    this.stage.y += dy;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  };

  private onPointerUp = (): void => {
    this.isDragging = false;
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(this.maxScale, Math.max(this.minScale, this.scale * factor));
    this.stage.scale.set(newScale);
    this.scale = newScale;
  };
}

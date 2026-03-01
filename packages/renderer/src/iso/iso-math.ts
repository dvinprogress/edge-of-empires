import type { GridPosition, IsoPoint } from '@edge-of-empires/core';

export function gridToIso(col: number, row: number, tileW: number, tileH: number): IsoPoint {
  return {
    x: (col - row) * (tileW / 2),
    y: (col + row) * (tileH / 2),
  };
}

export function gridPositionToIso(pos: GridPosition, tileW: number, tileH: number): IsoPoint {
  return gridToIso(pos.col, pos.row, tileW, tileH);
}

export function isoToGrid(screenX: number, screenY: number, tileW: number, tileH: number): GridPosition {
  const col = Math.round((screenX / (tileW / 2) + screenY / (tileH / 2)) / 2);
  const row = Math.round((screenY / (tileH / 2) - screenX / (tileW / 2)) / 2);
  return { col, row };
}

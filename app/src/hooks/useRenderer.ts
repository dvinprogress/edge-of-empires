import { useRef, useEffect, useCallback } from 'react';
import { WorldRenderer } from '@edge-of-empires/renderer';
import type { WorldState, CityState, RouteType, GridPosition } from '@edge-of-empires/core';

interface UseRendererOptions {
  containerId: string;
  worldState: WorldState | null;
  onCityClick: (cityId: string) => void;
}

export function useRenderer({ containerId, worldState, onCityClick }: UseRendererOptions) {
  const rendererRef = useRef<WorldRenderer | null>(null);
  const initializedRef = useRef(false);
  const onCityClickRef = useRef(onCityClick);
  onCityClickRef.current = onCityClick;

  // Initialiser le renderer UNE seule fois quand worldState est pret
  useEffect(() => {
    if (!worldState || initializedRef.current) return;
    initializedRef.current = true;

    const renderer = new WorldRenderer();
    rendererRef.current = renderer;

    renderer
      .init({
        containerId,
        tileWidth: 128,
        tileHeight: 64,
        theme: 'medieval',
      })
      .then(() => {
        renderer.renderWorld(worldState);
        renderer.onCityClick((cityId) => onCityClickRef.current(cityId));
      });

    return () => {
      renderer.destroy();
      rendererRef.current = null;
      initializedRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- init une seule fois
  }, [containerId, worldState !== null]);

  const updateCityVisual = useCallback((cityId: string, state: CityState) => {
    rendererRef.current?.updateCityState(cityId, state);
  }, []);

  const triggerCaravan = useCallback(
    (from: GridPosition, to: GridPosition, type: RouteType) => {
      rendererRef.current?.triggerCaravan(from, to, type);
    },
    [],
  );

  return { updateCityVisual, triggerCaravan };
}

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  createEventBus,
  createPluginRegistry,
  parseWorld,
  runSimulation,
  fullDeploymentScenario,
  type WorldState,
  type WorldEvent,
  type CityState,
  type EventBus,
  type PluginRegistry,
} from '@edge-of-empires/core';
import { localMachinePlugin } from '@edge-of-empires/plugin-local-machine';
import { githubPlugin } from '@edge-of-empires/plugin-github';
import { vercelPlugin } from '@edge-of-empires/plugin-vercel';
import { supabasePlugin } from '@edge-of-empires/plugin-supabase';
import { cloudflarePlugin } from '@edge-of-empires/plugin-cloudflare';
import { demoConfig } from '../data/demo-config';

const ALL_PLUGINS = [
  localMachinePlugin,
  githubPlugin,
  vercelPlugin,
  supabasePlugin,
  cloudflarePlugin,
];

export function useWorldEngine() {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const eventBusRef = useRef<EventBus | null>(null);
  const registryRef = useRef<PluginRegistry | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const registry = createPluginRegistry();
    for (const plugin of ALL_PLUGINS) {
      registry.register(plugin);
    }
    registryRef.current = registry;

    const eventBus = createEventBus();
    eventBusRef.current = eventBus;

    const state = parseWorld(demoConfig, registry);
    setWorldState(state);

    // Ecouter tous les events pour le panneau
    const unsub = eventBus.onAny((event) => {
      setEvents((prev) => [event, ...prev].slice(0, 50)); // Garder les 50 derniers
    });

    return () => {
      unsub();
      eventBus.clear();
      cancelRef.current?.();
    };
  }, []);

  const updateCityState = useCallback((cityId: string, newState: CityState) => {
    setWorldState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cities: prev.cities.map((city) =>
          city.id === cityId
            ? { ...city, state: newState, spriteAlias: city.plugin.appearance[newState] }
            : city,
        ),
      };
    });
  }, []);

  const simulate = useCallback(() => {
    if (!eventBusRef.current || isSimulating) return;
    setIsSimulating(true);

    // Reset tous les etats a idle
    setWorldState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cities: prev.cities.map((city) => ({
          ...city,
          state: 'idle' as CityState,
          spriteAlias: city.plugin.appearance.idle,
        })),
      };
    });
    setEvents([]);

    const handle = runSimulation(
      fullDeploymentScenario,
      eventBusRef.current,
      updateCityState,
    );
    cancelRef.current = handle.cancel;

    // Fin de simulation apres le dernier step
    const totalDuration = fullDeploymentScenario.steps.reduce(
      (acc, s) => acc + s.delay,
      0,
    );
    setTimeout(() => {
      setIsSimulating(false);
      cancelRef.current = null;
    }, totalDuration + 500);
  }, [isSimulating, updateCityState]);

  const selectCity = useCallback((cityId: string | null) => {
    setSelectedCity(cityId);
  }, []);

  return {
    worldState,
    events,
    isSimulating,
    selectedCity,
    simulate,
    selectCity,
    updateCityState,
  };
}

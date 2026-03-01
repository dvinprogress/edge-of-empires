import { useCallback, useEffect } from 'react';
import { useWorldEngine } from './hooks/useWorldEngine';
import { useRenderer } from './hooks/useRenderer';
import { GameCanvas } from './components/GameCanvas';
import { EventPanel } from './components/EventPanel';
import { CityTooltip } from './components/CityTooltip';
import { SimulationButton } from './components/SimulationButton';
import { Header } from './components/Header';

export function App() {
  const {
    worldState,
    events,
    isSimulating,
    selectedCity,
    simulate,
    selectCity,
    updateCityState,
  } = useWorldEngine();

  const onCityClick = useCallback(
    (cityId: string) => {
      selectCity(cityId);
    },
    [selectCity],
  );

  const { updateCityVisual, triggerCaravan } = useRenderer({
    containerId: 'game-canvas',
    worldState,
    onCityClick,
  });

  // Synchroniser les changements d'etat visuels
  useEffect(() => {
    if (!worldState) return;
    for (const city of worldState.cities) {
      updateCityVisual(city.id, city.state);
    }
  }, [worldState, updateCityVisual]);

  // Declencher des caravanes sur les events avec routes
  useEffect(() => {
    if (events.length === 0 || !worldState) return;
    const latest = events[0];
    if (!latest || !latest.targetCity || !latest.routeType) return;

    const sourceCity = worldState.cities.find((c) => c.id === latest.sourceCity);
    const targetCity = worldState.cities.find((c) => c.id === latest.targetCity);
    if (sourceCity && targetCity) {
      triggerCaravan(sourceCity.position, targetCity.position, latest.routeType);
    }
  }, [events, worldState, triggerCaravan]);

  const selectedCityData = worldState?.cities.find((c) => c.id === selectedCity) ?? null;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-stone-900">
      <div className="flex-1 relative">
        <Header
          worldName={worldState?.meta.name ?? 'Chargement...'}
          onSoundToggle={() => {}}
        />
        <GameCanvas />
        <CityTooltip city={selectedCityData} onClose={() => selectCity(null)} />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <SimulationButton onSimulate={simulate} isSimulating={isSimulating} />
        </div>
      </div>
      <EventPanel events={events} />
    </div>
  );
}

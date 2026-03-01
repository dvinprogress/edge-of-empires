import type { EventBus, WorldEvent, CityState, SimulationScenario } from '../types';

let nextEventId = 1;

function generateEventId(): string {
  return `evt-${nextEventId++}`;
}

export interface SimulationHandle {
  cancel: () => void;
}

export function runSimulation(
  scenario: SimulationScenario,
  eventBus: EventBus,
  onStateChange: (cityId: string, state: CityState) => void
): SimulationHandle {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;

  let cumulativeDelay = 0;

  for (const step of scenario.steps) {
    cumulativeDelay += step.delay;

    const timeout = setTimeout(() => {
      if (cancelled) return;

      const event: WorldEvent = {
        ...step.event,
        id: generateEventId(),
        timestamp: Date.now(),
      };

      eventBus.emit(event);

      if (step.cityStateChange) {
        onStateChange(step.cityStateChange.cityId, step.cityStateChange.newState);
      }
    }, cumulativeDelay);

    timeouts.push(timeout);
  }

  return {
    cancel() {
      cancelled = true;
      for (const t of timeouts) clearTimeout(t);
    },
  };
}

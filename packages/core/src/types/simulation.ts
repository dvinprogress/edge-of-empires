import type { WorldEvent } from './events';
import type { CityState } from './plugin';

/** Etape de simulation */
export interface SimulationStep {
  delay: number;
  event: Omit<WorldEvent, 'id' | 'timestamp'>;
  cityStateChange?: { cityId: string; newState: CityState };
}

/** Scenario de simulation */
export interface SimulationScenario {
  name: string;
  description: string;
  steps: SimulationStep[];
}

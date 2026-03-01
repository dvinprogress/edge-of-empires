import type { RouteType } from './world';

/** Evenement emis dans le monde */
export interface WorldEvent {
  id: string;
  timestamp: number;
  sourceCity: string;
  targetCity?: string;
  type: string;
  routeType?: RouteType;
  humanMessage: string;
  data?: Record<string, unknown>;
}

/** Handler d'evenement */
export type EventHandler = (event: WorldEvent) => void;

/** Interface du bus d'evenements */
export interface EventBus {
  emit(event: WorldEvent): void;
  on(eventType: string, handler: EventHandler): () => void;
  onAny(handler: EventHandler): () => void;
  clear(): void;
}

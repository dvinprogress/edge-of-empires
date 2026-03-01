import type { EventBus, EventHandler, WorldEvent } from '../types';

export function createEventBus(): EventBus {
  const handlers = new Map<string, Set<EventHandler>>();
  const anyHandlers = new Set<EventHandler>();

  return {
    emit(event: WorldEvent) {
      // Notifier les handlers specifiques au type
      const typeHandlers = handlers.get(event.type);
      if (typeHandlers) {
        for (const handler of typeHandlers) handler(event);
      }
      // Notifier les handlers "any"
      for (const handler of anyHandlers) handler(event);
    },

    on(eventType: string, handler: EventHandler): () => void {
      if (!handlers.has(eventType)) handlers.set(eventType, new Set());
      handlers.get(eventType)!.add(handler);
      return () => { handlers.get(eventType)?.delete(handler); };
    },

    onAny(handler: EventHandler): () => void {
      anyHandlers.add(handler);
      return () => { anyHandlers.delete(handler); };
    },

    clear() {
      handlers.clear();
      anyHandlers.clear();
    },
  };
}

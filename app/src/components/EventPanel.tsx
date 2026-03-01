import type { WorldEvent } from '@edge-of-empires/core';

interface EventPanelProps {
  events: WorldEvent[];
}

function formatTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 5) return "a l'instant";
  if (seconds < 60) return `il y a ${seconds}s`;
  return `il y a ${Math.round(seconds / 60)}min`;
}

export function EventPanel({ events }: EventPanelProps) {
  return (
    <div className="w-80 bg-stone-900/90 backdrop-blur border-l border-stone-700 flex flex-col">
      <div className="p-4 border-b border-stone-700">
        <h2 className="text-lg font-bold text-amber-400">Evenements</h2>
        <p className="text-xs text-stone-500">Ce qui se passe dans votre monde</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {events.length === 0 ? (
          <p className="text-stone-500 text-sm text-center mt-8">
            Lancez une simulation pour voir les evenements
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="p-3 bg-stone-800/80 rounded-lg border border-stone-700 animate-slide-in"
            >
              <p className="text-sm text-stone-200">{event.humanMessage}</p>
              <p className="text-xs text-stone-500 mt-1">{formatTime(event.timestamp)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

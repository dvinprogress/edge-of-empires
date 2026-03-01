import type { CityRenderData, CityState } from '@edge-of-empires/core';

interface CityTooltipProps {
  city: CityRenderData | null;
  onClose: () => void;
}

const STATE_LABELS: Record<CityState, string> = {
  idle: 'Au repos',
  building: 'En construction',
  success: 'Operationnelle',
  error: 'En erreur',
  offline: 'Hors ligne',
};

const STATE_COLORS: Record<CityState, string> = {
  idle: 'text-stone-400',
  building: 'text-amber-400',
  success: 'text-emerald-400',
  error: 'text-red-400',
  offline: 'text-stone-600',
};

const STATE_DOT_COLORS: Record<CityState, string> = {
  idle: 'bg-stone-400',
  building: 'bg-amber-400',
  success: 'bg-emerald-400',
  error: 'bg-red-400',
  offline: 'bg-stone-600',
};

export function CityTooltip({ city, onClose }: CityTooltipProps) {
  if (!city) return null;

  return (
    <div className="absolute bottom-4 left-4 w-72 bg-stone-900/95 backdrop-blur border border-stone-600 rounded-xl p-4 shadow-2xl">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-stone-500 hover:text-stone-300 text-lg leading-none"
        aria-label="Fermer"
      >
        x
      </button>
      <h3 className="text-lg font-bold text-amber-400">{city.name}</h3>
      <p className="text-sm text-stone-400 mt-1">{city.plugin.meta.description}</p>
      <div className="mt-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${STATE_DOT_COLORS[city.state]}`} />
        <span className={`text-sm ${STATE_COLORS[city.state]}`}>
          {STATE_LABELS[city.state]}
        </span>
      </div>
    </div>
  );
}

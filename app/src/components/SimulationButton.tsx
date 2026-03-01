interface SimulationButtonProps {
  onSimulate: () => void;
  isSimulating: boolean;
}

export function SimulationButton({ onSimulate, isSimulating }: SimulationButtonProps) {
  return (
    <button
      onClick={onSimulate}
      disabled={isSimulating}
      className={`
        px-6 py-3 rounded-lg font-bold text-sm transition-all
        ${
          isSimulating
            ? 'bg-stone-700 text-stone-500 cursor-not-allowed'
            : 'bg-amber-600 hover:bg-amber-500 text-stone-900 shadow-lg hover:shadow-amber-600/20'
        }
      `}
    >
      {isSimulating ? 'Simulation en cours...' : 'Simuler un deploiement complet'}
    </button>
  );
}

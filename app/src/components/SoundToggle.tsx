"use client";

import { useState } from 'react';

interface SoundToggleProps {
  onToggle: (muted: boolean) => void;
}

export function SoundToggle({ onToggle }: SoundToggleProps) {
  const [muted, setMuted] = useState(false);

  const toggle = () => {
    setMuted(!muted);
    onToggle(!muted);
  };

  return (
    <button
      onClick={toggle}
      className="p-2 text-stone-400 hover:text-stone-200 transition-colors"
      aria-label={muted ? 'Activer le son' : 'Couper le son'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

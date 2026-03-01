import { SoundToggle } from './SoundToggle';

interface HeaderProps {
  worldName: string;
  onSoundToggle: (muted: boolean) => void;
}

export function Header({ worldName, onSoundToggle }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-80 h-14 bg-stone-900/80 backdrop-blur border-b border-stone-700 flex items-center justify-between px-4 z-10">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-amber-400">Edge of Empires</h1>
        <span className="text-stone-500">|</span>
        <span className="text-sm text-stone-400">{worldName}</span>
      </div>
      <div className="flex items-center gap-2">
        <SoundToggle onToggle={onSoundToggle} />
      </div>
    </header>
  );
}

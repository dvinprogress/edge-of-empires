export class SoundManager {
  private sounds = new Map<string, HTMLAudioElement>();
  private volume = 0.5;
  private muted = false;

  async loadSounds(sounds: Record<string, string>, basePath: string): Promise<void> {
    for (const [alias, path] of Object.entries(sounds)) {
      const audio = new Audio(`${basePath}/${path}`);
      audio.preload = 'auto';
      audio.volume = this.volume;
      this.sounds.set(alias, audio);
    }
  }

  play(alias: string): void {
    if (this.muted) return;
    const audio = this.sounds.get(alias);
    if (!audio) return;
    // Clone pour permettre des sons superposes
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = this.volume;
    clone.play().catch(() => {
      // Ignorer les restrictions autoplay du navigateur
    });
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    for (const audio of this.sounds.values()) {
      audio.volume = this.volume;
    }
  }

  mute(): void {
    this.muted = true;
  }

  unmute(): void {
    this.muted = false;
  }

  isMuted(): boolean {
    return this.muted;
  }

  destroy(): void {
    this.sounds.clear();
  }
}

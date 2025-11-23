const audioCache = new Map<string, HTMLAudioElement>();
let globalVolume = 0.7;
let isMuted = false;

export type SoundType = "pomodoro-complete" | "break-pomodoro" | "notification";

const SOUND_PATHS: Record<SoundType, string> = {
  "pomodoro-complete": "/sounds/pomodoro-complete.ogg",
  "break-pomodoro": "/sounds/break-complete.ogg",
  notification: "/sounds/notification.ogg",
};

export function preloadSound(type: SoundType): void {
  if (audioCache.has(type)) {
    return;
  }

  const audio = new Audio(SOUND_PATHS[type]);
  audio.volume = globalVolume;
  audio.preload = "auto";

  audioCache.set(type, audio);
}

export async function playSound(type: SoundType): Promise<void> {
  if (isMuted) {
    return;
  }

  try {
    let audio = audioCache.get(type);

    if (!audio) {
      audio = new Audio(SOUND_PATHS[type]);
      audio.volume = globalVolume;
      audioCache.set(type, audio);
    }

    audio.currentTime = 0;

    await audio.play();
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      console.warn("El navegador bloqueó el audio");
    } else {
      console.error(`❌ Error al reproducir sonido ${type}:`, error);
    }

    throw error;
  }
}

export function setVolume(volume: number): void {
  globalVolume = Math.max(0, Math.min(1, volume));

  audioCache.forEach((audio) => {
    audio.volume = globalVolume;
  });
}

export function getVoume(): number {
  return globalVolume;
}

export function setMute(mute: boolean): void {
  isMuted = mute;
}

export function getMute(): boolean {
  return isMuted;
}

export function clearSoundCache(): void {
  audioCache.clear();
}

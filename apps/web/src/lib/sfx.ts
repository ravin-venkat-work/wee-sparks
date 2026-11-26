"use client";

export type SfxCue = "tap" | "snap" | "success" | "retry";

export const SFX_DURATION_MS: Record<SfxCue, number> = {
  tap: 70,
  snap: 120,
  success: 580,
  retry: 310,
};

const SFX_STORAGE_KEY = "wee-sparks-sfx-enabled";
const MUSIC_STORAGE_KEY = "wee-sparks-music-enabled";

let sharedAudioCtx: AudioContext | null = null;
let sfxEnabledCache: boolean | null = null;
let musicEnabledCache: boolean | null = null;
let musicTimerId: number | null = null;
let musicStepIndex = 0;

// Gentle C-major pentatonic marimba melody (Hz)
const AMBIENT_MELODY = [
  523.25, 659.25, 587.33, 783.99, 659.25, 523.25, 440.0, 587.33,
];

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new AudioCtx();
    } catch {
      return null;
    }
  }

  if (sharedAudioCtx.state === "suspended") {
    void sharedAudioCtx.resume().catch(() => {});
  }

  return sharedAudioCtx;
}

export function isSfxEnabled(): boolean {
  if (sfxEnabledCache !== null) return sfxEnabledCache;
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(SFX_STORAGE_KEY);
    sfxEnabledCache = raw === null ? true : raw === "1";
    return sfxEnabledCache;
  } catch {
    return true;
  }
}

export function setSfxEnabled(enabled: boolean): void {
  sfxEnabledCache = enabled;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SFX_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore storage errors in restricted modes.
  }
}

export function isMusicEnabled(): boolean {
  if (musicEnabledCache !== null) return musicEnabledCache;
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(MUSIC_STORAGE_KEY);
    musicEnabledCache = raw === "1";
    return musicEnabledCache;
  } catch {
    return false;
  }
}

export function stopAmbientMusic(): void {
  if (musicTimerId !== null && typeof window !== "undefined") {
    window.clearInterval(musicTimerId);
    musicTimerId = null;
  }
}

export function setMusicEnabled(enabled: boolean): void {
  musicEnabledCache = enabled;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(MUSIC_STORAGE_KEY, enabled ? "1" : "0");
    } catch {
      // Ignore storage errors.
    }
  }

  if (!enabled) {
    stopAmbientMusic();
    return;
  }

  if (typeof window === "undefined" || musicTimerId !== null) return;

  const playNote = () => {
    if (!isMusicEnabled()) {
      stopAmbientMusic();
      return;
    }
    const ctx = getAudioContext();
    if (!ctx) return;
    const freq = AMBIENT_MELODY[musicStepIndex % AMBIENT_MELODY.length]!;
    musicStepIndex += 1;
    try {
      scheduleTone(ctx, {
        startFreq: freq,
        startOffset: 0,
        duration: 0.42,
        gain: 0.024,
        type: "sine",
      });
    } catch {
      // Ignore audio errors.
    }
  };

  playNote();
  musicTimerId = window.setInterval(playNote, 920);
}

function scheduleTone(
  ctx: AudioContext,
  options: {
    startFreq: number;
    endFreq?: number;
    startOffset: number;
    duration: number;
    gain: number;
    type?: OscillatorType;
  }
): void {
  const now = ctx.currentTime + options.startOffset;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = options.type ?? "sine";
  osc.frequency.setValueAtTime(options.startFreq, now);
  if (options.endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      options.endFreq,
      now + options.duration
    );
  }

  // Soft envelope to prevent clicks/pops on tablet speakers
  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.linearRampToValueAtTime(options.gain, now + 0.012);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + options.duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + options.duration + 0.02);
}

/**
 * Lightweight, zero-dependency Web Audio API sound effects synthesizer for
 * Foundation Stage tactile cues: tap, snap, success, and gentle retry.
 */
export function playSfx(cue: SfxCue): void {
  if (!isSfxEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    switch (cue) {
      case "tap":
        scheduleTone(ctx, {
          startFreq: 520,
          endFreq: 610,
          startOffset: 0,
          duration: 0.06,
          gain: 0.075,
          type: "sine",
        });
        break;

      case "snap":
        scheduleTone(ctx, {
          startFreq: 420,
          endFreq: 680,
          startOffset: 0,
          duration: 0.075,
          gain: 0.1,
          type: "triangle",
        });
        scheduleTone(ctx, {
          startFreq: 740,
          endFreq: 880,
          startOffset: 0.045,
          duration: 0.065,
          gain: 0.065,
          type: "sine",
        });
        break;

      case "success":
        scheduleTone(ctx, {
          startFreq: 523.25,
          startOffset: 0,
          duration: 0.12,
          gain: 0.1,
          type: "triangle",
        });
        scheduleTone(ctx, {
          startFreq: 659.25,
          startOffset: 0.09,
          duration: 0.12,
          gain: 0.1,
          type: "triangle",
        });
        scheduleTone(ctx, {
          startFreq: 783.99,
          startOffset: 0.18,
          duration: 0.14,
          gain: 0.11,
          type: "triangle",
        });
        scheduleTone(ctx, {
          startFreq: 1046.5,
          startOffset: 0.27,
          duration: 0.28,
          gain: 0.12,
          type: "sine",
        });
        break;

      case "retry":
        scheduleTone(ctx, {
          startFreq: 329.63,
          startOffset: 0,
          duration: 0.12,
          gain: 0.075,
          type: "sine",
        });
        scheduleTone(ctx, {
          startFreq: 261.63,
          startOffset: 0.11,
          duration: 0.18,
          gain: 0.07,
          type: "sine",
        });
        break;
    }
  } catch {
    // Never interrupt child interaction if Web Audio fails on restricted devices.
  }
}

const CALM_MODE_STORAGE_KEY = "wee-sparks-calm-mode";

let calmModeCache: boolean | null = null;
const calmModeListeners = new Set<(enabled: boolean) => void>();

/**
 * Pure sensory helpers for Calm Mode (quiet audio + reduced motion) and
 * safe mid-session exit confirmation.
 */
export function resolveMotionReductionMode(
  calmMode: boolean
): "always" | "user" {
  return calmMode ? "always" : "user";
}

/**
 * Scales Web Audio SFX gain down gently in Calm Mode while keeping subtle tactile feedback audible.
 */
export function resolveAudioGain(baseGain: number, calmMode: boolean): number {
  const clamped = Math.max(0, Math.min(1, baseGain));
  return calmMode ? Math.round(clamped * 0.35 * 10000) / 10000 : clamped;
}

/**
 * Scales spoken narration & MP3 playback volume gently in Calm Mode.
 */
export function resolveSpeechVolume(calmMode: boolean): number {
  return calmMode ? 0.45 : 1;
}

/**
 * Keeps spoken narration slightly gentler/unhurried in Calm Mode.
 */
export function resolveSpeechRate(baseRate: number, calmMode: boolean): number {
  return calmMode ? Math.min(baseRate, 0.84) : baseRate;
}

/**
 * Determines whether tapping Home should show a gentle confirmation dialog
 * instead of abruptly exiting an active quest or story.
 */
export function shouldConfirmSessionExit(params: {
  mode: "quest" | "story";
  stage: "welcome" | "playing" | "celebrating" | "beat" | "exercise" | "finale";
}): boolean {
  if (params.mode === "quest") {
    return params.stage === "playing";
  }
  return params.stage === "beat" || params.stage === "exercise";
}

export function isCalmModeEnabled(): boolean {
  if (calmModeCache !== null) return calmModeCache;
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(CALM_MODE_STORAGE_KEY);
    calmModeCache = raw === "1";
    return calmModeCache;
  } catch {
    return false;
  }
}

export function setCalmModeEnabled(enabled: boolean): void {
  calmModeCache = enabled;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CALM_MODE_STORAGE_KEY, enabled ? "1" : "0");
    } catch {
      // Ignore storage errors in restricted browsing modes.
    }
    if (typeof document !== "undefined") {
      document.documentElement.dataset.calmMode = enabled ? "true" : "false";
    }
  }
  for (const listener of calmModeListeners) {
    listener(enabled);
  }
}

export function subscribeCalmMode(
  listener: (enabled: boolean) => void
): () => void {
  calmModeListeners.add(listener);
  return () => {
    calmModeListeners.delete(listener);
  };
}

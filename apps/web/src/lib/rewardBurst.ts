export type RewardBurstVariant = "standard" | "finale";

export type RewardVisualMode =
  | "none"
  | "glow"
  | "glow-finale"
  | "burst"
  | "finale";

export interface BurstParticle {
  id: string;
  shape: "star" | "sparkle" | "dot";
  color: string;
  angleDeg: number;
  distancePx: number;
  sizePx: number;
  delayS: number;
  durationS: number;
  rotateDeg: number;
}

/**
 * Hard ceiling (< 1.2s) for all reward particle burst animations.
 */
export const REWARD_BURST_MAX_DURATION_S = 1.15;
export const REWARD_STANDARD_DURATION_S = 0.82;
export const REWARD_FINALE_DURATION_S = 1.05;

/**
 * Duration of the Web Audio 4-note success jingle (last tone ends at 0.55s)
 * plus a short breathing gap so spoken praise never overlaps.
 */
export const SUCCESS_JINGLE_DURATION_MS = 580;
export const PRAISE_GAP_AFTER_JINGLE_MS = 80;

const BURST_COLORS = [
  "#F59E0B", // amber-500
  "#10B981", // emerald-500
  "#0284C7", // sky-600
  "#FACC15", // yellow-400
  "#F43F5E", // rose-500
  "#8B5CF6", // violet-500
] as const;

const PARTICLE_SHAPES: readonly BurstParticle["shape"][] = [
  "star",
  "sparkle",
  "dot",
];

/**
 * Determines which visual mode RewardBurst should render.
 * Always switches to a simple glow when prefers-reduced-motion is enabled.
 */
export function resolveRewardVisualMode(options: {
  active: boolean;
  isFinalStep: boolean;
  prefersReducedMotion: boolean;
}): RewardVisualMode {
  if (!options.active) return "none";
  if (options.prefersReducedMotion) {
    return options.isFinalStep ? "glow-finale" : "glow";
  }
  return options.isFinalStep ? "finale" : "burst";
}

/**
 * Deterministically builds radial SVG sparkle/star particles whose total
 * lifetime (delayS + durationS) always stays strictly under 1.2 seconds.
 */
export function generateBurstParticles(
  variant: RewardBurstVariant
): readonly BurstParticle[] {
  const count = variant === "finale" ? 22 : 12;
  const baseDuration =
    variant === "finale"
      ? REWARD_FINALE_DURATION_S
      : REWARD_STANDARD_DURATION_S;
  const maxDistance = variant === "finale" ? 170 : 115;
  const minDistance = variant === "finale" ? 72 : 52;

  return Array.from({ length: count }, (_, idx) => {
    const step = 360 / count;
    const jitter = ((idx % 3) - 1) * (step * 0.18);
    const angleDeg = (idx * step + jitter + 360) % 360;
    const ringFactor = idx % 2 === 0 ? 1 : 0.68;
    const distancePx = Math.round(
      minDistance + (maxDistance - minDistance) * ringFactor
    );
    const sizePx =
      variant === "finale"
        ? idx % 3 === 0
          ? 24
          : 17
        : idx % 3 === 0
        ? 20
        : 14;
    const delayS = Number(((idx % 4) * 0.035).toFixed(3));
    const rawDuration = baseDuration - delayS * 0.4;
    const durationS = Number(
      Math.min(REWARD_BURST_MAX_DURATION_S - delayS, rawDuration).toFixed(3)
    );

    return {
      id: `${variant}-p-${idx}`,
      shape: PARTICLE_SHAPES[idx % PARTICLE_SHAPES.length]!,
      color: BURST_COLORS[idx % BURST_COLORS.length]!,
      angleDeg,
      distancePx,
      sizePx,
      delayS,
      durationS,
      rotateDeg: idx % 2 === 0 ? 140 : -140,
    };
  });
}

export interface SequentialRewardAudioDeps {
  sfxEnabled: boolean;
  jingleWaitMs?: number;
  isCancelled: () => boolean;
  playJingle: () => void;
  wait: (ms: number) => Promise<void>;
  playPraise: () => Promise<void>;
}

/**
 * Pure audio sequencer ensuring the success jingle finishes before spoken
 * praise starts (zero overlap), skips waiting when SFX is muted, and aborts
 * cleanly if cancelled before praise begins.
 */
export async function sequenceJingleThenPraise(
  deps: SequentialRewardAudioDeps
): Promise<boolean> {
  if (deps.isCancelled()) {
    return false;
  }

  if (deps.sfxEnabled) {
    deps.playJingle();
    const waitMs =
      deps.jingleWaitMs ??
      SUCCESS_JINGLE_DURATION_MS + PRAISE_GAP_AFTER_JINGLE_MS;
    if (waitMs > 0) {
      await deps.wait(waitMs);
    }
  }

  if (deps.isCancelled()) {
    return false;
  }

  await deps.playPraise();
  return !deps.isCancelled();
}

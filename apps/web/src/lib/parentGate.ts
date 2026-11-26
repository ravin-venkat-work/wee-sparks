export const PARENT_GATE_HOLD_MS = 3000;

export interface ParentGateChallenge {
  left: number;
  right: number;
  answer: number;
  promptText: string;
}

export interface HoldProgressResult {
  elapsedMs: number;
  progress: number;
  unlocked: boolean;
}

/**
 * Generates a spoken-free mental addition challenge suitable for adults
 * (and beyond P1–P2 ages 4–6) using two-digit + single/low-two-digit sums
 * such as 12 + 7 or 16 + 8.
 */
export function generateParentChallenge(
  rng: () => number = Math.random
): ParentGateChallenge {
  const clampUnit = (v: number) => Math.min(0.999999, Math.max(0, v));
  const left = 11 + Math.floor(clampUnit(rng()) * 9); // 11..19
  const right = 6 + Math.floor(clampUnit(rng()) * 9); // 6..14
  const answer = left + right;
  return {
    left,
    right,
    answer,
    promptText: `${left} + ${right}`,
  };
}

/**
 * Strictly validates a parent's typed answer to a spoken-free sum challenge.
 */
export function verifyParentChallengeAnswer(
  challenge: ParentGateChallenge,
  rawInput: string
): boolean {
  const trimmed = rawInput.trim();
  if (!/^\d+$/.test(trimmed)) {
    return false;
  }
  return Number.parseInt(trimmed, 10) === challenge.answer;
}

/**
 * Computes deterministic hold-to-unlock progress for the 3-second corner button.
 */
export function evaluateHoldProgress(
  startedAtMs: number,
  nowMs: number,
  requiredHoldMs: number = PARENT_GATE_HOLD_MS
): HoldProgressResult {
  const safeRequired = Math.max(1, requiredHoldMs);
  const elapsedMs = Math.max(0, nowMs - startedAtMs);
  const progress = Math.min(1, elapsedMs / safeRequired);
  return {
    elapsedMs,
    progress,
    unlocked: elapsedMs >= safeRequired,
  };
}

/**
 * Pure guard ensuring privileged adult actions (printing practice sheets,
 * changing CCEA year group, switching/adding learners, or editing stickers)
 * can only execute after passing the ParentGate.
 */
export function runIfParentGateUnlocked<T>(
  isGateUnlocked: boolean,
  action: () => T
): { allowed: true; result: T } | { allowed: false } {
  if (!isGateUnlocked) {
    return { allowed: false };
  }
  return { allowed: true, result: action() };
}

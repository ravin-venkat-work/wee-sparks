import {
  getMicroSkillById,
  type DifficultyTier,
  type MicroSkillId,
} from "@wee-sparks/curriculum-schema";
import {
  db,
  type ExerciseAttempt,
  type SkillMasteryRecord,
} from "@/lib/db";

export interface AttemptSignal {
  learnerId: number;
  exerciseId: string;
  skillId: MicroSkillId;
  isCorrect: boolean;
  retriesCount: number;
  hintUsed: boolean;
  durationMs: number;
  now?: Date;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Deterministically scores an attempt in [0, 1] using correctness, retries,
 * and hint usage. A correct answer with scaffolding still moves mastery forward
 * gently rather than feeling punitive for Foundation Stage learners.
 */
export function computeAttemptQuality(params: {
  isCorrect: boolean;
  retriesCount: number;
  hintUsed: boolean;
}): number {
  if (!params.isCorrect) {
    return 0;
  }

  const boundedRetries = Math.min(Math.max(0, params.retriesCount), 3);
  const retryPenalty = boundedRetries * 0.18;
  const hintPenalty = params.hintUsed ? 0.15 : 0;

  return round3(clamp(1 - retryPenalty - hintPenalty, 0.35, 1));
}

/**
 * Computes the next spaced-repetition review timestamp from mastery status,
 * streak, and whether the latest attempt was correct.
 */
export function computeNextReviewAt(params: {
  isCorrect: boolean;
  status: SkillMasteryRecord["status"];
  streak: number;
  now: Date;
}): string {
  let intervalMs: number;

  if (!params.isCorrect) {
    intervalMs = 10 * 60 * 1000; // 10 minutes
  } else if (params.status === "emerging") {
    intervalMs = 4 * HOUR_MS;
  } else if (params.status === "developing") {
    intervalMs = 1 * DAY_MS;
  } else if (params.streak <= 2) {
    intervalMs = 3 * DAY_MS;
  } else if (params.streak === 3) {
    intervalMs = 7 * DAY_MS;
  } else {
    intervalMs = 14 * DAY_MS;
  }

  return new Date(params.now.getTime() + intervalMs).toISOString();
}

/**
 * Pure deterministic mastery state transition for a CCEA micro-skill.
 */
export function computeNextSkillMastery(
  existing: SkillMasteryRecord | undefined,
  signal: AttemptSignal
): SkillMasteryRecord {
  const now = signal.now ?? new Date();
  const nowIso = now.toISOString();
  const skill = getMicroSkillById(signal.skillId);

  const prevTotal = existing?.totalCount ?? 0;
  const prevCorrect = existing?.correctCount ?? 0;
  const prevScore = existing?.masteryScore ?? 0.25;
  const prevStreak = existing?.streak ?? 0;
  const prevHints = existing?.hintAssistedCount ?? 0;
  const prevRetries = existing?.retryTotal ?? 0;

  const quality = computeAttemptQuality({
    isCorrect: signal.isCorrect,
    retriesCount: signal.retriesCount,
    hintUsed: signal.hintUsed,
  });

  const totalCount = prevTotal + 1;
  const correctCount = prevCorrect + (signal.isCorrect ? 1 : 0);
  const hintAssistedCount = prevHints + (signal.hintUsed ? 1 : 0);
  const retryTotal = prevRetries + Math.max(0, signal.retriesCount);

  // Clean or lightly-scaffolded correct answer advances streak; misses reset it.
  const streak = signal.isCorrect
    ? signal.retriesCount === 0 && !signal.hintUsed
      ? prevStreak + 1
      : Math.max(1, prevStreak)
    : 0;

  // Deterministic exponential blend so recent mastery reflects independence.
  let masteryScore: number;
  if (signal.isCorrect) {
    const alpha = prevTotal < 3 ? 0.45 : 0.36;
    masteryScore = round3(
      clamp(prevScore * (1 - alpha) + quality * alpha, 0, 1)
    );
  } else {
    masteryScore = round3(clamp(prevScore * 0.72, 0, 1));
  }

  const accuracy = correctCount / totalCount;
  const { minAttempts, minAccuracy } = skill.masteryThreshold;

  let status: "not-started" | DifficultyTier = "emerging";
  if (
    totalCount >= minAttempts &&
    accuracy >= minAccuracy &&
    masteryScore >= minAccuracy &&
    streak >= 2
  ) {
    status = "secure";
  } else if (totalCount >= 2 && masteryScore >= 0.48) {
    status = "developing";
  }

  const nextReviewAt = computeNextReviewAt({
    isCorrect: signal.isCorrect,
    status,
    streak,
    now,
  });

  return {
    learnerId: signal.learnerId,
    skillId: signal.skillId,
    correctCount,
    totalCount,
    masteryScore,
    streak,
    hintAssistedCount,
    retryTotal,
    status,
    nextReviewAt,
    lastAttemptAt: nowIso,
    updatedAt: nowIso,
  };
}

/**
 * Atomically logs an ExerciseAttempt and updates SkillMasteryRecord in Dexie.
 */
export async function recordAdaptiveAttempt(
  signal: AttemptSignal
): Promise<SkillMasteryRecord> {
  const now = signal.now ?? new Date();
  const nowIso = now.toISOString();
  const retriesCount = Math.max(0, signal.retriesCount);

  return db.transaction("rw", db.attempts, db.skillMastery, async () => {
    await db.attempts.add({
      learnerId: signal.learnerId,
      exerciseId: signal.exerciseId,
      skillId: signal.skillId,
      isCorrect: signal.isCorrect,
      attemptsCount: retriesCount + 1,
      retriesCount,
      hintUsed: signal.hintUsed,
      durationMs: Math.max(0, Math.round(signal.durationMs)),
      completedAt: nowIso,
    });

    const existing = await db.skillMastery.get([
      signal.learnerId,
      signal.skillId,
    ]);

    const updated = computeNextSkillMastery(existing, { ...signal, now });
    await db.skillMastery.put(updated);
    return updated;
  });
}

/**
 * Returns whether a learner has met the CCEA micro-skill's mastery threshold.
 */
export function isSkillMastered(
  skillId: MicroSkillId,
  record?: SkillMasteryRecord
): boolean {
  if (!record || record.totalCount === 0) return false;
  const { minAttempts, minAccuracy } = getMicroSkillById(skillId).masteryThreshold;
  const accuracy = record.correctCount / record.totalCount;
  return (
    record.status === "secure" &&
    record.totalCount >= minAttempts &&
    accuracy >= minAccuracy &&
    record.masteryScore >= minAccuracy
  );
}

/**
 * Returns whether a practised skill is due for spaced-repetition review.
 */
export function isSkillDueForReview(
  record: SkillMasteryRecord | undefined,
  now: Date = new Date()
): boolean {
  if (!record || record.totalCount === 0) return false;
  if (record.status === "not-started") return false;
  return new Date(record.nextReviewAt).getTime() <= now.getTime();
}

/**
 * Checks whether all prerequisite micro-skills in the CCEA catalog are mastered.
 */
export function arePrerequisitesMet(
  skillId: MicroSkillId,
  masteryMap: ReadonlyMap<MicroSkillId, SkillMasteryRecord>
): boolean {
  const skill = getMicroSkillById(skillId);
  return skill.prerequisiteSkillIds.every((prereqId) =>
    isSkillMastered(prereqId, masteryMap.get(prereqId))
  );
}

export interface LearnerMasterySnapshot {
  masteryRecords: SkillMasteryRecord[];
  masteryMap: Map<MicroSkillId, SkillMasteryRecord>;
  recentAttempts: ExerciseAttempt[];
}

/**
 * Loads the learner's current mastery records and recent attempt history from Dexie.
 */
export async function getLearnerMasterySnapshot(
  learnerId: number
): Promise<LearnerMasterySnapshot> {
  const [masteryRecords, recentAttempts] = await Promise.all([
    db.skillMastery.where("learnerId").equals(learnerId).toArray(),
    db.attempts
      .where("learnerId")
      .equals(learnerId)
      .reverse()
      .limit(40)
      .toArray(),
  ]);

  const masteryMap = new Map<MicroSkillId, SkillMasteryRecord>(
    masteryRecords.map((record) => [record.skillId, record])
  );

  return { masteryRecords, masteryMap, recentAttempts };
}

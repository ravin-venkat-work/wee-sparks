import {
  getMicroSkillById,
  type DifficultyTier,
  type Exercise,
  type MicroSkillId,
} from "@wee-sparks/curriculum-schema";
import type {
  ExerciseAttempt,
  LearnerThemePreference,
  SkillMasteryRecord,
} from "@/lib/db";
import {
  arePrerequisitesMet,
  isSkillDueForReview,
  isSkillMastered,
} from "./mastery";

export type SessionSlotRole = "warmup" | "focus" | "review";

export interface ComposedSessionItem {
  exercise: Exercise;
  slotRole: SessionSlotRole;
  themeMatched: boolean;
  reason: string;
}

export interface ComposedSession {
  items: ComposedSessionItem[];
  selectedTheme: LearnerThemePreference;
  themeMatchCount: number;
  fallbackUsed: boolean;
  summary: {
    warmupCount: number;
    focusCount: number;
    reviewCount: number;
  };
}

export interface ComposeSessionOptions {
  exercises: readonly Exercise[];
  masteryRecords: readonly SkillMasteryRecord[];
  recentAttempts?: readonly ExerciseAttempt[];
  selectedTheme: LearnerThemePreference;
  sessionLength?: number;
  now?: Date;
}

const DIFFICULTY_RANK: Record<DifficultyTier, number> = {
  emerging: 0,
  developing: 1,
  secure: 2,
};

function targetDifficultyForRecord(
  record?: SkillMasteryRecord
): DifficultyTier {
  if (!record || record.status === "not-started" || record.status === "emerging") {
    return "emerging";
  }
  if (record.status === "developing") {
    return record.masteryScore >= 0.7 ? "secure" : "developing";
  }
  return "secure";
}

function buildExerciseHistoryMap(
  recentAttempts: readonly ExerciseAttempt[]
): Map<string, { lastCompletedMs: number; lastMissed: boolean; count: number }> {
  const map = new Map<
    string,
    { lastCompletedMs: number; lastMissed: boolean; count: number }
  >();

  for (const attempt of recentAttempts) {
    const ms = new Date(attempt.completedAt).getTime();
    const prev = map.get(attempt.exerciseId);
    if (!prev) {
      map.set(attempt.exerciseId, {
        lastCompletedMs: ms,
        lastMissed: !attempt.isCorrect,
        count: 1,
      });
    } else {
      map.set(attempt.exerciseId, {
        lastCompletedMs: Math.max(prev.lastCompletedMs, ms),
        lastMissed: ms >= prev.lastCompletedMs ? !attempt.isCorrect : prev.lastMissed,
        count: prev.count + 1,
      });
    }
  }

  return map;
}

/**
 * Deterministically composes a balanced Foundation Stage learning session from:
 *  1. Confidence warm-ups (accessible emerging or strong-mastery starter)
 *  2. Active skills below mastery threshold (scaffolded to current tier)
 *  3. Spaced-repetition review items (due or mastered skills)
 *
 * When the learner has chosen a specific theme and matching exercises exist,
 * the candidate pool is filtered to that theme.
 */
export function composeAdaptiveSession(
  options: ComposeSessionOptions
): ComposedSession {
  const now = options.now ?? new Date();
  const selectedTheme = options.selectedTheme;
  const recentAttempts = options.recentAttempts ?? [];
  const masteryMap = new Map<MicroSkillId, SkillMasteryRecord>(
    options.masteryRecords.map((r) => [r.skillId, r])
  );
  const exerciseHistory = buildExerciseHistoryMap(recentAttempts);

  // Filter by selected theme when matching exercises exist
  const themedMatches =
    selectedTheme === "all"
      ? options.exercises
      : options.exercises.filter((ex) => ex.theme === selectedTheme);

  const fallbackUsed =
    selectedTheme !== "all" && themedMatches.length === 0;
  const pool: readonly Exercise[] =
    selectedTheme !== "all" && themedMatches.length > 0
      ? themedMatches
      : options.exercises;

  const targetLength = Math.min(
    options.sessionLength ?? 6,
    pool.length
  );

  if (targetLength === 0) {
    return {
      items: [],
      selectedTheme,
      themeMatchCount: 0,
      fallbackUsed,
      summary: { warmupCount: 0, focusCount: 0, reviewCount: 0 },
    };
  }

  const chosenIds = new Set<string>();
  const warmupItems: ComposedSessionItem[] = [];
  const reviewItems: ComposedSessionItem[] = [];
  const focusItems: ComposedSessionItem[] = [];

  const toItem = (
    exercise: Exercise,
    slotRole: SessionSlotRole,
    reason: string
  ): ComposedSessionItem => ({
    exercise,
    slotRole,
    themeMatched:
      selectedTheme === "all" || exercise.theme === selectedTheme,
    reason,
  });

  // -------------------------------------------------------------------------
  // 1. Confidence Warm-up (1 item)
  // Prefer an "emerging" item from a skill where the child already has good
  // mastery/accuracy (or a gentle emerging starter if they are brand new).
  // -------------------------------------------------------------------------
  const warmupCandidates = [...pool].sort((a, b) => {
    const recA = masteryMap.get(a.skillId);
    const recB = masteryMap.get(b.skillId);
    const scoreA =
      (a.difficulty === "emerging" ? 40 : a.difficulty === "developing" ? 15 : 0) +
      (recA ? recA.masteryScore * 30 : 12) -
      (exerciseHistory.get(a.id)?.lastMissed ? 25 : 0);
    const scoreB =
      (b.difficulty === "emerging" ? 40 : b.difficulty === "developing" ? 15 : 0) +
      (recB ? recB.masteryScore * 30 : 12) -
      (exerciseHistory.get(b.id)?.lastMissed ? 25 : 0);

    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.id.localeCompare(b.id);
  });

  const warmupPick = warmupCandidates[0];
  if (warmupPick) {
    chosenIds.add(warmupPick.id);
    const rec = masteryMap.get(warmupPick.skillId);
    warmupItems.push(
      toItem(
        warmupPick,
        "warmup",
        rec && rec.masteryScore >= 0.5
          ? "Confidence warm-up from a familiar skill"
          : "Gentle starter warm-up to build momentum"
      )
    );
  }

  // -------------------------------------------------------------------------
  // 2. Spaced-Repetition Review (up to 1–2 items when eligible)
  // Draw from mastered skills or skills due for spaced-repetition review.
  // -------------------------------------------------------------------------
  const reviewQuota = targetLength >= 5 ? 2 : targetLength >= 3 ? 1 : 0;
  const reviewCandidates = pool
    .filter((ex) => {
      if (chosenIds.has(ex.id)) return false;
      const rec = masteryMap.get(ex.skillId);
      if (!rec || rec.totalCount === 0) return false;
      return (
        isSkillDueForReview(rec, now) || isSkillMastered(ex.skillId, rec)
      );
    })
    .sort((a, b) => {
      const recA = masteryMap.get(a.skillId)!;
      const recB = masteryMap.get(b.skillId)!;
      const overdueA = now.getTime() - new Date(recA.nextReviewAt).getTime();
      const overdueB = now.getTime() - new Date(recB.nextReviewAt).getTime();
      if (overdueB !== overdueA) return overdueB - overdueA;

      const histA = exerciseHistory.get(a.id)?.lastCompletedMs ?? 0;
      const histB = exerciseHistory.get(b.id)?.lastCompletedMs ?? 0;
      if (histA !== histB) return histA - histB;

      return a.id.localeCompare(b.id);
    });

  for (const candidate of reviewCandidates) {
    if (reviewItems.length >= reviewQuota) break;
    if (warmupItems.length + reviewItems.length >= targetLength) break;

    chosenIds.add(candidate.id);
    const rec = masteryMap.get(candidate.skillId);
    const due = isSkillDueForReview(rec, now);
    reviewItems.push(
      toItem(
        candidate,
        "review",
        due
          ? "Spaced-repetition review (due now)"
          : "Spaced-repetition consolidation for a mastered skill"
      )
    );
  }

  // -------------------------------------------------------------------------
  // 3. Active Skills Below Mastery Threshold (remaining slots)
  // Prioritise skills below masteryThreshold, matching difficulty to tier,
  // revisiting missed exercises, and interleaving literacy + numeracy.
  // -------------------------------------------------------------------------
  const focusScore = (ex: Exercise): number => {
    const rec = masteryMap.get(ex.skillId);
    const mastered = isSkillMastered(ex.skillId, rec);
    const prereqsReady = arePrerequisitesMet(ex.skillId, masteryMap);
    const desiredTier = targetDifficultyForRecord(rec);
    const tierDistance = Math.abs(
      DIFFICULTY_RANK[ex.difficulty] - DIFFICULTY_RANK[desiredTier]
    );
    const hist = exerciseHistory.get(ex.id);

    let score = 0;
    // Strongly favour active skills below mastery threshold
    score += mastered ? 10 : 100;
    // Favour skills already started (emerging/developing) so learner progresses smoothly
    if (rec && !mastered) {
      score += 25 + (1 - rec.masteryScore) * 20;
    } else if (!rec) {
      score += prereqsReady ? 20 : 12;
    }
    // Match exercise difficulty tier to current mastery tier
    score += (2 - tierDistance) * 14;
    // Prioritise previously missed or unseen exercises
    if (hist?.lastMissed) score += 22;
    if (!hist) score += 16;
    else score -= Math.min(hist.count * 4, 16);

    return score;
  };

  const remainingPool = pool
    .filter((ex) => !chosenIds.has(ex.id))
    .sort((a, b) => {
      const diff = focusScore(b) - focusScore(a);
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    });

  // Interleave skills/subjects gently so a child gets variety across the session
  const workingCandidates = [...remainingPool];
  let lastSkillId: MicroSkillId | null = warmupPick?.skillId ?? null;

  while (
    warmupItems.length + reviewItems.length + focusItems.length < targetLength &&
    workingCandidates.length > 0
  ) {
    let pickIdx = workingCandidates.findIndex(
      (ex) => ex.skillId !== lastSkillId
    );
    if (pickIdx === -1) pickIdx = 0;

    const [picked] = workingCandidates.splice(pickIdx, 1);
    if (!picked) break;

    chosenIds.add(picked.id);
    lastSkillId = picked.skillId;

    const rec = masteryMap.get(picked.skillId);
    const skill = getMicroSkillById(picked.skillId);
    const mastered = isSkillMastered(picked.skillId, rec);

    focusItems.push(
      toItem(
        picked,
        mastered ? "review" : "focus",
        mastered
          ? `Reinforcing ${skill.title}`
          : `Building mastery in ${skill.title}`
      )
    );
  }

  // Assemble final order: Warm-up -> interleaved Focus & Review
  const ordered: ComposedSessionItem[] = [...warmupItems];
  const focusQueue = [...focusItems];
  const reviewQueue = [...reviewItems];

  while (focusQueue.length > 0 || reviewQueue.length > 0) {
    const nextFocus = focusQueue.shift();
    if (nextFocus) ordered.push(nextFocus);

    const nextFocus2 = focusQueue.shift();
    if (nextFocus2) ordered.push(nextFocus2);

    const nextReview = reviewQueue.shift();
    if (nextReview) ordered.push(nextReview);
  }

  const warmupCount = ordered.filter((i) => i.slotRole === "warmup").length;
  const focusCount = ordered.filter((i) => i.slotRole === "focus").length;
  const reviewCount = ordered.filter((i) => i.slotRole === "review").length;

  return {
    items: ordered,
    selectedTheme,
    themeMatchCount: themedMatches.length,
    fallbackUsed,
    summary: { warmupCount, focusCount, reviewCount },
  };
}

import {
  getMicroSkillById,
  type DifficultyTier,
  type Exercise,
  type MicroSkillId,
  type YearGroup,
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
export type YearGroupFilter = YearGroup | "all";
export type EngineKind =
  | "tap-choice"
  | "phonics-builder"
  | "number-line"
  | "drag-sort"
  | "trace-canvas";

export interface ComposedSessionItem {
  exercise: Exercise;
  slotRole: SessionSlotRole;
  engineKind: EngineKind;
  themeMatched: boolean;
  reason: string;
}

export interface ComposedSession {
  items: ComposedSessionItem[];
  yearGroupFilter: YearGroupFilter;
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
  yearGroupFilter?: YearGroupFilter;
  selectedTheme: LearnerThemePreference;
  sessionLength?: number;
  now?: Date;
}

const DIFFICULTY_RANK: Record<DifficultyTier, number> = {
  emerging: 0,
  developing: 1,
  secure: 2,
};

/**
 * Maps an Exercise to the interactive Foundation Stage UI engine that renders it.
 */
export function getExerciseEngineKind(exercise: Exercise): EngineKind {
  if (
    exercise.type === "cvc-blending" ||
    exercise.type === "phoneme-segment"
  ) {
    return "phonics-builder";
  }
  if (exercise.type === "number-line-hop") {
    return "number-line";
  }
  if (exercise.type === "trace-glyph") {
    return "trace-canvas";
  }
  if (
    exercise.type === "shape-sort" ||
    exercise.type === "uk-coin-match" ||
    (exercise.type === "ten-frame-count" && exercise.mode === "build-on-frame")
  ) {
    return "drag-sort";
  }
  return "tap-choice";
}

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
        lastMissed:
          ms >= prev.lastCompletedMs ? !attempt.isCorrect : prev.lastMissed,
        count: prev.count + 1,
      });
    }
  }

  return map;
}

/**
 * Deterministically composes a balanced Foundation Stage learning session from:
 *  1. Confidence warm-ups (accessible emerging or strong-mastery starter)
 *  2. Active skills below mastery threshold (scaffolded to current tier, with
 *     engine-kind diversity so Phonics, NumberLine, DragSort, Trace, and TapChoice
 *     all get exercised naturally)
 *  3. Spaced-repetition review items (due or mastered skills)
 *
 * Respects yearGroupFilter (P1, P2, or all) and filters by the learner's
 * selected theme whenever matching exercises exist.
 */
export function composeAdaptiveSession(
  options: ComposeSessionOptions
): ComposedSession {
  const now = options.now ?? new Date();
  const yearGroupFilter: YearGroupFilter = options.yearGroupFilter ?? "all";
  const selectedTheme = options.selectedTheme;
  const recentAttempts = options.recentAttempts ?? [];
  const masteryMap = new Map<MicroSkillId, SkillMasteryRecord>(
    options.masteryRecords.map((r) => [r.skillId, r])
  );
  const exerciseHistory = buildExerciseHistoryMap(recentAttempts);

  // 1. Apply year-group filter (P1, P2, or all)
  const yearPool =
    yearGroupFilter === "all"
      ? options.exercises
      : options.exercises.filter((ex) => ex.yearGroup === yearGroupFilter);
  const effectiveYearPool = yearPool.length > 0 ? yearPool : options.exercises;

  // 2. Apply theme filter when matching exercises exist
  const themedMatches =
    selectedTheme === "all"
      ? effectiveYearPool
      : effectiveYearPool.filter((ex) => ex.theme === selectedTheme);

  const fallbackUsed =
    selectedTheme !== "all" && themedMatches.length === 0;
  const pool: readonly Exercise[] =
    selectedTheme !== "all" && themedMatches.length > 0
      ? themedMatches
      : effectiveYearPool;

  const targetLength = Math.min(options.sessionLength ?? 6, pool.length);

  if (targetLength === 0) {
    return {
      items: [],
      yearGroupFilter,
      selectedTheme,
      themeMatchCount: 0,
      fallbackUsed,
      summary: { warmupCount: 0, focusCount: 0, reviewCount: 0 },
    };
  }

  const chosenIds = new Set<string>();
  const usedEngineKinds = new Set<EngineKind>();
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
    engineKind: getExerciseEngineKind(exercise),
    themeMatched:
      selectedTheme === "all" || exercise.theme === selectedTheme,
    reason,
  });

  // -------------------------------------------------------------------------
  // A. Confidence Warm-up (1 item)
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
    usedEngineKinds.add(getExerciseEngineKind(warmupPick));
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
  // B. Spaced-Repetition Review (up to 1–2 items when eligible)
  // -------------------------------------------------------------------------
  const reviewQuota = targetLength >= 5 ? 2 : targetLength >= 3 ? 1 : 0;
  const reviewCandidates = pool
    .filter((ex) => {
      if (chosenIds.has(ex.id)) return false;
      const rec = masteryMap.get(ex.skillId);
      if (!rec || rec.totalCount === 0) return false;
      return isSkillDueForReview(rec, now) || isSkillMastered(ex.skillId, rec);
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
    usedEngineKinds.add(getExerciseEngineKind(candidate));
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
  // C. Active Skills Below Mastery Threshold (with engine & skill diversity)
  // -------------------------------------------------------------------------
  const baseFocusScore = (ex: Exercise): number => {
    const rec = masteryMap.get(ex.skillId);
    const mastered = isSkillMastered(ex.skillId, rec);
    const prereqsReady = arePrerequisitesMet(ex.skillId, masteryMap);
    const desiredTier = targetDifficultyForRecord(rec);
    const tierDistance = Math.abs(
      DIFFICULTY_RANK[ex.difficulty] - DIFFICULTY_RANK[desiredTier]
    );
    const hist = exerciseHistory.get(ex.id);

    let score = 0;
    score += mastered ? 10 : 100;
    if (rec && !mastered) {
      score += 25 + (1 - rec.masteryScore) * 20;
    } else if (!rec) {
      score += prereqsReady ? 20 : 12;
    }
    score += (2 - tierDistance) * 14;
    if (hist?.lastMissed) {
      score += 48;
    } else if (!hist) {
      score += 16;
    } else {
      score -= Math.min(hist.count * 4, 16);
    }

    return score;
  };

  const workingCandidates = pool.filter((ex) => !chosenIds.has(ex.id));
  let lastSkillId: MicroSkillId | null = warmupPick?.skillId ?? null;
  const yearCounts: Record<YearGroup, number> = { P1: 0, P2: 0 };
  for (const item of [...warmupItems, ...reviewItems]) {
    yearCounts[item.exercise.yearGroup] += 1;
  }

  while (
    warmupItems.length + reviewItems.length + focusItems.length < targetLength &&
    workingCandidates.length > 0
  ) {
    // Score dynamically with engine-kind, skill-interleaving, and P1/P2 balance bonuses
    workingCandidates.sort((a, b) => {
      const aEngineBonus = usedEngineKinds.has(getExerciseEngineKind(a)) ? 0 : 24;
      const bEngineBonus = usedEngineKinds.has(getExerciseEngineKind(b)) ? 0 : 24;
      const aSkillBonus = a.skillId !== lastSkillId ? 10 : 0;
      const bSkillBonus = b.skillId !== lastSkillId ? 10 : 0;
      const aYearBonus =
        yearGroupFilter === "all" &&
        yearCounts[a.yearGroup] < yearCounts[a.yearGroup === "P1" ? "P2" : "P1"]
          ? 20
          : 0;
      const bYearBonus =
        yearGroupFilter === "all" &&
        yearCounts[b.yearGroup] < yearCounts[b.yearGroup === "P1" ? "P2" : "P1"]
          ? 20
          : 0;

      const totalA = baseFocusScore(a) + aEngineBonus + aSkillBonus + aYearBonus;
      const totalB = baseFocusScore(b) + bEngineBonus + bSkillBonus + bYearBonus;
      if (totalB !== totalA) return totalB - totalA;
      return a.id.localeCompare(b.id);
    });

    const picked = workingCandidates.shift();
    if (!picked) break;

    chosenIds.add(picked.id);
    usedEngineKinds.add(getExerciseEngineKind(picked));
    yearCounts[picked.yearGroup] += 1;
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
    yearGroupFilter,
    selectedTheme,
    themeMatchCount: themedMatches.length,
    fallbackUsed,
    summary: { warmupCount, focusCount, reviewCount },
  };
}

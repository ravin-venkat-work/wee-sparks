import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { MicroSkillId } from "@wee-sparks/curriculum-schema";
import { COMBINED_P1_PACK } from "../../packs";
import type { ExerciseAttempt, SkillMasteryRecord } from "../../db";
import { composeAdaptiveSession } from "../sessionComposer";

const NOW = new Date("2026-11-25T12:00:00.000Z");

function makeMasteredRecord(
  skillId: MicroSkillId,
  nextReviewOffsetMs: number
): SkillMasteryRecord {
  return {
    learnerId: 1,
    skillId,
    correctCount: 6,
    totalCount: 6,
    masteryScore: 0.94,
    streak: 5,
    hintAssistedCount: 0,
    retryTotal: 0,
    status: "secure",
    nextReviewAt: new Date(NOW.getTime() + nextReviewOffsetMs).toISOString(),
    lastAttemptAt: new Date(NOW.getTime() - 3 * 86_400_000).toISOString(),
    updatedAt: new Date(NOW.getTime() - 3 * 86_400_000).toISOString(),
  };
}

describe("adaptive/sessionComposer", () => {
  it("starts with a confidence warm-up and balances active focus items deterministically", () => {
    const first = composeAdaptiveSession({
      exercises: COMBINED_P1_PACK.exercises,
      masteryRecords: [],
      selectedTheme: "all",
      sessionLength: 6,
      now: NOW,
    });

    const second = composeAdaptiveSession({
      exercises: COMBINED_P1_PACK.exercises,
      masteryRecords: [],
      selectedTheme: "all",
      sessionLength: 6,
      now: NOW,
    });

    assert.equal(first.items.length, 6);
    assert.equal(first.items[0]?.slotRole, "warmup");
    assert.equal(first.summary.warmupCount, 1);
    assert.ok(first.summary.focusCount >= 4);
    assert.equal(first.fallbackUsed, false);

    // Deterministic ordering on repeated calls with identical inputs
    assert.deepEqual(
      first.items.map((i) => i.exercise.id),
      second.items.map((i) => i.exercise.id)
    );
  });

  it("includes spaced-repetition review items when a mastered skill is due", () => {
    const overdueInitial = makeMasteredRecord(
      "ccea-p1-lit-initial-satpin",
      -3_600_000 // 1 hour overdue
    );

    const session = composeAdaptiveSession({
      exercises: COMBINED_P1_PACK.exercises,
      masteryRecords: [overdueInitial],
      selectedTheme: "all",
      sessionLength: 6,
      now: NOW,
    });

    const reviewItems = session.items.filter((i) => i.slotRole === "review");
    assert.ok(reviewItems.length >= 1);
    assert.ok(
      reviewItems.some(
        (i) => i.exercise.skillId === "ccea-p1-lit-initial-satpin"
      )
    );
  });

  it("prioritises previously missed exercises for active focus reinforcement", () => {
    const missedExerciseId = "p1-exp-cvc-02";
    const recentAttempts: ExerciseAttempt[] = [
      {
        id: 1,
        learnerId: 1,
        exerciseId: missedExerciseId,
        skillId: "ccea-p1-lit-cvc-blend-satpin",
        isCorrect: false,
        attemptsCount: 2,
        retriesCount: 1,
        hintUsed: true,
        durationMs: 7000,
        completedAt: new Date(NOW.getTime() - 120_000).toISOString(),
      },
    ];

    const developingCvc: SkillMasteryRecord = {
      learnerId: 1,
      skillId: "ccea-p1-lit-cvc-blend-satpin",
      correctCount: 1,
      totalCount: 2,
      masteryScore: 0.42,
      streak: 0,
      hintAssistedCount: 1,
      retryTotal: 1,
      status: "emerging",
      nextReviewAt: new Date(NOW.getTime() + 600_000).toISOString(),
      lastAttemptAt: new Date(NOW.getTime() - 120_000).toISOString(),
      updatedAt: new Date(NOW.getTime() - 120_000).toISOString(),
    };

    const session = composeAdaptiveSession({
      exercises: COMBINED_P1_PACK.exercises,
      masteryRecords: [developingCvc],
      recentAttempts,
      selectedTheme: "all",
      sessionLength: 6,
      now: NOW,
    });

    assert.ok(
      session.items.some((item) => item.exercise.id === missedExerciseId),
      `Expected missed exercise ${missedExerciseId} to be scheduled in session`
    );
  });

  it("strictly filters to the learner's selected theme when matching exercises exist", () => {
    for (const theme of ["space", "dinosaurs", "animals", "vehicles"] as const) {
      const session = composeAdaptiveSession({
        exercises: COMBINED_P1_PACK.exercises,
        masteryRecords: [],
        selectedTheme: theme,
        sessionLength: 6,
        now: NOW,
      });

      assert.equal(session.items.length, 6);
      assert.equal(session.fallbackUsed, false);
      assert.ok(
        session.items.every(
          (item) => item.exercise.theme === theme && item.themeMatched
        ),
        `Expected all items to match theme "${theme}"`
      );
    }
  });

  it("falls back cleanly to the full pool when a selected theme has zero matching exercises", () => {
    const spaceOnlyPool = COMBINED_P1_PACK.exercises.filter(
      (ex) => ex.theme === "space"
    );

    const session = composeAdaptiveSession({
      exercises: spaceOnlyPool,
      masteryRecords: [],
      selectedTheme: "vehicles",
      sessionLength: 4,
      now: NOW,
    });

    assert.equal(session.fallbackUsed, true);
    assert.equal(session.themeMatchCount, 0);
    assert.equal(session.items.length, 4);
    assert.ok(session.items.every((item) => !item.themeMatched));
  });
});

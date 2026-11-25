import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { MicroSkillId } from "@wee-sparks/curriculum-schema";
import {
  ALL_EXERCISES,
  COMBINED_P1_PACK,
  COMBINED_P2_PACK,
  getExercisesForYearFilter,
  getSkillIdsForYearFilter,
} from "../../packs";
import type { ExerciseAttempt, SkillMasteryRecord } from "../../db";
import {
  composeAdaptiveSession,
  getExerciseEngineKind,
  type EngineKind,
} from "../sessionComposer";

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

  it("filters cleanly by yearGroupFilter (P1, P2, or all) and exercises diverse UI engines", () => {
    const p1Session = composeAdaptiveSession({
      exercises: ALL_EXERCISES,
      masteryRecords: [],
      yearGroupFilter: "P1",
      selectedTheme: "all",
      sessionLength: 6,
      now: NOW,
    });
    assert.equal(p1Session.items.length, 6);
    assert.ok(p1Session.items.every((i) => i.exercise.yearGroup === "P1"));
    const p1Engines = new Set(p1Session.items.map((i) => i.engineKind));
    assert.ok(
      p1Engines.size >= 4,
      `Expected P1 adaptive session to exercise >= 4 engines, got ${Array.from(p1Engines).join(", ")}`
    );

    const p2Session = composeAdaptiveSession({
      exercises: ALL_EXERCISES,
      masteryRecords: [],
      yearGroupFilter: "P2",
      selectedTheme: "all",
      sessionLength: 6,
      now: NOW,
    });
    assert.equal(p2Session.items.length, 6);
    assert.ok(p2Session.items.every((i) => i.exercise.yearGroup === "P2"));
    assert.ok(COMBINED_P2_PACK.exercises.length >= 20);
    const p2Engines = new Set(p2Session.items.map((i) => i.engineKind));
    assert.ok(
      p2Engines.size >= 4,
      `Expected P2 adaptive session to exercise all 4 P2 engines, got ${Array.from(p2Engines).join(", ")}`
    );

    const allSession = composeAdaptiveSession({
      exercises: ALL_EXERCISES,
      masteryRecords: [],
      yearGroupFilter: "all",
      selectedTheme: "all",
      sessionLength: 8,
      now: NOW,
    });
    assert.equal(allSession.items.length, 8);
    assert.ok(allSession.items.some((i) => i.exercise.yearGroup === "P1"));
    assert.ok(allSession.items.some((i) => i.exercise.yearGroup === "P2"));
  });

  it("handles empty exercise pools gracefully without throwing", () => {
    const emptySession = composeAdaptiveSession({
      exercises: [],
      masteryRecords: [],
      yearGroupFilter: "P1",
      selectedTheme: "space",
      sessionLength: 6,
      now: NOW,
    });

    assert.equal(emptySession.items.length, 0);
    assert.equal(emptySession.summary.warmupCount, 0);
    assert.equal(emptySession.summary.focusCount, 0);
    assert.equal(emptySession.summary.reviewCount, 0);
  });

  it("maps every exercise type across P1 and P2 packs to its expected UI engine", () => {
    const observedEngines = new Set<EngineKind>();
    for (const ex of ALL_EXERCISES) {
      const kind = getExerciseEngineKind(ex);
      observedEngines.add(kind);

      if (ex.type === "cvc-blending" || ex.type === "phoneme-segment") {
        assert.equal(kind, "phonics-builder");
      } else if (ex.type === "number-line-hop") {
        assert.equal(kind, "number-line");
      } else if (ex.type === "trace-glyph") {
        assert.equal(kind, "trace-canvas");
      } else if (
        ex.type === "shape-sort" ||
        ex.type === "uk-coin-match" ||
        (ex.type === "ten-frame-count" && ex.mode === "build-on-frame")
      ) {
        assert.equal(kind, "drag-sort");
      } else {
        assert.equal(kind, "tap-choice");
      }
    }

    assert.deepEqual(
      Array.from(observedEngines).sort(),
      [
        "drag-sort",
        "number-line",
        "phonics-builder",
        "tap-choice",
        "trace-canvas",
      ]
    );
  });

  it("filters P1 and P2 pack helpers and supports every theme in P2 sessions", () => {
    assert.equal(
      getExercisesForYearFilter("P1").length,
      COMBINED_P1_PACK.exercises.length
    );
    assert.equal(
      getExercisesForYearFilter("P2").length,
      COMBINED_P2_PACK.exercises.length
    );
    assert.equal(getExercisesForYearFilter("all").length, ALL_EXERCISES.length);
    assert.ok(getSkillIdsForYearFilter("P1").length >= 6);
    assert.ok(getSkillIdsForYearFilter("P2").length >= 5);

    for (const theme of ["space", "dinosaurs", "animals", "vehicles"] as const) {
      const p2Themed = composeAdaptiveSession({
        exercises: ALL_EXERCISES,
        masteryRecords: [],
        yearGroupFilter: "P2",
        selectedTheme: theme,
        sessionLength: 5,
        now: NOW,
      });

      assert.equal(p2Themed.items.length, 5);
      assert.equal(p2Themed.fallbackUsed, false);
      assert.ok(
        p2Themed.items.every(
          (i) => i.exercise.yearGroup === "P2" && i.exercise.theme === theme
        )
      );
    }
  });
});

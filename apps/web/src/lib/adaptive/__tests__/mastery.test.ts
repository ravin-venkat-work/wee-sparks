import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { MicroSkillId } from "@wee-sparks/curriculum-schema";
import {
  arePrerequisitesMet,
  computeAttemptQuality,
  computeNextReviewAt,
  computeNextSkillMastery,
  isSkillDueForReview,
  isSkillMastered,
} from "../mastery";
import type { SkillMasteryRecord } from "../../db";

const BASE_TIME = new Date("2026-11-25T10:00:00.000Z");

describe("adaptive/mastery", () => {
  it("scores first-try clean solves highest and penalises retries and hints deterministically", () => {
    const clean = computeAttemptQuality({
      isCorrect: true,
      retriesCount: 0,
      hintUsed: false,
    });
    const oneRetry = computeAttemptQuality({
      isCorrect: true,
      retriesCount: 1,
      hintUsed: false,
    });
    const withHint = computeAttemptQuality({
      isCorrect: true,
      retriesCount: 0,
      hintUsed: true,
    });
    const heavyScaffold = computeAttemptQuality({
      isCorrect: true,
      retriesCount: 5,
      hintUsed: true,
    });
    const incorrect = computeAttemptQuality({
      isCorrect: false,
      retriesCount: 1,
      hintUsed: false,
    });

    assert.equal(clean, 1);
    assert.equal(oneRetry, 0.82);
    assert.equal(withHint, 0.85);
    // Floor at 0.35 so scaffolded solves stay encouraging
    assert.equal(heavyScaffold, 0.35);
    assert.equal(incorrect, 0);
  });

  it("progresses a skill to secure mastery after clean attempts meeting CCEA threshold", () => {
    const skillId: MicroSkillId = "ccea-p1-lit-cvc-blend-satpin"; // minAttempts: 4, minAccuracy: 0.75
    let record: SkillMasteryRecord | undefined;

    for (let i = 0; i < 4; i += 1) {
      record = computeNextSkillMastery(record, {
        learnerId: 1,
        exerciseId: `p1-cvc-0${i + 1}`,
        skillId,
        isCorrect: true,
        retriesCount: 0,
        hintUsed: false,
        durationMs: 4200,
        now: new Date(BASE_TIME.getTime() + i * 60_000),
      });
    }

    assert.ok(record);
    assert.equal(record.totalCount, 4);
    assert.equal(record.correctCount, 4);
    assert.equal(record.streak, 4);
    assert.equal(record.status, "secure");
    assert.equal(isSkillMastered(skillId, record), true);
  });

  it("holds skill below secure when solved only with heavy retries and hints", () => {
    const skillId: MicroSkillId = "ccea-p1-num-ten-frames-1-10"; // minAttempts: 4, minAccuracy: 0.75
    let record: SkillMasteryRecord | undefined;

    for (let i = 0; i < 4; i += 1) {
      record = computeNextSkillMastery(record, {
        learnerId: 1,
        exerciseId: `p1-tf-0${i + 1}`,
        skillId,
        isCorrect: true,
        retriesCount: 2,
        hintUsed: true,
        durationMs: 8500,
        now: new Date(BASE_TIME.getTime() + i * 60_000),
      });
    }

    assert.ok(record);
    assert.equal(record.hintAssistedCount, 4);
    assert.equal(record.retryTotal, 8);
    assert.notEqual(record.status, "secure");
    assert.equal(isSkillMastered(skillId, record), false);
  });

  it("resets streak, lowers masteryScore, and schedules rapid review after an incorrect attempt", () => {
    const skillId: MicroSkillId = "ccea-p1-lit-initial-satpin";
    const prior = computeNextSkillMastery(undefined, {
      learnerId: 1,
      exerciseId: "p1-init-01",
      skillId,
      isCorrect: true,
      retriesCount: 0,
      hintUsed: false,
      durationMs: 3000,
      now: BASE_TIME,
    });

    const afterMiss = computeNextSkillMastery(prior, {
      learnerId: 1,
      exerciseId: "p1-init-02",
      skillId,
      isCorrect: false,
      retriesCount: 1,
      hintUsed: false,
      durationMs: 5000,
      now: BASE_TIME,
    });

    assert.equal(afterMiss.streak, 0);
    assert.ok(afterMiss.masteryScore < prior.masteryScore);
    const reviewDeltaMin =
      (new Date(afterMiss.nextReviewAt).getTime() - BASE_TIME.getTime()) /
      60_000;
    assert.equal(reviewDeltaMin, 10);
  });

  it("expands spaced-repetition review intervals across status and streak tiers", () => {
    const missMs =
      new Date(
        computeNextReviewAt({
          isCorrect: false,
          status: "developing",
          streak: 0,
          now: BASE_TIME,
        })
      ).getTime() - BASE_TIME.getTime();
    const emergingMs =
      new Date(
        computeNextReviewAt({
          isCorrect: true,
          status: "emerging",
          streak: 1,
          now: BASE_TIME,
        })
      ).getTime() - BASE_TIME.getTime();
    const developingMs =
      new Date(
        computeNextReviewAt({
          isCorrect: true,
          status: "developing",
          streak: 2,
          now: BASE_TIME,
        })
      ).getTime() - BASE_TIME.getTime();
    const secureS2Ms =
      new Date(
        computeNextReviewAt({
          isCorrect: true,
          status: "secure",
          streak: 2,
          now: BASE_TIME,
        })
      ).getTime() - BASE_TIME.getTime();
    const secureS3Ms =
      new Date(
        computeNextReviewAt({
          isCorrect: true,
          status: "secure",
          streak: 3,
          now: BASE_TIME,
        })
      ).getTime() - BASE_TIME.getTime();
    const secureS4Ms =
      new Date(
        computeNextReviewAt({
          isCorrect: true,
          status: "secure",
          streak: 4,
          now: BASE_TIME,
        })
      ).getTime() - BASE_TIME.getTime();

    assert.equal(missMs, 10 * 60 * 1000);
    assert.equal(emergingMs, 4 * 60 * 60 * 1000);
    assert.equal(developingMs, 24 * 60 * 60 * 1000);
    assert.equal(secureS2Ms, 3 * 24 * 60 * 60 * 1000);
    assert.equal(secureS3Ms, 7 * 24 * 60 * 60 * 1000);
    assert.equal(secureS4Ms, 14 * 24 * 60 * 60 * 1000);
  });

  it("detects overdue review records and evaluates CCEA skill prerequisites accurately", () => {
    const overdueRecord: SkillMasteryRecord = {
      learnerId: 1,
      skillId: "ccea-p1-lit-initial-satpin",
      correctCount: 6,
      totalCount: 6,
      masteryScore: 0.92,
      streak: 6,
      hintAssistedCount: 0,
      retryTotal: 0,
      status: "secure",
      nextReviewAt: new Date(BASE_TIME.getTime() - 60_000).toISOString(),
      lastAttemptAt: new Date(BASE_TIME.getTime() - 86_400_000).toISOString(),
      updatedAt: new Date(BASE_TIME.getTime() - 86_400_000).toISOString(),
    };

    const futureRecord: SkillMasteryRecord = {
      ...overdueRecord,
      nextReviewAt: new Date(BASE_TIME.getTime() + 86_400_000).toISOString(),
    };

    assert.equal(isSkillDueForReview(overdueRecord, BASE_TIME), true);
    assert.equal(isSkillDueForReview(futureRecord, BASE_TIME), false);

    // ccea-p1-lit-cvc-blend-satpin requires ccea-p1-lit-initial-satpin
    const emptyMap = new Map<MicroSkillId, SkillMasteryRecord>();
    assert.equal(
      arePrerequisitesMet("ccea-p1-lit-cvc-blend-satpin", emptyMap),
      false
    );

    const masteredMap = new Map<MicroSkillId, SkillMasteryRecord>([
      ["ccea-p1-lit-initial-satpin", overdueRecord],
    ]);
    assert.equal(
      arePrerequisitesMet("ccea-p1-lit-cvc-blend-satpin", masteredMap),
      true
    );
  });
});

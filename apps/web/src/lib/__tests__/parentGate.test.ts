import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateHoldProgress,
  generateParentChallenge,
  PARENT_GATE_HOLD_MS,
  runIfParentGateUnlocked,
  verifyParentChallengeAnswer,
} from "../parentGate";

test("generateParentChallenge produces spoken-free adult addition sums within expected bounds", () => {
  for (let i = 0; i < 200; i += 1) {
    const challenge = generateParentChallenge();
    assert.ok(
      challenge.left >= 11 && challenge.left <= 19,
      `Expected left in [11, 19], got ${challenge.left}`
    );
    assert.ok(
      challenge.right >= 6 && challenge.right <= 14,
      `Expected right in [6, 14], got ${challenge.right}`
    );
    assert.equal(challenge.answer, challenge.left + challenge.right);
    assert.equal(challenge.promptText, `${challenge.left} + ${challenge.right}`);
  }
});

test("generateParentChallenge is deterministic with an injected RNG and clamps bounds", () => {
  const minChallenge = generateParentChallenge(() => 0);
  assert.deepEqual(minChallenge, {
    left: 11,
    right: 6,
    answer: 17,
    promptText: "11 + 6",
  });

  const maxChallenge = generateParentChallenge(() => 1);
  assert.deepEqual(maxChallenge, {
    left: 19,
    right: 14,
    answer: 33,
    promptText: "19 + 14",
  });

  // Out-of-bounds RNG values still stay safely clamped
  const clampedLow = generateParentChallenge(() => -5);
  assert.equal(clampedLow.left, 11);
  assert.equal(clampedLow.right, 6);

  const clampedHigh = generateParentChallenge(() => 99);
  assert.equal(clampedHigh.left, 19);
  assert.equal(clampedHigh.right, 14);
});

test("verifyParentChallengeAnswer accepts exact answers and rejects invalid or partial inputs", () => {
  const challenge = {
    left: 12,
    right: 7,
    answer: 19,
    promptText: "12 + 7",
  };

  assert.equal(verifyParentChallengeAnswer(challenge, "19"), true);
  assert.equal(verifyParentChallengeAnswer(challenge, "  19  "), true);

  assert.equal(verifyParentChallengeAnswer(challenge, "18"), false);
  assert.equal(verifyParentChallengeAnswer(challenge, "20"), false);
  assert.equal(verifyParentChallengeAnswer(challenge, ""), false);
  assert.equal(verifyParentChallengeAnswer(challenge, "   "), false);
  assert.equal(verifyParentChallengeAnswer(challenge, "19.0"), false);
  assert.equal(verifyParentChallengeAnswer(challenge, "19a"), false);
  assert.equal(verifyParentChallengeAnswer(challenge, "-19"), false);
  assert.equal(verifyParentChallengeAnswer(challenge, "12+7"), false);
});

test("evaluateHoldProgress requires the full 3-second hold before unlocking", () => {
  const start = 10_000;

  assert.deepEqual(evaluateHoldProgress(start, start), {
    elapsedMs: 0,
    progress: 0,
    unlocked: false,
  });

  const halfway = evaluateHoldProgress(start, start + PARENT_GATE_HOLD_MS / 2);
  assert.equal(halfway.elapsedMs, 1500);
  assert.equal(halfway.progress, 0.5);
  assert.equal(halfway.unlocked, false);

  const almostDone = evaluateHoldProgress(
    start,
    start + PARENT_GATE_HOLD_MS - 1
  );
  assert.equal(almostDone.unlocked, false);
  assert.ok(almostDone.progress > 0.99 && almostDone.progress < 1);

  const exactUnlock = evaluateHoldProgress(start, start + PARENT_GATE_HOLD_MS);
  assert.deepEqual(exactUnlock, {
    elapsedMs: 3000,
    progress: 1,
    unlocked: true,
  });

  const overHeld = evaluateHoldProgress(start, start + 5000);
  assert.equal(overHeld.progress, 1);
  assert.equal(overHeld.unlocked, true);

  // Clock skew guard
  const reversed = evaluateHoldProgress(start, start - 500);
  assert.deepEqual(reversed, {
    elapsedMs: 0,
    progress: 0,
    unlocked: false,
  });
});

test("runIfParentGateUnlocked blocks printing and year-group changes until unlocked", () => {
  let printed = false;
  let activeYear: "P1" | "P2" | "all" = "P1";

  const blockedPrint = runIfParentGateUnlocked(false, () => {
    printed = true;
    return "printed";
  });
  assert.deepEqual(blockedPrint, { allowed: false });
  assert.equal(printed, false);

  const blockedYearChange = runIfParentGateUnlocked(false, () => {
    activeYear = "P2";
    return activeYear;
  });
  assert.deepEqual(blockedYearChange, { allowed: false });
  assert.equal(activeYear, "P1");

  const allowedPrint = runIfParentGateUnlocked(true, () => {
    printed = true;
    return "printed";
  });
  assert.deepEqual(allowedPrint, { allowed: true, result: "printed" });
  assert.equal(printed, true);

  const allowedYearChange = runIfParentGateUnlocked(true, () => {
    activeYear = "P2";
    return activeYear;
  });
  assert.deepEqual(allowedYearChange, { allowed: true, result: "P2" });
  assert.equal(activeYear, "P2");
});

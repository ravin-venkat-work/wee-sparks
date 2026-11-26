import test from "node:test";
import assert from "node:assert/strict";
import { ALL_EXERCISES } from "../packs";
import { composeAdaptiveSession } from "../adaptive/sessionComposer";
import {
  AUTO_ADVANCE_DELAY_MS,
  canAutoAdvance,
  canInteractionPauseAutoAdvance,
  createInitialSessionState,
  deriveMascotMood,
  HINT_PULSE_INACTIVITY_MS,
  isSkipAvailable,
  isWithinPostSolveWindow,
  POST_SOLVE_DOUBLE_TAP_WINDOW_MS,
  sessionStateReducer,
  shouldCelebrateQuest,
  shouldTrackHintInactivity,
  shouldTrackSkipInactivity,
  SKIP_UNLOCK_INACTIVITY_MS,
  SKIP_UNLOCK_RETRIES,
} from "../sessionStateMachine";

function makeSession(length = 3) {
  return composeAdaptiveSession({
    exercises: ALL_EXERCISES,
    masteryRecords: [],
    yearGroupFilter: "P1",
    selectedTheme: "all",
    sessionLength: length,
  });
}

test("state machine transitions cleanly through idle -> encourage -> correct -> advancing -> next idle -> celebrating", () => {
  const session = makeSession(2);
  let state = createInitialSessionState(session);
  assert.equal(state.screen, "welcome");
  assert.equal(state.phase, "idle");
  assert.equal(HINT_PULSE_INACTIVITY_MS, 8000);
  assert.equal(SKIP_UNLOCK_RETRIES, 3);
  assert.equal(SKIP_UNLOCK_INACTIVITY_MS, 25000);
  assert.equal(POST_SOLVE_DOUBLE_TAP_WINDOW_MS, 1000);
  assert.ok(AUTO_ADVANCE_DELAY_MS > 0 && AUTO_ADVANCE_DELAY_MS <= 1000);

  // Enter playing
  state = sessionStateReducer(state, {
    type: "START_SESSION",
    session,
    lifetimeStars: 4,
    enterPlaying: true,
  });
  assert.equal(state.screen, "playing");
  assert.equal(state.currentIndex, 0);
  assert.equal(state.phase, "idle");
  assert.equal(deriveMascotMood(state), "idle");

  // ADVANCE_STEP is blocked while current step is unsolved
  const blockedAdvance = sessionStateReducer(state, { type: "ADVANCE_STEP" });
  assert.equal(blockedAdvance.currentIndex, 0);

  // Wrong try moves to encourage and increments retries
  state = sessionStateReducer(state, { type: "RECORD_RETRY" });
  assert.equal(state.phase, "encourage");
  assert.equal(state.retriesOnCurrent, 1);
  assert.equal(deriveMascotMood(state), "encouraging");

  // Correct answer awards star, records solvedAtMs, enables auto-advance
  state = sessionStateReducer(state, { type: "RECORD_CORRECT", nowMs: 10_000 });
  assert.equal(state.phase, "correct");
  assert.equal(state.solvedAtMs, 10_000);
  assert.equal(state.earnedIndices.has(0), true);
  assert.equal(canAutoAdvance(state), true);
  assert.equal(deriveMascotMood(state), "celebrating");

  // After praise finishes, transitions into advancing then step 1
  state = sessionStateReducer(state, { type: "BEGIN_ADVANCE" });
  assert.equal(state.phase, "advancing");
  assert.equal(deriveMascotMood(state), "celebrating");

  state = sessionStateReducer(state, { type: "ADVANCE_STEP" });
  assert.equal(state.screen, "playing");
  assert.equal(state.currentIndex, 1);
  assert.equal(state.phase, "idle");
  assert.equal(state.solvedAtMs, null);
  assert.equal(state.retriesOnCurrent, 0);
  assert.equal(state.hintUsedOnCurrent, false);
  assert.equal(state.hintPulseActive, false);

  // Solving final step and advancing finishes the quest in celebrating screen
  state = sessionStateReducer(state, { type: "RECORD_CORRECT", nowMs: 20_000 });
  state = sessionStateReducer(state, { type: "BEGIN_ADVANCE" });
  state = sessionStateReducer(state, { type: "ADVANCE_STEP" });
  assert.equal(state.screen, "celebrating");
  assert.equal(state.phase, "correct");
  assert.equal(state.earnedIndices.size, 2);
});

test("gentle skip unlocks after 3 wrong tries or 25s inactivity and records no star", () => {
  const session = makeSession(2);
  let state = sessionStateReducer(createInitialSessionState(session), {
    type: "START_SESSION",
    session,
    lifetimeStars: 0,
    enterPlaying: true,
  });

  // Skip is unavailable initially and ignored if dispatched early
  assert.equal(isSkipAvailable(state), false);
  assert.equal(shouldTrackSkipInactivity(state), true);
  state = sessionStateReducer(state, { type: "SKIP_STEP" });
  assert.equal(state.currentIndex, 0);

  // 1st and 2nd wrong tries keep skip hidden
  state = sessionStateReducer(state, { type: "RECORD_RETRY" });
  state = sessionStateReducer(state, { type: "RECORD_RETRY" });
  assert.equal(state.retriesOnCurrent, 2);
  assert.equal(isSkipAvailable(state), false);

  // 3rd wrong try unlocks gentle skip
  state = sessionStateReducer(state, { type: "RECORD_RETRY" });
  assert.equal(state.retriesOnCurrent, 3);
  assert.equal(isSkipAvailable(state), true);
  assert.equal(shouldTrackSkipInactivity(state), false);

  // Skipping moves to step 1 without awarding a star for step 0
  state = sessionStateReducer(state, { type: "SKIP_STEP" });
  assert.equal(state.currentIndex, 1);
  assert.equal(state.earnedIndices.has(0), false);
  assert.equal(state.earnedIndices.size, 0);
  assert.equal(state.retriesOnCurrent, 0);
  assert.equal(isSkipAvailable(state), false);

  // On step 1, 25s inactivity also unlocks gentle skip
  state = sessionStateReducer(state, { type: "SKIP_INACTIVITY_ELAPSED" });
  assert.equal(state.skipInactivityElapsed, true);
  assert.equal(isSkipAvailable(state), true);
});

test("final celebration only happens when at least one step was solved", () => {
  const session = makeSession(2);

  // Case A: All steps skipped -> NO celebration, returns cleanly to welcome
  let allSkipped = sessionStateReducer(createInitialSessionState(session), {
    type: "START_SESSION",
    session,
    lifetimeStars: 0,
    enterPlaying: true,
  });
  assert.equal(shouldCelebrateQuest(allSkipped), false);

  allSkipped = sessionStateReducer(allSkipped, {
    type: "SKIP_INACTIVITY_ELAPSED",
  });
  allSkipped = sessionStateReducer(allSkipped, { type: "SKIP_STEP" });
  allSkipped = sessionStateReducer(allSkipped, {
    type: "SKIP_INACTIVITY_ELAPSED",
  });
  allSkipped = sessionStateReducer(allSkipped, { type: "SKIP_STEP" });
  assert.equal(allSkipped.earnedIndices.size, 0);
  assert.equal(allSkipped.screen, "welcome");

  // FINISH_QUEST with 0 earned stars also refuses to celebrate
  const forcedFinish = sessionStateReducer(
    sessionStateReducer(createInitialSessionState(session), {
      type: "START_SESSION",
      session,
      lifetimeStars: 0,
      enterPlaying: true,
    }),
    { type: "FINISH_QUEST" }
  );
  assert.equal(forcedFinish.screen, "welcome");

  // Case B: Step 0 solved, Step 1 skipped -> celebrates because >= 1 step solved
  let partialSolved = sessionStateReducer(createInitialSessionState(session), {
    type: "START_SESSION",
    session,
    lifetimeStars: 0,
    enterPlaying: true,
  });
  partialSolved = sessionStateReducer(partialSolved, {
    type: "RECORD_CORRECT",
    nowMs: 5_000,
  });
  partialSolved = sessionStateReducer(partialSolved, { type: "ADVANCE_STEP" });
  partialSolved = sessionStateReducer(partialSolved, {
    type: "SKIP_INACTIVITY_ELAPSED",
  });
  partialSolved = sessionStateReducer(partialSolved, { type: "SKIP_STEP" });
  assert.equal(partialSolved.earnedIndices.size, 1);
  assert.equal(shouldCelebrateQuest(partialSolved), true);
  assert.equal(partialSolved.screen, "celebrating");
});

test("inactivity hint pulse activates after 8s only while playing unsolved and clears on activity or hint", () => {
  const session = makeSession(2);
  let state = createInitialSessionState(session);

  assert.equal(shouldTrackHintInactivity(state), false);
  state = sessionStateReducer(state, { type: "HINT_INACTIVITY_ELAPSED" });
  assert.equal(state.hintPulseActive, false);

  state = sessionStateReducer(state, {
    type: "START_SESSION",
    session,
    lifetimeStars: 0,
    enterPlaying: true,
  });
  assert.equal(shouldTrackHintInactivity(state), true);

  state = sessionStateReducer(state, { type: "SET_SPEAKING", speaking: true });
  assert.equal(shouldTrackHintInactivity(state), false);
  state = sessionStateReducer(state, { type: "SET_SPEAKING", speaking: false });
  assert.equal(shouldTrackHintInactivity(state), true);

  state = sessionStateReducer(state, { type: "HINT_INACTIVITY_ELAPSED" });
  assert.equal(state.hintPulseActive, true);
  assert.equal(shouldTrackHintInactivity(state), false);

  state = sessionStateReducer(state, {
    type: "USER_ACTIVITY",
    source: "pointer",
  });
  assert.equal(state.hintPulseActive, false);

  state = sessionStateReducer(state, { type: "HINT_INACTIVITY_ELAPSED" });
  state = sessionStateReducer(state, { type: "USE_HINT" });
  assert.equal(state.hintPulseActive, false);
  assert.equal(state.hintUsedOnCurrent, true);
  assert.equal(state.phase, "thinking");
  assert.equal(deriveMascotMood(state), "thinking");

  state = sessionStateReducer(state, { type: "RECORD_CORRECT", nowMs: 1_000 });
  assert.equal(shouldTrackHintInactivity(state), false);
  assert.equal(isSkipAvailable(state), false);
  state = sessionStateReducer(state, { type: "HINT_INACTIVITY_ELAPSED" });
  assert.equal(state.hintPulseActive, false);
});

test("double-taps on the just-solved answer card and any tap within 1s after solving do NOT pause auto-advance", () => {
  const session = makeSession(2);
  const solvedAt = 10_000;
  let state = sessionStateReducer(createInitialSessionState(session), {
    type: "START_SESSION",
    session,
    lifetimeStars: 0,
    enterPlaying: true,
  });

  state = sessionStateReducer(state, {
    type: "RECORD_CORRECT",
    nowMs: solvedAt,
  });
  assert.equal(canAutoAdvance(state), true);
  assert.equal(isWithinPostSolveWindow(state, solvedAt + 200), true);
  assert.equal(isWithinPostSolveWindow(state, solvedAt + 999), true);
  assert.equal(isWithinPostSolveWindow(state, solvedAt + 1000), false);

  // Double-tap on answer card within 1s -> ignored
  state = sessionStateReducer(state, {
    type: "USER_ACTIVITY",
    source: "answer-card",
    nowMs: solvedAt + 250,
  });
  assert.equal(state.autoAdvancePaused, false);
  assert.equal(canAutoAdvance(state), true);

  // Pointer tap on answer card even AFTER 1s -> still never pauses auto-advance
  state = sessionStateReducer(state, {
    type: "USER_ACTIVITY",
    source: "answer-card",
    nowMs: solvedAt + 1500,
  });
  assert.equal(state.autoAdvancePaused, false);

  state = sessionStateReducer(state, {
    type: "USER_ACTIVITY",
    source: "pointer",
    nowMs: solvedAt + 1600,
  });
  assert.equal(state.autoAdvancePaused, false);

  state = sessionStateReducer(state, {
    type: "PAUSE_AUTO_ADVANCE",
    source: "answer-card",
    nowMs: solvedAt + 1700,
  });
  assert.equal(state.autoAdvancePaused, false);

  // Stray audio-replay or hint tap inside the 1s post-solve window -> ignored
  state = sessionStateReducer(state, {
    type: "PAUSE_AUTO_ADVANCE",
    source: "audio-replay",
    nowMs: solvedAt + 400,
  });
  assert.equal(state.autoAdvancePaused, false);

  state = sessionStateReducer(state, {
    type: "USE_HINT",
    nowMs: solvedAt + 600,
  });
  assert.equal(state.autoAdvancePaused, false);
  assert.equal(canAutoAdvance(state), true);

  // Auto-advance proceeds cleanly into advancing
  state = sessionStateReducer(state, { type: "BEGIN_ADVANCE" });
  assert.equal(state.phase, "advancing");
});

test("explicit audio-replay or hint taps after the 1s window pause auto-advance without blocking manual Next", () => {
  const session = makeSession(2);
  const solvedAt = 20_000;
  let state = sessionStateReducer(createInitialSessionState(session), {
    type: "START_SESSION",
    session,
    lifetimeStars: 0,
    enterPlaying: true,
  });

  state = sessionStateReducer(state, {
    type: "RECORD_CORRECT",
    nowMs: solvedAt,
  });
  assert.equal(
    canInteractionPauseAutoAdvance(state, "audio-replay", solvedAt + 1000),
    true
  );
  assert.equal(
    canInteractionPauseAutoAdvance(state, "hint", solvedAt + 1000),
    true
  );
  assert.equal(
    canInteractionPauseAutoAdvance(state, "pointer", solvedAt + 1000),
    false
  );

  // Explicit audio-replay after 1s pauses auto-advance
  state = sessionStateReducer(state, {
    type: "PAUSE_AUTO_ADVANCE",
    source: "audio-replay",
    nowMs: solvedAt + 1100,
  });
  assert.equal(state.autoAdvancePaused, true);
  assert.equal(canAutoAdvance(state), false);

  // BEGIN_ADVANCE is ignored while paused
  state = sessionStateReducer(state, { type: "BEGIN_ADVANCE" });
  assert.equal(state.phase, "correct");

  // Manual Next still advances cleanly and resets solvedAtMs / autoAdvancePaused
  state = sessionStateReducer(state, { type: "ADVANCE_STEP" });
  assert.equal(state.currentIndex, 1);
  assert.equal(state.phase, "idle");
  assert.equal(state.solvedAtMs, null);
  assert.equal(state.autoAdvancePaused, false);

  // On step 1, explicit hint tap mid-advancing (after 1s) also pauses cleanly back to correct
  state = sessionStateReducer(state, {
    type: "RECORD_CORRECT",
    nowMs: solvedAt + 5000,
  });
  state = sessionStateReducer(state, { type: "BEGIN_ADVANCE" });
  assert.equal(state.phase, "advancing");

  state = sessionStateReducer(state, {
    type: "USE_HINT",
    nowMs: solvedAt + 6500,
  });
  assert.equal(state.phase, "correct");
  assert.equal(state.autoAdvancePaused, true);

  // Retries cannot corrupt an already-solved step
  state = sessionStateReducer(state, { type: "RECORD_RETRY" });
  assert.equal(state.phase, "correct");
  assert.equal(state.retriesOnCurrent, 0);
});

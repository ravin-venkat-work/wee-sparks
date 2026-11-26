import test from "node:test";
import assert from "node:assert/strict";
import { ALL_EXERCISES } from "../packs";
import { composeAdaptiveSession } from "../adaptive/sessionComposer";
import {
  AUTO_ADVANCE_DELAY_MS,
  canAutoAdvance,
  createInitialSessionState,
  deriveMascotMood,
  HINT_PULSE_INACTIVITY_MS,
  sessionStateReducer,
  shouldTrackHintInactivity,
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

  // Wrong try moves to encourage and increments retries
  state = sessionStateReducer(state, { type: "RECORD_RETRY" });
  assert.equal(state.phase, "encourage");
  assert.equal(state.retriesOnCurrent, 1);
  assert.equal(deriveMascotMood(state), "encouraging");

  // Correct answer awards star, enables auto-advance
  state = sessionStateReducer(state, { type: "RECORD_CORRECT" });
  assert.equal(state.phase, "correct");
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
  assert.equal(state.retriesOnCurrent, 0);
  assert.equal(state.hintUsedOnCurrent, false);
  assert.equal(state.hintPulseActive, false);

  // Solving final step and advancing finishes the quest in celebrating screen
  state = sessionStateReducer(state, { type: "RECORD_CORRECT" });
  state = sessionStateReducer(state, { type: "BEGIN_ADVANCE" });
  state = sessionStateReducer(state, { type: "ADVANCE_STEP" });
  assert.equal(state.screen, "celebrating");
  assert.equal(state.phase, "correct");
  assert.equal(state.earnedIndices.size, 2);
});

test("inactivity hint pulse activates after 8s only while playing unsolved and clears on activity or hint", () => {
  const session = makeSession(2);
  let state = createInitialSessionState(session);

  // Should not track inactivity on welcome screen
  assert.equal(shouldTrackHintInactivity(state), false);
  state = sessionStateReducer(state, { type: "HINT_INACTIVITY_ELAPSED" });
  assert.equal(state.hintPulseActive, false);

  // Start playing -> inactivity tracking active
  state = sessionStateReducer(state, {
    type: "START_SESSION",
    session,
    lifetimeStars: 0,
    enterPlaying: true,
  });
  assert.equal(shouldTrackHintInactivity(state), true);

  // While speaking prompt, do not trigger pulse
  state = sessionStateReducer(state, { type: "SET_SPEAKING", speaking: true });
  assert.equal(shouldTrackHintInactivity(state), false);
  state = sessionStateReducer(state, { type: "SET_SPEAKING", speaking: false });
  assert.equal(shouldTrackHintInactivity(state), true);

  // 8s elapsed -> icon-only hint pulses gently
  state = sessionStateReducer(state, { type: "HINT_INACTIVITY_ELAPSED" });
  assert.equal(state.hintPulseActive, true);
  assert.equal(shouldTrackHintInactivity(state), false);

  // User activity resets pulse
  state = sessionStateReducer(state, { type: "USER_ACTIVITY" });
  assert.equal(state.hintPulseActive, false);

  // Pulse again, then tapping hint clears pulse and moves to thinking
  state = sessionStateReducer(state, { type: "HINT_INACTIVITY_ELAPSED" });
  assert.equal(state.hintPulseActive, true);
  state = sessionStateReducer(state, { type: "USE_HINT" });
  assert.equal(state.hintPulseActive, false);
  assert.equal(state.hintUsedOnCurrent, true);
  assert.equal(state.phase, "thinking");
  assert.equal(deriveMascotMood(state), "thinking");

  // Once solved, inactivity never activates hint pulse
  state = sessionStateReducer(state, { type: "RECORD_CORRECT" });
  assert.equal(shouldTrackHintInactivity(state), false);
  state = sessionStateReducer(state, { type: "HINT_INACTIVITY_ELAPSED" });
  assert.equal(state.hintPulseActive, false);
});

test("lingering interaction on a solved step pauses auto-advance without blocking manual Next", () => {
  const session = makeSession(2);
  let state = sessionStateReducer(createInitialSessionState(session), {
    type: "START_SESSION",
    session,
    lifetimeStars: 0,
    enterPlaying: true,
  });

  state = sessionStateReducer(state, { type: "RECORD_CORRECT" });
  assert.equal(canAutoAdvance(state), true);

  // Child taps solved card/prompt to replay and linger -> pauses auto-advance
  state = sessionStateReducer(state, { type: "USER_ACTIVITY" });
  assert.equal(state.autoAdvancePaused, true);
  assert.equal(canAutoAdvance(state), false);

  // BEGIN_ADVANCE is ignored while paused
  state = sessionStateReducer(state, { type: "BEGIN_ADVANCE" });
  assert.equal(state.phase, "correct");

  // Child can still tap the big Next button anytime to advance
  state = sessionStateReducer(state, { type: "ADVANCE_STEP" });
  assert.equal(state.currentIndex, 1);
  assert.equal(state.phase, "idle");
  assert.equal(state.autoAdvancePaused, false);
});

test("cancelling mid-advancing via USER_ACTIVITY or PAUSE_AUTO_ADVANCE returns safely to correct", () => {
  const session = makeSession(2);
  let state = sessionStateReducer(createInitialSessionState(session), {
    type: "START_SESSION",
    session,
    lifetimeStars: 0,
    enterPlaying: true,
  });

  state = sessionStateReducer(state, { type: "RECORD_CORRECT" });
  state = sessionStateReducer(state, { type: "BEGIN_ADVANCE" });
  assert.equal(state.phase, "advancing");

  state = sessionStateReducer(state, { type: "PAUSE_AUTO_ADVANCE" });
  assert.equal(state.phase, "correct");
  assert.equal(state.autoAdvancePaused, true);

  // Retries cannot corrupt an already-solved step
  state = sessionStateReducer(state, { type: "RECORD_RETRY" });
  assert.equal(state.phase, "correct");
  assert.equal(state.retriesOnCurrent, 0);
});

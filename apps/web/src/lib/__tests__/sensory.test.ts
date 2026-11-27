import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveAudioGain,
  resolveMotionReductionMode,
  resolveSpeechRate,
  resolveSpeechVolume,
  shouldConfirmSessionExit,
} from "../sensory";

describe("Calm Mode & sensory helpers", () => {
  it("switches MotionConfig reducedMotion between 'always' and 'user'", () => {
    assert.equal(resolveMotionReductionMode(true), "always");
    assert.equal(resolveMotionReductionMode(false), "user");
  });

  it("scales audio gain, speech volume, and speech rate down gently in Calm Mode", () => {
    assert.equal(resolveAudioGain(0.1, false), 0.1);
    assert.equal(resolveAudioGain(0.1, true), 0.035);
    assert.equal(resolveAudioGain(-0.2, true), 0);
    assert.equal(resolveAudioGain(2, false), 1);

    assert.equal(resolveSpeechVolume(false), 1);
    assert.equal(resolveSpeechVolume(true), 0.45);

    assert.equal(resolveSpeechRate(0.9, false), 0.9);
    assert.equal(resolveSpeechRate(0.9, true), 0.84);
    assert.equal(resolveSpeechRate(0.8, true), 0.8);
  });

  it("requires exit confirmation only during active quests or stories", () => {
    assert.equal(
      shouldConfirmSessionExit({ mode: "quest", stage: "playing" }),
      true
    );
    assert.equal(
      shouldConfirmSessionExit({ mode: "quest", stage: "celebrating" }),
      false
    );
    assert.equal(
      shouldConfirmSessionExit({ mode: "quest", stage: "welcome" }),
      false
    );
    assert.equal(
      shouldConfirmSessionExit({ mode: "story", stage: "beat" }),
      true
    );
    assert.equal(
      shouldConfirmSessionExit({ mode: "story", stage: "exercise" }),
      true
    );
    assert.equal(
      shouldConfirmSessionExit({ mode: "story", stage: "finale" }),
      false
    );
  });
});

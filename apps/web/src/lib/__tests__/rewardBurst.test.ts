import test from "node:test";
import assert from "node:assert/strict";
import {
  generateBurstParticles,
  REWARD_BURST_MAX_DURATION_S,
  resolveRewardVisualMode,
  sequenceJingleThenPraise,
} from "../rewardBurst";

test("generateBurstParticles keeps every particle strictly under 1.2s and scales up for finale", () => {
  const standard = generateBurstParticles("standard");
  const finale = generateBurstParticles("finale");

  assert.ok(standard.length >= 10);
  assert.ok(finale.length > standard.length);

  for (const particle of [...standard, ...finale]) {
    const totalDurationS = particle.delayS + particle.durationS;
    assert.ok(
      totalDurationS < 1.2 && totalDurationS <= REWARD_BURST_MAX_DURATION_S + 0.001,
      `Expected particle ${particle.id} total duration < 1.2s, got ${totalDurationS}s`
    );
    assert.ok(particle.distancePx > 0);
    assert.ok(particle.sizePx > 0);
  }
});

test("resolveRewardVisualMode switches to simple glow under prefers-reduced-motion", () => {
  assert.equal(
    resolveRewardVisualMode({
      active: false,
      isFinalStep: false,
      prefersReducedMotion: false,
    }),
    "none"
  );

  assert.equal(
    resolveRewardVisualMode({
      active: true,
      isFinalStep: false,
      prefersReducedMotion: false,
    }),
    "burst"
  );

  assert.equal(
    resolveRewardVisualMode({
      active: true,
      isFinalStep: true,
      prefersReducedMotion: false,
    }),
    "finale"
  );

  assert.equal(
    resolveRewardVisualMode({
      active: true,
      isFinalStep: false,
      prefersReducedMotion: true,
    }),
    "glow"
  );

  assert.equal(
    resolveRewardVisualMode({
      active: true,
      isFinalStep: true,
      prefersReducedMotion: true,
    }),
    "glow-finale"
  );
});

test("sequenceJingleThenPraise waits for jingle completion before speaking praise (zero overlap)", async () => {
  const events: string[] = [];

  const completed = await sequenceJingleThenPraise({
    sfxEnabled: true,
    jingleWaitMs: 660,
    isCancelled: () => false,
    playJingle: () => {
      events.push("jingle-start");
    },
    wait: async (ms) => {
      events.push(`wait-${ms}`);
    },
    playPraise: async () => {
      events.push("praise-start");
    },
  });

  assert.equal(completed, true);
  assert.deepEqual(events, ["jingle-start", "wait-660", "praise-start"]);
});

test("sequenceJingleThenPraise skips jingle wait when SFX is muted and aborts cleanly on cancel", async () => {
  const mutedEvents: string[] = [];
  const mutedResult = await sequenceJingleThenPraise({
    sfxEnabled: false,
    jingleWaitMs: 660,
    isCancelled: () => false,
    playJingle: () => {
      mutedEvents.push("jingle");
    },
    wait: async () => {
      mutedEvents.push("wait");
    },
    playPraise: async () => {
      mutedEvents.push("praise");
    },
  });

  assert.equal(mutedResult, true);
  assert.deepEqual(mutedEvents, ["praise"]);

  // Interrupt mid-jingle -> spoken praise must NOT play
  let cancelled = false;
  const cancelledEvents: string[] = [];
  const cancelledResult = await sequenceJingleThenPraise({
    sfxEnabled: true,
    jingleWaitMs: 660,
    isCancelled: () => cancelled,
    playJingle: () => {
      cancelledEvents.push("jingle");
    },
    wait: async () => {
      cancelledEvents.push("wait");
      cancelled = true;
    },
    playPraise: async () => {
      cancelledEvents.push("praise");
    },
  });

  assert.equal(cancelledResult, false);
  assert.deepEqual(cancelledEvents, ["jingle", "wait"]);
});

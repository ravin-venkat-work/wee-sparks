import test from "node:test";
import assert from "node:assert/strict";
import {
  FeedbackSchema,
  pickPraiseAudioKey,
  pickTryAgainAudioKey,
  PRAISE_AUDIO_KEYS,
  TRY_AGAIN_AUDIO_KEYS,
} from "@wee-sparks/curriculum-schema";
import {
  buildAudioAuditReport,
  buildPrioritisedRecordingList,
  extractAudioEntriesFromPacks,
  RECORDING_PRIORITY_ORDER,
} from "../audioAudit";
import { EXPECTED_AUDIO_SUBDIRS, resolveAudioUrl } from "../audioUrls";
import { ALL_CONTENT_PACKS, ALL_EXERCISES } from "../packs";

test("resolveAudioUrl maps phoneme/* and phonemes/* to /audio/phonemes/*.mp3 and others to /audio/*.mp3", () => {
  assert.equal(resolveAudioUrl("phoneme/s"), "/audio/phonemes/s.mp3");
  assert.equal(resolveAudioUrl("phonemes/sh"), "/audio/phonemes/sh.mp3");
  assert.equal(resolveAudioUrl("/phoneme/t"), "/audio/phonemes/t.mp3");
  assert.equal(resolveAudioUrl("word/sat"), "/audio/word/sat.mp3");
  assert.equal(
    resolveAudioUrl("prompt/whos-playing"),
    "/audio/prompt/whos-playing.mp3"
  );
  assert.equal(resolveAudioUrl("coin/10p"), "/audio/coin/10p.mp3");
});

test("shared feedback pools pick deterministically and FeedbackSchema rejects per-exercise feedback keys", () => {
  const praiseSet = new Set<string>(PRAISE_AUDIO_KEYS);
  const tryAgainSet = new Set<string>(TRY_AGAIN_AUDIO_KEYS);

  assert.equal(PRAISE_AUDIO_KEYS.length, 12);
  assert.equal(TRY_AGAIN_AUDIO_KEYS.length, 12);

  // Deterministic per step/exercise seed
  assert.equal(pickPraiseAudioKey("0:p1-init-01"), pickPraiseAudioKey("0:p1-init-01"));
  assert.equal(
    pickTryAgainAudioKey("0:p1-init-01:1"),
    pickTryAgainAudioKey("0:p1-init-01:1")
  );
  assert.ok(praiseSet.has(pickPraiseAudioKey("3:p2-dig-01")));
  assert.ok(tryAgainSet.has(pickTryAgainAudioKey("3:p2-dig-01:2")));

  // Valid shared pool keys pass
  assert.equal(
    FeedbackSchema.safeParse({
      correctText: "Well done!",
      correctAudioKey: "feedback/praise-04",
      encourageText: "Try again!",
      encourageAudioKey: "feedback/try-again-07",
    }).success,
    true
  );

  // Legacy per-exercise feedback keys are rejected by schema
  assert.equal(
    FeedbackSchema.safeParse({
      correctText: "Well done!",
      correctAudioKey: "feedback/correct-p1-init-01",
      encourageText: "Try again!",
      encourageAudioKey: "feedback/try-again-07",
    }).success,
    false
  );
  assert.equal(
    FeedbackSchema.safeParse({
      correctText: "Well done!",
      correctAudioKey: "feedback/praise-04",
      encourageText: "Try again!",
      encourageAudioKey: "feedback/encourage-initial-sound",
    }).success,
    false
  );

  // Every exercise across all 6 bundled packs strictly uses the shared pools
  for (const ex of ALL_EXERCISES) {
    assert.ok(
      praiseSet.has(ex.feedback.correctAudioKey),
      `Exercise ${ex.id} uses non-pool correctAudioKey ${ex.feedback.correctAudioKey}`
    );
    assert.ok(
      tryAgainSet.has(ex.feedback.encourageAudioKey),
      `Exercise ${ex.id} uses non-pool encourageAudioKey ${ex.feedback.encourageAudioKey}`
    );
  }
});

test("extractAudioEntriesFromPacks deduplicates phoneme aliases and covers all expected folders across packs", () => {
  const aliasEntries = extractAudioEntriesFromPacks(
    [
      {
        sourceName: "test-pack.json",
        data: {
          a: { audioKey: "phoneme/s", grapheme: "s" },
          b: { audioKey: "phonemes/s", grapheme: "s" },
          c: { wordAudioKey: "word/sat", targetWord: "sat" },
        },
      },
    ],
    { includeCoreUiKeys: false, includeSharedFeedbackPool: false }
  );

  assert.equal(aliasEntries.length, 2);
  assert.equal(aliasEntries[0]?.url, "/audio/phonemes/s.mp3");
  assert.equal(aliasEntries[1]?.url, "/audio/word/sat.mp3");

  // Validate against all real CCEA P1 & P2 content packs
  const packEntries = extractAudioEntriesFromPacks(
    ALL_CONTENT_PACKS.map((pack) => ({
      sourceName: pack.packId,
      data: pack,
    })),
    { includeCoreUiKeys: true, includeSharedFeedbackPool: true }
  );

  assert.ok(packEntries.length > 200, "Expected > 200 unique pack audioKeys");

  const allowedDirs = new Set<string>(EXPECTED_AUDIO_SUBDIRS);
  for (const entry of packEntries) {
    assert.ok(
      allowedDirs.has(entry.category),
      `Unexpected audio category "${entry.category}" for ${entry.audioKey}`
    );
  }

  // Shared feedback pool dramatically limits total feedback MP3s (24 shared + quest-complete = 25)
  const feedbackEntries = packEntries.filter((e) => e.category === "feedback");
  assert.equal(feedbackEntries.length, 25);
});

test("buildPrioritisedRecordingList orders tiers strictly: phonemes -> words -> numbers -> coins -> shapes -> prompts", () => {
  assert.deepEqual(RECORDING_PRIORITY_ORDER.slice(0, 6), [
    "phonemes",
    "word",
    "number",
    "coin",
    "shape",
    "prompt",
  ]);

  const entries = extractAudioEntriesFromPacks(
    [
      {
        sourceName: "mixed.json",
        data: [
          { audioKey: "prompt/p1-01", text: "Tap the sun!" },
          { audioKey: "shape/circle", label: "circle" },
          { audioKey: "coin/5p", label: "5p" },
          { audioKey: "number/3", label: "3" },
          { audioKey: "word/sat", targetWord: "sat" },
          { audioKey: "phoneme/s", grapheme: "s" },
          { audioKey: "hint/h1", text: "Listen closely." },
        ],
      },
    ],
    { includeCoreUiKeys: false, includeSharedFeedbackPool: false }
  );

  const tiers = buildPrioritisedRecordingList(entries, () => false);
  assert.deepEqual(
    tiers.map((t) => t.category),
    ["phonemes", "word", "number", "coin", "shape", "prompt", "hint"]
  );

  const report = buildAudioAuditReport(
    entries,
    (relPath) => relPath === "audio/phonemes/s.mp3"
  );
  assert.equal(report.presentCount, 1);
  assert.equal(report.missingCount, 6);
  assert.equal(report.prioritisedTiers[0]?.category, "phonemes");
  assert.equal(report.prioritisedTiers[0]?.present, 1);
  assert.equal(report.prioritisedTiers[0]?.missing, 0);
});

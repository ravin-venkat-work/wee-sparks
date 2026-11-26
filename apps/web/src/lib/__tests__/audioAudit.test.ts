import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAudioAuditReport,
  extractAudioEntriesFromPacks,
} from "../audioAudit";
import { EXPECTED_AUDIO_SUBDIRS, resolveAudioUrl } from "../audioUrls";
import { ALL_CONTENT_PACKS } from "../packs";

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
    { includeCoreUiKeys: false }
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
    { includeCoreUiKeys: true }
  );

  assert.ok(packEntries.length > 200, "Expected > 200 unique pack audioKeys");

  const allowedDirs = new Set<string>(EXPECTED_AUDIO_SUBDIRS);
  for (const entry of packEntries) {
    assert.ok(
      allowedDirs.has(entry.category),
      `Unexpected audio category "${entry.category}" for ${entry.audioKey}`
    );
  }
});

test("buildAudioAuditReport separates present vs missing MP3 files accurately by category", () => {
  const entries = extractAudioEntriesFromPacks(
    [
      {
        sourceName: "mini.json",
        data: [
          { audioKey: "phoneme/s", grapheme: "s" },
          { audioKey: "phoneme/a", grapheme: "a" },
          { audioKey: "word/sat", targetWord: "sat" },
        ],
      },
    ],
    { includeCoreUiKeys: false }
  );

  const report = buildAudioAuditReport(
    entries,
    (relPath) => relPath === "audio/phonemes/s.mp3"
  );

  assert.equal(report.totalUnique, 3);
  assert.equal(report.presentCount, 1);
  assert.equal(report.missingCount, 2);
  assert.deepEqual(report.byCategory.phonemes, {
    total: 2,
    present: 1,
    missing: 1,
  });
  assert.deepEqual(report.byCategory.word, {
    total: 1,
    present: 0,
    missing: 1,
  });
});

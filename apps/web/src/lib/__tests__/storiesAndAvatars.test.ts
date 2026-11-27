import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PRAISE_AUDIO_KEYS,
  StoryBookSchema,
  TRY_AGAIN_AUDIO_KEYS,
} from "@wee-sparks/curriculum-schema";
import {
  COMPANION_AVATARS,
  getCompanionAvatar,
  resolveCompanionAvatarId,
} from "../avatars";
import { ALL_EXERCISES } from "../packs";
import {
  getStickersByCollection,
  STICKER_CATALOG,
  STICKER_COLLECTIONS,
} from "../stickers";
import { ALL_STORY_BOOKS, getStoriesForYearFilter } from "../stories";

describe("Companion avatar catalog & resolution", () => {
  it("exposes 6 unique animated companion avatars", () => {
    assert.equal(COMPANION_AVATARS.length, 6);
    const ids = new Set(COMPANION_AVATARS.map((a) => a.id));
    assert.equal(ids.size, 6);
    assert.equal(getCompanionAvatar("pip").name, "Pip");
    assert.equal(getCompanionAvatar("rusty").tagline, "Belfast Bus");
  });

  it("resolves explicit avatarId and migrates legacy emoji-only profiles cleanly", () => {
    assert.equal(resolveCompanionAvatarId({ avatarId: "nova" }), "nova");
    assert.equal(resolveCompanionAvatarId({ avatarEmoji: "🦕" }), "rex");
    assert.equal(resolveCompanionAvatarId({ avatarEmoji: "🚌" }), "rusty");
    assert.equal(resolveCompanionAvatarId({ avatarEmoji: "🐧" }), "pip");
    assert.equal(resolveCompanionAvatarId({ avatarEmoji: "🐼" }), "pippa");
    assert.equal(resolveCompanionAvatarId({ avatarEmoji: "🦁" }), "sparky");
    assert.equal(resolveCompanionAvatarId(null), "sparky");
    assert.equal(resolveCompanionAvatarId({ avatarId: "unknown" }), "sparky");
  });
});

describe("Expanded SVG sticker collection", () => {
  it("contains 28 unique stickers across 4 themed collections", () => {
    assert.equal(STICKER_CATALOG.length, 28);
    assert.equal(STICKER_COLLECTIONS.length, 4);

    const ids = new Set(STICKER_CATALOG.map((s) => s.id));
    assert.equal(ids.size, 28);

    for (const col of STICKER_COLLECTIONS) {
      const inCol = getStickersByCollection(col.id);
      assert.equal(inCol.length, 7);
    }
    assert.equal(getStickersByCollection("all").length, 28);
  });
});

describe("Offline CCEA story packs & guided tracing expansion", () => {
  it("loads 4 validated P1 and P2 story adventures with shared feedback audio pools", () => {
    assert.equal(ALL_STORY_BOOKS.length, 4);
    const p1Stories = ALL_STORY_BOOKS.filter((s) => s.yearGroup === "P1");
    const p2Stories = ALL_STORY_BOOKS.filter((s) => s.yearGroup === "P2");
    assert.equal(p1Stories.length, 2);
    assert.equal(p2Stories.length, 2);

    const praiseSet = new Set<string>(PRAISE_AUDIO_KEYS);
    const tryAgainSet = new Set<string>(TRY_AGAIN_AUDIO_KEYS);

    for (const story of ALL_STORY_BOOKS) {
      assert.equal(story.locale, "en-GB-NI");
      assert.ok(story.chapters.length >= 2);
      for (const chapter of story.chapters) {
        assert.equal(chapter.exercise.yearGroup, story.yearGroup);
        assert.ok(praiseSet.has(chapter.exercise.feedback.correctAudioKey));
        assert.ok(tryAgainSet.has(chapter.exercise.feedback.encourageAudioKey));
      }
    }
  });

  it("includes expanded P1 and P2 guided tracing exercises in the exercise pool", () => {
    const traceExercises = ALL_EXERCISES.filter((e) => e.type === "trace-glyph");
    const p1Traces = traceExercises.filter((e) => e.yearGroup === "P1");
    const p2Traces = traceExercises.filter((e) => e.yearGroup === "P2");

    assert.ok(p1Traces.length >= 12);
    assert.ok(p2Traces.length >= 6);
  });

  it("prioritises matching yearGroup first when filtering stories", () => {
    const p1Ordered = getStoriesForYearFilter("P1");
    assert.equal(p1Ordered[0]?.yearGroup, "P1");
    assert.equal(p1Ordered[1]?.yearGroup, "P1");

    const p2Ordered = getStoriesForYearFilter("P2");
    assert.equal(p2Ordered[0]?.yearGroup, "P2");
    assert.equal(p2Ordered[1]?.yearGroup, "P2");

    const allStories = getStoriesForYearFilter("all");
    assert.equal(allStories.length, ALL_STORY_BOOKS.length);
  });

  it("rejects stories whose chapter exercise yearGroup mismatches story yearGroup", () => {
    const baseStory = structuredClone(ALL_STORY_BOOKS[0]!);
    const p2Story = ALL_STORY_BOOKS.find((s) => s.yearGroup === "P2")!;
    const p2Exercise = structuredClone(p2Story.chapters[0]!.exercise);
    baseStory.chapters[0]!.exercise = p2Exercise;

    const parsed = StoryBookSchema.safeParse(baseStory);
    assert.equal(parsed.success, false);
  });
});

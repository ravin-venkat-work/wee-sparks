import { z } from "zod";
import {
  AudioKeySchema,
  CompanionAvatarIdSchema,
  ThemeSchema,
  YearGroupSchema,
} from "./enums";
import { ExerciseSchema } from "./exercises";

export const StoryIllustrationKeySchema = z.enum([
  "causeway-shore",
  "starlight-launch",
  "dino-valley",
  "rathlin-harbour",
  "belfast-depot",
  "treasure-cove",
]);
export type StoryIllustrationKey = z.infer<typeof StoryIllustrationKeySchema>;

export const StoryCompanionMoodSchema = z.enum([
  "idle",
  "thinking",
  "encouraging",
  "celebrating",
]);
export type StoryCompanionMood = z.infer<typeof StoryCompanionMoodSchema>;

/**
 * A single illustrated story beat paired with a CCEA Foundation Stage
 * literacy or numeracy interactive challenge.
 */
export const StoryChapterSchema = z.object({
  chapterId: z
    .string()
    .regex(/^[a-z0-9-]+$/, "chapterId must be lowercase kebab-case"),
  title: z.string().min(3),
  illustration: StoryIllustrationKeySchema,
  narrationText: z.string().min(12),
  narrationAudioKey: AudioKeySchema,
  companionMood: StoryCompanionMoodSchema.default("idle"),
  visualCueEmoji: z.string().min(1).max(8).optional(),
  exercise: ExerciseSchema,
});
export type StoryChapter = z.infer<typeof StoryChapterSchema>;

/**
 * An offline-authored illustrated story adventure weaving short narrative beats
 * with CCEA Foundation Stage (P1–P2) literacy and numeracy prompts.
 */
export const StoryBookSchema = z
  .object({
    storyId: z
      .string()
      .regex(/^[a-z0-9-]+$/, "storyId must be lowercase kebab-case"),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, "version must be semver"),
    title: z.string().min(4),
    subtitle: z.string().min(6),
    yearGroup: YearGroupSchema,
    theme: ThemeSchema,
    locale: z.literal("en-GB-NI"),
    coverIllustration: StoryIllustrationKeySchema,
    companionAvatarId: CompanionAvatarIdSchema,
    offlineParentTip: z.string().min(12),
    chapters: z.array(StoryChapterSchema).min(2).max(6),
    finaleTitle: z.string().min(4),
    finaleText: z.string().min(12),
    finaleAudioKey: AudioKeySchema,
    finaleIllustration: StoryIllustrationKeySchema,
    rewardBadgeTitle: z.string().min(3),
  })
  .superRefine((story, ctx) => {
    const seenChapterIds = new Set<string>();
    const seenExerciseIds = new Set<string>();

    story.chapters.forEach((chapter, idx) => {
      if (seenChapterIds.has(chapter.chapterId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["chapters", idx, "chapterId"],
          message: `Duplicate chapterId "${chapter.chapterId}" in story "${story.storyId}"`,
        });
      }
      seenChapterIds.add(chapter.chapterId);

      if (seenExerciseIds.has(chapter.exercise.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["chapters", idx, "exercise", "id"],
          message: `Duplicate exercise id "${chapter.exercise.id}" in story "${story.storyId}"`,
        });
      }
      seenExerciseIds.add(chapter.exercise.id);

      if (chapter.exercise.yearGroup !== story.yearGroup) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["chapters", idx, "exercise", "yearGroup"],
          message: `Chapter exercise yearGroup (${chapter.exercise.yearGroup}) must match story yearGroup (${story.yearGroup})`,
        });
      }
    });
  });

export type StoryBook = z.infer<typeof StoryBookSchema>;

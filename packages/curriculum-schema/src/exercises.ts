import { z } from "zod";
import {
  AudioKeySchema,
  DifficultyTierSchema,
  LINGUISTIC_PHONICS_SATPIN,
  SubjectSchema,
  ThemeSchema,
  UkCoinSchema,
  YearGroupSchema,
} from "./enums";
import { getMicroSkillById, MicroSkillIdSchema } from "./catalog";

/**
 * Interactive card/tile used across touch-first Foundation Stage exercises
 * (minimum 64px x 64px in UI, always paired with an offline audioKey).
 */
export const InteractiveCardSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  displayText: z.string().min(1).optional(),
  emoji: z.string().min(1).optional(),
  audioKey: AudioKeySchema,
});
export type InteractiveCard = z.infer<typeof InteractiveCardSchema>;

export const PromptSchema = z.object({
  text: z.string().min(1),
  audioKey: AudioKeySchema,
  visualCueEmoji: z.string().min(1).optional(),
});
export type Prompt = z.infer<typeof PromptSchema>;

export const FeedbackSchema = z.object({
  correctText: z.string().min(1),
  correctAudioKey: AudioKeySchema,
  encourageText: z.string().min(1),
  encourageAudioKey: AudioKeySchema,
});
export type Feedback = z.infer<typeof FeedbackSchema>;

export const HintSchema = z.object({
  text: z.string().min(1),
  audioKey: AudioKeySchema,
});
export type Hint = z.infer<typeof HintSchema>;

export const CounterVisualSchema = z.object({
  emoji: z.string().min(1),
  label: z.string().min(1),
  colour: z.string().min(1),
  audioKey: AudioKeySchema,
});
export type CounterVisual = z.infer<typeof CounterVisualSchema>;

const BaseExerciseFields = {
  id: z.string().min(1),
  skillId: MicroSkillIdSchema,
  yearGroup: YearGroupSchema,
  subject: SubjectSchema,
  theme: ThemeSchema,
  difficulty: DifficultyTierSchema,
  prompt: PromptSchema,
  hint: HintSchema,
  feedback: FeedbackSchema,
  offlineParentTip: z.string().min(15).optional(),
};

/**
 * 1. Initial Sound Match (Linguistic Phonics Stage 1)
 * Supports two modes:
 *  - "sound-to-picture": Hear a phoneme (e.g. /s/) and tap the matching picture card.
 *  - "picture-to-grapheme": See & hear a stimulus word (e.g. ant) and tap the starting letter.
 */
export const InitialSoundMatchExerciseSchema = z.object({
  ...BaseExerciseFields,
  type: z.literal("initial-sound-match"),
  mode: z.enum(["sound-to-picture", "picture-to-grapheme"]),
  targetSound: z.string().min(1).max(3),
  targetSoundAudioKey: AudioKeySchema,
  stimulus: z.object({
    label: z.string().min(1),
    emoji: z.string().min(1),
    audioKey: AudioKeySchema,
  }),
  options: z.array(InteractiveCardSchema).min(3).max(4),
  correctOptionId: z.string().min(1),
});
export type InitialSoundMatchExercise = z.infer<
  typeof InitialSoundMatchExerciseSchema
>;

/**
 * 2. CVC Blending (Linguistic Phonics Stage 1)
 * Child taps each of the 3 phoneme tiles to hear and blend the word, then selects the matching picture card.
 */
export const PhonemeTileSchema = z.object({
  grapheme: z.string().min(1).max(3),
  audioKey: AudioKeySchema,
});
export type PhonemeTile = z.infer<typeof PhonemeTileSchema>;

export const CvcBlendingExerciseSchema = z.object({
  ...BaseExerciseFields,
  type: z.literal("cvc-blending"),
  targetWord: z.string().min(3).max(5),
  wordAudioKey: AudioKeySchema,
  phonemes: z.array(PhonemeTileSchema).length(3),
  options: z.array(InteractiveCardSchema).min(3).max(4),
  correctOptionId: z.string().min(1),
});
export type CvcBlendingExercise = z.infer<typeof CvcBlendingExerciseSchema>;

/**
 * 3. Phoneme Segmenting (Elkonin Sound Boxes)
 */
export const PhonemeSegmentExerciseSchema = z.object({
  ...BaseExerciseFields,
  type: z.literal("phoneme-segment"),
  targetWord: z.string().min(2).max(6),
  wordAudioKey: AudioKeySchema,
  stimulusEmoji: z.string().min(1),
  correctGraphemes: z.array(z.string().min(1)).min(2).max(5),
  tileBank: z
    .array(
      z.object({
        id: z.string().min(1),
        grapheme: z.string().min(1),
        audioKey: AudioKeySchema,
      })
    )
    .min(3)
    .max(8),
});
export type PhonemeSegmentExercise = z.infer<
  typeof PhonemeSegmentExerciseSchema
>;

/**
 * 3b. High-Frequency Word Recognition (CCEA P1–P2 sight/context words)
 */
export const HighFrequencyWordExerciseSchema = z.object({
  ...BaseExerciseFields,
  type: z.literal("high-frequency-word"),
  targetWord: z.string().min(1).max(12),
  targetWordAudioKey: AudioKeySchema,
  contextSentence: z.string().min(3),
  contextAudioKey: AudioKeySchema,
  stimulusEmoji: z.string().min(1),
  options: z.array(InteractiveCardSchema).min(3).max(4),
  correctOptionId: z.string().min(1),
});
export type HighFrequencyWordExercise = z.infer<
  typeof HighFrequencyWordExerciseSchema
>;

/**
 * 3c. Guided Letter / Numeral Tracing Canvas with Anti-Reversal Cues
 */
export const TracePointSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});
export type TracePoint = z.infer<typeof TracePointSchema>;

export const TraceGlyphExerciseSchema = z.object({
  ...BaseExerciseFields,
  type: z.literal("trace-glyph"),
  glyph: z.string().min(1).max(2),
  glyphKind: z.enum(["letter", "numeral"]),
  glyphAudioKey: AudioKeySchema,
  antiReversalCue: z.string().min(5),
  antiReversalAudioKey: AudioKeySchema,
  startPoint: TracePointSchema,
  checkpoints: z.array(TracePointSchema).min(3).max(12),
  strokeGuidePath: z.string().min(4),
  requiredCoverage: z.number().min(0.6).max(1).default(0.8),
});
export type TraceGlyphExercise = z.infer<typeof TraceGlyphExerciseSchema>;

/**
 * 4. Ten-Frame Count & Build (CCEA Numeracy 1–10 and 11–20)
 * Supports:
 *  - "count-to-numeral": Counters are shown on the Ten-Frame; child subitises/counts and taps the matching numeral.
 *  - "build-on-frame": Child taps empty Ten-Frame cells to add counters until reaching targetNumber.
 */
export const TenFrameCountExerciseSchema = z.object({
  ...BaseExerciseFields,
  type: z.literal("ten-frame-count"),
  mode: z.enum(["count-to-numeral", "build-on-frame"]),
  frameSize: z.union([z.literal(10), z.literal(20)]).default(10),
  targetNumber: z.number().int().min(1).max(20),
  initialCounters: z.number().int().min(0).max(20),
  counterVisual: CounterVisualSchema,
  options: z.array(InteractiveCardSchema).min(3).max(4).optional(),
  correctOptionId: z.string().min(1).optional(),
});
export type TenFrameCountExercise = z.infer<typeof TenFrameCountExerciseSchema>;

/**
 * 4b. Number Line Hop (CCEA Numeracy 0–10 & 0–20)
 */
export const NumberLineHopExerciseSchema = z.object({
  ...BaseExerciseFields,
  type: z.literal("number-line-hop"),
  min: z.number().int().min(0).max(10).default(0),
  max: z.union([z.literal(10), z.literal(20)]).default(10),
  startNumber: z.number().int().min(0).max(20),
  operation: z.enum(["add", "subtract", "count-to"]),
  hops: z.number().int().min(1).max(10),
  targetNumber: z.number().int().min(0).max(20),
  hopperVisual: z.object({
    emoji: z.string().min(1),
    label: z.string().min(1),
    audioKey: AudioKeySchema,
  }),
});
export type NumberLineHopExercise = z.infer<typeof NumberLineHopExerciseSchema>;

/**
 * 5. Number Bonds (Make 5, Make 10, Part-Whole)
 */
export const NumberBondExerciseSchema = z.object({
  ...BaseExerciseFields,
  type: z.literal("number-bond"),
  whole: z.number().int().min(2).max(20),
  givenPart: z.number().int().min(0).max(20),
  missingPart: z.number().int().min(0).max(20),
  counterVisual: CounterVisualSchema,
  options: z.array(InteractiveCardSchema).min(3).max(4),
  correctOptionId: z.string().min(1),
});
export type NumberBondExercise = z.infer<typeof NumberBondExerciseSchema>;

/**
 * 6. UK Coin Match (1p, 2p, 5p, 10p, 20p)
 */
export const UkCoinMatchExerciseSchema = z.object({
  ...BaseExerciseFields,
  type: z.literal("uk-coin-match"),
  targetPence: z.number().int().min(1).max(50),
  coinsShown: z.array(UkCoinSchema).min(1),
  options: z.array(InteractiveCardSchema).min(3).max(4),
  correctOptionId: z.string().min(1),
});
export type UkCoinMatchExercise = z.infer<typeof UkCoinMatchExerciseSchema>;

/**
 * 7. Shape Sort (2D & 3D Shapes)
 */
export const ShapeSortExerciseSchema = z.object({
  ...BaseExerciseFields,
  type: z.literal("shape-sort"),
  targetShape: z.enum([
    "circle",
    "square",
    "triangle",
    "rectangle",
    "cube",
    "sphere",
    "cylinder",
    "cone",
  ]),
  options: z.array(InteractiveCardSchema).min(3).max(4),
  correctOptionId: z.string().min(1),
});
export type ShapeSortExercise = z.infer<typeof ShapeSortExerciseSchema>;

const RawExerciseUnionSchema = z.discriminatedUnion("type", [
  InitialSoundMatchExerciseSchema,
  CvcBlendingExerciseSchema,
  PhonemeSegmentExerciseSchema,
  HighFrequencyWordExerciseSchema,
  TraceGlyphExerciseSchema,
  TenFrameCountExerciseSchema,
  NumberLineHopExerciseSchema,
  NumberBondExerciseSchema,
  UkCoinMatchExerciseSchema,
  ShapeSortExerciseSchema,
]);

const SATPIN_SET = new Set<string>(LINGUISTIC_PHONICS_SATPIN);

/**
 * Validated Exercise schema enforcing curriculum alignment, interactive option
 * consistency, and NI Linguistic Phonics stage constraints.
 */
export const ExerciseSchema = RawExerciseUnionSchema.superRefine(
  (exercise, ctx) => {
    const skill = getMicroSkillById(exercise.skillId);

    if (exercise.yearGroup !== skill.yearGroup) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["yearGroup"],
        message: `Exercise yearGroup (${exercise.yearGroup}) does not match skill ${skill.id} (${skill.yearGroup})`,
      });
    }

    if (exercise.subject !== skill.subject) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subject"],
        message: `Exercise subject (${exercise.subject}) does not match skill ${skill.id} (${skill.subject})`,
      });
    }

    // Validate option IDs & correctOptionId where applicable
    if ("options" in exercise && exercise.options) {
      const optionIds = new Set<string>();
      for (const option of exercise.options) {
        if (optionIds.has(option.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["options"],
            message: `Duplicate option id "${option.id}" in exercise "${exercise.id}"`,
          });
        }
        optionIds.add(option.id);
      }

      if (
        "correctOptionId" in exercise &&
        exercise.correctOptionId &&
        !optionIds.has(exercise.correctOptionId)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["correctOptionId"],
          message: `correctOptionId "${exercise.correctOptionId}" not found in options`,
        });
      }
    }

    // Enforce Linguistic Phonics Stage 1 (s, a, t, p, i, n) purity
    if (
      exercise.type === "initial-sound-match" &&
      exercise.skillId === "ccea-p1-lit-initial-satpin"
    ) {
      if (!SATPIN_SET.has(exercise.targetSound.toLowerCase())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetSound"],
          message: `targetSound "${exercise.targetSound}" must be one of s, a, t, p, i, n for ${exercise.skillId}`,
        });
      }
    }

    if (exercise.type === "cvc-blending") {
      const joined = exercise.phonemes
        .map((p) => p.grapheme.toLowerCase())
        .join("");
      if (joined !== exercise.targetWord.toLowerCase()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phonemes"],
          message: `Phonemes ("${joined}") must join to match targetWord ("${exercise.targetWord}")`,
        });
      }

      if (exercise.skillId === "ccea-p1-lit-cvc-blend-satpin") {
        for (const p of exercise.phonemes) {
          if (!SATPIN_SET.has(p.grapheme.toLowerCase())) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["phonemes"],
              message: `Grapheme "${p.grapheme}" is outside Stage 1 starter set (s, a, t, p, i, n)`,
            });
          }
        }
      }
    }

    if (exercise.type === "ten-frame-count") {
      if (exercise.targetNumber > exercise.frameSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetNumber"],
          message: `targetNumber (${exercise.targetNumber}) cannot exceed frameSize (${exercise.frameSize})`,
        });
      }

      if (exercise.mode === "count-to-numeral") {
        if (exercise.initialCounters !== exercise.targetNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["initialCounters"],
            message: `count-to-numeral mode requires initialCounters (${exercise.initialCounters}) === targetNumber (${exercise.targetNumber})`,
          });
        }
        if (!exercise.options || !exercise.correctOptionId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["options"],
            message:
              "count-to-numeral mode requires options and correctOptionId",
          });
        }
      }

      if (
        exercise.mode === "build-on-frame" &&
        exercise.initialCounters >= exercise.targetNumber
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["initialCounters"],
          message:
            "build-on-frame mode requires initialCounters to be strictly less than targetNumber",
        });
      }
    }

    if (exercise.type === "number-line-hop") {
      if (
        exercise.startNumber < exercise.min ||
        exercise.startNumber > exercise.max
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startNumber"],
          message: `startNumber (${exercise.startNumber}) must lie within [${exercise.min}, ${exercise.max}]`,
        });
      }
      if (
        exercise.targetNumber < exercise.min ||
        exercise.targetNumber > exercise.max
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetNumber"],
          message: `targetNumber (${exercise.targetNumber}) must lie within [${exercise.min}, ${exercise.max}]`,
        });
      }
      if (
        exercise.operation === "add" &&
        exercise.startNumber + exercise.hops !== exercise.targetNumber
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetNumber"],
          message: `For add, startNumber (${exercise.startNumber}) + hops (${exercise.hops}) must equal targetNumber (${exercise.targetNumber})`,
        });
      }
      if (
        exercise.operation === "subtract" &&
        exercise.startNumber - exercise.hops !== exercise.targetNumber
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetNumber"],
          message: `For subtract, startNumber (${exercise.startNumber}) - hops (${exercise.hops}) must equal targetNumber (${exercise.targetNumber})`,
        });
      }
    }

    if (exercise.type === "number-bond") {
      if (exercise.givenPart + exercise.missingPart !== exercise.whole) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["missingPart"],
          message: `givenPart (${exercise.givenPart}) + missingPart (${exercise.missingPart}) must equal whole (${exercise.whole})`,
        });
      }
    }
  }
);
export type Exercise = z.infer<typeof ExerciseSchema>;

/**
 * Validated offline JSON Exercise Content Pack stored in apps/web/src/data/packs/.
 */
export const ContentPackSchema = z
  .object({
    packId: z.string().min(1),
    version: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/, "version must follow semver (e.g. 1.0.0)"),
    title: z.string().min(1),
    description: z.string().min(1),
    yearGroup: YearGroupSchema,
    locale: z.literal("en-GB-NI"),
    skillIds: z.array(MicroSkillIdSchema).min(1),
    exercises: z.array(ExerciseSchema).min(1),
  })
  .superRefine((pack, ctx) => {
    const seenExerciseIds = new Set<string>();
    const declaredSkills = new Set(pack.skillIds);

    pack.exercises.forEach((exercise, idx) => {
      if (seenExerciseIds.has(exercise.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["exercises", idx, "id"],
          message: `Duplicate exercise id "${exercise.id}" in pack "${pack.packId}"`,
        });
      }
      seenExerciseIds.add(exercise.id);

      if (!declaredSkills.has(exercise.skillId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["exercises", idx, "skillId"],
          message: `Exercise skillId "${exercise.skillId}" must be declared in pack.skillIds`,
        });
      }

      if (exercise.yearGroup !== pack.yearGroup) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["exercises", idx, "yearGroup"],
          message: `Exercise yearGroup (${exercise.yearGroup}) does not match pack yearGroup (${pack.yearGroup})`,
        });
      }
    });
  });
export type ContentPack = z.infer<typeof ContentPackSchema>;

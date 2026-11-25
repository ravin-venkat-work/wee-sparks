import { z } from "zod";

/**
 * Northern Ireland CCEA Foundation Stage year groups (ages 4–6).
 */
export const YearGroupSchema = z.enum(["P1", "P2"]);
export type YearGroup = z.infer<typeof YearGroupSchema>;

/**
 * Primary curriculum areas covered by Wee Sparks.
 */
export const SubjectSchema = z.enum(["literacy", "numeracy"]);
export type Subject = z.infer<typeof SubjectSchema>;

/**
 * CCEA Foundation Stage curriculum strands, aligned with Northern Ireland
 * Linguistic Phonics (Stages 1–4) and practical Foundation Stage numeracy.
 */
export const CurriculumStrandSchema = z.enum([
  // Language & Literacy (NI Linguistic Phonics)
  "linguistic-phonics-stage-1",
  "linguistic-phonics-stage-2",
  "linguistic-phonics-stage-3-4",
  "high-frequency-words",
  "reading-comprehension",
  // Mathematics & Numeracy
  "number-sense",
  "addition-subtraction",
  "measures-money",
  "shape-space",
]);
export type CurriculumStrand = z.infer<typeof CurriculumStrandSchema>;

/**
 * Kid-friendly themes for Foundation Stage exercises.
 */
export const ThemeSchema = z.enum([
  "space",
  "dinosaurs",
  "animals",
  "vehicles",
]);
export type Theme = z.infer<typeof ThemeSchema>;

/**
 * Progression tiers for adaptive scaffolding within a micro-skill.
 */
export const DifficultyTierSchema = z.enum([
  "emerging",
  "developing",
  "secure",
]);
export type DifficultyTier = z.infer<typeof DifficultyTierSchema>;

/**
 * Supported interactive exercise templates.
 */
export const ExerciseTypeSchema = z.enum([
  "initial-sound-match",
  "cvc-blending",
  "phoneme-segment",
  "high-frequency-word",
  "trace-glyph",
  "ten-frame-count",
  "number-line-hop",
  "number-bond",
  "uk-coin-match",
  "shape-sort",
]);
export type ExerciseType = z.infer<typeof ExerciseTypeSchema>;

/**
 * Northern Ireland / UK coin denominations used in Foundation Stage numeracy.
 */
export const UkCoinSchema = z.enum(["1p", "2p", "5p", "10p", "20p"]);
export type UkCoin = z.infer<typeof UkCoinSchema>;

/**
 * Deterministic offline audio asset key (e.g. "phoneme/s", "word/sat", "prompt/p1-init-01").
 * Every prompt and interactive card must provide an audioKey for audio-first UX.
 */
export const AudioKeySchema = z
  .string()
  .min(1, "audioKey is required")
  .regex(
    /^[a-z0-9][a-z0-9._/-]*$/,
    "audioKey must use lowercase letters, digits, '/', '.', '_' or '-'"
  );
export type AudioKey = z.infer<typeof AudioKeySchema>;

/**
 * Northern Ireland Linguistic Phonics Stage 1, Set 1 target graphemes.
 */
export const LINGUISTIC_PHONICS_SATPIN = ["s", "a", "t", "p", "i", "n"] as const;

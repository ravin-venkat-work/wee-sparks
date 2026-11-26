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

/**
 * Shared offline praise audio pool (12 reusable Northern Ireland voice clips)
 * replacing per-exercise feedback recordings.
 */
export const PRAISE_AUDIO_KEYS = [
  "feedback/praise-01",
  "feedback/praise-02",
  "feedback/praise-03",
  "feedback/praise-04",
  "feedback/praise-05",
  "feedback/praise-06",
  "feedback/praise-07",
  "feedback/praise-08",
  "feedback/praise-09",
  "feedback/praise-10",
  "feedback/praise-11",
  "feedback/praise-12",
] as const;
export const PraiseAudioKeySchema = z.enum(PRAISE_AUDIO_KEYS);
export type PraiseAudioKey = z.infer<typeof PraiseAudioKeySchema>;

/**
 * Shared offline gentle encouragement pool (12 reusable Northern Ireland clips).
 */
export const TRY_AGAIN_AUDIO_KEYS = [
  "feedback/try-again-01",
  "feedback/try-again-02",
  "feedback/try-again-03",
  "feedback/try-again-04",
  "feedback/try-again-05",
  "feedback/try-again-06",
  "feedback/try-again-07",
  "feedback/try-again-08",
  "feedback/try-again-09",
  "feedback/try-again-10",
  "feedback/try-again-11",
  "feedback/try-again-12",
] as const;
export const TryAgainAudioKeySchema = z.enum(TRY_AGAIN_AUDIO_KEYS);
export type TryAgainAudioKey = z.infer<typeof TryAgainAudioKeySchema>;

export const PRAISE_AUDIO_SCRIPTS: Record<PraiseAudioKey, string> = {
  "feedback/praise-01": "Brilliant work! You got it!",
  "feedback/praise-02": "Super star! Well done!",
  "feedback/praise-03": "Spot on! That was fantastic!",
  "feedback/praise-04": "Lovely job! You are flying!",
  "feedback/praise-05": "Clever thinking! Way to go!",
  "feedback/praise-06": "Awesome! Sparky is so proud of you!",
  "feedback/praise-07": "Wonderful! You nailed that one!",
  "feedback/praise-08": "Dead on! Great listening!",
  "feedback/praise-09": "Hooray! Another shiny star for you!",
  "feedback/praise-10": "Terrific! Keep up the great work!",
  "feedback/praise-11": "Marvellous! You figured it out!",
  "feedback/praise-12": "Top marks! What a bright spark!",
};

export const TRY_AGAIN_AUDIO_SCRIPTS: Record<TryAgainAudioKey, string> = {
  "feedback/try-again-01": "Good try! Have another go!",
  "feedback/try-again-02": "Almost there! Listen again and try one more time.",
  "feedback/try-again-03": "Nice try! You can do it!",
  "feedback/try-again-04": "Not quite yet — have another look!",
  "feedback/try-again-05": "Keep going! Tap the speaker if you want to hear it again.",
  "feedback/try-again-06": "So close! Give it another try!",
  "feedback/try-again-07": "Great effort! Let's try that one again.",
  "feedback/try-again-08": "Ooh, nearly! Have another go!",
  "feedback/try-again-09": "Don't worry — mistakes help our brains grow! Try again.",
  "feedback/try-again-10": "Have another wee think and tap again!",
  "feedback/try-again-11": "Almost! You're doing brilliantly — try another one.",
  "feedback/try-again-12": "Good effort! Listen closely and have one more go.",
};

function deterministicHash(seed: string | number): number {
  const str = String(seed);
  let hash = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

export function pickPraiseAudioKey(seed: string | number): PraiseAudioKey {
  return PRAISE_AUDIO_KEYS[deterministicHash(seed) % PRAISE_AUDIO_KEYS.length]!;
}

export function pickTryAgainAudioKey(seed: string | number): TryAgainAudioKey {
  return TRY_AGAIN_AUDIO_KEYS[
    deterministicHash(seed) % TRY_AGAIN_AUDIO_KEYS.length
  ]!;
}

/**
 * @wee-sparks/curriculum-schema
 *
 * Canonical Zod schemas and CCEA Foundation Stage (P1–P2) micro-skill catalog
 * for Northern Ireland Linguistic Phonics and practical numeracy.
 *
 * Key exports:
 * - Enums: YearGroupSchema, SubjectSchema, CurriculumStrandSchema, ThemeSchema,
 *   DifficultyTierSchema, ExerciseTypeSchema, UkCoinSchema, AudioKeySchema
 * - Catalog: CCEA_MICRO_SKILL_IDS, MicroSkillIdSchema, MicroSkillSchema,
 *   CCEA_FOUNDATION_SKILLS, getMicroSkillById, getSkillsByYearGroup, getSkillsBySubject
 * - Exercises & Packs: InteractiveCardSchema, ExerciseSchema, ContentPackSchema,
 *   plus individual exercise schemas (InitialSoundMatchExerciseSchema,
 *   CvcBlendingExerciseSchema, PhonemeSegmentExerciseSchema,
 *   TenFrameCountExerciseSchema, NumberBondExerciseSchema,
 *   UkCoinMatchExerciseSchema, ShapeSortExerciseSchema).
 */

export * from "./enums";
export * from "./catalog";
export * from "./exercises";

/**
 * @wee-sparks/curriculum-schema
 *
 * Canonical Zod schemas and CCEA Foundation Stage (P1–P2, ages 4–6)
 * micro-skill catalog for Northern Ireland Linguistic Phonics and practical
 * numeracy.
 *
 * Scope: CCEA Foundation Stage (P1–P2) Language & Literacy and Mathematics &
 * Numeracy only. Key Stage 1 (P3+) and the remaining CCEA Areas of Learning
 * are intentionally out of scope (see CURRICULUM_MAP.md).
 *
 * Key exports:
 * - Enums: YearGroupSchema, SubjectSchema, CurriculumStrandSchema, ThemeSchema,
 *   DifficultyTierSchema, ExerciseTypeSchema, UkCoinSchema, AudioKeySchema
 * - Catalog: CCEA_MICRO_SKILL_IDS, MicroSkillIdSchema, MicroSkillSchema,
 *   CCEA_FOUNDATION_SKILLS, getMicroSkillById, getSkillsByYearGroup, getSkillsBySubject
 * - Exercises & Packs: InteractiveCardSchema, ExerciseSchema, ContentPackSchema,
 *   plus all 10 individual exercise schemas.
 */

export * from "./enums";
export * from "./catalog";
export * from "./exercises";

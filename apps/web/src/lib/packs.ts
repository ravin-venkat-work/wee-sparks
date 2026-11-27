import {
  ContentPackSchema,
  type ContentPack,
  type Exercise,
  type MicroSkillId,
  type YearGroup,
} from "@wee-sparks/curriculum-schema";
import p1StarterPackRaw from "@/data/packs/p1-starter-pack.json";
import p1ThemedExpansionRaw from "@/data/packs/p1-themed-expansion.json";
import p1CoreExpansionRaw from "@/data/packs/p1-core-expansion.json";
import p1MasteryExpansionRaw from "@/data/packs/p1-mastery-expansion.json";
import p1TracingStudioRaw from "@/data/packs/p1-tracing-studio.json";
import p2FoundationPackRaw from "@/data/packs/p2-foundation-pack.json";
import p2MasteryExpansionRaw from "@/data/packs/p2-mastery-expansion.json";
import p2TracingStudioRaw from "@/data/packs/p2-tracing-studio.json";
import type { YearGroupFilter } from "@/lib/adaptive/sessionComposer";

/**
 * Validated offline JSON content packs (Primary 1 & Primary 2).
 * Parsing at module load guarantees strict Zod schema conformance.
 */
export const P1_STARTER_PACK: ContentPack =
  ContentPackSchema.parse(p1StarterPackRaw);

export const P1_THEMED_EXPANSION_PACK: ContentPack =
  ContentPackSchema.parse(p1ThemedExpansionRaw);

export const P1_CORE_EXPANSION_PACK: ContentPack =
  ContentPackSchema.parse(p1CoreExpansionRaw);

export const P1_MASTERY_EXPANSION_PACK: ContentPack =
  ContentPackSchema.parse(p1MasteryExpansionRaw);

export const P1_TRACING_STUDIO_PACK: ContentPack =
  ContentPackSchema.parse(p1TracingStudioRaw);

export const P2_FOUNDATION_PACK: ContentPack =
  ContentPackSchema.parse(p2FoundationPackRaw);

export const P2_MASTERY_EXPANSION_PACK: ContentPack =
  ContentPackSchema.parse(p2MasteryExpansionRaw);

export const P2_TRACING_STUDIO_PACK: ContentPack =
  ContentPackSchema.parse(p2TracingStudioRaw);

export const ALL_CONTENT_PACKS: readonly ContentPack[] = [
  P1_STARTER_PACK,
  P1_THEMED_EXPANSION_PACK,
  P1_CORE_EXPANSION_PACK,
  P1_MASTERY_EXPANSION_PACK,
  P1_TRACING_STUDIO_PACK,
  P2_FOUNDATION_PACK,
  P2_MASTERY_EXPANSION_PACK,
  P2_TRACING_STUDIO_PACK,
];

/**
 * Merges all validated content packs for a given CCEA year group into a single
 * deduplicated pool.
 */
export function getCombinedPackForYear(yearGroup: YearGroup): ContentPack {
  const matchingPacks = ALL_CONTENT_PACKS.filter(
    (pack) => pack.yearGroup === yearGroup
  );

  const skillIdSet = new Set<MicroSkillId>();
  const seenExerciseIds = new Set<string>();
  const exercises: Exercise[] = [];

  for (const pack of matchingPacks) {
    for (const skillId of pack.skillIds) {
      skillIdSet.add(skillId);
    }
    for (const ex of pack.exercises) {
      if (!seenExerciseIds.has(ex.id)) {
        seenExerciseIds.add(ex.id);
        exercises.push(ex);
      }
    }
  }

  return ContentPackSchema.parse({
    packId: `ccea-${yearGroup.toLowerCase()}-combined`,
    version: "1.0.0",
    title: `CCEA ${yearGroup} Complete Quest Pool`,
    description: `Combined validated ${yearGroup} exercise pool across ${matchingPacks.length} offline packs.`,
    yearGroup,
    locale: "en-GB-NI",
    skillIds: Array.from(skillIdSet),
    exercises,
  });
}

export const COMBINED_P1_PACK: ContentPack = getCombinedPackForYear("P1");
export const COMBINED_P2_PACK: ContentPack = getCombinedPackForYear("P2");

export const ALL_EXERCISES: readonly Exercise[] = [
  ...COMBINED_P1_PACK.exercises,
  ...COMBINED_P2_PACK.exercises,
];

export const ALL_PACK_SKILL_IDS: readonly MicroSkillId[] = Array.from(
  new Set<MicroSkillId>([
    ...COMBINED_P1_PACK.skillIds,
    ...COMBINED_P2_PACK.skillIds,
  ])
);

export function getExercisesForYearFilter(
  filter: YearGroupFilter
): readonly Exercise[] {
  if (filter === "P1") return COMBINED_P1_PACK.exercises;
  if (filter === "P2") return COMBINED_P2_PACK.exercises;
  return ALL_EXERCISES;
}

export function getSkillIdsForYearFilter(
  filter: YearGroupFilter
): readonly MicroSkillId[] {
  if (filter === "P1") return COMBINED_P1_PACK.skillIds;
  if (filter === "P2") return COMBINED_P2_PACK.skillIds;
  return ALL_PACK_SKILL_IDS;
}

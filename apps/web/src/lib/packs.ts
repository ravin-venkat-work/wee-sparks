import {
  ContentPackSchema,
  type ContentPack,
} from "@wee-sparks/curriculum-schema";
import p1StarterPackRaw from "@/data/packs/p1-starter-pack.json";

/**
 * Validated starter pack for CCEA Foundation Stage Primary 1.
 * Parsing at module load guarantees strict Zod schema conformance.
 */
export const P1_STARTER_PACK: ContentPack =
  ContentPackSchema.parse(p1StarterPackRaw);

export const ALL_CONTENT_PACKS: readonly ContentPack[] = [P1_STARTER_PACK];

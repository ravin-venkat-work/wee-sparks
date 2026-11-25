import type { Theme } from "@wee-sparks/curriculum-schema";
import { db, type UnlockedStickerRecord } from "./db";

export interface StickerDefinition {
  id: string;
  title: string;
  artKey: string;
  theme: Theme;
  starsRequired: number;
  cheerText: string;
}

/**
 * Collectible Northern Ireland & kid-friendly stickers unlocked locally in Dexie
 * as children earn stars (space rockets, dinosaurs, Rathlin puffins, diggers, etc.).
 */
export const STICKER_CATALOG: readonly StickerDefinition[] = [
  {
    id: "space-rocket",
    title: "Astro Rocket",
    artKey: "rocket",
    theme: "space",
    starsRequired: 2,
    cheerText: "Blast off! You unlocked the Astro Rocket sticker!",
  },
  {
    id: "ni-puffin",
    title: "Rathlin Puffin",
    artKey: "puffin",
    theme: "animals",
    starsRequired: 4,
    cheerText: "Flap flap! You unlocked the Northern Ireland Rathlin Puffin!",
  },
  {
    id: "dino-stego",
    title: "Dino Explorer",
    artKey: "dinosaur-egg",
    theme: "dinosaurs",
    starsRequired: 6,
    cheerText: "Roar! You hatched the Dino Explorer sticker!",
  },
  {
    id: "vehicle-digger",
    title: "Mighty Digger",
    artKey: "digger",
    theme: "vehicles",
    starsRequired: 9,
    cheerText: "Scoop scoop! You unlocked the Mighty Digger sticker!",
  },
  {
    id: "ni-causeway",
    title: "Causeway Hero",
    artKey: "causeway",
    theme: "space",
    starsRequired: 12,
    cheerText: "Giant's Causeway Champion! Stepping-stone master!",
  },
  {
    id: "dino-trex",
    title: "Friendly T-Rex",
    artKey: "t-rex",
    theme: "dinosaurs",
    starsRequired: 16,
    cheerText: "Stomp! Friendly T-Rex joined your sticker chest!",
  },
  {
    id: "vehicle-bus",
    title: "Belfast Red Bus",
    artKey: "bus",
    theme: "vehicles",
    starsRequired: 20,
    cheerText: "Beep beep! You unlocked the Belfast Red Bus sticker!",
  },
  {
    id: "animal-frog",
    title: "Pond Hopper",
    artKey: "frog",
    theme: "animals",
    starsRequired: 25,
    cheerText: "Ribbit! Pond Hopper jumped into your chest!",
  },
  {
    id: "space-sat",
    title: "Space Satellite",
    artKey: "satellite",
    theme: "space",
    starsRequired: 30,
    cheerText: "Beep boop! Space Satellite is orbiting your sticker wall!",
  },
  {
    id: "animal-ship",
    title: "Harbour Ship",
    artKey: "ship",
    theme: "vehicles",
    starsRequired: 36,
    cheerText: "Ahoy! You unlocked the Harbour Ship sticker!",
  },
];

export async function getLearnerLifetimeStars(
  learnerId: number
): Promise<number> {
  const attempts = await db.attempts
    .where("learnerId")
    .equals(learnerId)
    .toArray();
  return attempts.filter((a) => a.isCorrect).length;
}

/**
 * Unlocks any stickers earned by the learner's lifetime stars (plus guarantees
 * at least one fresh sticker when completing a quest if any remain locked).
 */
export async function syncAndUnlockStickers(
  learnerId: number,
  bonusQuestUnlock = false
): Promise<{
  totalStars: number;
  allUnlocked: UnlockedStickerRecord[];
  newlyUnlocked: StickerDefinition[];
}> {
  const [totalStars, existing] = await Promise.all([
    getLearnerLifetimeStars(learnerId),
    db.stickers.where("learnerId").equals(learnerId).toArray(),
  ]);

  const unlockedSet = new Set(existing.map((s) => s.stickerId));
  const newlyUnlocked: StickerDefinition[] = [];
  const nowIso = new Date().toISOString();

  for (const sticker of STICKER_CATALOG) {
    if (!unlockedSet.has(sticker.id) && totalStars >= sticker.starsRequired) {
      await db.stickers.put({
        learnerId,
        stickerId: sticker.id,
        unlockedAt: nowIso,
      });
      unlockedSet.add(sticker.id);
      newlyUnlocked.push(sticker);
    }
  }

  // Reward completing a full quest with the next locked sticker if none triggered by star threshold
  if (bonusQuestUnlock && newlyUnlocked.length === 0) {
    const nextLocked = STICKER_CATALOG.find((s) => !unlockedSet.has(s.id));
    if (nextLocked) {
      await db.stickers.put({
        learnerId,
        stickerId: nextLocked.id,
        unlockedAt: nowIso,
      });
      unlockedSet.add(nextLocked.id);
      newlyUnlocked.push(nextLocked);
    }
  }

  const allUnlocked = await db.stickers
    .where("learnerId")
    .equals(learnerId)
    .toArray();

  return { totalStars, allUnlocked, newlyUnlocked };
}

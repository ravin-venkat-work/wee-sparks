import type { Theme } from "@wee-sparks/curriculum-schema";
import { db, type UnlockedStickerRecord } from "./db";

export type StickerCollectionId =
  | "northern-ireland"
  | "space"
  | "dinosaurs"
  | "wheels-and-wild";

export interface StickerCollectionMeta {
  id: StickerCollectionId;
  label: string;
  accentClass: string;
}

export const STICKER_COLLECTIONS: readonly StickerCollectionMeta[] = [
  {
    id: "northern-ireland",
    label: "Causeway & NI",
    accentClass: "bg-sky-100 text-sky-950 ring-sky-300",
  },
  {
    id: "space",
    label: "Space & Stars",
    accentClass: "bg-indigo-100 text-indigo-950 ring-indigo-300",
  },
  {
    id: "dinosaurs",
    label: "Dino Glens",
    accentClass: "bg-emerald-100 text-emerald-950 ring-emerald-300",
  },
  {
    id: "wheels-and-wild",
    label: "Wheels & Wild",
    accentClass: "bg-amber-100 text-amber-950 ring-amber-300",
  },
];

export interface StickerDefinition {
  id: string;
  title: string;
  artKey: string;
  theme: Theme;
  collection: StickerCollectionId;
  starsRequired: number;
  cheerText: string;
}

/**
 * 28 collectible Northern Ireland & themed SVG stickers unlocked locally in Dexie
 * across four collections (7 per collection) as children earn stars.
 */
export const STICKER_CATALOG: readonly StickerDefinition[] = [
  {
    id: "space-rocket",
    title: "Astro Rocket",
    artKey: "rocket",
    theme: "space",
    collection: "space",
    starsRequired: 2,
    cheerText: "Blast off! You unlocked the Astro Rocket sticker!",
  },
  {
    id: "ni-puffin",
    title: "Rathlin Puffin",
    artKey: "puffin",
    theme: "animals",
    collection: "northern-ireland",
    starsRequired: 4,
    cheerText: "Flap flap! You unlocked the Northern Ireland Rathlin Puffin!",
  },
  {
    id: "dino-stego",
    title: "Dino Explorer",
    artKey: "dinosaur-egg",
    theme: "dinosaurs",
    collection: "dinosaurs",
    starsRequired: 6,
    cheerText: "Roar! You hatched the Dino Explorer sticker!",
  },
  {
    id: "vehicle-digger",
    title: "Mighty Digger",
    artKey: "digger",
    theme: "vehicles",
    collection: "wheels-and-wild",
    starsRequired: 9,
    cheerText: "Scoop scoop! You unlocked the Mighty Digger sticker!",
  },
  {
    id: "ni-causeway",
    title: "Causeway Hero",
    artKey: "causeway",
    theme: "space",
    collection: "northern-ireland",
    starsRequired: 12,
    cheerText: "Giant's Causeway Champion! Stepping-stone master!",
  },
  {
    id: "space-planet",
    title: "Ringed Planet",
    artKey: "planet",
    theme: "space",
    collection: "space",
    starsRequired: 14,
    cheerText: "Whoosh! You discovered the Ringed Planet sticker!",
  },
  {
    id: "dino-trex",
    title: "Friendly T-Rex",
    artKey: "t-rex",
    theme: "dinosaurs",
    collection: "dinosaurs",
    starsRequired: 16,
    cheerText: "Stomp! Friendly T-Rex joined your sticker chest!",
  },
  {
    id: "vehicle-train",
    title: "Steam Express",
    artKey: "train",
    theme: "vehicles",
    collection: "wheels-and-wild",
    starsRequired: 18,
    cheerText: "Choo choo! The Steam Express pulled into your chest!",
  },
  {
    id: "vehicle-bus",
    title: "Belfast Red Bus",
    artKey: "bus",
    theme: "vehicles",
    collection: "northern-ireland",
    starsRequired: 20,
    cheerText: "Beep beep! You unlocked the Belfast Red Bus sticker!",
  },
  {
    id: "space-moon",
    title: "Crescent Moon",
    artKey: "moon",
    theme: "space",
    collection: "space",
    starsRequired: 22,
    cheerText: "Twinkle! Crescent Moon is shining in your sticker chest!",
  },
  {
    id: "animal-frog",
    title: "Pond Hopper",
    artKey: "frog",
    theme: "animals",
    collection: "wheels-and-wild",
    starsRequired: 25,
    cheerText: "Ribbit! Pond Hopper jumped into your chest!",
  },
  {
    id: "dino-triceratops",
    title: "Three-Horn Trike",
    artKey: "triceratops",
    theme: "dinosaurs",
    collection: "dinosaurs",
    starsRequired: 27,
    cheerText: "Awesome! Three-Horn Trike stomped into your collection!",
  },
  {
    id: "vehicle-tractor",
    title: "Glens Tractor",
    artKey: "tractor",
    theme: "vehicles",
    collection: "wheels-and-wild",
    starsRequired: 29,
    cheerText: "Chug chug! The Glens Tractor is ready to roll!",
  },
  {
    id: "space-sat",
    title: "Space Satellite",
    artKey: "satellite",
    theme: "space",
    collection: "space",
    starsRequired: 32,
    cheerText: "Beep boop! Space Satellite is orbiting your sticker wall!",
  },
  {
    id: "dino-bronto",
    title: "Tall Bronto",
    artKey: "bronto",
    theme: "dinosaurs",
    collection: "dinosaurs",
    starsRequired: 34,
    cheerText: "Stretch high! Tall Bronto reached your sticker wall!",
  },
  {
    id: "animal-ship",
    title: "Harbour Ship",
    artKey: "ship",
    theme: "vehicles",
    collection: "northern-ireland",
    starsRequired: 36,
    cheerText: "Ahoy! You unlocked the Harbour Ship sticker!",
  },
  {
    id: "space-comet",
    title: "Zooming Comet",
    artKey: "comet",
    theme: "space",
    collection: "space",
    starsRequired: 39,
    cheerText: "Zoom! A bright comet streaked into your chest!",
  },
  {
    id: "animal-bee",
    title: "Bumble Bee",
    artKey: "bee",
    theme: "animals",
    collection: "wheels-and-wild",
    starsRequired: 42,
    cheerText: "Buzz buzz! Busy Bumble Bee joined your stickers!",
  },
  {
    id: "ni-lighthouse",
    title: "Rathlin Lighthouse",
    artKey: "lighthouse",
    theme: "vehicles",
    collection: "northern-ireland",
    starsRequired: 45,
    cheerText: "Shining bright! You unlocked Rathlin Lighthouse!",
  },
  {
    id: "dino-fossil",
    title: "Spiral Fossil",
    artKey: "fossil",
    theme: "dinosaurs",
    collection: "dinosaurs",
    starsRequired: 48,
    cheerText: "Super discovery! You dug up the Spiral Fossil!",
  },
  {
    id: "space-astronaut",
    title: "Star Explorer",
    artKey: "astronaut",
    theme: "space",
    collection: "space",
    starsRequired: 51,
    cheerText: "Floating high! Star Explorer joined your team!",
  },
  {
    id: "animal-hedgehog",
    title: "Garden Hedgehog",
    artKey: "hedgehog",
    theme: "animals",
    collection: "wheels-and-wild",
    starsRequired: 54,
    cheerText: "Sniff sniff! Friendly Garden Hedgehog curled up in your chest!",
  },
  {
    id: "ni-shamrock",
    title: "Emerald Shamrock",
    artKey: "shamrock",
    theme: "animals",
    collection: "northern-ireland",
    starsRequired: 57,
    cheerText: "Lucky star! Emerald Shamrock bloomed on your wall!",
  },
  {
    id: "dino-volcano",
    title: "Spark Volcano",
    artKey: "volcano",
    theme: "dinosaurs",
    collection: "dinosaurs",
    starsRequired: 60,
    cheerText: "Boom! Spark Volcano erupted with golden stars!",
  },
  {
    id: "space-telescope",
    title: "Sky Telescope",
    artKey: "telescope",
    theme: "space",
    collection: "space",
    starsRequired: 64,
    cheerText: "Star gazer! Look through your new Sky Telescope!",
  },
  {
    id: "animal-owl",
    title: "Wise Night Owl",
    artKey: "owl",
    theme: "animals",
    collection: "wheels-and-wild",
    starsRequired: 68,
    cheerText: "Too-wit too-woo! Wise Night Owl flew into your chest!",
  },
  {
    id: "ni-rainbow",
    title: "Glens Rainbow",
    artKey: "rainbow",
    theme: "animals",
    collection: "northern-ireland",
    starsRequired: 72,
    cheerText: "Colourful champion! You unlocked the Glens Rainbow!",
  },
  {
    id: "dino-footprint",
    title: "Giant Footprint",
    artKey: "footprint",
    theme: "dinosaurs",
    collection: "dinosaurs",
    starsRequired: 76,
    cheerText: "Mega explorer! You found the Giant Dino Footprint!",
  },
];

export function getStickersByCollection(
  collection: StickerCollectionId | "all"
): readonly StickerDefinition[] {
  if (collection === "all") return STICKER_CATALOG;
  return STICKER_CATALOG.filter((s) => s.collection === collection);
}

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

/**
 * Parent-gated sticker management: manually unlock or lock a sticker for a child
 * (for example, rewarding an offline real-world parent-tip activity).
 */
export async function toggleStickerForLearner(
  learnerId: number,
  stickerId: string
): Promise<boolean> {
  const existing = await db.stickers.get([learnerId, stickerId]);
  if (existing) {
    await db.stickers.delete([learnerId, stickerId]);
    return false;
  }

  await db.stickers.put({
    learnerId,
    stickerId,
    unlockedAt: new Date().toISOString(),
  });
  return true;
}

/**
 * Parent-gated sticker reset for a specific child profile.
 */
export async function resetStickersForLearner(learnerId: number): Promise<void> {
  await db.stickers.where("learnerId").equals(learnerId).delete();
}

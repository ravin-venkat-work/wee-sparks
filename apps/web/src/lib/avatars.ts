import type { CompanionAvatarId } from "@wee-sparks/curriculum-schema";

export interface CompanionAvatarDefinition {
  id: CompanionAvatarId;
  name: string;
  tagline: string;
  emoji: string;
  badgeBgClass: string;
  ringClass: string;
}

export const COMPANION_AVATARS: readonly CompanionAvatarDefinition[] = [
  {
    id: "sparky",
    name: "Sparky",
    tagline: "Causeway Fox",
    emoji: "🦊",
    badgeBgClass: "bg-amber-100",
    ringClass: "ring-amber-300",
  },
  {
    id: "pip",
    name: "Pip",
    tagline: "Rathlin Puffin",
    emoji: "🐧",
    badgeBgClass: "bg-sky-100",
    ringClass: "ring-sky-300",
  },
  {
    id: "rex",
    name: "Rex",
    tagline: "Friendly Dino",
    emoji: "🦕",
    badgeBgClass: "bg-emerald-100",
    ringClass: "ring-emerald-300",
  },
  {
    id: "nova",
    name: "Nova",
    tagline: "Space Bot",
    emoji: "🚀",
    badgeBgClass: "bg-indigo-100",
    ringClass: "ring-indigo-300",
  },
  {
    id: "pippa",
    name: "Pippa",
    tagline: "Panda Cub",
    emoji: "🐼",
    badgeBgClass: "bg-teal-100",
    ringClass: "ring-teal-300",
  },
  {
    id: "rusty",
    name: "Rusty",
    tagline: "Belfast Bus",
    emoji: "🚌",
    badgeBgClass: "bg-rose-100",
    ringClass: "ring-rose-300",
  },
];

const AVATAR_BY_ID = new Map<CompanionAvatarId, CompanionAvatarDefinition>(
  COMPANION_AVATARS.map((a) => [a.id, a])
);

const EMOJI_TO_AVATAR_ID: Record<string, CompanionAvatarId> = {
  "🦊": "sparky",
  "🦁": "sparky",
  "🐧": "pip",
  "🦕": "rex",
  "🚀": "nova",
  "🐼": "pippa",
  "🚌": "rusty",
};

export function getCompanionAvatar(
  id: CompanionAvatarId
): CompanionAvatarDefinition {
  return AVATAR_BY_ID.get(id) ?? COMPANION_AVATARS[0]!;
}

/**
 * Resolves a learner profile's companion avatar ID, preserving backward
 * compatibility with existing Dexie profiles that only stored `avatarEmoji`.
 */
export function resolveCompanionAvatarId(
  profile?: { avatarId?: CompanionAvatarId | string; avatarEmoji?: string } | null
): CompanionAvatarId {
  if (
    profile?.avatarId &&
    AVATAR_BY_ID.has(profile.avatarId as CompanionAvatarId)
  ) {
    return profile.avatarId as CompanionAvatarId;
  }
  if (profile?.avatarEmoji && EMOJI_TO_AVATAR_ID[profile.avatarEmoji]) {
    return EMOJI_TO_AVATAR_ID[profile.avatarEmoji]!;
  }
  return "sparky";
}

/**
 * Single source of truth for resolving an exercise/UI audioKey to its
 * static public URL under `apps/web/public/audio/`.
 *
 * Both `phoneme/<slug>` and `phonemes/<slug>` map to `/audio/phonemes/<slug>.mp3`.
 * All other keys `<category>/<slug>` map to `/audio/<category>/<slug>.mp3`.
 */
export function resolveAudioUrl(audioKey: string): string {
  const normalized = audioKey.replace(/^\/+/, "");
  if (normalized.startsWith("phoneme/")) {
    const slug = normalized.slice("phoneme/".length);
    return `/audio/phonemes/${slug}.mp3`;
  }
  if (normalized.startsWith("phonemes/")) {
    const slug = normalized.slice("phonemes/".length);
    return `/audio/phonemes/${slug}.mp3`;
  }
  return `/audio/${normalized}.mp3`;
}

/**
 * Expected subfolders under `apps/web/public/audio/` matching `resolveAudioUrl`.
 */
export const EXPECTED_AUDIO_SUBDIRS = [
  "coin",
  "feedback",
  "hint",
  "number",
  "object",
  "phonemes",
  "prompt",
  "sentence",
  "shape",
  "sticker",
  "word",
] as const;

/**
 * Core non-pack UI audioKeys used by WelcomeScreen, CelebrationStickerChest,
 * and KidSessionPlayer.
 */
export const CORE_UI_AUDIO_KEYS: ReadonlyArray<{
  audioKey: string;
  scriptText: string;
}> = [
  {
    audioKey: "prompt/whos-playing",
    scriptText: "Who's playing? Tap your picture to start!",
  },
  {
    audioKey: "feedback/quest-complete",
    scriptText: "Amazing work! You earned stars for your sticker chest!",
  },
  {
    audioKey: "sticker/locked",
    scriptText: "Earn more stars to unlock this sticker!",
  },
];

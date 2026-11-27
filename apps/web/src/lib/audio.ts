"use client";

import {
  isSfxEnabled,
  playSfx,
  setMusicEnabled,
  SFX_DURATION_MS,
} from "./sfx";
import {
  PRAISE_GAP_AFTER_JINGLE_MS,
  sequenceJingleThenPraise,
} from "./rewardBurst";
import { resolveAudioUrl } from "./audioUrls";
import {
  isCalmModeEnabled,
  resolveSpeechRate,
  resolveSpeechVolume,
  setCalmModeEnabled as persistCalmModeEnabled,
  subscribeCalmMode,
} from "./sensory";

export { resolveAudioUrl } from "./audioUrls";
export { isCalmModeEnabled, subscribeCalmMode } from "./sensory";

/**
 * Toggles Calm Mode (quieter audio + reduced motion). Automatically switches
 * off ambient music when turned on so the room stays quiet.
 */
export function setCalmModeEnabled(enabled: boolean): void {
  persistCalmModeEnabled(enabled);
  if (enabled) {
    setMusicEnabled(false);
  }
}
export {
  isMusicEnabled,
  isSfxEnabled,
  playSfx,
  setMusicEnabled,
  setSfxEnabled,
  SFX_DURATION_MS,
  stopAmbientMusic,
  type SfxCue,
} from "./sfx";

/**
 * Northern Ireland Linguistic Phonics phonetic approximations for Web Speech API
 * fallback when static MP3 files are not yet bundled.
 *
 * IMPORTANT: Isolated single letters (e.g. "s", "a", "t") must NEVER be sent
 * directly to speechSynthesis, otherwise browsers speak letter names ("ess",
 * "ay", "tee") instead of phonemes.
 */
const PHONEME_FALLBACK_MAP: Record<string, string> = {
  // Stage 1 starter set (s, a, t, p, i, n)
  s: "ssss",
  a: "aah",
  t: "tuh",
  p: "puh",
  i: "ih",
  n: "nnnn",
  // Stage 1 remaining single-letter graphemes
  c: "kuh",
  k: "kuh",
  e: "eh",
  h: "huh",
  r: "rrrr",
  m: "mmmm",
  d: "duh",
  g: "guh",
  o: "aw",
  u: "uh",
  l: "llll",
  f: "ffff",
  b: "buh",
  j: "juh",
  v: "vvvv",
  w: "wuh",
  x: "ks",
  y: "yuh",
  z: "zzzz",
  q: "kwuh",
  // Stage 3/4 digraphs & double letters
  sh: "shhh",
  ch: "chuh",
  th: "thhh",
  ng: "ngg",
  ff: "ffff",
  ll: "llll",
  ss: "ssss",
  zz: "zzzz",
  ee: "eee",
  ea: "eee",
  ai: "ay",
  ay: "ay",
  oa: "oh",
  ow: "oh",
};

/**
 * Cached HTMLAudioElement pool keyed by resolved static asset URL.
 * Tracks URLs that failed to load so subsequent taps fall back immediately.
 */
const audioElementCache = new Map<string, HTMLAudioElement>();
const missingAudioUrls = new Set<string>();

let activeHtmlAudio: HTMLAudioElement | null = null;
let activeCancelCallback: (() => void) | null = null;
let playbackGeneration = 0;

function getCachedAudioElement(url: string): HTMLAudioElement {
  const existing = audioElementCache.get(url);
  if (existing) return existing;

  const audio = new Audio(url);
  audio.preload = "auto";
  audioElementCache.set(url, audio);
  return audio;
}

/**
 * Optionally pre-warms static HTMLAudioElement instances for a set of audio keys.
 */
export function preloadAudioKeys(audioKeys: readonly string[]): void {
  if (typeof window === "undefined") return;

  for (const key of audioKeys) {
    const url = resolveAudioUrl(key);
    if (missingAudioUrls.has(url) || audioElementCache.has(url)) continue;

    const audio = getCachedAudioElement(url);
    audio.addEventListener(
      "error",
      () => {
        missingAudioUrls.add(url);
        audioElementCache.delete(url);
      },
      { once: true }
    );
  }
}

function pickUkVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  return (
    voices.find(
      (v) =>
        v.lang === "en-GB" &&
        /google|natural|libby|sonia|serena|kate/i.test(v.name)
    ) ??
    voices.find((v) => v.lang === "en-GB") ??
    voices.find((v) => v.lang.startsWith("en-")) ??
    null
  );
}

export function stopAudio(): void {
  playbackGeneration += 1;

  if (activeCancelCallback) {
    const cancel = activeCancelCallback;
    activeCancelCallback = null;
    cancel();
  }

  if (typeof window === "undefined") return;

  if (activeHtmlAudio) {
    activeHtmlAudio.pause();
    try {
      activeHtmlAudio.currentTime = 0;
    } catch {
      // Ignore if media is not seekable yet.
    }
    activeHtmlAudio = null;
  }

  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore speech synthesis errors on unsupported browsers.
    }
  }
}

/**
 * Derives speechSynthesis fallback text while guaranteeing that isolated
 * single letters are NEVER sent as raw letter names.
 */
function deriveSafeSpeechText(audioKey: string, fallbackText?: string): string {
  const normalizedKey = audioKey.replace(/^\/+/, "").toLowerCase();

  // Always map phoneme/* or phonemes/* keys through the phonetic approximation map
  if (
    normalizedKey.startsWith("phoneme/") ||
    normalizedKey.startsWith("phonemes/")
  ) {
    const slug = normalizedKey.split("/").pop() ?? "";
    if (PHONEME_FALLBACK_MAP[slug]) {
      return PHONEME_FALLBACK_MAP[slug];
    }
  }

  const trimmedFallback = fallbackText?.trim();
  if (trimmedFallback) {
    // Guard: never pass an isolated single letter (e.g. "s", "a", "t") to speechSynthesis
    if (/^[a-z]$/i.test(trimmedFallback)) {
      const lower = trimmedFallback.toLowerCase();
      return PHONEME_FALLBACK_MAP[lower] ?? `${lower}uh`;
    }
    return trimmedFallback;
  }

  const lastSegment = normalizedKey.split("/").pop() ?? normalizedKey;
  if (/^[a-z]$/i.test(lastSegment)) {
    return PHONEME_FALLBACK_MAP[lastSegment] ?? `${lastSegment}uh`;
  }
  return lastSegment.replace(/[-_]+/g, " ");
}

function speakWithWebSpeech(
  text: string,
  rate: number,
  generation: number
): Promise<void> {
  return new Promise((resolve) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      generation !== playbackGeneration
    ) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const calm = isCalmModeEnabled();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB";
      utterance.rate = resolveSpeechRate(rate, calm);
      utterance.pitch = calm ? 1.0 : 1.04;
      utterance.volume = resolveSpeechVolume(calm);

      const ukVoice = pickUkVoice();
      if (ukVoice) {
        utterance.voice = ukVoice;
      }

      let settled = false;
      let timerId: number | null = null;
      const done = () => {
        if (!settled) {
          settled = true;
          if (timerId !== null) window.clearTimeout(timerId);
          if (activeCancelCallback === done) activeCancelCallback = null;
          resolve();
        }
      };

      activeCancelCallback = done;
      utterance.onend = done;
      utterance.onerror = done;

      timerId = window.setTimeout(done, Math.max(950, text.length * 115));
      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
}

function playCachedHtmlAudio(
  url: string,
  generation: number
): Promise<boolean> {
  if (missingAudioUrls.has(url) || generation !== playbackGeneration) {
    return Promise.resolve(false);
  }

  return new Promise<boolean>((resolve) => {
    try {
      const audio = getCachedAudioElement(url);
      audio.volume = resolveSpeechVolume(isCalmModeEnabled());
      activeHtmlAudio = audio;

      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        audio.onended = null;
        audio.onerror = null;
        if (activeHtmlAudio === audio) {
          activeHtmlAudio = null;
        }
        if (!ok) {
          missingAudioUrls.add(url);
          audioElementCache.delete(url);
        }
        resolve(ok);
      };

      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);

      try {
        audio.currentTime = 0;
      } catch {
        // Seek will succeed once metadata loads.
      }

      const playPromise = audio.play();
      if (playPromise) {
        void playPromise.catch(() => finish(false));
      }
    } catch {
      missingAudioUrls.add(url);
      audioElementCache.delete(url);
      resolve(false);
    }
  });
}

export interface PlayAudioOptions {
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

/**
 * Offline-first audio playback helper:
 * 1. Resolves phoneme keys under /audio/phonemes/ and plays via cached HTMLAudioElement.
 * 2. Falls back seamlessly to en-GB Web Speech API with phonetic approximations
 *    (never passing raw isolated single letters as letter names).
 */
export async function playAudioKey(
  audioKey: string,
  fallbackText?: string,
  options?: PlayAudioOptions
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  stopAudio();
  const generation = playbackGeneration;
  options?.onStart?.();

  const isPhoneme =
    audioKey.startsWith("phoneme/") || audioKey.startsWith("phonemes/");
  const url = resolveAudioUrl(audioKey);
  const speechText = deriveSafeSpeechText(audioKey, fallbackText);
  const rate = options?.rate ?? (isPhoneme ? 0.8 : 0.9);

  const playedStatic = await playCachedHtmlAudio(url, generation);

  if (!playedStatic && generation === playbackGeneration) {
    await speakWithWebSpeech(speechText, rate, generation);
  }

  if (generation === playbackGeneration) {
    options?.onEnd?.();
  }
}

/**
 * Convenience helper for playing an isolated phoneme grapheme sound.
 */
export function playPhoneme(
  grapheme: string,
  audioKey?: string,
  options?: PlayAudioOptions
): Promise<void> {
  const key = audioKey ?? `phoneme/${grapheme.toLowerCase()}`;
  return playAudioKey(key, grapheme, { rate: 0.8, ...options });
}

/**
 * Plays a sequence of audioKeys in order (used for left-to-right Elkonin
 * sound-box blending sweeps followed by the full blended word).
 * Cancels cleanly if another audio cue interrupts mid-sweep.
 */
export async function playAudioSequence(
  items: ReadonlyArray<{
    audioKey: string;
    fallbackText?: string;
    rate?: number;
    pauseAfterMs?: number;
  }>,
  onStep?: (index: number) => void
): Promise<boolean> {
  stopAudio();
  const sequenceStartGen = playbackGeneration;

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]!;
    onStep?.(i);

    const expectedGen = sequenceStartGen + i + 1;
    await playAudioKey(item.audioKey, item.fallbackText, { rate: item.rate });

    // If an external stopAudio/playAudioKey interrupted this sequence, abort cleanly
    if (playbackGeneration !== expectedGen) {
      onStep?.(-1);
      return false;
    }

    const pauseMs = item.pauseAfterMs ?? 110;
    if (pauseMs > 0) {
      await new Promise((r) => window.setTimeout(r, pauseMs));
    }
    if (playbackGeneration !== expectedGen) {
      onStep?.(-1);
      return false;
    }
  }

  onStep?.(-1);
  return true;
}

/**
 * Plays the Web Audio success jingle first, waits until it finishes cleanly
 * (no overlap), and then speaks the praise audioKey. Cancels automatically
 * if stopAudio() or another cue interrupts during the jingle.
 */
export async function playSuccessThenPraise(
  audioKey: string,
  fallbackText?: string,
  options?: PlayAudioOptions & { pauseAfterJingleMs?: number }
): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  stopAudio();
  const startGen = playbackGeneration;
  const waitMs =
    SFX_DURATION_MS.success +
    (options?.pauseAfterJingleMs ?? PRAISE_GAP_AFTER_JINGLE_MS);

  return sequenceJingleThenPraise({
    sfxEnabled: isSfxEnabled(),
    jingleWaitMs: waitMs,
    isCancelled: () => playbackGeneration !== startGen,
    playJingle: () => playSfx("success"),
    wait: (ms) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
      }),
    playPraise: async () => {
      await playAudioKey(audioKey, fallbackText, options);
    },
  });
}

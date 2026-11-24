"use client";

/**
 * NI Linguistic Phonics pure-sound approximations for Web Speech API fallback.
 * Prevents TTS from reading letter names ("ess", "tee") when MP3 recordings
 * are not yet bundled in /public/audio/.
 */
const PHONEME_SPEECH_MAP: Record<string, string> = {
  "phoneme/s": "sss",
  "phoneme/a": "a",
  "phoneme/t": "t",
  "phoneme/p": "p",
  "phoneme/i": "ih",
  "phoneme/n": "nnn",
  "phoneme/c": "k",
  "phoneme/k": "k",
  "phoneme/e": "eh",
  "phoneme/h": "h",
  "phoneme/r": "rrr",
  "phoneme/m": "mmm",
  "phoneme/d": "d",
  "phoneme/g": "g",
  "phoneme/o": "oh",
  "phoneme/u": "uh",
  "phoneme/l": "lll",
  "phoneme/f": "fff",
  "phoneme/b": "b",
  "phoneme/sh": "shh",
  "phoneme/ch": "ch",
  "phoneme/th": "thh",
  "phoneme/ng": "ng",
};

/**
 * Cache audioKeys whose static MP3 returned 404/error during this session so
 * repeat taps fall back to Web Speech API with zero network delay.
 */
const missingAudioKeys = new Set<string>();

let activeHtmlAudio: HTMLAudioElement | null = null;

function pickUkVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  return (
    voices.find((v) => v.lang === "en-GB" && /google|natural|libby|sonia|serena|kate/i.test(v.name)) ??
    voices.find((v) => v.lang === "en-GB") ??
    voices.find((v) => v.lang.startsWith("en-")) ??
    null
  );
}

export function stopAudio(): void {
  if (typeof window === "undefined") return;

  if (activeHtmlAudio) {
    activeHtmlAudio.pause();
    activeHtmlAudio.currentTime = 0;
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

function deriveSpeechText(audioKey: string, fallbackText?: string): string {
  if (PHONEME_SPEECH_MAP[audioKey]) {
    return PHONEME_SPEECH_MAP[audioKey];
  }
  if (fallbackText && fallbackText.trim().length > 0) {
    return fallbackText.trim();
  }
  const lastSegment = audioKey.split("/").pop() ?? audioKey;
  return lastSegment.replace(/[-_]+/g, " ");
}

function speakWithWebSpeech(
  text: string,
  rate = 0.88
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB";
      utterance.rate = rate;
      utterance.pitch = 1.05;

      const ukVoice = pickUkVoice();
      if (ukVoice) {
        utterance.voice = ukVoice;
      }

      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };

      utterance.onend = done;
      utterance.onerror = done;

      // Safety timeout in case a browser swallows onend
      window.setTimeout(done, Math.max(1200, text.length * 110));
      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
}

export interface PlayAudioOptions {
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

/**
 * Offline-first audio playback helper.
 * 1. Tries static MP3 at /audio/<audioKey>.mp3 (unless already known missing).
 * 2. Falls back seamlessly to the browser's Web Speech API (en-GB).
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
  options?.onStart?.();

  const speechText = deriveSpeechText(audioKey, fallbackText);
  const rate =
    options?.rate ?? (audioKey.startsWith("phoneme/") ? 0.78 : 0.9);

  if (missingAudioKeys.has(audioKey)) {
    await speakWithWebSpeech(speechText, rate);
    options?.onEnd?.();
    return;
  }

  const audioUrl = `/audio/${audioKey}.mp3`;

  const playedMp3 = await new Promise<boolean>((resolve) => {
    try {
      const audio = new Audio(audioUrl);
      activeHtmlAudio = audio;

      audio.onended = () => {
        if (activeHtmlAudio === audio) activeHtmlAudio = null;
        resolve(true);
      };

      audio.onerror = () => {
        if (activeHtmlAudio === audio) activeHtmlAudio = null;
        missingAudioKeys.add(audioKey);
        resolve(false);
      };

      void audio.play().catch(() => {
        if (activeHtmlAudio === audio) activeHtmlAudio = null;
        missingAudioKeys.add(audioKey);
        resolve(false);
      });
    } catch {
      missingAudioKeys.add(audioKey);
      resolve(false);
    }
  });

  if (!playedMp3) {
    await speakWithWebSpeech(speechText, rate);
  }

  options?.onEnd?.();
}

/**
 * Plays a sequence of audioKeys one after another (used for left-to-right
 * Elkonin sound-box blending sweeps).
 */
export async function playAudioSequence(
  items: ReadonlyArray<{ audioKey: string; fallbackText?: string; rate?: number }>,
  onStep?: (index: number) => void
): Promise<void> {
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]!;
    onStep?.(i);
    await playAudioKey(item.audioKey, item.fallbackText, { rate: item.rate });
    await new Promise((r) => window.setTimeout(r, 120));
  }
  onStep?.(-1);
}

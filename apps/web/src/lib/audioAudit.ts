import {
  PRAISE_AUDIO_SCRIPTS,
  TRY_AGAIN_AUDIO_SCRIPTS,
} from "@wee-sparks/curriculum-schema";
import { CORE_UI_AUDIO_KEYS, resolveAudioUrl } from "./audioUrls";

/**
 * Prioritised recording order for Northern Ireland voice talent:
 * 1. phonemes  — highest impact (pure Linguistic Phonics sounds, zero schwa)
 * 2. word      — target words & sight words
 * 3. number    — spoken numbers 0–20
 * 4. coin      — UK coins & pence totals
 * 5. shape     — 2D & 3D shapes
 * 6. prompt    — exercise instructions & welcome prompt
 * 7. feedback  — shared 24-clip praise/try-again pool + quest-complete
 * 8+           — objects, sentences, hints, stickers
 */
export const RECORDING_PRIORITY_ORDER = [
  "phonemes",
  "word",
  "number",
  "coin",
  "shape",
  "prompt",
  "feedback",
  "object",
  "sentence",
  "hint",
  "sticker",
] as const;

export const RECORDING_PRIORITY_LABELS: Record<string, string> = {
  phonemes: "Pure NI Linguistic Phonics phonemes (zero 'uh' schwa)",
  word: "Target phonics & high-frequency words",
  number: "Spoken numbers (0–20)",
  coin: "UK coins & pence totals (1p–20p)",
  shape: "2D & 3D shape names",
  prompt: "Exercise prompts & welcome screen",
  feedback: "Shared praise (01–12), try-again (01–12) & quest-complete pool",
  object: "Visual item & counter names",
  sentence: "High-frequency word & caption sentences",
  hint: "Gentle audio hints",
  sticker: "Sticker chest cheer lines",
};

export interface ExtractedAudioEntry {
  audioKey: string;
  url: string;
  relativePublicPath: string;
  category: string;
  sampleTexts: string[];
  sources: string[];
}

export interface PrioritisedRecordingTier {
  priority: number;
  category: string;
  label: string;
  total: number;
  present: number;
  missing: number;
  missingEntries: ExtractedAudioEntry[];
}

export interface AudioAuditReport {
  totalUnique: number;
  presentCount: number;
  missingCount: number;
  present: ExtractedAudioEntry[];
  missing: ExtractedAudioEntry[];
  byCategory: Record<
    string,
    { total: number; present: number; missing: number }
  >;
  prioritisedTiers: PrioritisedRecordingTier[];
}

interface MutableEntry {
  audioKey: string;
  url: string;
  relativePublicPath: string;
  category: string;
  sampleTexts: Set<string>;
  sources: Set<string>;
}

export function getRecordingPriority(category: string): number {
  const idx = RECORDING_PRIORITY_ORDER.indexOf(
    category as (typeof RECORDING_PRIORITY_ORDER)[number]
  );
  return idx === -1 ? RECORDING_PRIORITY_ORDER.length : idx;
}

export function sortEntriesByRecordingPriority(
  entries: readonly ExtractedAudioEntry[]
): ExtractedAudioEntry[] {
  return [...entries].sort((a, b) => {
    const pa = getRecordingPriority(a.category);
    const pb = getRecordingPriority(b.category);
    if (pa !== pb) return pa - pb;
    return a.url.localeCompare(b.url);
  });
}

function getCategoryFromUrl(url: string): string {
  const trimmed = url.replace(/^\/audio\//, "");
  const slashIdx = trimmed.indexOf("/");
  return slashIdx === -1 ? "root" : trimmed.slice(0, slashIdx);
}

function inferCompanionText(
  parent: Record<string, unknown>,
  keyName: string
): string | null {
  if (keyName === "audioKey") {
    if (typeof parent.text === "string" && parent.text.trim()) {
      return parent.text.trim();
    }
    if (typeof parent.grapheme === "string" && parent.grapheme.trim()) {
      return `/${parent.grapheme.trim()}/ (pure phoneme)`;
    }
    if (typeof parent.label === "string" && parent.label.trim()) {
      return parent.label.trim();
    }
  }
  if (keyName === "correctAudioKey") {
    const val = parent.correctAudioKey;
    if (typeof val === "string" && val in PRAISE_AUDIO_SCRIPTS) {
      return PRAISE_AUDIO_SCRIPTS[val as keyof typeof PRAISE_AUDIO_SCRIPTS];
    }
    if (typeof parent.correctText === "string") {
      return parent.correctText.trim();
    }
  }
  if (keyName === "encourageAudioKey") {
    const val = parent.encourageAudioKey;
    if (typeof val === "string" && val in TRY_AGAIN_AUDIO_SCRIPTS) {
      return TRY_AGAIN_AUDIO_SCRIPTS[
        val as keyof typeof TRY_AGAIN_AUDIO_SCRIPTS
      ];
    }
    if (typeof parent.encourageText === "string") {
      return parent.encourageText.trim();
    }
  }
  if (keyName === "wordAudioKey" && typeof parent.targetWord === "string") {
    return parent.targetWord.trim();
  }
  if (
    keyName === "targetWordAudioKey" &&
    typeof parent.targetWord === "string"
  ) {
    return parent.targetWord.trim();
  }
  if (
    keyName === "contextAudioKey" &&
    typeof parent.contextSentence === "string"
  ) {
    return parent.contextSentence.trim();
  }
  if (
    keyName === "targetSoundAudioKey" &&
    typeof parent.targetSound === "string"
  ) {
    return `/${parent.targetSound.trim()}/ (pure phoneme)`;
  }
  if (keyName === "glyphAudioKey" && typeof parent.glyph === "string") {
    return parent.glyph.trim();
  }
  if (
    keyName === "antiReversalAudioKey" &&
    typeof parent.antiReversalCue === "string"
  ) {
    return parent.antiReversalCue.trim();
  }
  return null;
}

/**
 * Recursively collects every `*audioKey` / `audioKey` string from any number
 * of parsed JSON pack objects, keyed by resolved `/audio/.../*.mp3` URL so
 * `phoneme/s` and `phonemes/s` deduplicate cleanly, sorted by recording priority.
 */
export function extractAudioEntriesFromPacks(
  packs: ReadonlyArray<{ sourceName: string; data: unknown }>,
  options?: {
    includeCoreUiKeys?: boolean;
    includeSharedFeedbackPool?: boolean;
    extraEntries?: ReadonlyArray<{
      audioKey: string;
      scriptText: string;
      sourceName?: string;
    }>;
  }
): ExtractedAudioEntry[] {
  const byUrl = new Map<string, MutableEntry>();

  const register = (
    audioKey: string,
    sourceName: string,
    sampleText?: string | null
  ) => {
    const trimmedKey = audioKey.trim();
    if (!trimmedKey) return;
    const url = resolveAudioUrl(trimmedKey);
    const relativePublicPath = url.replace(/^\/+/, "");
    let existing = byUrl.get(url);
    if (!existing) {
      existing = {
        audioKey: trimmedKey,
        url,
        relativePublicPath,
        category: getCategoryFromUrl(url),
        sampleTexts: new Set(),
        sources: new Set(),
      };
      byUrl.set(url, existing);
    }
    existing.sources.add(sourceName);
    if (sampleText) {
      existing.sampleTexts.add(sampleText);
    }
  };

  const walk = (node: unknown, sourceName: string) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item, sourceName);
      return;
    }

    const record = node as Record<string, unknown>;
    for (const [k, v] of Object.entries(record)) {
      if (typeof v === "string" && /audioKey$/i.test(k)) {
        register(v, sourceName, inferCompanionText(record, k));
      } else if (v && typeof v === "object") {
        walk(v, sourceName);
      }
    }
  };

  for (const pack of packs) {
    walk(pack.data, pack.sourceName);
  }

  if (options?.includeCoreUiKeys !== false) {
    for (const ui of CORE_UI_AUDIO_KEYS) {
      register(ui.audioKey, "ui-core", ui.scriptText);
    }
  }

  if (options?.includeSharedFeedbackPool !== false) {
    for (const [key, script] of Object.entries(PRAISE_AUDIO_SCRIPTS)) {
      register(key, "shared-feedback-pool", script);
    }
    for (const [key, script] of Object.entries(TRY_AGAIN_AUDIO_SCRIPTS)) {
      register(key, "shared-feedback-pool", script);
    }
  }

  if (options?.extraEntries) {
    for (const extra of options.extraEntries) {
      register(
        extra.audioKey,
        extra.sourceName ?? "ui-stickers",
        extra.scriptText
      );
    }
  }

  return sortEntriesByRecordingPriority(
    Array.from(byUrl.values()).map((entry) => ({
      audioKey: entry.audioKey,
      url: entry.url,
      relativePublicPath: entry.relativePublicPath,
      category: entry.category,
      sampleTexts: Array.from(entry.sampleTexts),
      sources: Array.from(entry.sources).sort(),
    }))
  );
}

/**
 * Groups missing & present audio entries into a prioritised recording plan
 * (phonemes -> words -> numbers -> coins -> shapes -> prompts -> feedback -> ...).
 */
export function buildPrioritisedRecordingList(
  entries: readonly ExtractedAudioEntry[],
  fileExists: (relativePublicPath: string) => boolean
): PrioritisedRecordingTier[] {
  const sorted = sortEntriesByRecordingPriority(entries);
  const tierMap = new Map<string, PrioritisedRecordingTier>();

  for (const entry of sorted) {
    let tier = tierMap.get(entry.category);
    if (!tier) {
      tier = {
        priority: getRecordingPriority(entry.category) + 1,
        category: entry.category,
        label:
          RECORDING_PRIORITY_LABELS[entry.category] ??
          `${entry.category} audio clips`,
        total: 0,
        present: 0,
        missing: 0,
        missingEntries: [],
      };
      tierMap.set(entry.category, tier);
    }

    tier.total += 1;
    if (fileExists(entry.relativePublicPath)) {
      tier.present += 1;
    } else {
      tier.missing += 1;
      tier.missingEntries.push(entry);
    }
  }

  return Array.from(tierMap.values()).sort((a, b) => a.priority - b.priority);
}

/**
 * Evaluates which extracted audio entries already have MP3 files on disk
 * versus which are still missing, including a prioritised recording plan.
 */
export function buildAudioAuditReport(
  entries: readonly ExtractedAudioEntry[],
  fileExists: (relativePublicPath: string) => boolean
): AudioAuditReport {
  const sorted = sortEntriesByRecordingPriority(entries);
  const present: ExtractedAudioEntry[] = [];
  const missing: ExtractedAudioEntry[] = [];
  const byCategory: Record<
    string,
    { total: number; present: number; missing: number }
  > = {};

  for (const entry of sorted) {
    if (!byCategory[entry.category]) {
      byCategory[entry.category] = { total: 0, present: 0, missing: 0 };
    }
    const bucket = byCategory[entry.category]!;
    bucket.total += 1;

    if (fileExists(entry.relativePublicPath)) {
      present.push(entry);
      bucket.present += 1;
    } else {
      missing.push(entry);
      bucket.missing += 1;
    }
  }

  const prioritisedTiers = buildPrioritisedRecordingList(sorted, fileExists);

  return {
    totalUnique: sorted.length,
    presentCount: present.length,
    missingCount: missing.length,
    present,
    missing,
    byCategory,
    prioritisedTiers,
  };
}

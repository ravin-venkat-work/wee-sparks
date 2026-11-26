import { CORE_UI_AUDIO_KEYS, resolveAudioUrl } from "./audioUrls";

export interface ExtractedAudioEntry {
  audioKey: string;
  url: string;
  relativePublicPath: string;
  category: string;
  sampleTexts: string[];
  sources: string[];
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
}

interface MutableEntry {
  audioKey: string;
  url: string;
  relativePublicPath: string;
  category: string;
  sampleTexts: Set<string>;
  sources: Set<string>;
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
  if (keyName === "correctAudioKey" && typeof parent.correctText === "string") {
    return parent.correctText.trim();
  }
  if (
    keyName === "encourageAudioKey" &&
    typeof parent.encourageText === "string"
  ) {
    return parent.encourageText.trim();
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
 * `phoneme/s` and `phonemes/s` deduplicate cleanly.
 */
export function extractAudioEntriesFromPacks(
  packs: ReadonlyArray<{ sourceName: string; data: unknown }>,
  options?: { includeCoreUiKeys?: boolean; extraEntries?: ReadonlyArray<{ audioKey: string; scriptText: string; sourceName?: string }> }
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

  if (options?.extraEntries) {
    for (const extra of options.extraEntries) {
      register(
        extra.audioKey,
        extra.sourceName ?? "ui-stickers",
        extra.scriptText
      );
    }
  }

  return Array.from(byUrl.values())
    .map((entry) => ({
      audioKey: entry.audioKey,
      url: entry.url,
      relativePublicPath: entry.relativePublicPath,
      category: entry.category,
      sampleTexts: Array.from(entry.sampleTexts),
      sources: Array.from(entry.sources).sort(),
    }))
    .sort((a, b) => a.url.localeCompare(b.url));
}

/**
 * Evaluates which extracted audio entries already have MP3 files on disk
 * versus which are still missing.
 */
export function buildAudioAuditReport(
  entries: readonly ExtractedAudioEntry[],
  fileExists: (relativePublicPath: string) => boolean
): AudioAuditReport {
  const present: ExtractedAudioEntry[] = [];
  const missing: ExtractedAudioEntry[] = [];
  const byCategory: Record<
    string,
    { total: number; present: number; missing: number }
  > = {};

  for (const entry of entries) {
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

  return {
    totalUnique: entries.length,
    presentCount: present.length,
    missingCount: missing.length,
    present,
    missing,
    byCategory,
  };
}

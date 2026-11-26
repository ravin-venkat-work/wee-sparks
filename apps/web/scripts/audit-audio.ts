import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildAudioAuditReport,
  extractAudioEntriesFromPacks,
} from "../src/lib/audioAudit";
import { EXPECTED_AUDIO_SUBDIRS } from "../src/lib/audioUrls";
import { STICKER_CATALOG } from "../src/lib/stickers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_ROOT = path.resolve(__dirname, "..");
const PACKS_DIR = path.join(WEB_ROOT, "src", "data", "packs");
const PUBLIC_DIR = path.join(WEB_ROOT, "public");
const AUDIO_DIR = path.join(PUBLIC_DIR, "audio");
const PRECACHE_MANIFEST_PATH = path.join(AUDIO_DIR, "precache-manifest.json");

const args = new Set(process.argv.slice(2).filter((a) => a !== "--"));
const jsonOutput = args.has("--json");
const missingOnly = args.has("--missing-only");
const writeManifest = args.has("--write-manifest");
const strictMode = args.has("--strict");

// Ensure expected public/audio/* folders exist
for (const subdir of EXPECTED_AUDIO_SUBDIRS) {
  fs.mkdirSync(path.join(AUDIO_DIR, subdir), { recursive: true });
}

const packFiles = fs
  .readdirSync(PACKS_DIR)
  .filter((name) => name.endsWith(".json"))
  .sort();

const parsedPacks = packFiles.map((fileName) => {
  const fullPath = path.join(PACKS_DIR, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  return {
    sourceName: fileName,
    data: JSON.parse(raw) as unknown,
  };
});

const stickerExtras = STICKER_CATALOG.map((sticker) => ({
  audioKey: `sticker/${sticker.id}`,
  scriptText: `${sticker.title}! ${sticker.cheerText}`,
  sourceName: "stickers.ts",
}));

const entries = extractAudioEntriesFromPacks(parsedPacks, {
  includeCoreUiKeys: true,
  includeSharedFeedbackPool: true,
  extraEntries: stickerExtras,
});

const report = buildAudioAuditReport(entries, (relativePublicPath) => {
  const fullPath = path.join(PUBLIC_DIR, relativePublicPath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).size > 0;
});

if (writeManifest) {
  // Also discover any manually added MP3 files inside public/audio
  const discoveredUrls = new Set<string>(report.present.map((e) => e.url));
  const walkAudioDir = (dir: string) => {
    for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        walkAudioDir(full);
      } else if (dirent.isFile() && dirent.name.toLowerCase().endsWith(".mp3")) {
        const rel = path.relative(PUBLIC_DIR, full).split(path.sep).join("/");
        discoveredUrls.add(`/${rel}`);
      }
    }
  };
  walkAudioDir(AUDIO_DIR);

  const sortedUrls = Array.from(discoveredUrls).sort();
  const hasher = crypto.createHash("sha256");
  hasher.update(`total:${report.totalUnique}\n`);
  for (const url of sortedUrls) {
    const filePath = path.join(PUBLIC_DIR, url.replace(/^\/+/, ""));
    hasher.update(`${url}\n`);
    if (fs.existsSync(filePath)) {
      hasher.update(fs.readFileSync(filePath));
    }
  }
  const contentHash = hasher.digest("hex").slice(0, 12);

  const manifestPayload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    contentHash,
    totalExpected: report.totalUnique,
    cachedAudioUrls: sortedUrls,
  };

  fs.writeFileSync(
    PRECACHE_MANIFEST_PATH,
    `${JSON.stringify(manifestPayload, null, 2)}\n`,
    "utf8"
  );
}

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("=== Wee Sparks Prioritised Audio Recording Audit ===");
  console.log(`Scanned packs: ${packFiles.join(", ")}`);
  console.log(
    `Audio assets: ${report.presentCount} present / ${report.missingCount} missing (${report.totalUnique} total unique MP3s)\n`
  );

  console.log(
    "Prioritised recording tiers (phonemes -> words -> numbers -> coins -> shapes -> prompts -> ...):"
  );
  for (const tier of report.prioritisedTiers) {
    const statusIcon = tier.missing === 0 ? "✓" : "○";
    console.log(
      `  P${String(tier.priority).padEnd(2)} ${statusIcon} ${tier.category.padEnd(10)} ${String(tier.present).padStart(3)}/${String(tier.total).padEnd(3)} present (${tier.missing} missing) — ${tier.label}`
    );
  }

  console.log(
    `\nPrioritised recording list (${missingOnly ? "missing only" : "all entries"}):`
  );
  const presentUrls = new Set(report.present.map((p) => p.url));

  for (const tier of report.prioritisedTiers) {
    const tierItems = missingOnly
      ? tier.missingEntries
      : entries.filter((e) => e.category === tier.category);
    if (tierItems.length === 0) continue;

    console.log(
      `\n[Priority ${tier.priority}] ${tier.category.toUpperCase()} — ${tier.label} (${tierItems.length} files)`
    );
    for (const item of tierItems) {
      const mark = presentUrls.has(item.url) ? "[OK]     " : "[MISSING]";
      const hint =
        item.sampleTexts.length > 0 ? ` — "${item.sampleTexts[0]}"` : "";
      console.log(
        `  ${mark} ${item.audioKey.padEnd(32)} -> public/${item.relativePublicPath}${hint}`
      );
    }
  }

  if (writeManifest) {
    console.log(
      `\nUpdated ${path.relative(WEB_ROOT, PRECACHE_MANIFEST_PATH)} for Service Worker precaching.`
    );
  }
}

if (strictMode && report.missingCount > 0) {
  process.exit(1);
}

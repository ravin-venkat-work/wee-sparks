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

  const manifestPayload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    totalExpected: report.totalUnique,
    cachedAudioUrls: Array.from(discoveredUrls).sort(),
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
  console.log("=== Wee Sparks Audio Asset Audit ===");
  console.log(`Scanned packs: ${packFiles.join(", ")}`);
  console.log(
    `Audio assets: ${report.presentCount} present / ${report.missingCount} missing (${report.totalUnique} total unique MP3s)\n`
  );

  console.log("Summary by folder (apps/web/public/audio/<folder>/):");
  for (const category of Object.keys(report.byCategory).sort()) {
    const stats = report.byCategory[category]!;
    const statusIcon = stats.missing === 0 ? "✓" : "○";
    console.log(
      `  ${statusIcon} ${category.padEnd(10)} ${String(stats.present).padStart(3)}/${String(stats.total).padEnd(3)} present (${stats.missing} missing)`
    );
  }

  const listToPrint = missingOnly ? report.missing : entries;
  console.log(
    `\n${missingOnly ? "Missing MP3 files" : "All expected MP3 files"} (${listToPrint.length}):`
  );

  for (const item of listToPrint) {
    const exists = report.present.some((p) => p.url === item.url);
    const mark = exists ? "[OK]     " : "[MISSING]";
    const hint =
      item.sampleTexts.length > 0 ? ` — "${item.sampleTexts[0]}"` : "";
    console.log(
      `  ${mark} ${item.audioKey.padEnd(36)} -> public/${item.relativePublicPath}${hint}`
    );
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

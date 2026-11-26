import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { GoogleGenAI } from "@google/genai";
import {
  ContentPackSchema,
  getMicroSkillById,
  MicroSkillIdSchema,
  pickPraiseAudioKey,
  pickTryAgainAudioKey,
  PRAISE_AUDIO_KEYS,
  ThemeSchema,
  TRY_AGAIN_AUDIO_KEYS,
  YearGroupSchema,
  type ContentPack,
  type MicroSkillId,
  type Theme,
  type YearGroup,
} from "@wee-sparks/curriculum-schema";
import {
  buildFixtureContentPack,
  type FixturePreset,
} from "./fixtures";
import { buildContentPackJsonSchema } from "./packJsonSchema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKS_DIR = path.resolve(__dirname, "../../../apps/web/src/data/packs");

const DEFAULT_SKILLS_BY_YEAR: Record<YearGroup, MicroSkillId[]> = {
  P1: [
    "ccea-p1-lit-initial-satpin",
    "ccea-p1-lit-cvc-blend-satpin",
    "ccea-p1-lit-hfw-p1",
    "ccea-p1-num-subitise-1-5",
    "ccea-p1-num-ten-frames-1-10",
    "ccea-p1-num-bonds-to-5",
    "ccea-p1-num-shapes-2d",
    "ccea-p1-num-coins-1p-5p",
  ],
  P2: [
    "ccea-p2-lit-digraphs-sh-ch-th-ng",
    "ccea-p2-lit-cvcc-ccvc",
    "ccea-p2-num-bonds-to-10",
    "ccea-p2-num-add-sub-within-20",
    "ccea-p2-num-coins-to-20p",
  ],
};

function printUsage(): void {
  console.log(`
Wee Sparks Offline Content Studio Generator (CCEA Foundation Stage P1–P2)

Usage:
  pnpm --filter content-studio generate [options]

Options:
  --year, -y <P1|P2>              Target CCEA year group (default: P1)
  --skills, -s <id1,id2,...>      Comma-separated CCEA MicroSkillIds
  --theme, -t <theme|all>         space | dinosaurs | animals | vehicles | all (default: all)
  --count, -c <number>            Target exercise count (default: 16)
  --out, -o <filename.json>       Output file inside apps/web/src/data/packs/
  --pack-id <id>                  Custom packId
  --title <title>                 Custom pack title
  --dry-run                       Use local fixture mode & validate without writing (add --write to save)
  --fixture                       Use local fixture mode, validate, and write pack to --out
  --write                         Write file even when --dry-run is set
  --help, -h                      Show this help message
`);
}

function formatValidationErrors(
  candidate: unknown,
  issues: ReadonlyArray<{ path: (string | number)[]; message: string }>
): void {
  const rawExercises =
    typeof candidate === "object" &&
    candidate !== null &&
    "exercises" in candidate &&
    Array.isArray((candidate as { exercises?: unknown }).exercises)
      ? ((candidate as { exercises: Array<{ id?: string }> }).exercises ?? [])
      : [];

  console.error("\n✗ ContentPackSchema validation failed:");
  for (const issue of issues) {
    if (issue.path[0] === "exercises" && typeof issue.path[1] === "number") {
      const idx = issue.path[1];
      const exId = rawExercises[idx]?.id ?? "<missing-id>";
      const subPath = issue.path.slice(2).join(".") || "(root)";
      console.error(
        `  - Exercise #${idx + 1} (${exId}) [${subPath}]: ${issue.message}`
      );
    } else {
      console.error(
        `  - Pack [${issue.path.join(".") || "(root)"}]: ${issue.message}`
      );
    }
  }
}

async function generateWithGemini(params: {
  apiKey: string;
  yearGroup: YearGroup;
  skillIds: readonly MicroSkillId[];
  theme: Theme | "all";
  count: number;
  packId: string;
  title: string;
}): Promise<unknown> {
  const ai = new GoogleGenAI({ apiKey: params.apiKey });
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  const skillDescriptions = params.skillIds
    .map((id) => {
      const s = getMicroSkillById(id);
      return `- ${s.id} (${s.code}): ${s.title} — ${s.description} [CCEA: ${s.cceaReference}]`;
    })
    .join("\n");

  const themeInstruction =
    params.theme === "all"
      ? "Distribute exercises evenly across all four kid-friendly themes: space, dinosaurs, animals, and vehicles."
      : `Tag every exercise with theme "${params.theme}".`;

  const prompt = [
    `Generate a Northern Ireland CCEA Foundation Stage (${params.yearGroup}) ContentPack JSON object.`,
    `Pack metadata: packId="${params.packId}", version="1.0.0", title="${params.title}", yearGroup="${params.yearGroup}", locale="en-GB-NI".`,
    `Create exactly ${params.count} unique exercises covering these CCEA micro-skills:`,
    skillDescriptions,
    themeInstruction,
    "Strict curriculum rules:",
    "1. Use UK/NI English spelling throughout (colour, recognise, practise, tyre) and UK coins (1p, 2p, 5p, 10p, 20p).",
    "2. For ccea-p1-lit-initial-satpin and ccea-p1-lit-cvc-blend-satpin, ONLY use single-letter Stage 1 sounds from {s, a, t, p, i, n}. Never introduce digraphs or initial consonant clusters.",
    "3. Every prompt, hint, stimulus, phoneme tile, and option card MUST include a lowercase audioKey matching /^[a-z0-9][a-z0-9._/-]*$/.",
    "4. For feedback.correctAudioKey ONLY use the shared praise pool feedback/praise-01 through feedback/praise-12; for feedback.encourageAudioKey ONLY use the shared pool feedback/try-again-01 through feedback/try-again-12 (never per-exercise feedback audioKeys).",
    "5. Every exercise must include an age-appropriate offlineParentTip (>= 15 characters).",
    "6. Keep prompt text short and friendly for ages 4–6.",
  ].join("\n\n");

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: buildContentPackJsonSchema(),
    },
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error("Gemini returned an empty response body.");
  }

  return JSON.parse(rawText) as unknown;
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const args = rawArgs[0] === "--" ? rawArgs.slice(1) : rawArgs;

  const { values } = parseArgs({
    args,
    options: {
      year: { type: "string", short: "y", default: "P1" },
      skills: { type: "string", short: "s" },
      skill: { type: "string" },
      theme: { type: "string", short: "t", default: "all" },
      count: { type: "string", short: "c", default: "16" },
      out: { type: "string", short: "o" },
      preset: { type: "string", default: "default" },
      "pack-id": { type: "string" },
      title: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      fixture: { type: "boolean", default: false },
      write: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
  });

  if (values.help) {
    printUsage();
    return;
  }

  const yearParsed = YearGroupSchema.safeParse(values.year);
  if (!yearParsed.success) {
    console.error(`Invalid --year "${values.year}". Expected P1 or P2.`);
    process.exit(1);
  }
  const yearGroup: YearGroup = yearParsed.data;

  const rawSkillArg = values.skills ?? values.skill;
  let skillIds: MicroSkillId[];
  if (rawSkillArg) {
    const parts = rawSkillArg
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    skillIds = [];
    for (const part of parts) {
      const parsed = MicroSkillIdSchema.safeParse(part);
      if (!parsed.success) {
        console.error(`Invalid micro-skill ID "${part}".`);
        process.exit(1);
      }
      skillIds.push(parsed.data);
    }
  } else {
    skillIds = DEFAULT_SKILLS_BY_YEAR[yearGroup];
  }

  let theme: Theme | "all" = "all";
  if (values.theme !== "all") {
    const themeParsed = ThemeSchema.safeParse(values.theme);
    if (!themeParsed.success) {
      console.error(
        `Invalid --theme "${values.theme}". Expected space, dinosaurs, animals, vehicles, or all.`
      );
      process.exit(1);
    }
    theme = themeParsed.data;
  }

  const count = Number.parseInt(values.count, 10);
  if (!Number.isInteger(count) || count < 1 || count > 60) {
    console.error(`Invalid --count "${values.count}". Expected integer 1–60.`);
    process.exit(1);
  }

  const outFileName =
    values.out ??
    `${yearGroup.toLowerCase()}-${theme === "all" ? "themed-expansion" : theme}.json`;
  const safeOutName = outFileName.endsWith(".json")
    ? outFileName
    : `${outFileName}.json`;
  const outPath = path.join(PACKS_DIR, path.basename(safeOutName));

  const packId =
    values["pack-id"] ??
    `ccea-${path.basename(safeOutName, ".json")}`;
  const title =
    values.title ??
    `${yearGroup} Themed Expansion Quest (${theme === "all" ? "All Themes" : theme})`;

  const useFixtureMode = values.fixture || values["dry-run"];
  const shouldWrite = values.fixture || !values["dry-run"] || values.write;

  let candidate: unknown;

  const preset = (values.preset ?? "default") as FixturePreset;

  if (useFixtureMode) {
    console.log(
      `Running content-studio in offline ${values["dry-run"] ? "--dry-run" : "--fixture"} mode (${yearGroup}, preset=${preset}, theme=${theme}, count=${count})...`
    );
    candidate = buildFixtureContentPack({
      yearGroup,
      skillIds,
      theme,
      count,
      packId,
      title,
      preset,
    });
  } else {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error(
        "GEMINI_API_KEY is not set. Pass --fixture or --dry-run to run locally without an API key."
      );
      process.exit(1);
    }
    console.log(
      `Generating ${count} ${yearGroup} exercises via @google/genai (theme=${theme})...`
    );
    candidate = await generateWithGemini({
      apiKey,
      yearGroup,
      skillIds,
      theme,
      count,
      packId,
      title,
    });
  }

  // Normalise feedback audioKeys onto the shared praise/try-again pools if needed
  const praiseSet = new Set<string>(PRAISE_AUDIO_KEYS);
  const tryAgainSet = new Set<string>(TRY_AGAIN_AUDIO_KEYS);
  if (
    candidate &&
    typeof candidate === "object" &&
    "exercises" in candidate &&
    Array.isArray((candidate as { exercises?: unknown }).exercises)
  ) {
    for (const ex of (candidate as { exercises: Array<Record<string, unknown>> }).exercises) {
      const fb = ex.feedback as Record<string, unknown> | undefined;
      const exId = typeof ex.id === "string" ? ex.id : "exercise";
      if (fb && typeof fb === "object") {
        if (typeof fb.correctAudioKey !== "string" || !praiseSet.has(fb.correctAudioKey)) {
          fb.correctAudioKey = pickPraiseAudioKey(exId);
        }
        if (typeof fb.encourageAudioKey !== "string" || !tryAgainSet.has(fb.encourageAudioKey)) {
          fb.encourageAudioKey = pickTryAgainAudioKey(exId);
        }
      }
    }
  }

  // Mandatory strict Zod validation before writing any file
  const parsed = ContentPackSchema.safeParse(candidate);
  if (!parsed.success) {
    formatValidationErrors(candidate, parsed.error.issues);
    process.exit(1);
  }

  const validPack: ContentPack = parsed.data;
  const themeCounts = validPack.exercises.reduce<Record<string, number>>(
    (acc, ex) => {
      acc[ex.theme] = (acc[ex.theme] ?? 0) + 1;
      return acc;
    },
    {}
  );

  console.log(
    `✓ ContentPackSchema passed: "${validPack.title}" (${validPack.exercises.length} exercises)`
  );
  console.log(`  Skills: ${validPack.skillIds.join(", ")}`);
  console.log(`  Themes: ${JSON.stringify(themeCounts)}`);

  if (!shouldWrite) {
    console.log(
      `[dry-run] Skipped writing to ${outPath}. Re-run with --fixture or --dry-run --write to save.`
    );
    return;
  }

  mkdirSync(PACKS_DIR, { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(validPack, null, 2)}\n`, "utf8");
  console.log(`✓ Wrote validated pack to ${outPath}`);
}

void main().catch((err: unknown) => {
  console.error("Content generation failed:", err);
  process.exit(1);
});

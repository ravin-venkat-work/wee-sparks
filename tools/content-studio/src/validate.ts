import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CCEA_FOUNDATION_SKILLS,
  ContentPackSchema,
  MicroSkillSchema,
} from "@wee-sparks/curriculum-schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packsDir = path.resolve(__dirname, "../../../apps/web/src/data/packs");

function validateCatalog(): boolean {
  let ok = true;
  const seenIds = new Set<string>();

  for (const skill of CCEA_FOUNDATION_SKILLS) {
    const parsed = MicroSkillSchema.safeParse(skill);
    if (!parsed.success) {
      ok = false;
      console.error(`Catalog validation failed for ${skill.id}:`);
      console.error(parsed.error.format());
    }
    if (seenIds.has(skill.id)) {
      ok = false;
      console.error(`Duplicate catalog skill ID: ${skill.id}`);
    }
    seenIds.add(skill.id);
  }

  if (ok) {
    console.log(
      `✓ Validated CCEA Foundation Stage catalog (${CCEA_FOUNDATION_SKILLS.length} P1–P2 micro-skills).`
    );
  }
  return ok;
}

function validatePacks(): boolean {
  const files = readdirSync(packsDir).filter((file) => file.endsWith(".json"));
  if (files.length === 0) {
    console.error(`No JSON pack files found in ${packsDir}`);
    return false;
  }

  let allValid = true;

  for (const file of files) {
    const fullPath = path.join(packsDir, file);
    const raw = JSON.parse(readFileSync(fullPath, "utf8")) as unknown;
    const parsed = ContentPackSchema.safeParse(raw);

    if (!parsed.success) {
      allValid = false;
      console.error(`✗ Schema errors in ${file}:`);
      for (const issue of parsed.error.issues) {
        console.error(`  - [${issue.path.join(".")}] ${issue.message}`);
      }
    } else {
      const pack = parsed.data;
      console.log(
        `✓ ${file}: "${pack.title}" (${pack.yearGroup}, ${pack.exercises.length} exercises, skills: ${pack.skillIds.join(", ")})`
      );
    }
  }

  return allValid;
}

const catalogOk = validateCatalog();
const packsOk = validatePacks();

if (!catalogOk || !packsOk) {
  process.exit(1);
}

console.log("\nAll CCEA curriculum schemas and exercise packs passed validation.");

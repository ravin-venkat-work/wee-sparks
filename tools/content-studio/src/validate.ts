import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CCEA_FOUNDATION_SKILLS,
  ContentPackSchema,
  MicroSkillSchema,
  StoryBookSchema,
} from "@wee-sparks/curriculum-schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packsDir = path.resolve(__dirname, "../../../apps/web/src/data/packs");
const storiesDir = path.resolve(__dirname, "../../../apps/web/src/data/stories");

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

function validatePacks(globalExerciseIds: Map<string, string>): boolean {
  const files = readdirSync(packsDir)
    .filter((file) => file.endsWith(".json"))
    .sort();
  if (files.length === 0) {
    console.error(`No JSON pack files found in ${packsDir}`);
    return false;
  }

  let allValid = true;
  const globalPackIds = new Map<string, string>();
  let totalExercises = 0;

  const usedFeedbackKeys = new Set<string>();

  for (const file of files) {
    const fullPath = path.join(packsDir, file);
    const raw = JSON.parse(readFileSync(fullPath, "utf8")) as unknown;
    const parsed = ContentPackSchema.safeParse(raw);

    if (!parsed.success) {
      allValid = false;
      console.error(`✗ Schema errors in ${file}:`);
      const rawExercises =
        typeof raw === "object" &&
        raw !== null &&
        "exercises" in raw &&
        Array.isArray((raw as { exercises?: unknown }).exercises)
          ? ((raw as { exercises: Array<{ id?: string }> }).exercises ?? [])
          : [];

      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "exercises" && typeof issue.path[1] === "number") {
          const idx = issue.path[1];
          const exId = rawExercises[idx]?.id ?? "<missing-id>";
          const subPath = issue.path.slice(2).join(".") || "(root)";
          console.error(
            `  - Exercise #${idx + 1} (${exId}) [${subPath}]: ${issue.message}`
          );
        } else {
          console.error(`  - [${issue.path.join(".")}] ${issue.message}`);
        }
      }
      continue;
    }

    const pack = parsed.data;
    totalExercises += pack.exercises.length;

    if (globalPackIds.has(pack.packId)) {
      allValid = false;
      console.error(
        `✗ Duplicate packId "${pack.packId}" in ${file} (already defined in ${globalPackIds.get(pack.packId)})`
      );
    }
    globalPackIds.set(pack.packId, file);

    for (const ex of pack.exercises) {
      if (globalExerciseIds.has(ex.id)) {
        allValid = false;
        console.error(
          `✗ Duplicate exercise id "${ex.id}" in ${file} (already defined in ${globalExerciseIds.get(ex.id)})`
        );
      }
      globalExerciseIds.set(ex.id, file);
      usedFeedbackKeys.add(ex.feedback.correctAudioKey);
      usedFeedbackKeys.add(ex.feedback.encourageAudioKey);
    }

    console.log(
      `✓ ${file}: "${pack.title}" (${pack.yearGroup}, ${pack.exercises.length} exercises, skills: ${pack.skillIds.join(", ")})`
    );
  }

  if (allValid) {
    console.log(
      `✓ Validated ${files.length} pack files (${totalExercises} unique exercises total, ${usedFeedbackKeys.size} shared feedback audioKeys).`
    );
  }

  return allValid;
}

function validateStories(globalExerciseIds: Map<string, string>): boolean {
  if (!existsSync(storiesDir)) {
    console.error(`Stories directory not found: ${storiesDir}`);
    return false;
  }

  const files = readdirSync(storiesDir)
    .filter((file) => file.endsWith(".json"))
    .sort();
  if (files.length === 0) {
    console.error(`No JSON story files found in ${storiesDir}`);
    return false;
  }

  let allValid = true;
  const globalStoryIds = new Map<string, string>();
  let totalChapters = 0;

  for (const file of files) {
    const fullPath = path.join(storiesDir, file);
    const raw = JSON.parse(readFileSync(fullPath, "utf8")) as unknown;
    const parsed = StoryBookSchema.safeParse(raw);

    if (!parsed.success) {
      allValid = false;
      console.error(`✗ Schema errors in story ${file}:`);
      for (const issue of parsed.error.issues) {
        console.error(`  - [${issue.path.join(".")}] ${issue.message}`);
      }
      continue;
    }

    const story = parsed.data;
    totalChapters += story.chapters.length;

    if (globalStoryIds.has(story.storyId)) {
      allValid = false;
      console.error(
        `✗ Duplicate storyId "${story.storyId}" in ${file} (already defined in ${globalStoryIds.get(story.storyId)})`
      );
    }
    globalStoryIds.set(story.storyId, file);

    for (const chapter of story.chapters) {
      if (globalExerciseIds.has(chapter.exercise.id)) {
        allValid = false;
        console.error(
          `✗ Duplicate exercise id "${chapter.exercise.id}" in story ${file} (already defined in ${globalExerciseIds.get(chapter.exercise.id)})`
        );
      }
      globalExerciseIds.set(chapter.exercise.id, `stories/${file}`);
    }

    console.log(
      `✓ stories/${file}: "${story.title}" (${story.yearGroup}, ${story.chapters.length} chapters)`
    );
  }

  if (allValid) {
    console.log(
      `✓ Validated ${files.length} story packs (${totalChapters} illustrated story chapters).`
    );
  }

  return allValid;
}

const globalExerciseIds = new Map<string, string>();
const catalogOk = validateCatalog();
const packsOk = validatePacks(globalExerciseIds);
const storiesOk = validateStories(globalExerciseIds);

if (!catalogOk || !packsOk || !storiesOk) {
  process.exit(1);
}

console.log(
  "\nAll CCEA curriculum schemas, exercise packs, and story packs passed validation."
);

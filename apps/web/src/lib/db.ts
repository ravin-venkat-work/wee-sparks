import Dexie, { type EntityTable } from "dexie";
import type {
  DifficultyTier,
  MicroSkillId,
  Theme,
  YearGroup,
} from "@wee-sparks/curriculum-schema";

export type LearnerThemePreference = Theme | "all";

export interface LearnerProfile {
  id?: number;
  displayName: string;
  yearGroup: YearGroup;
  avatarEmoji: string;
  preferredTheme: LearnerThemePreference;
  createdAt: string;
}

export interface ExerciseAttempt {
  id?: number;
  learnerId: number;
  exerciseId: string;
  skillId: MicroSkillId;
  isCorrect: boolean;
  attemptsCount: number;
  retriesCount: number;
  hintUsed: boolean;
  durationMs: number;
  completedAt: string;
}

export interface SkillMasteryRecord {
  learnerId: number;
  skillId: MicroSkillId;
  correctCount: number;
  totalCount: number;
  masteryScore: number;
  streak: number;
  hintAssistedCount: number;
  retryTotal: number;
  status: "not-started" | DifficultyTier;
  nextReviewAt: string;
  lastAttemptAt: string;
  updatedAt: string;
}

/**
 * Local-only IndexedDB database (UK ICO Children's Code compliant).
 * All student profiles, attempts, and mastery records stay strictly on-device.
 */
export class WeeSparksDatabase extends Dexie {
  learners!: EntityTable<LearnerProfile, "id">;
  attempts!: EntityTable<ExerciseAttempt, "id">;
  skillMastery!: Dexie.Table<SkillMasteryRecord, [number, MicroSkillId]>;

  constructor() {
    super("wee-sparks-local-db");

    this.version(1).stores({
      learners: "++id, displayName, yearGroup, createdAt",
      attempts: "++id, learnerId, exerciseId, skillId, completedAt",
      skillMastery: "[learnerId+skillId], learnerId, skillId, status, updatedAt",
    });

    this.version(2)
      .stores({
        learners: "++id, displayName, yearGroup, preferredTheme, createdAt",
        attempts: "++id, learnerId, exerciseId, skillId, completedAt",
        skillMastery:
          "[learnerId+skillId], learnerId, skillId, status, nextReviewAt, updatedAt",
      })
      .upgrade(async (tx) => {
        await tx
          .table("learners")
          .toCollection()
          .modify((learner: Partial<LearnerProfile>) => {
            if (!learner.preferredTheme) {
              learner.preferredTheme = "all";
            }
          });

        await tx
          .table("attempts")
          .toCollection()
          .modify((attempt: Partial<ExerciseAttempt>) => {
            if (typeof attempt.retriesCount !== "number") {
              attempt.retriesCount = Math.max(
                0,
                (attempt.attemptsCount ?? 1) - 1
              );
            }
            if (typeof attempt.hintUsed !== "boolean") {
              attempt.hintUsed = false;
            }
          });

        await tx
          .table("skillMastery")
          .toCollection()
          .modify((record: Partial<SkillMasteryRecord>) => {
            const total = record.totalCount ?? 0;
            const correct = record.correctCount ?? 0;
            if (typeof record.masteryScore !== "number") {
              record.masteryScore =
                total > 0 ? Math.round((correct / total) * 1000) / 1000 : 0;
            }
            if (typeof record.streak !== "number") {
              record.streak = record.status === "secure" ? 2 : correct > 0 ? 1 : 0;
            }
            if (typeof record.hintAssistedCount !== "number") {
              record.hintAssistedCount = 0;
            }
            if (typeof record.retryTotal !== "number") {
              record.retryTotal = 0;
            }
            const fallbackIso = record.updatedAt ?? new Date().toISOString();
            if (!record.lastAttemptAt) {
              record.lastAttemptAt = fallbackIso;
            }
            if (!record.nextReviewAt) {
              record.nextReviewAt = fallbackIso;
            }
          });
      });
  }
}

export const db = new WeeSparksDatabase();

const ACTIVE_LEARNER_STORAGE_KEY = "wee-sparks-active-learner-id";

export function getStoredActiveLearnerId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_LEARNER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function setStoredActiveLearnerId(learnerId: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVE_LEARNER_STORAGE_KEY, String(learnerId));
  } catch {
    // Ignore storage errors in private browsing modes.
  }
}

/**
 * Returns all locally stored learner profiles on this device.
 */
export async function listLearners(): Promise<LearnerProfile[]> {
  return db.learners.orderBy("id").toArray();
}

/**
 * Creates a new local learner profile in Dexie and marks them active.
 */
export async function createLearnerProfile(params: {
  displayName: string;
  yearGroup: YearGroup;
  avatarEmoji: string;
  preferredTheme?: LearnerThemePreference;
}): Promise<LearnerProfile> {
  const cleanedName = params.displayName.trim() || "Wee Explorer";
  const profile: LearnerProfile = {
    displayName: cleanedName,
    yearGroup: params.yearGroup,
    avatarEmoji: params.avatarEmoji || "🦊",
    preferredTheme: params.preferredTheme ?? "all",
    createdAt: new Date().toISOString(),
  };

  const id = await db.learners.add(profile);
  if (typeof id === "number") {
    setStoredActiveLearnerId(id);
  }
  return { ...profile, id };
}

/**
 * Restores the last-selected local learner (or creates the default profile)
 * so multiple children can share one device with isolated progress.
 */
export async function ensureDefaultLearner(): Promise<LearnerProfile> {
  const storedId = getStoredActiveLearnerId();
  if (storedId !== null) {
    const found = await db.learners.get(storedId);
    if (found) {
      if (!found.preferredTheme && found.id !== undefined) {
        await db.learners.update(found.id, { preferredTheme: "all" });
        return { ...found, preferredTheme: "all" };
      }
      return found;
    }
  }

  const existing = await db.learners.orderBy("id").first();
  if (existing) {
    if (existing.id !== undefined) {
      setStoredActiveLearnerId(existing.id);
    }
    if (!existing.preferredTheme && existing.id !== undefined) {
      await db.learners.update(existing.id, { preferredTheme: "all" });
      return { ...existing, preferredTheme: "all" };
    }
    return existing;
  }

  return createLearnerProfile({
    displayName: "Wee Explorer",
    yearGroup: "P1",
    avatarEmoji: "🦊",
    preferredTheme: "all",
  });
}

/**
 * Updates and persists the learner's preferred exercise theme locally in Dexie.
 */
export async function updateLearnerTheme(
  learnerId: number,
  preferredTheme: LearnerThemePreference
): Promise<LearnerProfile | undefined> {
  await db.learners.update(learnerId, { preferredTheme });
  return db.learners.get(learnerId);
}

import Dexie, { type EntityTable } from "dexie";
import type {
  DifficultyTier,
  MicroSkillId,
  YearGroup,
} from "@wee-sparks/curriculum-schema";

export interface LearnerProfile {
  id?: number;
  displayName: string;
  yearGroup: YearGroup;
  avatarEmoji: string;
  createdAt: string;
}

export interface ExerciseAttempt {
  id?: number;
  learnerId: number;
  exerciseId: string;
  skillId: MicroSkillId;
  isCorrect: boolean;
  attemptsCount: number;
  durationMs: number;
  completedAt: string;
}

export interface SkillMasteryRecord {
  learnerId: number;
  skillId: MicroSkillId;
  correctCount: number;
  totalCount: number;
  status: "not-started" | DifficultyTier;
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
  }
}

export const db = new WeeSparksDatabase();

/**
 * Ensures a default local learner exists so children can start playing offline
 * without account creation or cloud sign-in.
 */
export async function ensureDefaultLearner(): Promise<LearnerProfile> {
  const existing = await db.learners.orderBy("id").first();
  if (existing) {
    return existing;
  }

  const newProfile: LearnerProfile = {
    displayName: "Wee Explorer",
    yearGroup: "P1",
    avatarEmoji: "🦊",
    createdAt: new Date().toISOString(),
  };

  const id = await db.learners.add(newProfile);
  return { ...newProfile, id };
}

/**
 * Records an exercise attempt locally and recalculates the learner's mastery tier
 * for the associated CCEA micro-skill.
 */
export async function recordExerciseAttempt(params: {
  learnerId: number;
  exerciseId: string;
  skillId: MicroSkillId;
  isCorrect: boolean;
  attemptsCount: number;
  durationMs: number;
}): Promise<SkillMasteryRecord> {
  const now = new Date().toISOString();

  await db.attempts.add({
    learnerId: params.learnerId,
    exerciseId: params.exerciseId,
    skillId: params.skillId,
    isCorrect: params.isCorrect,
    attemptsCount: params.attemptsCount,
    durationMs: params.durationMs,
    completedAt: now,
  });

  const existing = await db.skillMastery.get([
    params.learnerId,
    params.skillId,
  ]);

  const totalCount = (existing?.totalCount ?? 0) + 1;
  const correctCount =
    (existing?.correctCount ?? 0) + (params.isCorrect ? 1 : 0);
  const accuracy = correctCount / totalCount;

  let status: SkillMasteryRecord["status"] = "emerging";
  if (totalCount >= 4 && accuracy >= 0.8) {
    status = "secure";
  } else if (totalCount >= 2 && accuracy >= 0.5) {
    status = "developing";
  }

  const updated: SkillMasteryRecord = {
    learnerId: params.learnerId,
    skillId: params.skillId,
    correctCount,
    totalCount,
    status,
    updatedAt: now,
  };

  await db.skillMastery.put(updated);
  return updated;
}

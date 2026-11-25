"use client";

import { useState } from "react";
import {
  getMicroSkillById,
  type Exercise,
  type MicroSkill,
  type MicroSkillId,
} from "@wee-sparks/curriculum-schema";
import type { LearnerProfile, SkillMasteryRecord } from "@/lib/db";
import { isSkillDueForReview, isSkillMastered } from "@/lib/adaptive/mastery";
import type { ComposedSession } from "@/lib/adaptive/sessionComposer";
import { playSfx } from "@/lib/audio";
import { LearnerSwitcher } from "./LearnerSwitcher";
import { PrintablePracticeSheet } from "./PrintablePracticeSheet";

interface ParentBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  learner: LearnerProfile | null;
  onSelectLearner: (learner: LearnerProfile) => void;
  currentSkill: MicroSkill;
  currentExercise: Exercise;
  packSkillIds: readonly MicroSkillId[];
  masteryRecords: readonly SkillMasteryRecord[];
  session: ComposedSession;
}

const STATUS_BADGE: Record<SkillMasteryRecord["status"], string> = {
  "not-started": "bg-slate-100 text-slate-700",
  emerging: "bg-amber-100 text-amber-900",
  developing: "bg-sky-100 text-sky-900",
  secure: "bg-emerald-100 text-emerald-900",
};

function formatReviewLabel(record?: SkillMasteryRecord): string {
  if (!record || record.totalCount === 0) return "Ready to start";
  const now = new Date();
  if (isSkillDueForReview(record, now)) return "Due for spaced review";

  const diffMs = new Date(record.nextReviewAt).getTime() - now.getTime();
  const diffHours = Math.max(1, Math.round(diffMs / (60 * 60 * 1000)));
  if (diffHours < 24) return `Next review in ~${diffHours}h`;
  const diffDays = Math.round(diffHours / 24);
  return `Next review in ~${diffDays}d`;
}

/**
 * Discreet Parent Bridge modal kept out of the child's main visual canvas.
 * Includes multi-child learner switching, 1-click printable practice sheet
 * tailored to lowest-mastery skills, per-skill Dexie progress, and offlineParentTips.
 */
export function ParentBridgeModal({
  isOpen,
  onClose,
  learner,
  onSelectLearner,
  currentSkill,
  currentExercise,
  packSkillIds,
  masteryRecords,
  session,
}: ParentBridgeModalProps) {
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  if (!isOpen) return null;

  const masteryMap = new Map<MicroSkillId, SkillMasteryRecord>(
    masteryRecords.map((record) => [record.skillId, record])
  );

  const orderedSkillIds: MicroSkillId[] = [];
  const seen = new Set<MicroSkillId>();
  const addSkillId = (id: MicroSkillId) => {
    if (!seen.has(id)) {
      seen.add(id);
      orderedSkillIds.push(id);
    }
  };

  addSkillId(currentSkill.id);
  for (const id of packSkillIds) addSkillId(id);
  for (const rec of masteryRecords) addSkillId(rec.skillId);

  const handleOneClickPrint = () => {
    playSfx("tap");
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="parent-bridge-heading"
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
              Parent Bridge · Northern Ireland CCEA Foundation Stage
            </p>
            <h2
              id="parent-bridge-heading"
              className="mt-1 text-2xl font-extrabold text-slate-900"
            >
              🏡 Progress, Profiles &amp; Printable Sheet
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOneClickPrint}
              className="touch-card rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-500 sm:text-base"
            >
              🖨️ Print Practice Sheet
            </button>
            <button
              type="button"
              onClick={() => {
                playSfx("tap");
                setShowPrintPreview((prev) => !prev);
              }}
              className="touch-card rounded-2xl bg-amber-100 px-4 py-3 text-sm font-extrabold text-amber-950 ring-1 ring-amber-300 hover:bg-amber-200"
            >
              {showPrintPreview ? "Hide Preview" : "👁️ Preview Sheet"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="touch-card rounded-2xl bg-slate-100 px-5 py-3 text-lg font-extrabold text-slate-700 hover:bg-slate-200"
              aria-label="Close Parent Bridge"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {/* Multi-Child Profile Switcher & Quick Add Child */}
          <LearnerSwitcher
            activeLearner={learner}
            onSelectLearner={onSelectLearner}
          />

          {/* Optional On-Screen Printable Practice Sheet Preview */}
          {showPrintPreview && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
                  Screen-Free Printable Sheet Preview (Lowest-Mastery Skills)
                </h3>
                <button
                  type="button"
                  onClick={handleOneClickPrint}
                  className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-500"
                >
                  🖨️ Print Now
                </button>
              </div>
              <PrintablePracticeSheet
                learner={learner}
                packSkillIds={packSkillIds}
                masteryRecords={masteryRecords}
              />
            </div>
          )}

          {/* Adaptive Session Mix Summary */}
          <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-sky-50 p-4 text-center ring-1 ring-sky-200">
            <div>
              <div className="text-xl font-black text-sky-950">
                {session.summary.warmupCount}
              </div>
              <div className="text-xs font-bold text-sky-800">
                Confidence Warm-up
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-indigo-950">
                {session.summary.focusCount}
              </div>
              <div className="text-xs font-bold text-indigo-800">
                Active Focus
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-emerald-950">
                {session.summary.reviewCount}
              </div>
              <div className="text-xs font-bold text-emerald-800">
                Spaced Review
              </div>
            </div>
          </div>

          {/* Current Exercise Spotlight */}
          {currentExercise.offlineParentTip && (
            <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-amber-900">
                Try This Right Now ({currentSkill.code})
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-800">
                {currentExercise.offlineParentTip}
              </p>
            </div>
          )}

          {/* Per-Skill Mastery & Linked Catalog offlineParentTip */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
                🔒 Per-Skill Mastery ({learner?.displayName ?? "Wee Explorer"})
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                On-device IndexedDB · Zero tracking
              </span>
            </div>

            <ul className="space-y-3">
              {orderedSkillIds.map((skillId) => {
                const skill = getMicroSkillById(skillId);
                const record = masteryMap.get(skillId);
                const status = record?.status ?? "not-started";
                const masteryPct = record
                  ? Math.round(record.masteryScore * 100)
                  : 0;
                const thresholdPct = Math.round(
                  skill.masteryThreshold.minAccuracy * 100
                );
                const mastered = isSkillMastered(skillId, record);
                const isCurrent = skillId === currentSkill.id;

                return (
                  <li
                    key={skillId}
                    className={`rounded-2xl p-4 ring-1 ${
                      isCurrent
                        ? "bg-sky-50/60 ring-sky-300"
                        : "bg-slate-50 ring-slate-200"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-black text-sky-900 ring-1 ring-sky-200">
                            {skill.code}
                          </span>
                          <h4 className="text-base font-extrabold text-slate-900">
                            {skill.title}
                          </h4>
                          {isCurrent && (
                            <span className="rounded-full bg-sky-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          {skill.cceaReference}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${STATUS_BADGE[status]}`}
                      >
                        {mastered ? "★ Secure" : status.replace("-", " ")}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700">
                        <span>
                          Mastery: {masteryPct}% (target {thresholdPct}% across{" "}
                          {skill.masteryThreshold.minAttempts}+ tries)
                        </span>
                        <span>
                          {record
                            ? `${record.correctCount}/${record.totalCount} correct · Streak ${record.streak}`
                            : "Not tried yet"}
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            mastered
                              ? "bg-emerald-500"
                              : masteryPct >= 48
                              ? "bg-sky-500"
                              : "bg-amber-400"
                          }`}
                          style={{
                            width: `${Math.max(masteryPct, record ? 8 : 0)}%`,
                          }}
                        />
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-slate-500">
                        <span>{formatReviewLabel(record)}</span>
                        {record && (
                          <span>
                            Retries: {record.retryTotal} · Hints:{" "}
                            {record.hintAssistedCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-amber-200/80">
                      <p className="text-[11px] font-extrabold uppercase tracking-wide text-amber-800">
                        Offline Parent Tip
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-700">
                        {skill.offlineParentTip}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

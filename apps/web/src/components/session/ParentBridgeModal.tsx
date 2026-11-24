"use client";

import {
  getMicroSkillById,
  type Exercise,
  type MicroSkill,
} from "@wee-sparks/curriculum-schema";
import type { SkillMasteryRecord } from "@/lib/db";

interface ParentBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSkill: MicroSkill;
  currentExercise: Exercise;
  masteryRecords: readonly SkillMasteryRecord[];
}

/**
 * Discreet Parent Bridge drawer kept out of the child's main visual canvas.
 * Shows NI CCEA reference, real-world offline home activity, and local IndexedDB mastery.
 */
export function ParentBridgeModal({
  isOpen,
  onClose,
  currentSkill,
  currentExercise,
  masteryRecords,
}: ParentBridgeModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="parent-bridge-heading"
    >
      <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
              Parent Bridge · Northern Ireland CCEA
            </p>
            <h2
              id="parent-bridge-heading"
              className="mt-1 text-2xl font-extrabold text-slate-900"
            >
              🏡 {currentSkill.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-card rounded-2xl bg-slate-100 px-4 py-2 text-lg font-bold text-slate-700 hover:bg-slate-200"
            aria-label="Close Parent Bridge"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <h3 className="text-sm font-bold uppercase tracking-wide text-amber-900">
              Offline Home Activity
            </h3>
            <p className="mt-1.5 text-base leading-relaxed text-slate-800">
              {currentExercise.offlineParentTip ??
                currentSkill.offlineParentTip}
            </p>
          </div>

          <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-200">
            <h3 className="text-sm font-bold uppercase tracking-wide text-sky-900">
              CCEA Curriculum Link
            </h3>
            <p className="mt-1 text-sm text-slate-700">
              {currentSkill.cceaReference}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
              🔒 On-Device Progress (Dexie IndexedDB)
            </h3>
            {masteryRecords.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">
                No completed attempts yet. Progress is saved 100% locally on
                this device with zero tracking or cloud uploads.
              </p>
            ) : (
              <ul className="mt-2.5 space-y-2">
                {masteryRecords.map((record) => {
                  const skill = getMicroSkillById(record.skillId);
                  return (
                    <li
                      key={record.skillId}
                      className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-slate-100"
                    >
                      <span className="font-semibold text-slate-800">
                        {skill.code} · {skill.title}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold capitalize text-emerald-900">
                        {record.status} ({record.correctCount}/
                        {record.totalCount})
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

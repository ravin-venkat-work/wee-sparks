"use client";

import { useEffect, useState } from "react";
import {
  getMicroSkillById,
  type Exercise,
  type MicroSkill,
  type MicroSkillId,
} from "@wee-sparks/curriculum-schema";
import type {
  LearnerProfile,
  LearnerThemePreference,
  SkillMasteryRecord,
  UnlockedStickerRecord,
} from "@/lib/db";
import { isSkillDueForReview, isSkillMastered } from "@/lib/adaptive/mastery";
import type {
  ComposedSession,
  YearGroupFilter,
} from "@/lib/adaptive/sessionComposer";
import { playSfx } from "@/lib/audio";
import { runIfParentGateUnlocked } from "@/lib/parentGate";
import { LearnerSwitcher } from "./LearnerSwitcher";
import { PrintablePracticeSheet } from "./PrintablePracticeSheet";
import { StickerManager } from "./StickerManager";
import { ThemePicker } from "./ThemePicker";

interface ParentBridgeModalProps {
  isOpen: boolean;
  isGateUnlocked: boolean;
  onClose: () => void;
  learner: LearnerProfile | null;
  onSelectLearner: (learner: LearnerProfile) => void;
  yearGroupFilter: YearGroupFilter;
  onChangeYearGroup: (filter: YearGroupFilter) => void;
  selectedTheme: LearnerThemePreference;
  onChangeTheme: (theme: LearnerThemePreference) => void;
  sfxOn: boolean;
  onToggleSfx: () => void;
  musicOn: boolean;
  onToggleMusic: () => void;
  onStartFreshQuest: () => void;
  unlockedStickers: readonly UnlockedStickerRecord[];
  currentSkill: MicroSkill | null;
  currentExercise: Exercise | null;
  packSkillIds: readonly MicroSkillId[];
  masteryRecords: readonly SkillMasteryRecord[];
  session: ComposedSession;
}

type SettingsTab = "settings" | "stickers" | "bridge";

const STATUS_BADGE: Record<SkillMasteryRecord["status"], string> = {
  "not-started": "bg-slate-100 text-slate-700",
  emerging: "bg-amber-100 text-amber-900",
  developing: "bg-sky-100 text-sky-900",
  secure: "bg-emerald-100 text-emerald-900",
};

const YEAR_OPTIONS: ReadonlyArray<{ id: YearGroupFilter; label: string }> = [
  { id: "P1", label: "P1" },
  { id: "P2", label: "P2" },
  { id: "all", label: "All (P1–P2)" },
];

const SETTINGS_TABS: ReadonlyArray<{ id: SettingsTab; label: string }> = [
  { id: "settings", label: "⚙️ Settings" },
  { id: "stickers", label: "🎁 Stickers" },
  { id: "bridge", label: "🏡 Parent Bridge & Print" },
];

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
 * Single ParentGate-protected Settings & Parent Bridge area.
 * Houses learner switcher, CCEA stage switcher, audio toggles, theme picker,
 * sticker management, per-skill Dexie mastery, and 1-click printable sheets.
 * Enforces `isGateUnlocked` on render as well as on printing and stage switching.
 */
export function ParentBridgeModal({
  isOpen,
  isGateUnlocked,
  onClose,
  learner,
  onSelectLearner,
  yearGroupFilter,
  onChangeYearGroup,
  selectedTheme,
  onChangeTheme,
  sfxOn,
  onToggleSfx,
  musicOn,
  onToggleMusic,
  onStartFreshQuest,
  unlockedStickers,
  currentSkill,
  currentExercise,
  packSkillIds,
  masteryRecords,
  session,
}: ParentBridgeModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("settings");
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  useEffect(() => {
    if (!isOpen || !isGateUnlocked) {
      setActiveTab("settings");
      setShowPrintPreview(false);
    }
  }, [isOpen, isGateUnlocked]);

  if (!isOpen || !isGateUnlocked) return null;

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

  if (currentSkill) addSkillId(currentSkill.id);
  for (const id of packSkillIds) addSkillId(id);
  for (const rec of masteryRecords) addSkillId(rec.skillId);

  const handleOneClickPrint = () => {
    runIfParentGateUnlocked(isGateUnlocked, () => {
      playSfx("tap");
      if (typeof window !== "undefined") {
        window.print();
      }
    });
  };

  const handleGuardedYearChange = (nextYear: YearGroupFilter) => {
    runIfParentGateUnlocked(isGateUnlocked, () => {
      onChangeYearGroup(nextYear);
    });
  };

  const handleGuardedLearnerSelect = (nextLearner: LearnerProfile) => {
    runIfParentGateUnlocked(isGateUnlocked, () => {
      onSelectLearner(nextLearner);
    });
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
            <p className="text-sm font-bold uppercase tracking-wider text-sky-700">
              🔓 Parent Settings · Northern Ireland CCEA Foundation Stage
            </p>
            <h2
              id="parent-bridge-heading"
              className="mt-1 text-2xl font-extrabold text-slate-900"
            >
              Grown-Up Settings &amp; Parent Bridge
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOneClickPrint}
              className="touch-card rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 sm:text-base"
            >
              🖨️ Print Sheet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="touch-card flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl font-extrabold text-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
              aria-label="Lock and close Parent Settings"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Single Settings Area Navigation Tabs */}
        <div
          className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-4"
          role="tablist"
          aria-label="Parent Settings sections"
        >
          {SETTINGS_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  playSfx("tap");
                  setActiveTab(tab.id);
                }}
                className={`touch-card rounded-2xl px-5 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 sm:text-base ${
                  isSelected
                    ? "bg-sky-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-5">
          {activeTab === "settings" && (
            <>
              {/* Multi-Child Profile Switcher & Quick Add Child */}
              <LearnerSwitcher
                activeLearner={learner}
                onSelectLearner={handleGuardedLearnerSelect}
              />

              {/* Stage Switcher, Audio Toggles & Theme Picker */}
              <div className="space-y-4 rounded-2xl bg-sky-50/70 p-4 ring-1 ring-sky-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-sky-900">
                    ⚙️ Year Group, Audio &amp; Theme
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      runIfParentGateUnlocked(isGateUnlocked, () => {
                        onStartFreshQuest();
                        onClose();
                      });
                    }}
                    className="touch-card rounded-2xl bg-sky-700 px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
                  >
                    🎯 Start Fresh Quest
                  </button>
                </div>

                <div>
                  <p className="mb-2 text-sm font-bold text-slate-700">
                    CCEA Stage Filter
                  </p>
                  <div
                    className="flex flex-wrap items-center gap-2"
                    role="group"
                    aria-label="CCEA stage filter"
                  >
                    {YEAR_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        aria-pressed={yearGroupFilter === opt.id}
                        onClick={() => handleGuardedYearChange(opt.id)}
                        className={`touch-card rounded-2xl px-5 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 ${
                          yearGroupFilter === opt.id
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white text-slate-700 ring-1 ring-slate-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    aria-pressed={sfxOn}
                    onClick={() =>
                      runIfParentGateUnlocked(isGateUnlocked, onToggleSfx)
                    }
                    className={`touch-card rounded-2xl px-4 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 ${
                      sfxOn
                        ? "bg-emerald-100 text-emerald-950 ring-2 ring-emerald-300"
                        : "bg-white text-slate-600 ring-1 ring-slate-200"
                    }`}
                  >
                    {sfxOn ? "🔔 Sound Effects: On" : "🔕 Sound Effects: Off"}
                  </button>

                  <button
                    type="button"
                    aria-pressed={musicOn}
                    onClick={() =>
                      runIfParentGateUnlocked(isGateUnlocked, onToggleMusic)
                    }
                    className={`touch-card rounded-2xl px-4 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-400 ${
                      musicOn
                        ? "bg-violet-100 text-violet-950 ring-2 ring-violet-300"
                        : "bg-white text-slate-600 ring-1 ring-slate-200"
                    }`}
                  >
                    {musicOn ? "🎵 Gentle Music: On" : "🎵 Gentle Music: Off"}
                  </button>
                </div>

                <div>
                  <p className="mb-2 text-sm font-bold text-slate-700">
                    Theme Preference
                  </p>
                  <ThemePicker
                    selectedTheme={selectedTheme}
                    onSelectTheme={(theme) =>
                      runIfParentGateUnlocked(isGateUnlocked, () =>
                        onChangeTheme(theme)
                      )
                    }
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "stickers" && (
            <StickerManager
              learner={learner}
              unlockedRecords={unlockedStickers}
              isGateUnlocked={isGateUnlocked}
            />
          )}

          {activeTab === "bridge" && (
            <>
              {/* Printable Practice Sheet Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-emerald-950">
                    🖨️ Screen-Free Practice Sheet
                  </h3>
                  <p className="text-sm text-emerald-900">
                    Prints an A4 worksheet focused on{" "}
                    {learner?.displayName ?? "your child"}&apos;s current
                    lowest-mastery CCEA skills.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playSfx("tap");
                      setShowPrintPreview((prev) => !prev);
                    }}
                    className="touch-card rounded-2xl bg-amber-100 px-4 py-3 text-sm font-extrabold text-amber-950 ring-1 ring-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400"
                  >
                    {showPrintPreview ? "Hide Preview" : "👁️ Preview Sheet"}
                  </button>
                  <button
                    type="button"
                    onClick={handleOneClickPrint}
                    className="touch-card rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500"
                  >
                    🖨️ Print Now
                  </button>
                </div>
              </div>

              {showPrintPreview && (
                <PrintablePracticeSheet
                  learner={learner}
                  packSkillIds={packSkillIds}
                  masteryRecords={masteryRecords}
                />
              )}

              {/* Adaptive Session Mix Summary */}
              <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
                <div>
                  <div className="text-xl font-black text-sky-950">
                    {session.summary.warmupCount}
                  </div>
                  <div className="text-sm font-bold text-sky-800">
                    Confidence Warm-up
                  </div>
                </div>
                <div>
                  <div className="text-xl font-black text-indigo-950">
                    {session.summary.focusCount}
                  </div>
                  <div className="text-sm font-bold text-indigo-800">
                    Active Focus
                  </div>
                </div>
                <div>
                  <div className="text-xl font-black text-emerald-950">
                    {session.summary.reviewCount}
                  </div>
                  <div className="text-sm font-bold text-emerald-800">
                    Spaced Review
                  </div>
                </div>
              </div>

              {/* Current Exercise Spotlight */}
              {currentExercise?.offlineParentTip && currentSkill && (
                <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-amber-900">
                    Try This Right Now ({currentSkill.code})
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-800">
                    {currentExercise.offlineParentTip}
                  </p>
                </div>
              )}

              {/* Per-Skill Mastery & Linked Catalog offlineParentTip */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
                    🔒 Per-Skill Mastery ({learner?.displayName ?? "Wee Explorer"})
                  </h3>
                  <span className="text-sm font-semibold text-slate-500">
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
                    const isCurrent = skillId === currentSkill?.id;

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
                                <span className="rounded-full bg-sky-700 px-2.5 py-0.5 text-xs font-bold text-white">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-slate-600">
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
                              Mastery: {masteryPct}% (target {thresholdPct}%
                              across {skill.masteryThreshold.minAttempts}+ tries)
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
                          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-500">
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
                          <p className="text-xs font-extrabold uppercase tracking-wide text-amber-800">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

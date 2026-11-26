"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { YearGroup } from "@wee-sparks/curriculum-schema";
import {
  createLearnerProfile,
  db,
  type LearnerProfile,
  type LearnerThemePreference,
} from "@/lib/db";
import { playSfx } from "@/lib/audio";

interface LearnerSwitcherProps {
  activeLearner: LearnerProfile | null;
  onSelectLearner: (learner: LearnerProfile) => void;
}

const AVATAR_CHOICES = ["🦊", "🦕", "🚀", "🐼", "🦁", "🚌"] as const;

const THEME_CHOICES: ReadonlyArray<{
  id: LearnerThemePreference;
  label: string;
}> = [
  { id: "all", label: "✨ All" },
  { id: "space", label: "🚀 Space" },
  { id: "dinosaurs", label: "🦕 Dinos" },
  { id: "animals", label: "🦊 Animals" },
  { id: "vehicles", label: "🚌 Vehicles" },
];

/**
 * Multi-child learner switcher + quick Add-Child panel backed strictly by
 * local Dexie IndexedDB (`db.learners`), keeping every child's mastery and
 * theme preferences isolated on-device.
 */
export function LearnerSwitcher({
  activeLearner,
  onSelectLearner,
}: LearnerSwitcherProps) {
  const learners = useLiveQuery(
    () => db.learners.orderBy("id").toArray(),
    [],
    []
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [yearGroup, setYearGroup] = useState<YearGroup>("P1");
  const [avatarEmoji, setAvatarEmoji] = useState<string>("🦕");
  const [preferredTheme, setPreferredTheme] =
    useState<LearnerThemePreference>("all");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      const created = await createLearnerProfile({
        displayName: nameInput.trim() || "New Explorer",
        yearGroup,
        avatarEmoji,
        preferredTheme,
      });
      playSfx("success");
      setNameInput("");
      setShowAddForm(false);
      onSelectLearner(created);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
            👨‍👩‍👧‍👦 Children on This Device
          </h3>
          <p className="text-xs text-slate-500">
            Switch profiles to keep each child&apos;s stars, mastery, and theme
            separate.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            playSfx("tap");
            setShowAddForm((prev) => !prev);
          }}
          className="touch-card rounded-2xl bg-sky-700 px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-sky-800"
        >
          {showAddForm ? "Cancel" : "+ Add Child"}
        </button>
      </div>

      {/* Existing local learner profiles */}
      <div className="mt-3 flex flex-wrap gap-2">
        {learners.map((profile) => {
          const isCurrent = profile.id === activeLearner?.id;
          return (
            <button
              key={profile.id ?? profile.displayName}
              type="button"
              aria-pressed={isCurrent}
              onClick={() => {
                playSfx("tap");
                if (!isCurrent) {
                  onSelectLearner(profile);
                }
              }}
              className={`touch-card flex items-center gap-2.5 rounded-2xl px-4 py-3 text-left transition-all ${
                isCurrent
                  ? "bg-sky-100 text-sky-950 ring-2 ring-sky-500 shadow-sm"
                  : "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-sky-50"
              }`}
            >
              <span className="text-2xl" aria-hidden="true">
                {profile.avatarEmoji}
              </span>
              <div>
                <div className="text-sm font-extrabold leading-tight">
                  {profile.displayName}
                </div>
                <div className="text-[11px] font-bold text-slate-500">
                  {profile.yearGroup} ·{" "}
                  {profile.preferredTheme === "all"
                    ? "All themes"
                    : profile.preferredTheme}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Add-Child Form */}
      {showAddForm && (
        <form
          onSubmit={(e) => void handleCreateChild(e)}
          className="mt-4 space-y-3 rounded-2xl bg-white p-4 ring-2 ring-sky-200"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
                Child&apos;s First Name / Nickname
              </span>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Aoife or Noah"
                maxLength={24}
                required
                className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3.5 py-2.5 text-base font-bold text-slate-900 focus-visible:border-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-700"
              />
            </label>

            <div>
              <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-700">
                CCEA Year Group
              </span>
              <div className="mt-1 flex gap-2">
                {(["P1", "P2"] as const).map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    aria-pressed={yearGroup === yr}
                    onClick={() => {
                      playSfx("tap");
                      setYearGroup(yr);
                    }}
                    className={`touch-card flex-1 rounded-xl px-4 py-2 text-base font-extrabold ${
                      yearGroup === yr
                        ? "bg-sky-700 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-700">
              Choose Avatar
            </span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {AVATAR_CHOICES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  aria-pressed={avatarEmoji === emoji}
                  onClick={() => {
                    playSfx("tap");
                    setAvatarEmoji(emoji);
                  }}
                  className={`touch-card flex h-16 w-16 items-center justify-center rounded-2xl text-2xl ${
                    avatarEmoji === emoji
                      ? "bg-amber-100 ring-2 ring-amber-400"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-700">
              Favourite Theme
            </span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {THEME_CHOICES.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={preferredTheme === opt.id}
                  onClick={() => {
                    playSfx("tap");
                    setPreferredTheme(opt.id);
                  }}
                  className={`touch-card rounded-xl px-4 py-3 text-sm font-extrabold ${
                    preferredTheme === opt.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="touch-card rounded-2xl bg-emerald-700 px-6 py-3 text-base font-extrabold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50"
            >
              ✅ Save &amp; Switch Child
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

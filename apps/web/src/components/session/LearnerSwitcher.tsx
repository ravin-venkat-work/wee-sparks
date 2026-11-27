"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type {
  CompanionAvatarId,
  YearGroup,
} from "@wee-sparks/curriculum-schema";
import {
  createLearnerProfile,
  db,
  updateLearnerProfile,
  type LearnerProfile,
  type LearnerThemePreference,
} from "@/lib/db";
import { getCompanionAvatar, resolveCompanionAvatarId } from "@/lib/avatars";
import { playAudioKey, playSfx } from "@/lib/audio";
import { AvatarPicker } from "../avatars/AvatarPicker";
import { CompanionAvatarSvg } from "../avatars/CompanionAvatarSvg";

interface LearnerSwitcherProps {
  activeLearner: LearnerProfile | null;
  onSelectLearner: (learner: LearnerProfile) => void;
  onProfileUpdated?: (learner: LearnerProfile) => void;
}

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

type FormMode = "closed" | "add" | "edit";

/**
 * Multi-child learner switcher + Create/Edit Child panel backed strictly by
 * local Dexie IndexedDB (`db.learners`), keeping every child's mastery,
 * companion avatar, CCEA stage focus, and theme preferences isolated on-device.
 */
export function LearnerSwitcher({
  activeLearner,
  onSelectLearner,
  onProfileUpdated,
}: LearnerSwitcherProps) {
  const learners = useLiveQuery(
    () => db.learners.orderBy("id").toArray(),
    [],
    []
  );

  const [formMode, setFormMode] = useState<FormMode>("closed");
  const [editingLearnerId, setEditingLearnerId] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [yearGroup, setYearGroup] = useState<YearGroup>("P1");
  const [avatarId, setAvatarId] = useState<CompanionAvatarId>("rex");
  const [preferredTheme, setPreferredTheme] =
    useState<LearnerThemePreference>("all");
  const [isSaving, setIsSaving] = useState(false);

  const openAddForm = () => {
    playSfx("tap");
    if (formMode === "add") {
      setFormMode("closed");
      return;
    }
    setEditingLearnerId(null);
    setNameInput("");
    setYearGroup("P1");
    setAvatarId("rex");
    setPreferredTheme("all");
    setFormMode("add");
  };

  const openEditForm = (profile: LearnerProfile) => {
    if (profile.id === undefined) return;
    playSfx("tap");
    setEditingLearnerId(profile.id);
    setNameInput(profile.displayName);
    setYearGroup(profile.yearGroup);
    setAvatarId(resolveCompanionAvatarId(profile));
    setPreferredTheme(profile.preferredTheme ?? "all");
    setFormMode("edit");
  };

  const closeForm = () => {
    playSfx("tap");
    setFormMode("closed");
    setEditingLearnerId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      const avatarDef = getCompanionAvatar(avatarId);

      if (formMode === "edit" && editingLearnerId !== null) {
        const updated = await updateLearnerProfile(editingLearnerId, {
          displayName: nameInput.trim() || "Wee Explorer",
          yearGroup,
          avatarId: avatarDef.id,
          avatarEmoji: avatarDef.emoji,
          preferredTheme,
        });
        if (updated) {
          playSfx("success");
          setFormMode("closed");
          setEditingLearnerId(null);
          onProfileUpdated?.(updated);
          if (updated.id === activeLearner?.id && !onProfileUpdated) {
            onSelectLearner(updated);
          }
        }
      } else {
        const created = await createLearnerProfile({
          displayName: nameInput.trim() || "New Explorer",
          yearGroup,
          avatarId: avatarDef.id,
          avatarEmoji: avatarDef.emoji,
          preferredTheme,
        });
        playSfx("success");
        setNameInput("");
        setFormMode("closed");
        onSelectLearner(created);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const selectedAvatarDef = getCompanionAvatar(avatarId);

  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
            👨‍👩‍👧‍👦 Children on This Device
          </h3>
          <p className="text-xs text-slate-600">
            Switch, add, or edit local profiles to keep each child&apos;s stars,
            companion, stage, and theme separate.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="touch-card rounded-2xl bg-sky-700 px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
        >
          {formMode === "add" ? "Cancel" : "+ Add Child"}
        </button>
      </div>

      {/* Existing local learner profiles */}
      <div className="mt-3 flex flex-wrap gap-2.5">
        {learners.map((profile) => {
          const isCurrent = profile.id === activeLearner?.id;
          const profileAvatarId = resolveCompanionAvatarId(profile);
          const profileAvatarDef = getCompanionAvatar(profileAvatarId);
          return (
            <div
              key={profile.id ?? profile.displayName}
              className={`flex items-center gap-1.5 rounded-2xl p-1.5 transition-all ${
                isCurrent
                  ? "bg-sky-100 text-sky-950 ring-2 ring-sky-600 shadow-sm"
                  : "bg-white text-slate-800 ring-1 ring-slate-200"
              }`}
            >
              <button
                type="button"
                aria-pressed={isCurrent}
                onClick={() => {
                  playSfx("tap");
                  if (!isCurrent) {
                    onSelectLearner(profile);
                  }
                }}
                className="touch-card flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-sky-50/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl p-0.5 ${profileAvatarDef.badgeBgClass}`}
                  aria-hidden="true"
                >
                  <CompanionAvatarSvg
                    avatarId={profileAvatarId}
                    mood={isCurrent ? "celebrating" : "idle"}
                    animated={isCurrent}
                  />
                </span>
                <div>
                  <div className="text-sm font-extrabold leading-tight">
                    {profile.displayName}
                  </div>
                  <div className="text-xs font-bold text-slate-600">
                    {profile.yearGroup} · {profileAvatarDef.name} ·{" "}
                    {profile.preferredTheme === "all"
                      ? "All themes"
                      : profile.preferredTheme}
                  </div>
                </div>
              </button>

              {profile.id !== undefined && (
                <button
                  type="button"
                  onClick={() => openEditForm(profile)}
                  aria-label={`Edit ${profile.displayName}'s profile`}
                  className="touch-card flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100 text-xs font-extrabold text-slate-700 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
                >
                  <span className="text-base" aria-hidden="true">
                    ✏️
                  </span>
                  <span>Edit</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add or Edit Child Form */}
      {formMode !== "closed" && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-4 space-y-4 rounded-2xl bg-white p-4 ring-2 ring-sky-200"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl p-1 ring-2 ${selectedAvatarDef.badgeBgClass} ${selectedAvatarDef.ringClass}`}
              >
                <CompanionAvatarSvg avatarId={avatarId} mood="celebrating" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">
                  {formMode === "edit" ? "Edit Child Profile" : "Add a Child"}
                </h4>
                <p className="text-xs font-semibold text-slate-600">
                  Stored strictly on this device · Companion:{" "}
                  {selectedAvatarDef.name} the {selectedAvatarDef.tagline}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="touch-card rounded-xl bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
            >
              Cancel
            </button>
          </div>

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
                CCEA Stage / Year Group
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
                    className={`touch-card flex-1 rounded-xl px-4 py-2 text-base font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 ${
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
            <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-700">
              Choose Companion Avatar
            </span>
            <AvatarPicker
              selectedAvatarId={avatarId}
              onSelectAvatar={setAvatarId}
            />
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
                  className={`touch-card rounded-xl px-4 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 ${
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

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                playSfx("tap");
                void playAudioKey(
                  "prompt/sound-check",
                  `Hello! ${selectedAvatarDef.name} is ready to play!`
                );
              }}
              className="touch-card rounded-2xl bg-amber-100 px-4 py-3 text-sm font-extrabold text-amber-950 ring-1 ring-amber-300 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500"
            >
              🔊 Sound Check
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="touch-card rounded-2xl bg-emerald-700 px-6 py-3 text-base font-extrabold text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 disabled:opacity-50"
            >
              {formMode === "edit"
                ? "✅ Save Profile Changes"
                : "✅ Save & Switch Child"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

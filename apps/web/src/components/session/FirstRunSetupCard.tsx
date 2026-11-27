"use client";

import { useState } from "react";
import type {
  CompanionAvatarId,
  YearGroup,
} from "@wee-sparks/curriculum-schema";
import {
  createLearnerProfile,
  type LearnerProfile,
  type LearnerThemePreference,
} from "@/lib/db";
import { getCompanionAvatar } from "@/lib/avatars";
import { playAudioKey, playSfx } from "@/lib/audio";
import { AvatarPicker } from "../avatars/AvatarPicker";
import { CompanionAvatarSvg } from "../avatars/CompanionAvatarSvg";

interface FirstRunSetupCardProps {
  onComplete: (profile: LearnerProfile) => void;
  onQuickStart: () => void;
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

/**
 * Friendly first-run setup card shown on a fresh device (zero local profiles)
 * instead of silently creating a default child. Collects bare-minimum local
 * preferences (nickname, P1/P2 stage, companion avatar, favourite theme) and
 * offers a quick sound check plus a frictionless 1-tap Quick Start option.
 */
export function FirstRunSetupCard({
  onComplete,
  onQuickStart,
}: FirstRunSetupCardProps) {
  const [nickname, setNickname] = useState("");
  const [yearGroup, setYearGroup] = useState<YearGroup>("P1");
  const [avatarId, setAvatarId] = useState<CompanionAvatarId>("sparky");
  const [preferredTheme, setPreferredTheme] =
    useState<LearnerThemePreference>("all");
  const [isTestingSound, setIsTestingSound] = useState(false);
  const [soundChecked, setSoundChecked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedAvatar = getCompanionAvatar(avatarId);

  const handleTestSound = () => {
    playSfx("tap");
    setSoundChecked(true);
    void playAudioKey(
      "prompt/sound-check",
      `Hello! ${selectedAvatar.name} is ready to play Wee Sparks!`,
      {
        onStart: () => setIsTestingSound(true),
        onEnd: () => setIsTestingSound(false),
      }
    );
  };

  const handleSaveAndPlay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const created = await createLearnerProfile({
        displayName: nickname.trim() || "Wee Explorer",
        yearGroup,
        avatarId: selectedAvatar.id,
        avatarEmoji: selectedAvatar.emoji,
        preferredTheme,
      });
      playSfx("success");
      onComplete(created);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      aria-labelledby="first-run-heading"
      className="mt-7 w-full max-w-2xl rounded-3xl border-4 border-sky-200 bg-white/95 p-5 shadow-lg sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl p-1 ring-2 ${selectedAvatar.badgeBgClass} ${selectedAvatar.ringClass}`}
          >
            <CompanionAvatarSvg avatarId={avatarId} mood="celebrating" />
          </div>
          <div>
            <h2
              id="first-run-heading"
              className="text-xl font-black text-slate-900 sm:text-2xl"
            >
              Set Up Your First Explorer
            </h2>
            <p className="text-xs font-semibold text-slate-600 sm:text-sm">
              Saved only on this device — nicknames work great!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playSfx("snap");
            onQuickStart();
          }}
          aria-label="Play as Wee Explorer"
          className="touch-card rounded-2xl bg-sky-100 px-4 py-3 text-sm font-black text-sky-950 ring-2 ring-sky-300 hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
        >
          ⚡ Quick Start ➡️
        </button>
      </div>

      <form
        onSubmit={(e) => void handleSaveAndPlay(e)}
        className="mt-5 space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
              Child&apos;s Nickname (optional)
            </span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Aoife, Noah, or Wee Explorer"
              maxLength={24}
              className="mt-1.5 w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-base font-bold text-slate-900 focus-visible:border-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
            />
          </label>

          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-700">
              CCEA Stage Focus
            </span>
            <div className="mt-1.5 flex gap-2">
              {(["P1", "P2"] as const).map((yr) => (
                <button
                  key={yr}
                  type="button"
                  aria-pressed={yearGroup === yr}
                  onClick={() => {
                    playSfx("tap");
                    setYearGroup(yr);
                  }}
                  className={`touch-card flex-1 rounded-2xl px-4 py-3 text-base font-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 ${
                    yearGroup === yr
                      ? "bg-sky-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {yr === "P1" ? "P1 (Ages 4–5)" : "P2 (Ages 5–6)"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-700">
            Pick a Companion Avatar
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
                className={`touch-card rounded-2xl px-4 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 ${
                  preferredTheme === opt.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Sound Check */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 p-3.5 ring-1 ring-amber-200">
          <div>
            <p className="text-sm font-extrabold text-amber-950">
              🔊 Quick Sound Check
            </p>
            <p className="text-xs font-semibold text-amber-900">
              {soundChecked
                ? "Heard it clearly? You're all set — or tap Calm Mode above for quiet play."
                : "Wee Sparks is audio-first. Tap to check your speaker volume."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleTestSound}
            className="touch-card rounded-2xl bg-amber-200 px-5 py-3 text-sm font-black text-amber-950 ring-1 ring-amber-400 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500"
          >
            {isTestingSound
              ? "🔈 Playing…"
              : soundChecked
              ? "✅ Test Again"
              : "🔊 Test Sound"}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
          <button
            type="submit"
            disabled={isSaving}
            className="touch-card w-full rounded-3xl bg-emerald-700 px-8 py-4 text-lg font-black text-white shadow-md hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 disabled:opacity-50 sm:w-auto"
          >
            ✨ Save &amp; Start Playing
          </button>
        </div>
      </form>
    </section>
  );
}

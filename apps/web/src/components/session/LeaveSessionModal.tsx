"use client";

import { useEffect } from "react";
import type { CompanionAvatarId } from "@wee-sparks/curriculum-schema";
import { playSfx } from "@/lib/audio";
import { CompanionAvatarSvg } from "../avatars/CompanionAvatarSvg";
import { HomeIconSvg, PlayIconSvg } from "../icons/KidUiIcons";

interface LeaveSessionModalProps {
  isOpen: boolean;
  mode: "quest" | "story";
  starsEarned: number;
  avatarId: CompanionAvatarId;
  onKeepPlaying: () => void;
  onConfirmLeave: () => void;
}

/**
 * Gentle, child-friendly mid-session exit confirmation dialog so accidental
 * Home taps never abruptly end an active quest or story.
 */
export function LeaveSessionModal({
  isOpen,
  mode,
  starsEarned,
  avatarId,
  onKeepPlaying,
  onConfirmLeave,
}: LeaveSessionModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onKeepPlaying();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onKeepPlaying]);

  if (!isOpen) return null;

  const isStory = mode === "story";

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-session-heading"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl ring-4 ring-sky-200 sm:p-7">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-sky-100 p-2 ring-4 ring-sky-200">
          <CompanionAvatarSvg avatarId={avatarId} mood="thinking" />
        </div>

        <h2
          id="leave-session-heading"
          className="mt-4 text-2xl font-black text-slate-900"
        >
          {isStory ? "Leave this story?" : "Leave this quest?"}
        </h2>

        <p className="mt-2 text-base font-bold text-slate-600">
          {starsEarned > 0
            ? `Your ${starsEarned} ⭐ star${starsEarned === 1 ? "" : "s"} so far ${starsEarned === 1 ? "is" : "are"} safely saved on this device!`
            : "You can jump back in anytime from the home screen."}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              playSfx("snap");
              onKeepPlaying();
            }}
            className="touch-card inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 text-lg font-black text-white shadow-md hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500"
          >
            <PlayIconSvg className="h-5 w-5" />
            <span>Keep Playing</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSfx("tap");
              onConfirmLeave();
            }}
            className="touch-card inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-4 text-lg font-extrabold text-slate-800 ring-2 ring-slate-300 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
          >
            <HomeIconSvg className="h-5 w-5" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}

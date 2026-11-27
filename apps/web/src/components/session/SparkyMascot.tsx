"use client";

import type { CompanionAvatarId } from "@wee-sparks/curriculum-schema";
import { getCompanionAvatar } from "@/lib/avatars";
import { CompanionAvatarSvg } from "../avatars/CompanionAvatarSvg";
import { SparkySvg, type MascotMood } from "../avatars/SparkySvg";

export { SparkySvg, type MascotMood };

interface SparkyMascotProps {
  mood: MascotMood;
  avatarId?: CompanionAvatarId;
  message?: string;
  onTap?: () => void;
  size?: "sm" | "md";
}

const MOOD_RING: Record<MascotMood, string> = {
  idle: "bg-sky-100 ring-sky-200",
  thinking: "bg-violet-100 ring-violet-300",
  encouraging: "bg-amber-100 ring-amber-300",
  celebrating: "bg-emerald-100 ring-emerald-300",
};

function getMoodLabel(name: string, mood: MascotMood): string {
  switch (mood) {
    case "thinking":
      return `${name} is thinking with you`;
    case "encouraging":
      return `${name} says have another go`;
    case "celebrating":
      return `${name} is celebrating your star`;
    case "idle":
    default:
      return `${name} is ready to play`;
  }
}

/**
 * Interactive companion mascot button wrapping CompanionAvatarSvg with mood-coloured rings.
 * Defaults to Sparky the Causeway Fox when no avatarId is supplied.
 */
export function SparkyMascot({
  mood,
  avatarId = "sparky",
  message,
  onTap,
  size = "md",
}: SparkyMascotProps) {
  const dim = size === "sm" ? "h-16 w-16" : "h-20 w-20 sm:h-24 sm:w-24";
  const companion = getCompanionAvatar(avatarId);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onTap}
        aria-label={getMoodLabel(companion.name, mood)}
        className={`touch-card relative flex shrink-0 items-center justify-center rounded-3xl p-1.5 shadow-sm ring-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 ${dim} ${MOOD_RING[mood]}`}
      >
        <CompanionAvatarSvg avatarId={avatarId} mood={mood} />
      </button>

      {message && (
        <div className="hidden rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-800 shadow-sm ring-2 ring-sky-100 md:block">
          {message}
        </div>
      )}
    </div>
  );
}

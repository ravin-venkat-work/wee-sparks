"use client";

import type { CompanionAvatarId } from "@wee-sparks/curriculum-schema";
import { COMPANION_AVATARS } from "@/lib/avatars";
import { playSfx } from "@/lib/audio";
import { CompanionAvatarSvg } from "./CompanionAvatarSvg";

interface AvatarPickerProps {
  selectedAvatarId: CompanionAvatarId;
  onSelectAvatar: (avatarId: CompanionAvatarId) => void;
}

/**
 * Accessible >= 64px x 64px companion avatar selector used inside Parent Settings
 * when creating or editing a child's local profile.
 */
export function AvatarPicker({
  selectedAvatarId,
  onSelectAvatar,
}: AvatarPickerProps) {
  return (
    <div
      className="grid grid-cols-3 gap-2.5 sm:grid-cols-6"
      role="radiogroup"
      aria-label="Choose companion avatar"
    >
      {COMPANION_AVATARS.map((avatar) => {
        const isSelected = avatar.id === selectedAvatarId;
        return (
          <button
            key={avatar.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${avatar.name} the ${avatar.tagline}`}
            onClick={() => {
              playSfx("tap");
              onSelectAvatar(avatar.id);
            }}
            className={`touch-card flex flex-col items-center justify-center gap-1 rounded-2xl p-2.5 text-center transition-colors ${
              isSelected
                ? "bg-sky-100 text-sky-950 ring-4 ring-sky-700 shadow-sm"
                : "bg-slate-50 text-slate-800 ring-1 ring-slate-200 hover:bg-sky-50"
            }`}
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl p-1 ${avatar.badgeBgClass}`}
            >
              <CompanionAvatarSvg
                avatarId={avatar.id}
                mood={isSelected ? "celebrating" : "idle"}
                animated={isSelected}
                className="h-full w-full"
              />
            </div>
            <span className="text-xs font-black leading-tight">
              {avatar.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

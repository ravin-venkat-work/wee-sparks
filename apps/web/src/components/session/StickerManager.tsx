"use client";

import { useState } from "react";
import {
  resetStickersForLearner,
  STICKER_CATALOG,
  toggleStickerForLearner,
} from "@/lib/stickers";
import type { LearnerProfile, UnlockedStickerRecord } from "@/lib/db";
import { SeedItemArt } from "./SeedItemArt";

interface StickerManagerProps {
  learner: LearnerProfile | null;
  unlockedRecords: readonly UnlockedStickerRecord[];
  isGateUnlocked: boolean;
}

/**
 * Parent-gated sticker management panel inside Parent Settings.
 * Allows grown-ups to award a bonus sticker for offline real-world practice,
 * lock/unlock individual stickers, or reset a child's sticker chest.
 */
export function StickerManager({
  learner,
  unlockedRecords,
  isGateUnlocked,
}: StickerManagerProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isGateUnlocked || !learner?.id) {
    return null;
  }

  const learnerId = learner.id;
  const unlockedSet = new Set(unlockedRecords.map((r) => r.stickerId));

  const handleToggle = async (stickerId: string) => {
    if (!isGateUnlocked) return;
    await toggleStickerForLearner(learnerId, stickerId);
  };

  const handleResetAll = async () => {
    if (!isGateUnlocked) return;
    await resetStickersForLearner(learnerId);
    setConfirmReset(false);
  };

  return (
    <div className="space-y-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
            🎁 Sticker Chest Management ({learner.displayName})
          </h3>
          <p className="text-sm text-slate-600">
            Tap any sticker to award or remove it ({unlockedSet.size} /{" "}
            {STICKER_CATALOG.length} unlocked).
          </p>
        </div>

        {!confirmReset ? (
          <button
            type="button"
            disabled={unlockedSet.size === 0}
            onClick={() => setConfirmReset(true)}
            className="touch-card rounded-2xl bg-rose-100 px-4 py-3 text-sm font-extrabold text-rose-900 ring-1 ring-rose-300 disabled:opacity-45"
          >
            Reset Stickers
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleResetAll()}
              className="touch-card rounded-2xl bg-rose-600 px-4 py-3 text-sm font-extrabold text-white"
            >
              Confirm Reset
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="touch-card rounded-2xl bg-slate-200 px-4 py-3 text-sm font-extrabold text-slate-800"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STICKER_CATALOG.map((sticker) => {
          const isUnlocked = unlockedSet.has(sticker.id);
          return (
            <button
              key={sticker.id}
              type="button"
              aria-pressed={isUnlocked}
              onClick={() => void handleToggle(sticker.id)}
              className={`touch-card flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 text-center ${
                isUnlocked
                  ? "border-emerald-400 bg-emerald-50 text-slate-900"
                  : "border-dashed border-slate-300 bg-white text-slate-500"
              }`}
            >
              <div className={isUnlocked ? "" : "opacity-35 grayscale"}>
                <SeedItemArt itemKey={sticker.artKey} className="h-12 w-12" />
              </div>
              <span className="text-xs font-extrabold leading-tight">
                {sticker.title}
              </span>
              <span className="text-[11px] font-bold">
                {isUnlocked ? "Unlocked ✓" : `Locked (${sticker.starsRequired}⭐)`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

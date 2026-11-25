"use client";

import { useEffect, useState } from "react";
import {
  STICKER_CATALOG,
  type StickerDefinition,
} from "@/lib/stickers";
import type { UnlockedStickerRecord } from "@/lib/db";
import { playAudioKey, playSfx } from "@/lib/audio";
import { SparkyMascot } from "./SparkyMascot";
import { SeedItemArt } from "./SeedItemArt";

interface CelebrationStickerChestProps {
  mode: "post-session" | "chest-modal";
  starsThisSession?: number;
  totalExercises?: number;
  lifetimeStars: number;
  unlockedRecords: readonly UnlockedStickerRecord[];
  newlyUnlocked: readonly StickerDefinition[];
  onPlayNextQuest?: () => void;
  onOpenParentBridge?: () => void;
  onClose?: () => void;
}

/**
 * Post-session Celebration & Interactive Sticker/Badge Chest screen.
 * Children tap the treasure chest to reveal newly unlocked Northern Ireland
 * & themed stickers (Astro Rocket, Rathlin Puffin, Dinosaurs, Mighty Digger)
 * persisted locally in Dexie.
 */
export function CelebrationStickerChest({
  mode,
  starsThisSession = 0,
  totalExercises = 6,
  lifetimeStars,
  unlockedRecords,
  newlyUnlocked,
  onPlayNextQuest,
  onOpenParentBridge,
  onClose,
}: CelebrationStickerChestProps) {
  const [chestOpened, setChestOpened] = useState(
    mode === "chest-modal" || newlyUnlocked.length === 0
  );

  useEffect(() => {
    setChestOpened(mode === "chest-modal" || newlyUnlocked.length === 0);
  }, [mode, newlyUnlocked.length]);

  const unlockedSet = new Set(unlockedRecords.map((r) => r.stickerId));

  const handleOpenChest = () => {
    setChestOpened(true);
    playSfx("success");
    const first = newlyUnlocked[0];
    if (first) {
      void playAudioKey(`sticker/${first.id}`, first.cheerText);
    }
  };

  return (
    <section className="animate-card-enter relative overflow-hidden rounded-3xl bg-white p-6 text-center shadow-xl ring-4 ring-amber-200 sm:p-8">
      {/* Decorative floating confetti sparkles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-2 flex justify-around text-2xl opacity-75"
      >
        <span className="animate-confetti">⭐</span>
        <span className="animate-confetti">✨</span>
        <span className="animate-confetti">🎉</span>
        <span className="animate-confetti">🌟</span>
      </div>

      {/* Header */}
      <div className="relative flex flex-col items-center">
        <SparkyMascot
          mood="celebrating"
          onTap={() => {
            playSfx("success");
            void playAudioKey(
              "feedback/quest-complete",
              "Hooray! Look at your amazing stickers!"
            );
          }}
        />

        {mode === "post-session" ? (
          <>
            <h2 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">
              Causeway Quest Complete!
            </h2>
            <p className="mt-1.5 text-lg font-extrabold text-amber-700">
              ⭐ {starsThisSession} / {totalExercises} Stars This Quest ·{" "}
              {lifetimeStars} Lifetime Stars
            </p>
          </>
        ) : (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              🎁 My Sticker Chest
            </h2>
            <span className="rounded-full bg-amber-100 px-4 py-1 text-sm font-black text-amber-900">
              {unlockedSet.size} / {STICKER_CATALOG.length} Collected · ⭐{" "}
              {lifetimeStars}
            </span>
          </div>
        )}
      </div>

      {/* Tap-to-Open Treasure Chest Reveal for Newly Unlocked Stickers */}
      {newlyUnlocked.length > 0 && !chestOpened && (
        <div className="mt-6 flex flex-col items-center">
          <button
            type="button"
            onClick={handleOpenChest}
            className="touch-card animate-hint-glow flex flex-col items-center gap-2 rounded-3xl border-4 border-amber-400 bg-gradient-to-b from-amber-100 to-yellow-200 px-10 py-6 shadow-lg hover:scale-105"
          >
            <span className="text-6xl" aria-hidden="true">
              🎁
            </span>
            <span className="text-xl font-black text-amber-950">
              Tap to Open Your Sticker Chest!
            </span>
          </button>
        </div>
      )}

      {newlyUnlocked.length > 0 && chestOpened && (
        <div className="animate-star-pop mt-5 rounded-3xl bg-gradient-to-r from-amber-50 via-yellow-50 to-emerald-50 p-4 ring-2 ring-amber-300">
          <p className="text-sm font-black uppercase tracking-wide text-amber-800">
            🎉 New Sticker{newlyUnlocked.length > 1 ? "s" : ""} Unlocked!
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-4">
            {newlyUnlocked.map((sticker) => (
              <button
                key={sticker.id}
                type="button"
                onClick={() => {
                  playSfx("tap");
                  void playAudioKey(`sticker/${sticker.id}`, sticker.cheerText);
                }}
                className="touch-card flex flex-col items-center gap-1.5 rounded-2xl bg-white px-5 py-3 shadow-md ring-2 ring-amber-400 hover:scale-105"
              >
                <SeedItemArt
                  itemKey={sticker.artKey}
                  className="h-16 w-16"
                />
                <span className="text-base font-black text-slate-900">
                  {sticker.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full Sticker Collection Wall */}
      <div className="mt-6 text-left">
        <p className="mb-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Tap any unlocked sticker to hear its cheer!
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STICKER_CATALOG.map((sticker) => {
            const isUnlocked = unlockedSet.has(sticker.id);
            return (
              <button
                key={sticker.id}
                type="button"
                onClick={() => {
                  playSfx(isUnlocked ? "tap" : "retry");
                  if (isUnlocked) {
                    void playAudioKey(
                      `sticker/${sticker.id}`,
                      `${sticker.title}! ${sticker.cheerText}`
                    );
                  } else {
                    void playAudioKey(
                      `sticker/locked`,
                      `Earn ${sticker.starsRequired} stars to unlock ${sticker.title}!`
                    );
                  }
                }}
                aria-label={
                  isUnlocked
                    ? `${sticker.title}, unlocked sticker`
                    : `${sticker.title}, locked, requires ${sticker.starsRequired} stars`
                }
                className={`touch-card flex min-h-[112px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 text-center ${
                  isUnlocked
                    ? "border-amber-300 bg-amber-50/70 text-slate-900 hover:bg-amber-100"
                    : "border-dashed border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                <div className={isUnlocked ? "" : "opacity-25 grayscale"}>
                  <SeedItemArt
                    itemKey={sticker.artKey}
                    className="h-12 w-12"
                  />
                </div>
                <span className="text-xs font-black leading-tight">
                  {isUnlocked ? sticker.title : `🔒 ${sticker.starsRequired} ⭐`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons (>= 64px height) */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {mode === "post-session" && onPlayNextQuest && (
          <button
            type="button"
            onClick={onPlayNextQuest}
            className="touch-card rounded-3xl bg-sky-600 px-8 py-4 text-xl font-extrabold text-white shadow-md hover:bg-sky-500"
          >
            ✨ Next Adaptive Quest
          </button>
        )}
        {onOpenParentBridge && (
          <button
            type="button"
            onClick={onOpenParentBridge}
            className="touch-card rounded-3xl bg-amber-200 px-7 py-4 text-xl font-extrabold text-amber-950 shadow-sm hover:bg-amber-300"
          >
            🏡 Parent Bridge
          </button>
        )}
        {mode === "chest-modal" && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="touch-card rounded-3xl bg-sky-600 px-8 py-4 text-xl font-extrabold text-white shadow-md hover:bg-sky-500"
          >
            Back to Quest ➡️
          </button>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { CompanionAvatarId } from "@wee-sparks/curriculum-schema";
import {
  getStickersByCollection,
  STICKER_CATALOG,
  STICKER_COLLECTIONS,
  type StickerCollectionId,
  type StickerDefinition,
} from "@/lib/stickers";
import type { UnlockedStickerRecord } from "@/lib/db";
import { playAudioKey, playSfx, playSuccessThenPraise } from "@/lib/audio";
import {
  ArrowRightIconSvg,
  ChestIconSvg,
  HomeIconSvg,
  LockIconSvg,
  SparklesIconSvg,
  StarIconSvg,
} from "../icons/KidUiIcons";
import { SparkyMascot } from "./SparkyMascot";
import { SeedItemArt } from "./SeedItemArt";
import { ParentGateTrigger } from "./ParentGate";

interface CelebrationStickerChestProps {
  mode: "post-session" | "chest-modal";
  avatarId?: CompanionAvatarId;
  starsThisSession?: number;
  totalExercises?: number;
  lifetimeStars: number;
  unlockedRecords: readonly UnlockedStickerRecord[];
  newlyUnlocked: readonly StickerDefinition[];
  onPlayNextQuest?: () => void;
  onFinishForToday?: () => void;
  onParentUnlock?: () => void;
  onRequestParentChallenge?: () => void;
  onClose?: () => void;
}

/**
 * Calm, celebratory End-of-Session Wind-Down & 28-Sticker Collection Chest.
 * - Uses 100% custom inline SVG icons and sticker artwork (zero OS emoji drift).
 * - Gives families a soothing "All done for today?" wrap-up path alongside
 *   an optional "Play Another Quest" button if they want to keep playing.
 * - All interactive tabs, stickers, and buttons enforce >= 64px x 64px touch targets.
 */
export function CelebrationStickerChest({
  mode,
  avatarId = "sparky",
  starsThisSession = 0,
  totalExercises = 6,
  lifetimeStars,
  unlockedRecords,
  newlyUnlocked,
  onPlayNextQuest,
  onFinishForToday,
  onParentUnlock,
  onRequestParentChallenge,
  onClose,
}: CelebrationStickerChestProps) {
  const [chestOpened, setChestOpened] = useState(
    mode === "chest-modal" || newlyUnlocked.length === 0
  );
  const [selectedCollection, setSelectedCollection] = useState<
    StickerCollectionId | "all"
  >("all");

  useEffect(() => {
    setChestOpened(mode === "chest-modal" || newlyUnlocked.length === 0);
  }, [mode, newlyUnlocked.length]);

  const unlockedSet = new Set(unlockedRecords.map((r) => r.stickerId));
  const visibleStickers = getStickersByCollection(selectedCollection);

  const handleOpenChest = () => {
    setChestOpened(true);
    const first = newlyUnlocked[0];
    if (first) {
      void playSuccessThenPraise(`sticker/${first.id}`, first.cheerText);
    } else {
      playSfx("success");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white p-6 text-center shadow-xl ring-4 ring-amber-200 sm:p-8">
      {/* Gentle SVG starlight accent bar (automatically still in Calm Mode / reduced motion) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-3 flex justify-around opacity-75"
      >
        <StarIconSvg className="animate-confetti h-6 w-6" />
        <SparklesIconSvg className="animate-confetti h-6 w-6" />
        <StarIconSvg className="animate-confetti h-6 w-6" />
        <SparklesIconSvg className="animate-confetti h-6 w-6" />
      </div>

      {/* Header */}
      <div className="relative flex flex-col items-center">
        <SparkyMascot
          avatarId={avatarId}
          mood="celebrating"
          onTap={() => {
            void playSuccessThenPraise(
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
            <p className="mt-2 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-amber-100 px-5 py-1.5 text-base font-extrabold text-amber-950">
              <StarIconSvg className="h-5 w-5" />
              <span>
                {starsThisSession} / {totalExercises} Stars This Quest
              </span>
              <span aria-hidden="true">·</span>
              <span>{lifetimeStars} Lifetime Stars</span>
            </p>
          </>
        ) : (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <h2 className="inline-flex items-center gap-2 text-2xl font-black text-slate-900 sm:text-3xl">
              <ChestIconSvg className="h-9 w-9" />
              <span>My Sticker Chest</span>
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1 text-sm font-black text-amber-900">
              <span>
                {unlockedSet.size} / {STICKER_CATALOG.length} Collected
              </span>
              <span aria-hidden="true">·</span>
              <StarIconSvg className="h-4 w-4" />
              <span>{lifetimeStars}</span>
            </span>
          </div>
        )}
      </div>

      {/* Calm Session Wind-Down Card (post-session only) */}
      {mode === "post-session" && (
        <div className="mx-auto mt-5 max-w-2xl rounded-3xl bg-gradient-to-r from-sky-50 via-emerald-50/70 to-amber-50 p-5 ring-2 ring-sky-200">
          <p className="text-lg font-black text-slate-900">
            Brilliant learning today!
          </p>
          <p className="mt-1 text-sm font-bold text-slate-600">
            All your stars and stickers are safely saved. Take a cosy break or
            jump into one more quest whenever you&apos;re ready.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {onFinishForToday && (
              <button
                type="button"
                onClick={onFinishForToday}
                className="touch-card inline-flex items-center justify-center gap-2.5 rounded-3xl bg-sky-700 px-7 py-4 text-lg font-black text-white shadow-md hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
              >
                <HomeIconSvg className="h-6 w-6" />
                <span>All Done for Today</span>
              </button>
            )}

            {onPlayNextQuest && (
              <button
                type="button"
                onClick={onPlayNextQuest}
                aria-label="Next Adaptive Quest"
                className="touch-card inline-flex items-center justify-center gap-2.5 rounded-3xl bg-emerald-700 px-7 py-4 text-lg font-black text-white shadow-md hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500"
              >
                <SparklesIconSvg className="h-6 w-6" />
                <span>Play Another Quest</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tap-to-Open Treasure Chest Reveal for Newly Unlocked Stickers */}
      {newlyUnlocked.length > 0 && !chestOpened && (
        <div className="mt-6 flex flex-col items-center">
          <button
            type="button"
            onClick={handleOpenChest}
            className="touch-card animate-hint-glow flex flex-col items-center gap-2 rounded-3xl border-4 border-amber-400 bg-gradient-to-b from-amber-100 to-yellow-200 px-10 py-6 shadow-lg hover:scale-105"
          >
            <ChestIconSvg className="h-16 w-16" />
            <span className="text-xl font-black text-amber-950">
              Tap to Open Your Sticker Chest!
            </span>
          </button>
        </div>
      )}

      {newlyUnlocked.length > 0 && chestOpened && (
        <div className="animate-star-pop mt-5 rounded-3xl bg-gradient-to-r from-amber-50 via-yellow-50 to-emerald-50 p-4 ring-2 ring-amber-300">
          <p className="inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-wide text-amber-900">
            <SparklesIconSvg className="h-5 w-5" />
            <span>
              New Sticker{newlyUnlocked.length > 1 ? "s" : ""} Unlocked!
            </span>
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

      {/* Collection Filter Tabs + 28-Sticker Wall */}
      <div className="mt-6 text-left">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
            Sticker Collection ({unlockedSet.size} / {STICKER_CATALOG.length})
          </p>
          <p className="text-xs font-bold text-slate-500">
            Tap any unlocked sticker to hear its cheer!
          </p>
        </div>

        <div
          className="mb-4 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter sticker collection"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCollection === "all"}
            onClick={() => {
              playSfx("tap");
              setSelectedCollection("all");
            }}
            className={`touch-card rounded-2xl px-4 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 ${
              selectedCollection === "all"
                ? "bg-sky-700 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All ({STICKER_CATALOG.length})
          </button>
          {STICKER_COLLECTIONS.map((col) => {
            const countInCol = STICKER_CATALOG.filter(
              (s) => s.collection === col.id && unlockedSet.has(s.id)
            ).length;
            const totalInCol = STICKER_CATALOG.filter(
              (s) => s.collection === col.id
            ).length;
            const isSelected = selectedCollection === col.id;
            return (
              <button
                key={col.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  playSfx("tap");
                  setSelectedCollection(col.id);
                }}
                className={`touch-card rounded-2xl px-4 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {col.label} ({countInCol}/{totalInCol})
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {visibleStickers.map((sticker) => {
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
                      "sticker/locked",
                      `Earn ${sticker.starsRequired} stars to unlock ${sticker.title}!`
                    );
                  }
                }}
                aria-label={
                  isUnlocked
                    ? `${sticker.title}, unlocked sticker`
                    : `${sticker.title}, locked, requires ${sticker.starsRequired} stars`
                }
                className={`touch-card flex min-h-[116px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 text-center ${
                  isUnlocked
                    ? "border-amber-300 bg-amber-50/70 text-slate-900 hover:bg-amber-100"
                    : "border-dashed border-slate-300 bg-slate-50 text-slate-600"
                }`}
              >
                <div className={isUnlocked ? "" : "opacity-35 grayscale"}>
                  <SeedItemArt
                    itemKey={sticker.artKey}
                    className="h-14 w-14"
                  />
                </div>
                {isUnlocked ? (
                  <span className="text-xs font-black leading-tight sm:text-sm">
                    {sticker.title}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-black leading-tight text-slate-600">
                    <LockIconSvg className="h-3.5 w-3.5" />
                    <span>{sticker.starsRequired}</span>
                    <StarIconSvg className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Actions (>= 64px height) */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onParentUnlock && onRequestParentChallenge && (
          <ParentGateTrigger
            onUnlock={onParentUnlock}
            onRequestChallenge={onRequestParentChallenge}
            label="Grown-Ups"
          />
        )}
        {mode === "chest-modal" && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="touch-card inline-flex items-center justify-center gap-2 rounded-3xl bg-sky-700 px-8 py-4 text-xl font-extrabold text-white shadow-md hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
          >
            <span>Back to Wee World</span>
            <ArrowRightIconSvg className="h-6 w-6" />
          </button>
        )}
      </div>
    </section>
  );
}

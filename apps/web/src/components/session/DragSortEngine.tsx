"use client";

import { useEffect, useState } from "react";
import type {
  ShapeSortExercise,
  TenFrameCountExercise,
  UkCoin,
  UkCoinMatchExercise,
} from "@wee-sparks/curriculum-schema";
import { playAudioKey, playSfx } from "@/lib/audio";
import { SeedItemArt } from "./SeedItemArt";

export type DragSortExercise =
  | TenFrameCountExercise
  | ShapeSortExercise
  | UkCoinMatchExercise;

interface DragSortEngineProps {
  exercise: DragSortExercise;
  isSolved: boolean;
  onAttempt: (isCorrect: boolean) => void;
}

const UK_COIN_VALUE: Record<UkCoin, number> = {
  "1p": 1,
  "2p": 2,
  "5p": 5,
  "10p": 10,
  "20p": 20,
};

const UK_COIN_VISUAL: Record<UkCoin, string> = {
  "1p": "bg-amber-700 text-amber-50 border-amber-900 rounded-full",
  "2p": "bg-amber-700 text-amber-50 border-amber-900 rounded-full",
  "5p": "bg-slate-300 text-slate-900 border-slate-500 rounded-full",
  "10p": "bg-slate-300 text-slate-900 border-slate-500 rounded-full",
  "20p": "bg-slate-200 text-slate-900 border-slate-600 rounded-2xl",
};

function ShapeSvg({ shape, className = "h-14 w-14" }: { shape: string; className?: string }) {
  const s = shape.toLowerCase();
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      {s.includes("circle") || s.includes("sphere") ? (
        <circle cx="40" cy="40" r="28" fill="#38BDF8" stroke="#0369A1" strokeWidth="4" />
      ) : s.includes("triangle") || s.includes("cone") ? (
        <polygon points="40,12 68,66 12,66" fill="#4ADE80" stroke="#15803D" strokeWidth="4" strokeLinejoin="round" />
      ) : s.includes("square") || s.includes("cube") ? (
        <rect x="14" y="14" width="52" height="52" rx="4" fill="#FACC15" stroke="#B45309" strokeWidth="4" />
      ) : s.includes("rectangle") || s.includes("cylinder") ? (
        <rect x="8" y="22" width="64" height="36" rx="4" fill="#F472B6" stroke="#BE185D" strokeWidth="4" />
      ) : (
        <circle cx="40" cy="40" r="26" fill="#C4B5FD" stroke="#6D28D9" strokeWidth="4" />
      )}
    </svg>
  );
}

/**
 * Tactile Drag & Tap Sort Engine supporting three Foundation Stage activities:
 *  1. Ten-Frame counter drag/tap placement (build-on-frame)
 *  2. 2D/3D Shape sorting buckets (shape-sort)
 *  3. Northern Ireland / UK Coin Jar 1p–20p sorting (uk-coin-match)
 *
 * Every draggable item also supports 1-tap placement for fine-motor tablet accessibility.
 */
export function DragSortEngine({
  exercise,
  isSolved,
  onAttempt,
}: DragSortEngineProps) {
  const [tenFrameCount, setTenFrameCount] = useState<number>(
    exercise.type === "ten-frame-count" ? exercise.initialCounters : 0
  );
  const [sortedOptionId, setSortedOptionId] = useState<string | null>(null);
  const [jarCoins, setJarCoins] = useState<UkCoin[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [shakeTarget, setShakeTarget] = useState(false);

  useEffect(() => {
    setTenFrameCount(
      exercise.type === "ten-frame-count" ? exercise.initialCounters : 0
    );
    setSortedOptionId(null);
    setJarCoins([]);
    setIsDragOver(false);
    setShakeTarget(false);
  }, [exercise]);

  const triggerShake = () => {
    setShakeTarget(true);
    window.setTimeout(() => setShakeTarget(false), 450);
  };

  // =========================================================================
  // 1. TEN-FRAME DRAG & TAP BUILDER
  // =========================================================================
  if (exercise.type === "ten-frame-count") {
    const addCounter = () => {
      if (isSolved || tenFrameCount >= exercise.frameSize) return;
      const next = tenFrameCount + 1;
      setTenFrameCount(next);
      playSfx("snap");
      void playAudioKey(`number/${next}`, String(next));
    };

    const toggleCell = (idx: number) => {
      if (isSolved) return;
      const next = idx < tenFrameCount ? idx : idx + 1;
      setTenFrameCount(next);
      playSfx(next > tenFrameCount ? "snap" : "tap");
      void playAudioKey(`number/${next}`, String(next));
    };

    const checkFrame = () => {
      if (isSolved) return;
      const ok = tenFrameCount === exercise.targetNumber;
      if (!ok) triggerShake();
      onAttempt(ok);
    };

    return (
      <div className="space-y-5">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            addCounter();
          }}
          className={`mx-auto grid max-w-xl grid-cols-5 gap-2.5 rounded-3xl p-3.5 shadow-inner transition-all ${
            isDragOver
              ? "bg-sky-800 ring-4 ring-sky-400"
              : "bg-slate-900"
          } ${shakeTarget ? "animate-gentle-shake" : ""}`}
          role="grid"
          aria-label={`Ten-Frame drop zone: ${tenFrameCount} of ${exercise.frameSize}`}
        >
          {Array.from({ length: exercise.frameSize }).map((_, idx) => {
            const filled = idx < tenFrameCount;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleCell(idx)}
                aria-label={`Ten-Frame slot ${idx + 1}${filled ? ", filled" : ", empty"}`}
                className={`touch-card flex h-20 items-center justify-center rounded-2xl p-2 sm:h-24 ${
                  filled
                    ? "bg-amber-100 ring-4 ring-amber-400"
                    : "bg-white hover:bg-sky-100"
                }`}
              >
                {filled ? (
                  <div className="animate-star-pop">
                    <SeedItemArt
                      itemKey={exercise.counterVisual.audioKey}
                      fallbackEmoji={exercise.counterVisual.emoji}
                      className="h-12 w-12 sm:h-14 sm:w-14"
                    />
                  </div>
                ) : (
                  <span className="text-2xl font-black text-slate-300">+</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Draggable / Tappable Counter Tray */}
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-3xl bg-sky-50 p-4 ring-2 ring-sky-100">
          <button
            type="button"
            draggable={!isSolved}
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", "counter");
              playSfx("tap");
            }}
            onClick={addCounter}
            disabled={isSolved || tenFrameCount >= exercise.frameSize}
            className="touch-card flex cursor-grab items-center gap-3 rounded-2xl border-b-4 border-amber-500 bg-amber-200 px-6 py-3.5 text-lg font-black text-slate-900 shadow-sm hover:bg-amber-300 active:cursor-grabbing disabled:opacity-50"
          >
            <SeedItemArt
              itemKey={exercise.counterVisual.audioKey}
              fallbackEmoji={exercise.counterVisual.emoji}
              className="h-10 w-10"
            />
            <span>Drag or Tap +1 ({tenFrameCount})</span>
          </button>

          <button
            type="button"
            disabled={isSolved}
            onClick={() => {
              playSfx("tap");
              setTenFrameCount(exercise.initialCounters);
            }}
            className="touch-card rounded-2xl bg-slate-100 px-5 py-4 text-lg font-extrabold text-slate-800 hover:bg-slate-200 disabled:opacity-50"
          >
            🔄 Reset
          </button>

          <button
            type="button"
            disabled={isSolved}
            onClick={checkFrame}
            className="touch-card rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-extrabold text-white shadow-md hover:bg-emerald-500 disabled:opacity-55"
          >
            ✅ Check!
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. 2D / 3D SHAPE SORTING BUCKETS
  // =========================================================================
  if (exercise.type === "shape-sort") {
    const placeIntoTargetBucket = (optionId: string) => {
      if (isSolved) return;
      const picked = exercise.options.find((o) => o.id === optionId);
      if (!picked) return;

      playSfx("snap");
      setSortedOptionId(optionId);
      void playAudioKey(picked.audioKey, picked.label);

      const isCorrect = optionId === exercise.correctOptionId;
      if (!isCorrect) triggerShake();
      onAttempt(isCorrect);
    };

    const sortedOption = exercise.options.find((o) => o.id === sortedOptionId);

    return (
      <div className="space-y-6">
        {/* Target Shape Sorting Bucket Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const droppedId = e.dataTransfer.getData("text/plain");
            if (droppedId) placeIntoTargetBucket(droppedId);
          }}
          className={`mx-auto flex min-h-[156px] max-w-md flex-col items-center justify-center gap-2 rounded-3xl border-4 border-dashed p-5 text-center transition-all ${
            isSolved
              ? "border-emerald-500 bg-emerald-50"
              : isDragOver
              ? "scale-105 border-sky-500 bg-sky-100"
              : "border-sky-300 bg-sky-50/70"
          } ${shakeTarget ? "animate-gentle-shake" : ""}`}
        >
          <span className="rounded-full bg-white px-4 py-1 text-sm font-black uppercase tracking-wide text-sky-900 shadow-sm">
            🪣 {exercise.targetShape} Bucket
          </span>

          {sortedOption ? (
            <div className="animate-star-pop flex flex-col items-center gap-1">
              <ShapeSvg shape={sortedOption.label} className="h-16 w-16" />
              <span className="text-xl font-black capitalize text-slate-900">
                {sortedOption.displayText ?? sortedOption.label}
              </span>
            </div>
          ) : (
            <p className="text-base font-bold text-sky-900/80">
              Drag or tap the{" "}
              <span className="font-black underline">
                {exercise.targetShape}
              </span>{" "}
              into this bucket!
            </p>
          )}
        </div>

        {/* Shape Cards Tray */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {exercise.options.map((option) => {
            const isCorrectCard =
              isSolved && option.id === exercise.correctOptionId;
            return (
              <button
                key={option.id}
                type="button"
                draggable={!isSolved}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", option.id);
                  playSfx("tap");
                }}
                onClick={() => placeIntoTargetBucket(option.id)}
                aria-label={`Sort ${option.label} into ${exercise.targetShape} bucket`}
                className={`touch-card flex min-h-[128px] cursor-grab flex-col items-center justify-center gap-2 rounded-3xl border-4 p-4 shadow-sm active:cursor-grabbing ${
                  isCorrectCard
                    ? "border-emerald-500 bg-emerald-100 text-emerald-950"
                    : "border-slate-200 bg-white text-slate-900 hover:border-sky-400 hover:bg-sky-50"
                }`}
              >
                <ShapeSvg shape={option.label} className="h-16 w-16" />
                <span className="text-xl font-black capitalize">
                  {option.displayText ?? option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. UK COIN JAR (1p, 2p, 5p, 10p, 20p)
  // =========================================================================
  const coinPalette: UkCoin[] =
    exercise.targetPence <= 5
      ? ["1p", "2p", "5p"]
      : ["1p", "2p", "5p", "10p", "20p"];
  const jarTotal = jarCoins.reduce((sum, c) => sum + UK_COIN_VALUE[c], 0);

  const addCoinToJar = (coin: UkCoin) => {
    if (isSolved || jarCoins.length >= 10) return;
    const nextCoins = [...jarCoins, coin];
    const nextTotal = jarTotal + UK_COIN_VALUE[coin];
    setJarCoins(nextCoins);
    playSfx("snap");
    void playAudioKey(`coin/${nextTotal}p`, `${nextTotal} pence`);
  };

  const removeCoinFromJar = (coinIndex: number) => {
    if (isSolved) return;
    playSfx("tap");
    setJarCoins((prev) => prev.filter((_, idx) => idx !== coinIndex));
  };

  const checkCoinJar = () => {
    if (isSolved) return;
    const ok = jarTotal === exercise.targetPence;
    if (!ok) triggerShake();
    onAttempt(ok);
  };

  return (
    <div className="space-y-5">
      {/* Target Pence & Glass Coin Jar Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const dropped = e.dataTransfer.getData("text/plain") as UkCoin;
          if (dropped in UK_COIN_VALUE) addCoinToJar(dropped);
        }}
        className={`mx-auto max-w-lg rounded-3xl border-4 p-5 transition-all ${
          isSolved
            ? "border-emerald-500 bg-emerald-50"
            : isDragOver
            ? "scale-[1.02] border-sky-500 bg-sky-100"
            : "border-sky-300 bg-gradient-to-b from-sky-50 to-white"
        } ${shakeTarget ? "animate-gentle-shake" : ""}`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-amber-100 px-4 py-1.5 text-base font-black text-amber-950">
            🫙 Target: {exercise.targetPence}p
          </span>
          <span className="rounded-full bg-sky-100 px-4 py-1.5 text-base font-black text-sky-950">
            In Jar: {jarTotal}p
          </span>
        </div>

        <div className="flex min-h-[96px] flex-wrap items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-sky-200 bg-white/80 p-3">
          {jarCoins.length === 0 ? (
            <p className="text-sm font-bold text-slate-500">
              Drag or tap UK coins below to drop them into the jar!
            </p>
          ) : (
            jarCoins.map((coin, idx) => (
              <button
                key={`${coin}-${idx}`}
                type="button"
                onClick={() => removeCoinFromJar(idx)}
                aria-label={`Remove ${coin} coin from jar`}
                className={`touch-card animate-star-pop flex h-16 w-16 items-center justify-center border-4 text-lg font-black shadow-sm ${UK_COIN_VISUAL[coin]}`}
              >
                {coin}
              </button>
            ))
          )}
        </div>
      </div>

      {/* UK Coin Tray (1p–20p, >= 72px x 72px) */}
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-3xl bg-amber-50/80 p-4 ring-2 ring-amber-200">
        {coinPalette.map((coin) => (
          <button
            key={coin}
            type="button"
            draggable={!isSolved}
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", coin);
              playSfx("tap");
            }}
            onClick={() => addCoinToJar(coin)}
            disabled={isSolved}
            aria-label={`Add UK ${coin} coin`}
            className={`touch-card flex h-20 w-20 cursor-grab items-center justify-center border-4 text-xl font-black shadow-md active:cursor-grabbing disabled:opacity-50 ${UK_COIN_VISUAL[coin]}`}
          >
            {coin}
          </button>
        ))}
      </div>

      {/* Jar Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={isSolved || jarCoins.length === 0}
          onClick={() => {
            playSfx("tap");
            setJarCoins([]);
          }}
          className="touch-card rounded-2xl bg-slate-100 px-6 py-4 text-lg font-extrabold text-slate-800 hover:bg-slate-200 disabled:opacity-45"
        >
          🔄 Empty Jar
        </button>
        <button
          type="button"
          disabled={isSolved || jarCoins.length === 0}
          onClick={checkCoinJar}
          className="touch-card rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-extrabold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50"
        >
          ✅ Check {jarTotal}p
        </button>
      </div>
    </div>
  );
}

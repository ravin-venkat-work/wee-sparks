"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ShapeSortExercise,
  TenFrameCountExercise,
  UkCoin,
  UkCoinMatchExercise,
} from "@wee-sparks/curriculum-schema";
import { playAudioKey, playSfx } from "@/lib/audio";
import { SeedItemArt } from "./SeedItemArt";
import { ShapeSvg } from "./art/ShapeSvg";
import { UkCoinSvg } from "./art/UkCoinSvg";

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

interface ActivePointerDrag {
  payload: string;
  label: string;
  x: number;
  y: number;
  moved: boolean;
}

const HESITATION_MS = 9000;

/**
 * Tactile Pointer-Drag & Tap Sort Engine supporting:
 *  1. Ten-Frame counter drag/tap placement (build-on-frame)
 *  2. 2D/3D Shape sorting buckets (shape-sort)
 *  3. Northern Ireland / UK Coin Jar 1p–20p sorting (uk-coin-match)
 *
 * Uses unified Pointer Events (smooth on both tablet touchscreens and desktop
 * mouse/trackpads) with 1-tap accessibility and hesitation / 2-miss visual hints.
 */
export function DragSortEngine({
  exercise,
  isSolved,
  onAttempt,
}: DragSortEngineProps) {
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const [tenFrameCount, setTenFrameCount] = useState<number>(
    exercise.type === "ten-frame-count" ? exercise.initialCounters : 0
  );
  const [sortedOptionId, setSortedOptionId] = useState<string | null>(null);
  const [jarCoins, setJarCoins] = useState<UkCoin[]>([]);
  const [activeDrag, setActiveDrag] = useState<ActivePointerDrag | null>(null);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [shakeTarget, setShakeTarget] = useState(false);
  const [misses, setMisses] = useState(0);
  const [isHesitating, setIsHesitating] = useState(false);
  const [activityTick, setActivityTick] = useState(0);

  useEffect(() => {
    setTenFrameCount(
      exercise.type === "ten-frame-count" ? exercise.initialCounters : 0
    );
    setSortedOptionId(null);
    setJarCoins([]);
    setActiveDrag(null);
    setIsOverDropZone(false);
    setShakeTarget(false);
    setMisses(0);
    setIsHesitating(false);
    setActivityTick(0);
  }, [exercise]);

  // Hesitation cue timer (resets on every interaction)
  useEffect(() => {
    if (isSolved) {
      setIsHesitating(false);
      return;
    }
    setIsHesitating(false);
    const id = window.setTimeout(() => setIsHesitating(true), HESITATION_MS);
    return () => window.clearTimeout(id);
  }, [exercise, activityTick, isSolved]);

  const showVisualHint = !isSolved && (misses >= 2 || isHesitating);

  const markActivity = () => {
    setActivityTick((t) => t + 1);
  };

  const triggerShake = () => {
    setShakeTarget(true);
    window.setTimeout(() => setShakeTarget(false), 450);
  };

  const isPointInDropZone = (clientX: number, clientY: number): boolean => {
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (!rect) return false;
    return (
      clientX >= rect.left - 12 &&
      clientX <= rect.right + 12 &&
      clientY >= rect.top - 12 &&
      clientY <= rect.bottom + 12
    );
  };

  const startPointerDrag = (
    e: React.PointerEvent<HTMLButtonElement>,
    payload: string,
    label: string
  ) => {
    if (isSolved) return;
    markActivity();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    setActiveDrag({
      payload,
      label,
      x: e.clientX,
      y: e.clientY,
      moved: false,
    });
  };

  const movePointerDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!activeDrag || !pointerStartRef.current) return;
    const dist = Math.hypot(
      e.clientX - pointerStartRef.current.x,
      e.clientY - pointerStartRef.current.y
    );
    const moved = activeDrag.moved || dist > 10;
    setActiveDrag({ ...activeDrag, x: e.clientX, y: e.clientY, moved });
    if (moved) {
      setIsOverDropZone(isPointInDropZone(e.clientX, e.clientY));
    }
  };

  const cancelPointerDrag = () => {
    setActiveDrag(null);
    setIsOverDropZone(false);
    pointerStartRef.current = null;
  };

  const endPointerDrag = (
    e: React.PointerEvent<HTMLButtonElement>,
    onDropOrTap: (payload: string) => void
  ) => {
    if (!activeDrag) return;
    const { payload, moved } = activeDrag;
    const droppedInside = isPointInDropZone(e.clientX, e.clientY);
    setActiveDrag(null);
    setIsOverDropZone(false);
    pointerStartRef.current = null;

    // Fire on 1-tap OR when dragged onto the drop zone
    if (!moved || droppedInside) {
      onDropOrTap(payload);
    }
  };

  // =========================================================================
  // 1. TEN-FRAME DRAG & TAP BUILDER
  // =========================================================================
  if (exercise.type === "ten-frame-count") {
    const addCounter = () => {
      if (isSolved || tenFrameCount >= exercise.frameSize) return;
      markActivity();
      const next = tenFrameCount + 1;
      setTenFrameCount(next);
      playSfx("snap");
      void playAudioKey(`number/${next}`, String(next));
    };

    const toggleCell = (idx: number) => {
      if (isSolved) return;
      markActivity();
      const next = idx < tenFrameCount ? idx : idx + 1;
      setTenFrameCount(next);
      playSfx(next > tenFrameCount ? "snap" : "tap");
      void playAudioKey(`number/${next}`, String(next));
    };

    const checkFrame = () => {
      if (isSolved) return;
      markActivity();
      const ok = tenFrameCount === exercise.targetNumber;
      if (!ok) {
        setMisses((m) => m + 1);
        triggerShake();
      }
      onAttempt(ok);
    };

    const needsMore = tenFrameCount < exercise.targetNumber;

    return (
      <div className="space-y-5">
        {showVisualHint && (
          <div className="mx-auto max-w-md rounded-2xl bg-amber-100 px-4 py-2 text-center text-sm font-extrabold text-amber-950 ring-2 ring-amber-300">
            💡{" "}
            {needsMore
              ? `Tap or drag ${exercise.targetNumber - tenFrameCount} more onto the glowing square!`
              : tenFrameCount > exercise.targetNumber
              ? `Too many! Tap the last counter to take ${tenFrameCount - exercise.targetNumber} off.`
              : "Looks spot on — tap ✅ Check!"}
          </div>
        )}

        <div
          ref={dropZoneRef}
          className={`mx-auto grid max-w-xl grid-cols-5 gap-2.5 rounded-3xl p-3.5 shadow-inner transition-all ${
            isOverDropZone
              ? "scale-[1.01] bg-sky-800 ring-4 ring-sky-400"
              : "bg-slate-900"
          } ${shakeTarget ? "animate-gentle-shake" : ""}`}
          role="grid"
          aria-label={`Ten-Frame drop zone: ${tenFrameCount} of ${exercise.frameSize}`}
        >
          {Array.from({ length: exercise.frameSize }).map((_, idx) => {
            const filled = idx < tenFrameCount;
            const isHintCell =
              showVisualHint && needsMore && idx === tenFrameCount;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleCell(idx)}
                aria-label={`Ten-Frame slot ${idx + 1}${filled ? ", filled" : ", empty"}`}
                className={`touch-card flex h-20 items-center justify-center rounded-2xl p-2 sm:h-24 ${
                  filled
                    ? "bg-amber-100 ring-4 ring-amber-400"
                    : isHintCell
                    ? "animate-hint-glow bg-amber-50 ring-4 ring-amber-400"
                    : "bg-white hover:bg-sky-100"
                }`}
              >
                {filled ? (
                  <div className="animate-tile-snap">
                    <SeedItemArt
                      itemKey={exercise.counterVisual.audioKey}
                      fallbackEmoji={exercise.counterVisual.emoji}
                      className="h-12 w-12 sm:h-14 sm:w-14"
                    />
                  </div>
                ) : (
                  <span className="text-2xl font-black text-slate-300">
                    {isHintCell ? "👇" : "+"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Pointer-Draggable / Tappable Counter Tray */}
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-3xl bg-sky-50 p-4 ring-2 ring-sky-100">
          <button
            type="button"
            style={{ touchAction: "none" }}
            onPointerDown={(e) =>
              startPointerDrag(e, "counter", exercise.counterVisual.label)
            }
            onPointerMove={movePointerDrag}
            onPointerUp={(e) => endPointerDrag(e, () => addCounter())}
            onPointerCancel={cancelPointerDrag}
            disabled={isSolved || tenFrameCount >= exercise.frameSize}
            className={`touch-card flex cursor-grab items-center gap-3 rounded-2xl border-b-4 border-amber-500 bg-amber-200 px-6 py-3.5 text-lg font-black text-slate-900 shadow-sm hover:bg-amber-300 active:cursor-grabbing disabled:opacity-50 ${
              showVisualHint && needsMore ? "animate-hint-glow" : ""
            }`}
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
              markActivity();
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
            className={`touch-card rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-extrabold text-white shadow-md hover:bg-emerald-500 disabled:opacity-55 ${
              showVisualHint && tenFrameCount === exercise.targetNumber
                ? "animate-hint-glow"
                : ""
            }`}
          >
            ✅ Check!
          </button>
        </div>

        {activeDrag?.moved && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-amber-200/95 p-3 shadow-xl ring-4 ring-amber-400"
            style={{ left: activeDrag.x, top: activeDrag.y }}
          >
            <SeedItemArt
              itemKey={exercise.counterVisual.audioKey}
              fallbackEmoji={exercise.counterVisual.emoji}
              className="h-12 w-12"
            />
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. 2D / 3D SHAPE SORTING BUCKETS
  // =========================================================================
  if (exercise.type === "shape-sort") {
    const placeIntoTargetBucket = (optionId: string) => {
      const picked = exercise.options.find((o) => o.id === optionId);
      if (!picked) return;
      if (isSolved) {
        playSfx("tap");
        void playAudioKey(picked.audioKey, picked.label);
        return;
      }

      markActivity();
      playSfx("snap");
      setSortedOptionId(optionId);

      const isCorrect = optionId === exercise.correctOptionId;
      if (!isCorrect) {
        setMisses((m) => m + 1);
        triggerShake();
      }
      onAttempt(isCorrect);
    };

    const sortedOption = exercise.options.find((o) => o.id === sortedOptionId);

    return (
      <div className="space-y-6">
        <div
          ref={dropZoneRef}
          className={`mx-auto flex min-h-[156px] max-w-md flex-col items-center justify-center gap-2 rounded-3xl border-4 border-dashed p-5 text-center transition-all ${
            isSolved
              ? "border-emerald-500 bg-emerald-50"
              : isOverDropZone
              ? "scale-105 border-sky-500 bg-sky-100 ring-4 ring-sky-200"
              : "border-sky-300 bg-sky-50/70"
          } ${shakeTarget ? "animate-gentle-shake" : ""}`}
        >
          <span className="rounded-full bg-white px-4 py-1 text-sm font-black uppercase tracking-wide text-sky-900 shadow-sm">
            🪣 {exercise.targetShape} Bucket
          </span>

          {sortedOption ? (
            <div className="animate-tile-snap flex flex-col items-center gap-1">
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

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {exercise.options.map((option) => {
            const isCorrectCard =
              isSolved && option.id === exercise.correctOptionId;
            const isHintCard =
              showVisualHint && option.id === exercise.correctOptionId;

            return (
              <button
                key={option.id}
                type="button"
                style={{ touchAction: "none" }}
                onPointerDown={(e) =>
                  startPointerDrag(e, option.id, option.label)
                }
                onPointerMove={movePointerDrag}
                onPointerUp={(e) =>
                  endPointerDrag(e, (id) => placeIntoTargetBucket(id))
                }
                onPointerCancel={cancelPointerDrag}
                aria-label={`Sort ${option.label} into ${exercise.targetShape} bucket`}
                className={`touch-card flex min-h-[128px] cursor-grab flex-col items-center justify-center gap-2 rounded-3xl border-4 p-4 shadow-sm active:cursor-grabbing ${
                  isCorrectCard
                    ? "border-emerald-500 bg-emerald-100 text-emerald-950"
                    : isHintCard
                    ? "animate-hint-glow border-amber-400 bg-amber-50 text-slate-900"
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

        {activeDrag?.moved && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white/95 p-3 shadow-2xl ring-4 ring-sky-400"
            style={{ left: activeDrag.x, top: activeDrag.y }}
          >
            <ShapeSvg shape={activeDrag.label} className="h-16 w-16" />
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. UK COIN JAR (1p, 2p, 5p, 10p, 20p with authentic UkCoinSvg)
  // =========================================================================
  const coinPalette: UkCoin[] =
    exercise.targetPence <= 5
      ? ["1p", "2p", "5p"]
      : ["1p", "2p", "5p", "10p", "20p"];
  const jarTotal = jarCoins.reduce((sum, c) => sum + UK_COIN_VALUE[c], 0);
  const remainingPence = exercise.targetPence - jarTotal;

  // Pick the largest helpful UK coin for visual hint glow
  const suggestedCoin: UkCoin | null =
    remainingPence > 0
      ? [...coinPalette]
          .reverse()
          .find((c) => UK_COIN_VALUE[c] <= remainingPence) ?? null
      : null;

  const addCoinToJar = (coin: UkCoin) => {
    if (isSolved || jarCoins.length >= 10) return;
    markActivity();
    const nextCoins = [...jarCoins, coin];
    const nextTotal = jarTotal + UK_COIN_VALUE[coin];
    setJarCoins(nextCoins);
    playSfx("snap");
    void playAudioKey(`coin/${nextTotal}p`, `${nextTotal} pence`);
  };

  const removeCoinFromJar = (coinIndex: number) => {
    if (isSolved) return;
    markActivity();
    playSfx("tap");
    setJarCoins((prev) => prev.filter((_, idx) => idx !== coinIndex));
  };

  const checkCoinJar = () => {
    if (isSolved) return;
    markActivity();
    const ok = jarTotal === exercise.targetPence;
    if (!ok) {
      setMisses((m) => m + 1);
      triggerShake();
    }
    onAttempt(ok);
  };

  return (
    <div className="space-y-5">
      {showVisualHint && (
        <div className="mx-auto max-w-lg rounded-2xl bg-amber-100 px-4 py-2 text-center text-sm font-extrabold text-amber-950 ring-2 ring-amber-300">
          💡{" "}
          {remainingPence > 0 && suggestedCoin
            ? `Try dropping a ${suggestedCoin} coin into the jar (${remainingPence}p still needed)!`
            : remainingPence < 0
            ? `You have ${Math.abs(remainingPence)}p too much — tap a coin in the jar to take it out!`
            : `Exact match (${jarTotal}p) — tap ✅ Check!`}
        </div>
      )}

      {/* Glass Coin Jar Drop Zone */}
      <div
        ref={dropZoneRef}
        className={`mx-auto max-w-lg rounded-3xl border-4 p-5 transition-all ${
          isSolved
            ? "border-emerald-500 bg-emerald-50"
            : isOverDropZone
            ? "scale-[1.02] border-sky-500 bg-sky-100 ring-4 ring-sky-200"
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

        <div className="flex min-h-[104px] flex-wrap items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-sky-200 bg-white/85 p-3">
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
                className="touch-card animate-tile-snap flex h-16 w-16 items-center justify-center rounded-full hover:scale-105"
              >
                <UkCoinSvg coin={coin} className="h-16 w-16" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* UK Coin Tray (1p–20p, >= 80px x 80px) */}
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-3xl bg-amber-50/80 p-4 ring-2 ring-amber-200">
        {coinPalette.map((coin) => {
          const isSuggested = showVisualHint && coin === suggestedCoin;
          return (
            <button
              key={coin}
              type="button"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => startPointerDrag(e, coin, coin)}
              onPointerMove={movePointerDrag}
              onPointerUp={(e) =>
                endPointerDrag(e, (c) => addCoinToJar(c as UkCoin))
              }
              onPointerCancel={cancelPointerDrag}
              disabled={isSolved}
              aria-label={`Add UK ${coin} coin`}
              className={`touch-card flex h-20 w-20 cursor-grab items-center justify-center rounded-full p-1 transition-transform hover:scale-105 active:cursor-grabbing disabled:opacity-50 ${
                isSuggested ? "animate-hint-glow bg-amber-200/70" : ""
              }`}
            >
              <UkCoinSvg coin={coin} className="h-16 w-16" />
            </button>
          );
        })}
      </div>

      {/* Jar Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={isSolved || jarCoins.length === 0}
          onClick={() => {
            markActivity();
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
          className={`touch-card rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-extrabold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 ${
            showVisualHint && remainingPence === 0 ? "animate-hint-glow" : ""
          }`}
        >
          ✅ Check {jarTotal}p
        </button>
      </div>

      {activeDrag?.moved && activeDrag.payload in UK_COIN_VALUE && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 drop-shadow-xl"
          style={{ left: activeDrag.x, top: activeDrag.y }}
        >
          <UkCoinSvg coin={activeDrag.payload as UkCoin} className="h-20 w-20" />
        </div>
      )}
    </div>
  );
}

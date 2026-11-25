"use client";

import { useEffect, useState } from "react";
import type { NumberLineHopExercise } from "@wee-sparks/curriculum-schema";
import { playAudioKey, playSfx } from "@/lib/audio";
import { SeedItemArt } from "./SeedItemArt";

interface NumberLineEngineProps {
  exercise: NumberLineHopExercise;
  isSolved: boolean;
  onAttempt: (isCorrect: boolean) => void;
}

const HESITATION_MS = 9000;

/**
 * Interactive 0–10 / 0–20 Number Line hopping engine.
 * Supports smooth pointer/touch taps on >= 64px x 64px numeral stops, chunky
 * -1 / +1 hop buttons, animated hop arcs, and hesitation / 2-miss visual hints.
 */
export function NumberLineEngine({
  exercise,
  isSolved,
  onAttempt,
}: NumberLineEngineProps) {
  const [position, setPosition] = useState(exercise.startNumber);
  const [hopPath, setHopPath] = useState<number[]>([exercise.startNumber]);
  const [shakeLine, setShakeLine] = useState(false);
  const [misses, setMisses] = useState(0);
  const [isHesitating, setIsHesitating] = useState(false);
  const [activityTick, setActivityTick] = useState(0);

  useEffect(() => {
    setPosition(exercise.startNumber);
    setHopPath([exercise.startNumber]);
    setShakeLine(false);
    setMisses(0);
    setIsHesitating(false);
    setActivityTick(0);
  }, [exercise]);

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
  const shouldHopForward = position < exercise.targetNumber;
  const shouldHopBack = position > exercise.targetNumber;

  const numbers: number[] = [];
  for (let n = exercise.min; n <= exercise.max; n += 1) {
    numbers.push(n);
  }

  const moveTo = (nextPos: number) => {
    if (isSolved) return;
    if (nextPos < exercise.min || nextPos > exercise.max) return;
    setActivityTick((t) => t + 1);

    if (nextPos === position) {
      playSfx("tap");
      void playAudioKey(`number/${nextPos}`, String(nextPos));
      return;
    }

    playSfx("snap");
    setPosition(nextPos);
    setHopPath((prev) => [...prev, nextPos]);
    void playAudioKey(`number/${nextPos}`, String(nextPos));
  };

  const handleReset = () => {
    if (isSolved) return;
    setActivityTick((t) => t + 1);
    playSfx("tap");
    setPosition(exercise.startNumber);
    setHopPath([exercise.startNumber]);
    void playAudioKey(
      `number/${exercise.startNumber}`,
      String(exercise.startNumber)
    );
  };

  const handleCheck = () => {
    if (isSolved) return;
    setActivityTick((t) => t + 1);
    const isCorrect = position === exercise.targetNumber;
    if (!isCorrect) {
      setMisses((m) => m + 1);
      setShakeLine(true);
      window.setTimeout(() => setShakeLine(false), 450);
    }
    onAttempt(isCorrect);
  };

  const hopsTaken = Math.abs(position - exercise.startNumber);
  const operationSymbol =
    exercise.operation === "add"
      ? "+"
      : exercise.operation === "subtract"
      ? "−"
      : "→";

  const spanCount = Math.max(1, numbers.length - 1);
  const startPercent = ((exercise.startNumber - exercise.min) / spanCount) * 100;
  const currentPercent = ((position - exercise.min) / spanCount) * 100;
  const nextSuggestedNum = shouldHopForward
    ? position + 1
    : shouldHopBack
    ? position - 1
    : position;

  return (
    <div className="space-y-6">
      {showVisualHint && (
        <div className="mx-auto max-w-lg rounded-2xl bg-amber-100 px-4 py-2 text-center text-sm font-extrabold text-amber-950 ring-2 ring-amber-300">
          💡{" "}
          {shouldHopForward
            ? `Hop forward to the glowing number ${nextSuggestedNum}!`
            : shouldHopBack
            ? `Hop backwards to the glowing number ${nextSuggestedNum}!`
            : `You landed on ${position} — tap ✅ Check!`}
        </div>
      )}

      {/* Visual Number Story Pill */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-3 rounded-3xl bg-sky-100 px-6 py-3.5 text-2xl font-black text-sky-950 ring-2 ring-sky-200 sm:text-3xl">
          <SeedItemArt
            itemKey={exercise.hopperVisual.audioKey}
            fallbackEmoji={exercise.hopperVisual.emoji}
            className="h-11 w-11"
          />
          {exercise.operation === "count-to" ? (
            <span>
              Start at {exercise.startNumber} {operationSymbol} Land on{" "}
              {exercise.targetNumber}
            </span>
          ) : (
            <span>
              {exercise.startNumber} {operationSymbol} {exercise.hops} ={" "}
              <span className="inline-block min-w-[2ch] rounded-xl bg-white px-2.5 py-0.5 text-center text-sky-700 ring-2 ring-sky-300">
                {isSolved ? exercise.targetNumber : "?"}
              </span>
            </span>
          )}
        </div>

        <div className="rounded-2xl bg-amber-100 px-4 py-2.5 text-base font-extrabold text-amber-950">
          Hops: {hopsTaken} · Now on {position}
        </div>
      </div>

      {/* Scrollable Number Line Track with Hopping Arcs & >= 64px Stops */}
      <div
        className={`overflow-x-auto rounded-3xl bg-slate-50 px-4 pb-5 pt-3 ring-2 ring-slate-200 ${
          shakeLine ? "animate-gentle-shake" : ""
        }`}
      >
        <div
          className="relative mx-auto"
          style={{ minWidth: `${Math.max(640, numbers.length * 72)}px` }}
        >
          <svg
            viewBox="0 0 1000 76"
            className="h-16 w-full overflow-visible"
            aria-hidden="true"
          >
            <line
              x1="36"
              y1="66"
              x2="964"
              y2="66"
              stroke="#94A3B8"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {Array.from({ length: hopsTaken }).map((_, stepIdx) => {
              const dir = position >= exercise.startNumber ? 1 : -1;
              const fromNum = exercise.startNumber + dir * stepIdx;
              const toNum = fromNum + dir;
              const x1 = 36 + ((fromNum - exercise.min) / spanCount) * 928;
              const x2 = 36 + ((toNum - exercise.min) / spanCount) * 928;
              const midX = (x1 + x2) / 2;

              return (
                <path
                  key={`${fromNum}-${toNum}`}
                  d={`M ${x1} 64 Q ${midX} 12 ${x2} 64`}
                  fill="none"
                  stroke={isSolved ? "#10B981" : "#0284C7"}
                  strokeWidth="5"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Visual golden guide arc on hesitation or 2 misses */}
            {showVisualHint && nextSuggestedNum !== position && (
              <path
                d={`M ${36 + ((position - exercise.min) / spanCount) * 928} 64 Q ${
                  36 +
                  (((position + nextSuggestedNum) / 2 - exercise.min) /
                    spanCount) *
                    928
                } 6 ${
                  36 + ((nextSuggestedNum - exercise.min) / spanCount) * 928
                } 64`}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="5"
                strokeDasharray="6 5"
                strokeLinecap="round"
              />
            )}

            <circle
              cx={36 + (startPercent / 100) * 928}
              cy="66"
              r="8"
              fill="#F59E0B"
            />
            <circle
              cx={36 + (currentPercent / 100) * 928}
              cy="66"
              r="11"
              fill={isSolved ? "#10B981" : "#0284C7"}
            />
          </svg>

          {/* Numeral Stops (>= 64px x 64px) */}
          <div className="mt-1 flex items-center justify-between gap-2">
            {numbers.map((num) => {
              const isStart = num === exercise.startNumber;
              const isCurrent = num === position;
              const isVisited = hopPath.includes(num);
              const isHintStop =
                showVisualHint &&
                num === nextSuggestedNum &&
                nextSuggestedNum !== position;

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => moveTo(num)}
                  aria-label={`Hop to number ${num}${
                    isCurrent ? ", current position" : ""
                  }`}
                  aria-current={isCurrent ? "location" : undefined}
                  className={`touch-card relative flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border-4 text-2xl font-black shadow-sm ${
                    isCurrent && isSolved
                      ? "animate-tile-snap scale-110 border-emerald-500 bg-emerald-100 text-emerald-950"
                      : isCurrent
                      ? "animate-tile-snap scale-110 border-sky-500 bg-sky-100 text-sky-950 ring-4 ring-sky-200"
                      : isHintStop
                      ? "animate-hint-glow border-amber-400 bg-amber-100 text-amber-950"
                      : isStart
                      ? "border-amber-400 bg-amber-50 text-amber-950"
                      : isVisited
                      ? "border-sky-200 bg-white text-sky-900"
                      : "border-slate-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50"
                  }`}
                >
                  {isCurrent && (
                    <span
                      className="absolute -top-4 text-xl leading-none"
                      aria-hidden="true"
                    >
                      {exercise.hopperVisual.emoji}
                    </span>
                  )}
                  <span>{num}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chunky Hop Controls (>= 64px x 64px) */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => moveTo(position - 1)}
          disabled={isSolved || position <= exercise.min}
          className={`touch-card rounded-2xl bg-indigo-100 px-6 py-4 text-lg font-extrabold text-indigo-950 ring-2 ring-indigo-200 hover:bg-indigo-200 disabled:opacity-45 ${
            showVisualHint && shouldHopBack ? "animate-hint-glow" : ""
          }`}
        >
          ⬅️ Hop Back (-1)
        </button>

        <button
          type="button"
          onClick={() => moveTo(position + 1)}
          disabled={isSolved || position >= exercise.max}
          className={`touch-card rounded-2xl bg-sky-600 px-6 py-4 text-lg font-extrabold text-white shadow-md hover:bg-sky-500 disabled:opacity-45 ${
            showVisualHint && shouldHopForward ? "animate-hint-glow" : ""
          }`}
        >
          Hop Forward (+1) ➡️
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={isSolved}
          className="touch-card rounded-2xl bg-slate-100 px-5 py-4 text-lg font-extrabold text-slate-800 hover:bg-slate-200 disabled:opacity-45"
        >
          🔄 Reset
        </button>

        <button
          type="button"
          onClick={handleCheck}
          disabled={isSolved}
          className={`touch-card rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-extrabold text-white shadow-md hover:bg-emerald-500 disabled:opacity-55 ${
            showVisualHint && position === exercise.targetNumber
              ? "animate-hint-glow"
              : ""
          }`}
        >
          ✅ Check!
        </button>
      </div>
    </div>
  );
}

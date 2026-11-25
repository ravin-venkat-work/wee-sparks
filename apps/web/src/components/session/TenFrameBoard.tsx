"use client";

import type { TenFrameCountExercise } from "@wee-sparks/curriculum-schema";
import { playAudioKey, playSfx } from "@/lib/audio";
import { SeedItemArt } from "./SeedItemArt";

interface TenFrameBoardProps {
  exercise: TenFrameCountExercise;
  builtCounters: number;
  isSolved: boolean;
  shakeFrame: boolean;
  onChangeCounters: (nextCount: number) => void;
  onCheckBuild: () => void;
}

/**
 * Tactile 10-Frame (or 20-Frame) numeracy board with custom SVG counters,
 * audio counting on tap, and >= 64px x 64px interactive cells.
 */
export function TenFrameBoard({
  exercise,
  builtCounters,
  isSolved,
  shakeFrame,
  onChangeCounters,
  onCheckBuild,
}: TenFrameBoardProps) {
  const isBuildMode = exercise.mode === "build-on-frame";
  const activeCount = isBuildMode ? builtCounters : exercise.initialCounters;

  const handleCellTap = (cellIndex: number) => {
    if (!isBuildMode) {
      if (cellIndex < exercise.initialCounters) {
        playSfx("tap");
        const spokenNum = cellIndex + 1;
        void playAudioKey(`number/${spokenNum}`, String(spokenNum));
      }
      return;
    }

    if (isSolved) return;

    const nextCount = cellIndex < builtCounters ? cellIndex : cellIndex + 1;
    playSfx(nextCount > builtCounters ? "snap" : "tap");
    onChangeCounters(nextCount);
    void playAudioKey(`number/${nextCount}`, String(nextCount));
  };

  return (
    <div className="space-y-4">
      <div
        className={`mx-auto grid max-w-xl grid-cols-5 gap-2.5 rounded-3xl bg-slate-900 p-3.5 shadow-inner ${
          shakeFrame ? "animate-gentle-shake" : ""
        }`}
        role="grid"
        aria-label={`Ten-Frame showing ${activeCount} of ${exercise.frameSize}`}
      >
        {Array.from({ length: exercise.frameSize }).map((_, idx) => {
          const isFilled = idx < activeCount;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCellTap(idx)}
              aria-label={`Ten-Frame square ${idx + 1}${
                isFilled ? ", filled" : ", empty"
              }`}
              className={`touch-card flex h-20 items-center justify-center rounded-2xl p-2 sm:h-24 ${
                isFilled
                  ? "bg-amber-100 ring-4 ring-amber-400"
                  : isBuildMode
                  ? "bg-white hover:bg-sky-100"
                  : "bg-slate-100/95"
              }`}
            >
              {isFilled ? (
                <div className="animate-star-pop">
                  <SeedItemArt
                    itemKey={exercise.counterVisual.audioKey}
                    fallbackEmoji={exercise.counterVisual.emoji}
                    className="h-12 w-12 sm:h-14 sm:w-14"
                  />
                </div>
              ) : (
                <span className="text-2xl font-black text-slate-300">
                  {isBuildMode ? "+" : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isBuildMode && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex min-h-[64px] items-center gap-2.5 rounded-2xl bg-sky-100 px-5 py-3 text-2xl font-black text-sky-950">
            <SeedItemArt
              itemKey={exercise.counterVisual.audioKey}
              fallbackEmoji={exercise.counterVisual.emoji}
              className="h-9 w-9"
            />
            <span>{builtCounters}</span>
          </div>

          <button
            type="button"
            disabled={isSolved}
            onClick={() => {
              playSfx("tap");
              onChangeCounters(exercise.initialCounters);
              void playAudioKey(
                `number/${exercise.initialCounters}`,
                String(exercise.initialCounters)
              );
            }}
            className="touch-card rounded-2xl bg-slate-100 px-6 py-3.5 text-lg font-extrabold text-slate-800 hover:bg-slate-200 disabled:opacity-50"
          >
            🔄 Reset
          </button>

          <button
            type="button"
            onClick={onCheckBuild}
            disabled={isSolved}
            className="touch-card rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-extrabold text-white shadow-md hover:bg-emerald-500 disabled:opacity-60"
          >
            ✅ Check!
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

export interface ElkoninTile {
  id: string;
  grapheme: string;
  audioKey: string;
}

interface ElkoninSoundBoxesProps {
  slots: ReadonlyArray<ElkoninTile | null>;
  guideLetters?: ReadonlyArray<string>;
  activeSweepIndex: number;
  pulsedBoxIndex: number;
  isWordComplete: boolean;
  shakeBoxes: boolean;
  onBoxTap: (boxIndex: number) => void;
}

/**
 * Northern Ireland Linguistic Phonics Elkonin Sound Boxes with sound-button dots
 * and a left-to-right blending sweep bar underneath.
 * Tapping any placed box plays its isolated phoneme without deleting it.
 */
export function ElkoninSoundBoxes({
  slots,
  guideLetters,
  activeSweepIndex,
  pulsedBoxIndex,
  isWordComplete,
  shakeBoxes,
  onBoxTap,
}: ElkoninSoundBoxesProps) {
  const isSweeping = activeSweepIndex >= 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`inline-flex items-stretch overflow-hidden rounded-3xl border-4 border-indigo-900 bg-indigo-900 p-2 shadow-md ${
          shakeBoxes ? "animate-gentle-shake" : ""
        }`}
        role="group"
        aria-label="Elkonin sound boxes"
      >
        {slots.map((placed, idx) => {
          const isLit = activeSweepIndex === idx || pulsedBoxIndex === idx;
          const guide = guideLetters?.[idx];

          return (
            <div
              key={idx}
              className="flex flex-col items-center px-1.5 first:pl-0 last:pr-0"
            >
              <button
                type="button"
                onClick={() => onBoxTap(idx)}
                aria-label={
                  placed
                    ? `Sound box ${idx + 1}: ${placed.grapheme}. Tap to hear phoneme.`
                    : `Empty sound box ${idx + 1}`
                }
                className={`touch-card flex h-24 w-24 items-center justify-center rounded-2xl text-5xl font-black transition-all sm:h-28 sm:w-28 sm:text-6xl ${
                  isLit
                    ? "scale-105 bg-amber-200 text-amber-950 ring-4 ring-amber-400"
                    : placed && isWordComplete
                    ? "bg-emerald-100 text-emerald-950 ring-4 ring-emerald-400"
                    : placed
                    ? "bg-indigo-100 text-indigo-950 hover:bg-indigo-200"
                    : "bg-white text-slate-300 hover:bg-sky-50"
                }`}
              >
                {placed ? (
                  <span className="animate-star-pop">{placed.grapheme}</span>
                ) : (
                  <span className="text-4xl font-bold opacity-35">
                    {guide ?? "•"}
                  </span>
                )}
              </button>

              {/* Linguistic Phonics Sound-Button Dot */}
              <div className="mt-2 pb-1">
                <span
                  aria-hidden="true"
                  className={`block h-4 w-4 rounded-full transition-all ${
                    isLit
                      ? "scale-125 bg-amber-300 shadow-sm"
                      : placed && isWordComplete
                      ? "bg-emerald-300"
                      : placed
                      ? "bg-sky-300"
                      : "bg-indigo-400/50"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Left-to-right blending sweep track */}
      <div
        className="flex w-full max-w-xs items-center gap-2 px-2"
        aria-hidden="true"
      >
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-indigo-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isSweeping
                ? "bg-gradient-to-r from-amber-400 to-emerald-400"
                : isWordComplete
                ? "bg-emerald-400"
                : "bg-indigo-300"
            }`}
            style={{
              width: isSweeping
                ? `${Math.round(((activeSweepIndex + 1) / slots.length) * 100)}%`
                : isWordComplete
                ? "100%"
                : "0%",
            }}
          />
        </div>
        <span
          className={`text-xl font-black transition-transform ${
            isSweeping ? "translate-x-1 text-amber-500" : "text-indigo-400"
          }`}
        >
          ➜
        </span>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type {
  InitialSoundMatchExercise,
  NumberBondExercise,
  ShapeSortExercise,
  TenFrameCountExercise,
  UkCoin,
  UkCoinMatchExercise,
} from "@wee-sparks/curriculum-schema";
import { playAudioKey } from "@/lib/audio";

export type TapChoiceExercise =
  | InitialSoundMatchExercise
  | TenFrameCountExercise
  | NumberBondExercise
  | UkCoinMatchExercise
  | ShapeSortExercise;

interface TapChoiceEngineProps {
  exercise: TapChoiceExercise;
  isSolved: boolean;
  onAttempt: (isCorrect: boolean) => void;
}

const UK_COIN_STYLES: Record<UkCoin, string> = {
  "1p": "bg-amber-700 text-amber-50 border-amber-900 rounded-full",
  "2p": "bg-amber-700 text-amber-50 border-amber-900 rounded-full scale-105",
  "5p": "bg-slate-300 text-slate-900 border-slate-500 rounded-full",
  "10p": "bg-slate-300 text-slate-900 border-slate-500 rounded-full scale-105",
  "20p": "bg-slate-200 text-slate-900 border-slate-500 rounded-2xl",
};

/**
 * Tablet-first tap choice engine supporting Initial Sound Match, Ten-Frames
 * (count-to-numeral & build-on-frame), Number Bonds, UK Coins, and Shape Sort.
 */
export function TapChoiceEngine({
  exercise,
  isSolved,
  onAttempt,
}: TapChoiceEngineProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [wrongOptionId, setWrongOptionId] = useState<string | null>(null);
  const [builtCounters, setBuiltCounters] = useState<number>(
    exercise.type === "ten-frame-count" ? exercise.initialCounters : 0
  );
  const [shakeFrame, setShakeFrame] = useState(false);

  useEffect(() => {
    setSelectedOptionId(null);
    setWrongOptionId(null);
    setShakeFrame(false);
    setBuiltCounters(
      exercise.type === "ten-frame-count" ? exercise.initialCounters : 0
    );
  }, [exercise]);

  const handleOptionTap = (
    optionId: string,
    correctOptionId: string,
    audioKey: string,
    label: string
  ) => {
    void playAudioKey(audioKey, label);
    if (isSolved) return;

    setSelectedOptionId(optionId);
    const isCorrect = optionId === correctOptionId;

    if (!isCorrect) {
      setWrongOptionId(optionId);
      window.setTimeout(() => setWrongOptionId(null), 500);
    }

    onAttempt(isCorrect);
  };

  const handleTenFrameCellTap = (cellIndex: number) => {
    if (exercise.type !== "ten-frame-count") return;

    if (exercise.mode === "count-to-numeral") {
      if (cellIndex < exercise.initialCounters) {
        const spokenNum = cellIndex + 1;
        void playAudioKey(`number/${spokenNum}`, String(spokenNum));
      }
      return;
    }

    if (isSolved) return;

    // Tactile toggle: tap an empty cell to fill up to it, or tap a filled cell to reduce
    const nextCount = cellIndex < builtCounters ? cellIndex : cellIndex + 1;
    setBuiltCounters(nextCount);
    void playAudioKey(`number/${nextCount}`, String(nextCount));
  };

  const handleCheckTenFrameBuild = () => {
    if (exercise.type !== "ten-frame-count" || isSolved) return;
    const isCorrect = builtCounters === exercise.targetNumber;
    if (!isCorrect) {
      setShakeFrame(true);
      window.setTimeout(() => setShakeFrame(false), 450);
    }
    onAttempt(isCorrect);
  };

  const renderStimulus = () => {
    if (exercise.type === "initial-sound-match") {
      const isSoundPrompt = exercise.mode === "sound-to-picture";
      return (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() =>
              void playAudioKey(
                isSoundPrompt
                  ? exercise.targetSoundAudioKey
                  : exercise.stimulus.audioKey,
                isSoundPrompt
                  ? exercise.targetSound
                  : exercise.stimulus.label
              )
            }
            aria-label={
              isSoundPrompt
                ? `Hear target sound ${exercise.targetSound}`
                : `Hear word ${exercise.stimulus.label}`
            }
            className="touch-card flex min-h-[96px] items-center gap-5 rounded-3xl bg-sky-100 px-8 py-5 text-sky-950 shadow-sm ring-4 ring-sky-200 hover:bg-sky-200"
          >
            {isSoundPrompt ? (
              <>
                <span className="text-4xl" aria-hidden="true">
                  🔊
                </span>
                <span className="text-5xl font-black tracking-wide">
                  /{exercise.targetSound}/
                </span>
              </>
            ) : (
              <>
                <span className="text-6xl" aria-hidden="true">
                  {exercise.stimulus.emoji}
                </span>
                <div className="text-left">
                  <div className="text-3xl font-black capitalize">
                    {exercise.stimulus.label}
                  </div>
                  <div className="text-sm font-bold text-sky-700">
                    🔊 Tap to hear
                  </div>
                </div>
              </>
            )}
          </button>
        </div>
      );
    }

    if (exercise.type === "ten-frame-count") {
      const activeCount =
        exercise.mode === "build-on-frame"
          ? builtCounters
          : exercise.initialCounters;

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
                  onClick={() => handleTenFrameCellTap(idx)}
                  aria-label={`Ten-Frame square ${idx + 1}${
                    isFilled ? ", filled" : ", empty"
                  }`}
                  className={`touch-card flex h-20 items-center justify-center rounded-2xl text-4xl sm:h-24 sm:text-5xl ${
                    isFilled
                      ? "bg-amber-100 ring-4 ring-amber-400"
                      : exercise.mode === "build-on-frame"
                      ? "bg-white hover:bg-sky-100"
                      : "bg-slate-100/95"
                  }`}
                >
                  {isFilled ? (
                    <span className="animate-star-pop">
                      {exercise.counterVisual.emoji}
                    </span>
                  ) : (
                    <span className="text-lg font-bold text-slate-300">
                      {exercise.mode === "build-on-frame" ? "+" : ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {exercise.mode === "build-on-frame" && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex min-h-[64px] items-center gap-2 rounded-2xl bg-sky-100 px-5 py-3 text-xl font-extrabold text-sky-950">
                <span>{exercise.counterVisual.emoji}</span>
                <span>{builtCounters}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isSolved) return;
                  setBuiltCounters(exercise.initialCounters);
                  void playAudioKey(
                    `number/${exercise.initialCounters}`,
                    String(exercise.initialCounters)
                  );
                }}
                className="touch-card rounded-2xl bg-slate-100 px-5 py-3 text-lg font-bold text-slate-700 hover:bg-slate-200"
              >
                🔄 Reset
              </button>

              <button
                type="button"
                onClick={handleCheckTenFrameBuild}
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

    if (exercise.type === "number-bond") {
      return (
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-4xl font-black text-amber-950 ring-4 ring-amber-300">
            {exercise.givenPart}
          </div>
          <span className="text-4xl font-black text-slate-500">+</span>
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-dashed border-sky-400 bg-sky-50 text-4xl font-black text-sky-600">
            ?
          </div>
          <span className="text-4xl font-black text-slate-500">=</span>
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-4xl font-black text-emerald-950 ring-4 ring-emerald-300">
            {exercise.whole}
          </div>
        </div>
      );
    }

    if (exercise.type === "uk-coin-match") {
      return (
        <div className="flex flex-wrap items-center justify-center gap-4">
          {exercise.coinsShown.map((coin, idx) => (
            <button
              key={`${coin}-${idx}`}
              type="button"
              onClick={() => void playAudioKey(`coin/${coin}`, coin)}
              className={`touch-card flex h-20 w-20 items-center justify-center border-4 text-2xl font-black shadow-md ${UK_COIN_STYLES[coin]}`}
            >
              {coin}
            </button>
          ))}
        </div>
      );
    }

    return null;
  };

  const showChoiceGrid =
    !(exercise.type === "ten-frame-count" && exercise.mode === "build-on-frame") &&
    "options" in exercise &&
    Boolean(exercise.options) &&
    Boolean(exercise.correctOptionId);

  return (
    <div className="space-y-6">
      {renderStimulus()}

      {showChoiceGrid && exercise.options && exercise.correctOptionId && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {exercise.options.map((option) => {
            const isCorrectCard =
              isSolved && option.id === exercise.correctOptionId;
            const isWrongFlash = wrongOptionId === option.id;
            const isSelected = selectedOptionId === option.id;

            return (
              <div key={option.id} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    handleOptionTap(
                      option.id,
                      exercise.correctOptionId!,
                      option.audioKey,
                      option.label
                    )
                  }
                  aria-label={`Choose ${option.label}`}
                  className={`touch-card flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-3xl border-4 p-4 text-center shadow-sm sm:min-h-[136px] ${
                    isCorrectCard
                      ? "border-emerald-500 bg-emerald-100 text-emerald-950 shadow-emerald-200"
                      : isWrongFlash
                      ? "animate-gentle-shake border-amber-400 bg-amber-100 text-amber-950"
                      : isSelected
                      ? "border-sky-400 bg-sky-50 text-slate-900"
                      : "border-slate-200 bg-white text-slate-900 hover:border-sky-400 hover:bg-sky-50"
                  }`}
                >
                  {option.emoji && (
                    <span className="text-5xl sm:text-6xl" aria-hidden="true">
                      {option.emoji}
                    </span>
                  )}
                  <span
                    className={`font-black ${
                      option.emoji
                        ? "text-xl sm:text-2xl"
                        : "text-4xl sm:text-5xl"
                    }`}
                  >
                    {option.displayText ?? option.label}
                  </span>
                  {isCorrectCard && (
                    <span className="animate-star-pop text-xl" aria-hidden="true">
                      ⭐
                    </span>
                  )}
                </button>

                {/* Dedicated card audio preview badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void playAudioKey(option.audioKey, option.label);
                  }}
                  aria-label={`Listen to ${option.label}`}
                  className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-base shadow-sm ring-1 ring-amber-300 hover:bg-amber-200"
                >
                  🔊
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

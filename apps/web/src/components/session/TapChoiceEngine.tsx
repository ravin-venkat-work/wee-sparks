"use client";

import { useEffect, useState } from "react";
import type {
  HighFrequencyWordExercise,
  InitialSoundMatchExercise,
  NumberBondExercise,
  ShapeSortExercise,
  TenFrameCountExercise,
  UkCoin,
  UkCoinMatchExercise,
} from "@wee-sparks/curriculum-schema";
import { playAudioKey, playPhoneme, playSfx } from "@/lib/audio";
import { SeedItemArt } from "./SeedItemArt";
import { TenFrameBoard } from "./TenFrameBoard";

export type TapChoiceExercise =
  | InitialSoundMatchExercise
  | HighFrequencyWordExercise
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
 * Tablet-first tap choice engine supporting Initial Sound Match, Ten-Frames,
 * Number Bonds, UK Coins, and Shape Sort with custom SVG visuals and >= 64px cards.
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
    if (isSolved) {
      playSfx("tap");
      if (audioKey.startsWith("phoneme/")) {
        void playPhoneme(label, audioKey);
      } else {
        void playAudioKey(audioKey, label);
      }
      return;
    }

    setSelectedOptionId(optionId);
    const isCorrect = optionId === correctOptionId;

    if (!isCorrect) {
      setWrongOptionId(optionId);
      window.setTimeout(() => setWrongOptionId(null), 500);
    }

    // Let KidSessionPlayer play the single clean feedback cue without audio overlap
    onAttempt(isCorrect);
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
            onClick={() => {
              playSfx("tap");
              if (isSoundPrompt) {
                void playPhoneme(
                  exercise.targetSound,
                  exercise.targetSoundAudioKey
                );
              } else {
                void playAudioKey(
                  exercise.stimulus.audioKey,
                  exercise.stimulus.label
                );
              }
            }}
            aria-label={
              isSoundPrompt
                ? `Hear target sound ${exercise.targetSound}`
                : `Hear word ${exercise.stimulus.label}`
            }
            className="touch-card flex min-h-[100px] items-center gap-5 rounded-3xl bg-sky-100 px-8 py-5 text-sky-950 shadow-sm ring-4 ring-sky-200 hover:bg-sky-200"
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
                <SeedItemArt
                  itemKey={exercise.stimulus.audioKey}
                  fallbackEmoji={exercise.stimulus.emoji}
                  className="h-20 w-20"
                />
                <div className="text-left">
                  <div className="text-3xl font-black capitalize">
                    {exercise.stimulus.label}
                  </div>
                  <div className="text-sm font-extrabold text-sky-700">
                    🔊 Tap to hear
                  </div>
                </div>
              </>
            )}
          </button>
        </div>
      );
    }

    if (exercise.type === "high-frequency-word") {
      return (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              playSfx("tap");
              void playAudioKey(
                exercise.contextAudioKey,
                exercise.contextSentence.replace(/___/g, exercise.targetWord)
              );
            }}
            aria-label={`Hear sentence: ${exercise.contextSentence.replace(/___/g, exercise.targetWord)}`}
            className="touch-card flex min-h-[100px] items-center gap-4 rounded-3xl bg-violet-100 px-8 py-5 text-violet-950 shadow-sm ring-4 ring-violet-200 hover:bg-violet-200"
          >
            <span className="text-5xl" aria-hidden="true">
              {exercise.stimulusEmoji}
            </span>
            <div className="text-left">
              <div className="text-2xl font-black tracking-wide sm:text-3xl">
                {exercise.contextSentence}
              </div>
              <div className="text-sm font-extrabold text-violet-700">
                🔊 Tap to hear the sentence
              </div>
            </div>
          </button>
        </div>
      );
    }

    if (exercise.type === "ten-frame-count") {
      return (
        <TenFrameBoard
          exercise={exercise}
          builtCounters={builtCounters}
          isSolved={isSolved}
          shakeFrame={shakeFrame}
          onChangeCounters={setBuiltCounters}
          onCheckBuild={handleCheckTenFrameBuild}
        />
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
              onClick={() => {
                playSfx("tap");
                void playAudioKey(`coin/${coin}`, coin);
              }}
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
    !(
      exercise.type === "ten-frame-count" && exercise.mode === "build-on-frame"
    ) &&
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
            const isVisualOption = Boolean(option.emoji);

            return (
              <button
                key={option.id}
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
                className={`touch-card flex min-h-[128px] w-full flex-col items-center justify-center gap-2 rounded-3xl border-4 p-4 text-center shadow-sm sm:min-h-[144px] ${
                  isCorrectCard
                    ? "border-emerald-500 bg-emerald-100 text-emerald-950 shadow-emerald-200"
                    : isWrongFlash
                    ? "animate-gentle-shake border-amber-400 bg-amber-100 text-amber-950"
                    : isSelected
                    ? "border-sky-400 bg-sky-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-900 hover:border-sky-400 hover:bg-sky-50"
                }`}
              >
                {isVisualOption && (
                  <SeedItemArt
                    itemKey={option.audioKey}
                    fallbackEmoji={option.emoji}
                    className="h-16 w-16 sm:h-20 sm:w-20"
                  />
                )}
                <span
                  className={`font-black ${
                    isVisualOption
                      ? "text-xl sm:text-2xl"
                      : "text-5xl sm:text-6xl"
                  }`}
                >
                  {option.displayText ?? option.label}
                </span>
                {isCorrectCard && (
                  <span
                    className="animate-star-pop text-lg font-extrabold text-emerald-700"
                    aria-hidden="true"
                  >
                    ⭐
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LINGUISTIC_PHONICS_SATPIN,
  type CvcBlendingExercise,
  type PhonemeSegmentExercise,
} from "@wee-sparks/curriculum-schema";
import { playAudioKey, playAudioSequence } from "@/lib/audio";

export type PhonicsBuilderExercise =
  | CvcBlendingExercise
  | PhonemeSegmentExercise;

interface PhonicsBuilderEngineProps {
  exercise: PhonicsBuilderExercise;
  isSolved: boolean;
  onAttempt: (isCorrect: boolean) => void;
}

interface TileItem {
  id: string;
  grapheme: string;
  audioKey: string;
}

/**
 * Deterministic shuffle seeded by exercise ID so hydration stays consistent
 * and tile order varies naturally across exercises.
 */
function deterministicShuffle<T>(items: readonly T[], seed: string): T[] {
  const result = [...items];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  for (let i = result.length - 1; i > 0; i -= 1) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    const j = hash % (i + 1);
    const tmp = result[i]!;
    result[i] = result[j]!;
    result[j] = tmp;
  }
  return result;
}

/**
 * Interactive Phonics Builder Engine featuring chunky NI Linguistic Phonics
 * Elkonin sound boxes, sound-button dots, grapheme tile tray, and left-to-right
 * audio sweep blending.
 */
export function PhonicsBuilderEngine({
  exercise,
  isSolved,
  onAttempt,
}: PhonicsBuilderEngineProps) {
  const expectedGraphemes = useMemo<string[]>(() => {
    if (exercise.type === "cvc-blending") {
      return exercise.phonemes.map((p) => p.grapheme);
    }
    return exercise.correctGraphemes;
  }, [exercise]);

  const tileBank = useMemo<TileItem[]>(() => {
    if (exercise.type === "phoneme-segment") {
      return exercise.tileBank;
    }

    const baseTiles: TileItem[] = exercise.phonemes.map((p, idx) => ({
      id: `${exercise.id}-tile-${idx}-${p.grapheme}`,
      grapheme: p.grapheme,
      audioKey: p.audioKey,
    }));

    // Add 2 Linguistic Phonics Stage 1 distractors not already in the word
    const usedLetters = new Set(
      exercise.phonemes.map((p) => p.grapheme.toLowerCase())
    );
    const extras = LINGUISTIC_PHONICS_SATPIN.filter(
      (g) => !usedLetters.has(g)
    ).slice(0, 2);

    const distractorTiles: TileItem[] = extras.map((g, idx) => ({
      id: `${exercise.id}-extra-${idx}-${g}`,
      grapheme: g,
      audioKey: `phoneme/${g}`,
    }));

    return deterministicShuffle([...baseTiles, ...distractorTiles], exercise.id);
  }, [exercise]);

  const [slots, setSlots] = useState<Array<TileItem | null>>(() =>
    Array.from({ length: expectedGraphemes.length }, () => null)
  );
  const [activeSweepIndex, setActiveSweepIndex] = useState<number>(-1);
  const [isBlending, setIsBlending] = useState(false);
  const [shakeBoxes, setShakeBoxes] = useState(false);
  const [wrongOptionId, setWrongOptionId] = useState<string | null>(null);

  useEffect(() => {
    setSlots(Array.from({ length: expectedGraphemes.length }, () => null));
    setActiveSweepIndex(-1);
    setIsBlending(false);
    setShakeBoxes(false);
    setWrongOptionId(null);
  }, [exercise, expectedGraphemes.length]);

  const placedTileIds = useMemo(
    () => new Set(slots.filter((s): s is TileItem => s !== null).map((s) => s.id)),
    [slots]
  );

  const isAllBoxesFilled = slots.every((s) => s !== null);

  const builtWordMatchesTarget = useMemo(() => {
    if (!isAllBoxesFilled) return false;
    return slots.every(
      (slot, idx) =>
        slot?.grapheme.toLowerCase() === expectedGraphemes[idx]?.toLowerCase()
    );
  }, [isAllBoxesFilled, slots, expectedGraphemes]);

  const handleTileTap = (tile: TileItem) => {
    void playAudioKey(tile.audioKey, tile.grapheme);
    if (isSolved || placedTileIds.has(tile.id)) return;

    const firstEmptyIdx = slots.findIndex((s) => s === null);
    if (firstEmptyIdx === -1) return;

    const nextSlots = [...slots];
    nextSlots[firstEmptyIdx] = tile;
    setSlots(nextSlots);

    // If CVC blending and boxes are now filled incorrectly, give gentle shake
    if (
      exercise.type === "cvc-blending" &&
      nextSlots.every((s) => s !== null)
    ) {
      const matches = nextSlots.every(
        (slot, idx) =>
          slot?.grapheme.toLowerCase() === expectedGraphemes[idx]?.toLowerCase()
      );
      if (!matches) {
        setShakeBoxes(true);
        window.setTimeout(() => setShakeBoxes(false), 450);
      }
    }
  };

  const handleElkoninBoxTap = (boxIndex: number) => {
    const placed = slots[boxIndex];
    if (!placed) {
      // Speak guide sound if available in cvc-blending
      if (exercise.type === "cvc-blending") {
        const targetTile = exercise.phonemes[boxIndex];
        if (targetTile) {
          void playAudioKey(targetTile.audioKey, targetTile.grapheme);
        }
      }
      return;
    }

    void playAudioKey(placed.audioKey, placed.grapheme);

    if (isSolved) return;

    // Pop the letter back out to the tile tray so young children can easily adjust
    const nextSlots = [...slots];
    nextSlots[boxIndex] = null;
    setSlots(nextSlots);
  };

  const handleClearBoxes = () => {
    if (isSolved) return;
    setSlots(Array.from({ length: expectedGraphemes.length }, () => null));
  };

  const handleSweepBlend = async () => {
    if (isBlending) return;
    setIsBlending(true);

    const sequence = slots.map((slot, idx) => {
      if (slot) {
        return {
          audioKey: slot.audioKey,
          fallbackText: slot.grapheme,
          rate: 0.78,
        };
      }
      if (exercise.type === "cvc-blending") {
        const p = exercise.phonemes[idx]!;
        return { audioKey: p.audioKey, fallbackText: p.grapheme, rate: 0.78 };
      }
      return {
        audioKey: `phoneme/${expectedGraphemes[idx] ?? ""}`,
        fallbackText: expectedGraphemes[idx] ?? "",
        rate: 0.78,
      };
    });

    await playAudioSequence(sequence, setActiveSweepIndex);

    // Speak the full blended word when boxes match target or are empty (preview)
    const isEmpty = slots.every((s) => s === null);
    if (builtWordMatchesTarget || (isEmpty && exercise.type === "cvc-blending")) {
      await playAudioKey(exercise.wordAudioKey, exercise.targetWord, {
        rate: 0.88,
      });
    }

    setActiveSweepIndex(-1);
    setIsBlending(false);
  };

  const handleSegmentCheck = () => {
    if (exercise.type !== "phoneme-segment" || isSolved) return;

    if (!builtWordMatchesTarget) {
      setShakeBoxes(true);
      window.setTimeout(() => setShakeBoxes(false), 450);
    }
    onAttempt(builtWordMatchesTarget);
  };

  const handleCvcPictureChoice = (
    optionId: string,
    audioKey: string,
    label: string
  ) => {
    if (exercise.type !== "cvc-blending") return;
    void playAudioKey(audioKey, label);
    if (isSolved) return;

    const isCorrect = optionId === exercise.correctOptionId;
    if (!isCorrect) {
      setWrongOptionId(optionId);
      window.setTimeout(() => setWrongOptionId(null), 500);
    }
    onAttempt(isCorrect);
  };

  return (
    <div className="space-y-6">
      {/* Stimulus header for phoneme-segment */}
      {exercise.type === "phoneme-segment" && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() =>
              void playAudioKey(exercise.wordAudioKey, exercise.targetWord)
            }
            className="touch-card flex items-center gap-4 rounded-3xl bg-indigo-100 px-8 py-4 text-indigo-950 ring-4 ring-indigo-200 hover:bg-indigo-200"
          >
            <span className="text-6xl" aria-hidden="true">
              {exercise.stimulusEmoji}
            </span>
            <span className="text-2xl font-extrabold">🔊 Hear Word</span>
          </button>
        </div>
      )}

      {/* Elkonin Sound Boxes Frame */}
      <div className="flex flex-col items-center gap-4">
        <div
          className={`inline-flex items-stretch overflow-hidden rounded-3xl border-4 border-indigo-900 bg-indigo-900 p-1.5 shadow-md ${
            shakeBoxes ? "animate-gentle-shake" : ""
          }`}
          role="group"
          aria-label="Elkonin sound boxes"
        >
          {slots.map((placed, idx) => {
            const isSweeping = activeSweepIndex === idx;
            const guideLetter =
              exercise.type === "cvc-blending"
                ? exercise.phonemes[idx]?.grapheme
                : undefined;

            return (
              <div
                key={idx}
                className="flex flex-col items-center px-1 first:pl-0 last:pr-0"
              >
                <button
                  type="button"
                  onClick={() => handleElkoninBoxTap(idx)}
                  aria-label={
                    placed
                      ? `Sound box ${idx + 1}: letter ${placed.grapheme}. Tap to remove.`
                      : `Empty sound box ${idx + 1}`
                  }
                  className={`touch-card flex h-24 w-24 items-center justify-center rounded-2xl text-5xl font-black transition-all sm:h-28 sm:w-28 sm:text-6xl ${
                    isSweeping
                      ? "scale-105 bg-amber-200 text-amber-950 ring-4 ring-amber-400"
                      : placed && builtWordMatchesTarget
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
                      {guideLetter ?? "•"}
                    </span>
                  )}
                </button>

                {/* Classic NI Linguistic Phonics Sound-Button Dot */}
                <div className="mt-2 pb-1">
                  <span
                    aria-hidden="true"
                    className={`block h-4 w-4 rounded-full transition-all ${
                      isSweeping
                        ? "scale-125 bg-amber-300 shadow-sm"
                        : placed
                        ? "bg-emerald-300"
                        : "bg-indigo-400/50"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sweep & Blend + Clear controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => void handleSweepBlend()}
            disabled={isBlending}
            className="touch-card flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-lg font-extrabold text-white shadow-md hover:bg-indigo-500 disabled:opacity-70"
          >
            <span aria-hidden="true">➡️</span>
            <span>{isBlending ? "Blending..." : "Slide & Blend"}</span>
          </button>

          {slots.some((s) => s !== null) && !isSolved && (
            <button
              type="button"
              onClick={handleClearBoxes}
              className="touch-card rounded-2xl bg-slate-100 px-5 py-3.5 text-lg font-bold text-slate-700 hover:bg-slate-200"
            >
              🔄 Clear
            </button>
          )}

          {exercise.type === "phoneme-segment" && (
            <button
              type="button"
              onClick={handleSegmentCheck}
              disabled={!isAllBoxesFilled || isSolved}
              className="touch-card rounded-2xl bg-emerald-600 px-7 py-3.5 text-lg font-extrabold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50"
            >
              ✅ Check Word
            </button>
          )}
        </div>
      </div>

      {/* Tactile Grapheme Tile Tray */}
      <div className="rounded-3xl bg-sky-50/90 p-4 ring-2 ring-sky-100">
        <p className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-sky-800">
          Tap letters to fill the sound boxes
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {tileBank.map((tile) => {
            const isPlaced = placedTileIds.has(tile.id);
            return (
              <button
                key={tile.id}
                type="button"
                disabled={isPlaced || isSolved}
                onClick={() => handleTileTap(tile)}
                aria-label={`Letter tile ${tile.grapheme}`}
                className={`touch-card flex h-20 w-20 items-center justify-center rounded-2xl border-b-4 text-4xl font-black shadow-sm sm:h-24 sm:w-24 sm:text-5xl ${
                  isPlaced
                    ? "border-slate-200 bg-slate-200/70 text-slate-400 opacity-50"
                    : "border-amber-500 bg-amber-200 text-slate-900 hover:bg-amber-300"
                }`}
              >
                {tile.grapheme}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase 2 for CVC Blending: Tap the matching picture card */}
      {exercise.type === "cvc-blending" && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-center">
            <span
              className={`rounded-full px-4 py-1.5 text-sm font-extrabold ${
                builtWordMatchesTarget
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {builtWordMatchesTarget
                ? `✨ Now tap the matching picture for "${exercise.targetWord}"!`
                : "Step 2: Build the word in the boxes above, then tap the picture!"}
            </span>
          </div>

          <div
            className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-4 ${
              builtWordMatchesTarget || isSolved
                ? "opacity-100"
                : "opacity-60"
            }`}
          >
            {exercise.options.map((option) => {
              const isCorrectCard =
                isSolved && option.id === exercise.correctOptionId;
              const isWrongFlash = wrongOptionId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={!builtWordMatchesTarget && !isSolved}
                  onClick={() =>
                    handleCvcPictureChoice(
                      option.id,
                      option.audioKey,
                      option.label
                    )
                  }
                  aria-label={`Match picture ${option.label}`}
                  className={`touch-card flex min-h-[116px] flex-col items-center justify-center gap-2 rounded-3xl border-4 p-4 shadow-sm ${
                    isCorrectCard
                      ? "border-emerald-500 bg-emerald-100 text-emerald-950"
                      : isWrongFlash
                      ? "animate-gentle-shake border-amber-400 bg-amber-100 text-amber-950"
                      : "border-slate-200 bg-white text-slate-900 hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {option.emoji && (
                    <span className="text-5xl" aria-hidden="true">
                      {option.emoji}
                    </span>
                  )}
                  <span className="text-xl font-black">
                    {option.displayText ?? option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

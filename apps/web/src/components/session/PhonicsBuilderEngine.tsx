"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LINGUISTIC_PHONICS_SATPIN,
  type CvcBlendingExercise,
  type PhonemeSegmentExercise,
} from "@wee-sparks/curriculum-schema";
import {
  playAudioKey,
  playAudioSequence,
  playPhoneme,
  playSfx,
} from "@/lib/audio";
import { ElkoninSoundBoxes, type ElkoninTile } from "./ElkoninSoundBoxes";
import { SeedItemArt } from "./SeedItemArt";

export type PhonicsBuilderExercise =
  | CvcBlendingExercise
  | PhonemeSegmentExercise;

interface PhonicsBuilderEngineProps {
  exercise: PhonicsBuilderExercise;
  isSolved: boolean;
  onAttempt: (isCorrect: boolean) => void;
  onThinkingChange?: (isThinking: boolean) => void;
}

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
 * Interactive Phonics Builder Engine with Elkonin sound boxes:
 * - Tapping any phoneme tile or placed sound box plays its isolated phoneme.
 * - Completing a word automatically triggers a left-to-right blending sweep
 *   playing each phoneme in sequence followed by the full word.
 */
export function PhonicsBuilderEngine({
  exercise,
  isSolved,
  onAttempt,
  onThinkingChange,
}: PhonicsBuilderEngineProps) {
  const expectedGraphemes = useMemo<string[]>(() => {
    if (exercise.type === "cvc-blending") {
      return exercise.phonemes.map((p) => p.grapheme);
    }
    return exercise.correctGraphemes;
  }, [exercise]);

  const tileBank = useMemo<ElkoninTile[]>(() => {
    if (exercise.type === "phoneme-segment") {
      return exercise.tileBank;
    }

    const baseTiles: ElkoninTile[] = exercise.phonemes.map((p, idx) => ({
      id: `${exercise.id}-tile-${idx}-${p.grapheme}`,
      grapheme: p.grapheme,
      audioKey: p.audioKey,
    }));

    const usedLetters = new Set(
      exercise.phonemes.map((p) => p.grapheme.toLowerCase())
    );
    const hasDigraph = exercise.phonemes.some((p) => p.grapheme.length >= 2);
    const distractorSource: readonly string[] = hasDigraph
      ? ["sh", "ch", "th", "ng", ...LINGUISTIC_PHONICS_SATPIN]
      : LINGUISTIC_PHONICS_SATPIN;

    const extras = distractorSource
      .filter((g) => !usedLetters.has(g))
      .slice(0, 2);

    const distractorTiles: ElkoninTile[] = extras.map((g, idx) => ({
      id: `${exercise.id}-extra-${idx}-${g}`,
      grapheme: g,
      audioKey: `phoneme/${g}`,
    }));

    return deterministicShuffle([...baseTiles, ...distractorTiles], exercise.id);
  }, [exercise]);

  const [slots, setSlots] = useState<Array<ElkoninTile | null>>(() =>
    Array.from({ length: expectedGraphemes.length }, () => null)
  );
  const [activeSweepIndex, setActiveSweepIndex] = useState(-1);
  const [pulsedBoxIndex, setPulsedBoxIndex] = useState(-1);
  const [isBlending, setIsBlending] = useState(false);
  const [shakeBoxes, setShakeBoxes] = useState(false);
  const [wrongOptionId, setWrongOptionId] = useState<string | null>(null);
  const autoSweptRef = useRef(false);
  const activeExerciseIdRef = useRef(exercise.id);
  activeExerciseIdRef.current = exercise.id;

  useEffect(() => {
    setSlots(Array.from({ length: expectedGraphemes.length }, () => null));
    setActiveSweepIndex(-1);
    setPulsedBoxIndex(-1);
    setIsBlending(false);
    setShakeBoxes(false);
    setWrongOptionId(null);
    autoSweptRef.current = false;
  }, [exercise, expectedGraphemes.length]);

  const placedTileIds = useMemo(
    () =>
      new Set(
        slots.filter((s): s is ElkoninTile => s !== null).map((s) => s.id)
      ),
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

  const runBlendingSweep = useCallback(
    async (
      currentSlots: ReadonlyArray<ElkoninTile | null>,
      includeFullWord: boolean
    ): Promise<boolean> => {
      setIsBlending(true);
      onThinkingChange?.(true);

      const sequence = currentSlots.map((slot, idx) => {
        if (slot) {
          return {
            audioKey: slot.audioKey,
            fallbackText: slot.grapheme,
            rate: 0.78,
            pauseAfterMs: 120,
          };
        }
        const fallbackGrapheme = expectedGraphemes[idx] ?? "";
        return {
          audioKey: `phoneme/${fallbackGrapheme.toLowerCase()}`,
          fallbackText: fallbackGrapheme,
          rate: 0.78,
          pauseAfterMs: 120,
        };
      });

      const finished = await playAudioSequence(sequence, setActiveSweepIndex);

      if (finished && includeFullWord) {
        await playAudioKey(exercise.wordAudioKey, exercise.targetWord, {
          rate: 0.88,
        });
      }

      setActiveSweepIndex(-1);
      setIsBlending(false);
      onThinkingChange?.(false);
      return finished;
    },
    [exercise.targetWord, exercise.wordAudioKey, expectedGraphemes, onThinkingChange]
  );

  const handleTileTap = (tile: ElkoninTile) => {
    if (isSolved || placedTileIds.has(tile.id)) {
      playSfx("tap");
      void playPhoneme(tile.grapheme, tile.audioKey);
      return;
    }

    const firstEmptyIdx = slots.findIndex((s) => s === null);
    if (firstEmptyIdx === -1) {
      playSfx("tap");
      void playPhoneme(tile.grapheme, tile.audioKey);
      return;
    }

    const nextSlots = [...slots];
    nextSlots[firstEmptyIdx] = tile;
    setSlots(nextSlots);
    playSfx("snap");

    const allFilledNow = nextSlots.every((s) => s !== null);
    const matchesTargetNow =
      allFilledNow &&
      nextSlots.every(
        (slot, idx) =>
          slot?.grapheme.toLowerCase() === expectedGraphemes[idx]?.toLowerCase()
      );

    const capturedExerciseId = exercise.id;
    // Always play the tapped tile's isolated phoneme first
    void playPhoneme(tile.grapheme, tile.audioKey).then(() => {
      if (activeExerciseIdRef.current !== capturedExerciseId) return;
      if (!allFilledNow) return;

      if (matchesTargetNow && !autoSweptRef.current) {
        autoSweptRef.current = true;
        // Automatically sweep left-to-right across boxes, then speak full word
        void runBlendingSweep(nextSlots, true).then((completed) => {
          if (activeExerciseIdRef.current !== capturedExerciseId) return;
          if (completed && exercise.type === "phoneme-segment") {
            onAttempt(true);
          }
        });
      } else if (!matchesTargetNow) {
        playSfx("retry");
        setShakeBoxes(true);
        window.setTimeout(() => setShakeBoxes(false), 450);
      }
    });
  };

  const handleBoxTap = (boxIndex: number) => {
    const placed = slots[boxIndex];
    setPulsedBoxIndex(boxIndex);
    window.setTimeout(() => setPulsedBoxIndex(-1), 380);

    if (placed) {
      playSfx("tap");
      void playPhoneme(placed.grapheme, placed.audioKey);
      return;
    }

    if (exercise.type === "cvc-blending") {
      const targetTile = exercise.phonemes[boxIndex];
      if (targetTile) {
        playSfx("tap");
        void playPhoneme(targetTile.grapheme, targetTile.audioKey);
      }
    }
  };

  const handleUndoLast = () => {
    if (isSolved || isBlending) return;
    const lastFilledIdx = [...slots]
      .map((s, i) => (s !== null ? i : -1))
      .filter((i) => i !== -1)
      .pop();

    if (lastFilledIdx === undefined) return;

    playSfx("tap");
    const nextSlots = [...slots];
    nextSlots[lastFilledIdx] = null;
    setSlots(nextSlots);
    autoSweptRef.current = false;
  };

  const handleClearBoxes = () => {
    if (isSolved || isBlending) return;
    playSfx("tap");
    setSlots(Array.from({ length: expectedGraphemes.length }, () => null));
    autoSweptRef.current = false;
  };

  const handleManualBlend = () => {
    if (isBlending) return;
    playSfx("tap");
    const isEmpty = slots.every((s) => s === null);
    const shouldSpeakWord =
      builtWordMatchesTarget || (isEmpty && exercise.type === "cvc-blending");
    void runBlendingSweep(slots, shouldSpeakWord);
  };

  const handleSegmentCheck = () => {
    if (exercise.type !== "phoneme-segment" || isSolved || isBlending) return;

    if (builtWordMatchesTarget) {
      void runBlendingSweep(slots, true).then((completed) => {
        if (completed) onAttempt(true);
      });
    } else {
      setShakeBoxes(true);
      window.setTimeout(() => setShakeBoxes(false), 450);
      onAttempt(false);
    }
  };

  const handleCvcPictureChoice = (
    optionId: string,
    audioKey: string,
    label: string
  ) => {
    if (exercise.type !== "cvc-blending") return;
    if (isSolved) {
      playSfx("tap");
      void playAudioKey(audioKey, label);
      return;
    }

    const isCorrect = optionId === exercise.correctOptionId;
    if (!isCorrect) {
      setWrongOptionId(optionId);
      window.setTimeout(() => setWrongOptionId(null), 500);
    }
    onAttempt(isCorrect);
  };

  const hasAnyPlaced = slots.some((s) => s !== null);

  return (
    <div className="space-y-6">
      {/* Stimulus header for phoneme-segment */}
      {exercise.type === "phoneme-segment" && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              playSfx("tap");
              void playAudioKey(exercise.wordAudioKey, exercise.targetWord);
            }}
            className="touch-card flex items-center gap-4 rounded-3xl bg-indigo-100 px-8 py-4 text-indigo-950 ring-4 ring-indigo-200 hover:bg-indigo-200"
          >
            <SeedItemArt
              itemKey={exercise.wordAudioKey}
              fallbackEmoji={exercise.stimulusEmoji}
              className="h-16 w-16"
            />
            <span className="text-2xl font-extrabold">🔊 Hear Word</span>
          </button>
        </div>
      )}

      {/* Elkonin Sound Boxes */}
      <ElkoninSoundBoxes
        slots={slots}
        guideLetters={
          exercise.type === "cvc-blending" ? expectedGraphemes : undefined
        }
        activeSweepIndex={activeSweepIndex}
        pulsedBoxIndex={pulsedBoxIndex}
        isWordComplete={builtWordMatchesTarget}
        shakeBoxes={shakeBoxes}
        onBoxTap={handleBoxTap}
      />

      {/* Tactile Action Controls (>= 64px x 64px) */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleManualBlend}
          disabled={isBlending}
          className="touch-card flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-lg font-extrabold text-white shadow-md hover:bg-indigo-500 disabled:opacity-70"
        >
          <span aria-hidden="true">➡️</span>
          <span>{isBlending ? "Blending..." : "Slide & Blend"}</span>
        </button>

        {hasAnyPlaced && !isSolved && (
          <>
            <button
              type="button"
              onClick={handleUndoLast}
              disabled={isBlending}
              className="touch-card rounded-2xl bg-slate-100 px-5 py-4 text-lg font-extrabold text-slate-800 hover:bg-slate-200 disabled:opacity-50"
            >
              ⌫ Undo
            </button>
            <button
              type="button"
              onClick={handleClearBoxes}
              disabled={isBlending}
              className="touch-card rounded-2xl bg-slate-100 px-5 py-4 text-lg font-extrabold text-slate-800 hover:bg-slate-200 disabled:opacity-50"
            >
              🔄 Clear
            </button>
          </>
        )}

        {exercise.type === "phoneme-segment" && (
          <button
            type="button"
            onClick={handleSegmentCheck}
            disabled={!isAllBoxesFilled || isSolved || isBlending}
            className="touch-card rounded-2xl bg-emerald-600 px-7 py-4 text-lg font-extrabold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50"
          >
            ✅ Check Word
          </button>
        )}
      </div>

      {/* Grapheme Tile Tray */}
      <div className="rounded-3xl bg-sky-50/90 p-4 ring-2 ring-sky-100">
        <p className="mb-3 text-center text-sm font-extrabold uppercase tracking-wide text-sky-900">
          Tap each letter tile to place it in a sound box
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {tileBank.map((tile) => {
            const isPlaced = placedTileIds.has(tile.id);
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTileTap(tile)}
                aria-label={`Letter sound ${tile.grapheme}`}
                className={`touch-card flex h-20 w-20 items-center justify-center rounded-2xl border-b-4 text-4xl font-black shadow-sm sm:h-24 sm:w-24 sm:text-5xl ${
                  isPlaced
                    ? "border-slate-300 bg-slate-200/80 text-slate-500"
                    : "border-amber-500 bg-amber-200 text-slate-900 hover:bg-amber-300"
                }`}
              >
                {tile.grapheme}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase 2 for CVC Blending: Picture Match Cards */}
      {exercise.type === "cvc-blending" && (
        <div className="space-y-3">
          <div className="flex justify-center">
            <span
              className={`rounded-full px-4 py-1.5 text-sm font-extrabold ${
                builtWordMatchesTarget
                  ? "bg-emerald-100 text-emerald-950"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {builtWordMatchesTarget
                ? `✨ Tap the picture for "${exercise.targetWord}"!`
                : "Build the word in the boxes above to unlock the pictures"}
            </span>
          </div>

          <div
            className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-4 ${
              builtWordMatchesTarget || isSolved ? "opacity-100" : "opacity-55"
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
                  className={`touch-card flex min-h-[124px] flex-col items-center justify-center gap-2 rounded-3xl border-4 p-4 shadow-sm ${
                    isCorrectCard
                      ? "border-emerald-500 bg-emerald-100 text-emerald-950"
                      : isWrongFlash
                      ? "animate-gentle-shake border-amber-400 bg-amber-100 text-amber-950"
                      : "border-slate-200 bg-white text-slate-900 hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed"
                  }`}
                >
                  <SeedItemArt
                    itemKey={option.audioKey}
                    fallbackEmoji={option.emoji}
                    className="h-14 w-14 sm:h-16 sm:w-16"
                  />
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

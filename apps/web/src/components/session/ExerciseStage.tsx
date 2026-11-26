"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Exercise } from "@wee-sparks/curriculum-schema";
import type { FeedbackPhase } from "@/lib/sessionStateMachine";
import { AudioReplayButton } from "./AudioReplayButton";
import { TapChoiceEngine } from "./TapChoiceEngine";
import { PhonicsBuilderEngine } from "./PhonicsBuilderEngine";
import { NumberLineEngine } from "./NumberLineEngine";
import { DragSortEngine } from "./DragSortEngine";
import { TraceCanvasEngine } from "./TraceCanvasEngine";
import { RewardBurst } from "./RewardBurst";

interface ExerciseStageProps {
  exercise: Exercise;
  stepKey: string;
  isSolved: boolean;
  isFinalStep: boolean;
  isPromptSpeaking: boolean;
  hintPulseActive: boolean;
  skipAvailable: boolean;
  feedbackPhase: FeedbackPhase;
  retriesCount: number;
  onPlayPrompt: () => void;
  onPlayHint: () => void;
  onAttempt: (isCorrect: boolean) => void;
  onThinkingChange: (isThinking: boolean) => void;
  onUserInteraction: () => void;
  onNext: () => void;
  onSkip: () => void;
}

/**
 * Pure child-facing exercise stage:
 * - Zero settings, zero skill codes, zero slot-role badges, zero Previous button.
 * - Keeps only: Question + big Audio button + icon-only 💡 hint (pulses gently
 *   after 8s of inactivity), Answer area, RewardBurst celebration overlay,
 *   polite aria-live feedback announcements, Next (hidden until solved), and a
 *   gentle Skip unlocked after 3 wrong tries or 25s of inactivity.
 */
export function ExerciseStage({
  exercise,
  stepKey,
  isSolved,
  isFinalStep,
  isPromptSpeaking,
  hintPulseActive,
  skipAvailable,
  feedbackPhase,
  retriesCount,
  onPlayPrompt,
  onPlayHint,
  onAttempt,
  onThinkingChange,
  onUserInteraction,
  onNext,
  onSkip,
}: ExerciseStageProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());

  const liveFeedbackMessage =
    feedbackPhase === "correct" || feedbackPhase === "advancing"
      ? exercise.feedback.correctText
      : feedbackPhase === "encourage"
      ? retriesCount > 1
        ? `${exercise.feedback.encourageText} (Try ${retriesCount})`
        : exercise.feedback.encourageText
      : "";

  return (
    <section className="relative flex flex-1 flex-col justify-between gap-6 rounded-3xl bg-white/95 p-5 shadow-lg ring-2 ring-sky-200 sm:p-7">
      {/* Persistent polite live region for reliable screen-reader feedback */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveFeedbackMessage}
      </div>

      <RewardBurst
        active={isSolved}
        burstKey={stepKey}
        variant={isFinalStep ? "finale" : "standard"}
      />

      {/* Interactive prompt + answer zone resets inactivity timer & lets kids linger */}
      <div
        className="flex flex-1 flex-col justify-between gap-6"
        onPointerDownCapture={onUserInteraction}
        onKeyDownCapture={onUserInteraction}
      >
        {/* Question + Big Audio Replay Button + Icon-Only 💡 Hint */}
        <div className="flex flex-wrap items-center gap-4">
          <AudioReplayButton
            onClick={onPlayPrompt}
            isPlaying={isPromptSpeaking}
            ariaLabel="Play question audio"
          />

          <p className="min-w-[180px] flex-1 text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl">
            {exercise.prompt.visualCueEmoji && (
              <span className="mr-2 text-2xl sm:text-3xl" aria-hidden="true">
                {exercise.prompt.visualCueEmoji}
              </span>
            )}
            {exercise.prompt.text}
          </p>

          <motion.button
            type="button"
            onClick={onPlayHint}
            aria-label="Play audio hint"
            animate={
              hintPulseActive && !prefersReducedMotion
                ? { scale: [1, 1.09, 1] }
                : { scale: 1 }
            }
            transition={
              hintPulseActive && !prefersReducedMotion
                ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.2 }
            }
            className={`touch-card flex h-16 w-16 items-center justify-center rounded-2xl text-3xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500 ${
              hintPulseActive
                ? prefersReducedMotion
                  ? "bg-amber-100 ring-4 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.45)]"
                  : "animate-hint-glow bg-amber-100 ring-2 ring-amber-300"
                : "bg-violet-100 ring-2 ring-violet-200"
            }`}
          >
            <span aria-hidden="true">💡</span>
          </motion.button>
        </div>

        {/* Interactive Answer Area */}
        <div className="py-2">
          {exercise.type === "cvc-blending" ||
          exercise.type === "phoneme-segment" ? (
            <PhonicsBuilderEngine
              exercise={exercise}
              isSolved={isSolved}
              onAttempt={onAttempt}
              onThinkingChange={onThinkingChange}
            />
          ) : exercise.type === "number-line-hop" ? (
            <NumberLineEngine
              exercise={exercise}
              isSolved={isSolved}
              onAttempt={onAttempt}
            />
          ) : exercise.type === "trace-glyph" ? (
            <TraceCanvasEngine
              exercise={exercise}
              isSolved={isSolved}
              onAttempt={onAttempt}
            />
          ) : exercise.type === "shape-sort" ||
            exercise.type === "uk-coin-match" ||
            (exercise.type === "ten-frame-count" &&
              exercise.mode === "build-on-frame") ? (
            <DragSortEngine
              exercise={exercise}
              isSolved={isSolved}
              onAttempt={onAttempt}
            />
          ) : (
            <TapChoiceEngine
              exercise={exercise}
              isSolved={isSolved}
              onAttempt={onAttempt}
            />
          )}
        </div>
      </div>

      {/* Minimal Visual Feedback + Solved-Only Next / Gentle Skip (No Previous) */}
      <div className="flex min-h-[80px] items-center justify-between gap-4 border-t-2 border-slate-100 pt-4">
        <div className="flex min-h-[64px] items-center">
          {(feedbackPhase === "correct" || feedbackPhase === "advancing") && (
            <div
              aria-hidden="true"
              className="animate-star-pop flex items-center gap-2 rounded-2xl bg-emerald-100 px-5 py-3 text-3xl"
            >
              <span>🌟</span>
              <span>🎉</span>
            </div>
          )}

          {feedbackPhase === "encourage" && (
            <div
              aria-hidden="true"
              className="flex items-center gap-2 rounded-2xl bg-amber-100 px-5 py-3 text-3xl"
            >
              <span>💛</span>
              <span>🔁</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isSolved && skipAvailable && (
            <button
              type="button"
              onClick={onSkip}
              aria-label="Skip this question"
              className="touch-card flex h-16 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 text-base font-extrabold text-slate-700 ring-2 ring-slate-200 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
            >
              <span className="text-2xl" aria-hidden="true">
                ⏭️
              </span>
            </button>
          )}

          {isSolved && (
            <button
              type="button"
              onClick={onNext}
              aria-label="Next"
              className="touch-card animate-hint-glow flex h-20 w-24 items-center justify-center rounded-3xl bg-emerald-700 text-4xl text-white shadow-md hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
            >
              <span aria-hidden="true">➡️</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

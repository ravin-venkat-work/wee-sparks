"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  getMicroSkillById,
  type ContentPack,
  type Exercise,
} from "@wee-sparks/curriculum-schema";
import { playAudioKey, stopAudio } from "@/lib/audio";
import {
  db,
  ensureDefaultLearner,
  recordExerciseAttempt,
  type LearnerProfile,
} from "@/lib/db";
import { AudioReplayButton } from "./AudioReplayButton";
import { StarProgressBar } from "./StarProgressBar";
import { TapChoiceEngine } from "./TapChoiceEngine";
import { PhonicsBuilderEngine } from "./PhonicsBuilderEngine";
import { ParentBridgeModal } from "./ParentBridgeModal";

type QuestFilter = "all" | "initial-sound-match" | "cvc-blending" | "ten-frame-count";

interface KidSessionPlayerProps {
  pack: ContentPack;
}

const QUEST_FILTERS: ReadonlyArray<{
  id: QuestFilter;
  label: string;
  emoji: string;
}> = [
  { id: "all", label: "Full Quest", emoji: "✨" },
  { id: "initial-sound-match", label: "Sounds", emoji: "🔤" },
  { id: "cvc-blending", label: "Sound Boxes", emoji: "🧩" },
  { id: "ten-frame-count", label: "Ten-Frames", emoji: "🔟" },
];

const THEME_BADGE_STYLES: Record<Exercise["theme"], string> = {
  space: "bg-indigo-100 text-indigo-900",
  dinosaurs: "bg-emerald-100 text-emerald-900",
  animals: "bg-amber-100 text-amber-900",
  vehicles: "bg-rose-100 text-rose-900",
};

/**
 * Tablet-first Kid Session Player for Northern Ireland CCEA Foundation Stage (P1–P2).
 * Combines a big audio replay button, star progress bar, TapChoiceEngine,
 * PhonicsBuilderEngine (Elkonin sound boxes), and local Dexie persistence.
 */
export function KidSessionPlayer({ pack }: KidSessionPlayerProps) {
  const [learner, setLearner] = useState<LearnerProfile | null>(null);
  const [questFilter, setQuestFilter] = useState<QuestFilter>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [earnedIndices, setEarnedIndices] = useState<Set<number>>(
    () => new Set()
  );
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0);
  const [feedbackState, setFeedbackState] = useState<
    "idle" | "correct" | "encourage"
  >("idle");
  const [isPromptSpeaking, setIsPromptSpeaking] = useState(false);
  const [showParentBridge, setShowParentBridge] = useState(false);
  const [showCompleteScreen, setShowCompleteScreen] = useState(false);

  const startedAtRef = useRef<number>(Date.now());
  const earnedIndicesRef = useRef<Set<number>>(earnedIndices);
  earnedIndicesRef.current = earnedIndices;

  const activeExercises = useMemo<readonly Exercise[]>(() => {
    if (questFilter === "all") return pack.exercises;
    return pack.exercises.filter((ex) => ex.type === questFilter);
  }, [pack.exercises, questFilter]);

  const currentExercise: Exercise =
    activeExercises[currentIndex] ?? activeExercises[0]!;
  const currentSkill = getMicroSkillById(currentExercise.skillId);
  const isCurrentSolved = earnedIndices.has(currentIndex);

  useEffect(() => {
    void ensureDefaultLearner().then(setLearner);
    return () => stopAudio();
  }, []);

  const masteryRecords = useLiveQuery(
    async () => {
      if (!learner?.id) return [];
      return db.skillMastery.where("learnerId").equals(learner.id).toArray();
    },
    [learner?.id],
    []
  );

  const handlePlayPrompt = useCallback(() => {
    void playAudioKey(
      currentExercise.prompt.audioKey,
      currentExercise.prompt.text,
      {
        onStart: () => setIsPromptSpeaking(true),
        onEnd: () => setIsPromptSpeaking(false),
      }
    );
  }, [currentExercise]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    setAttemptsOnCurrent(0);
    setFeedbackState(
      earnedIndicesRef.current.has(currentIndex) ? "correct" : "idle"
    );
    setIsPromptSpeaking(false);
    stopAudio();
  }, [currentIndex, questFilter]);

  const handleFilterChange = (nextFilter: QuestFilter) => {
    stopAudio();
    setQuestFilter(nextFilter);
    setCurrentIndex(0);
    setEarnedIndices(new Set());
    setShowCompleteScreen(false);
    setFeedbackState("idle");
  };

  const handleAttempt = async (isCorrect: boolean) => {
    const nextAttempts = attemptsOnCurrent + 1;
    setAttemptsOnCurrent(nextAttempts);

    if (isCorrect) {
      setFeedbackState("correct");
      setEarnedIndices((prev) => {
        const updated = new Set(prev);
        updated.add(currentIndex);
        return updated;
      });
      void playAudioKey(
        currentExercise.feedback.correctAudioKey,
        currentExercise.feedback.correctText
      );
    } else {
      setFeedbackState("encourage");
      void playAudioKey(
        currentExercise.feedback.encourageAudioKey,
        currentExercise.feedback.encourageText
      );
    }

    if (learner?.id) {
      await recordExerciseAttempt({
        learnerId: learner.id,
        exerciseId: currentExercise.id,
        skillId: currentExercise.skillId,
        isCorrect,
        attemptsCount: nextAttempts,
        durationMs: Date.now() - startedAtRef.current,
      });
    }
  };

  const handleNext = () => {
    stopAudio();
    if (currentIndex + 1 < activeExercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowCompleteScreen(true);
      void playAudioKey(
        "feedback/quest-complete",
        "Amazing work! You earned every star in this quest!"
      );
    }
  };

  const handleReplayQuest = () => {
    stopAudio();
    setCurrentIndex(0);
    setEarnedIndices(new Set());
    setShowCompleteScreen(false);
    setFeedbackState("idle");
  };

  const isPhonicsBuilder =
    currentExercise.type === "cvc-blending" ||
    currentExercise.type === "phoneme-segment";

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
      {/* Top Tablet HUD */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm ring-2 ring-sky-200"
            aria-hidden="true"
          >
            {learner?.avatarEmoji ?? "🦊"}
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              ✨ Wee Sparks
            </h1>
            <p className="text-xs font-bold text-sky-800 sm:text-sm">
              {learner?.displayName ?? "Wee Explorer"} · CCEA{" "}
              {pack.yearGroup} Quest
            </p>
          </div>
        </div>

        {/* Quest Filter Pills */}
        <nav
          className="flex flex-wrap items-center gap-2"
          aria-label="Choose quest focus"
        >
          {QUEST_FILTERS.map((filter) => {
            const isActive = questFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => handleFilterChange(filter.id)}
                className={`min-h-[48px] rounded-2xl px-3.5 py-2 text-sm font-extrabold transition-all sm:px-4 ${
                  isActive
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-white/90 text-slate-700 ring-1 ring-slate-200 hover:bg-sky-50"
                }`}
              >
                <span className="mr-1" aria-hidden="true">
                  {filter.emoji}
                </span>
                {filter.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowParentBridge(true)}
            className="min-h-[48px] rounded-2xl bg-amber-100 px-3.5 py-2 text-sm font-extrabold text-amber-950 ring-1 ring-amber-300 hover:bg-amber-200"
          >
            🏡 Parent Tip
          </button>
        </nav>
      </header>

      {/* Star Progress Bar */}
      <StarProgressBar
        total={activeExercises.length}
        currentIndex={currentIndex}
        earnedIndices={earnedIndices}
        onSelectExercise={(idx) => {
          setShowCompleteScreen(false);
          setCurrentIndex(idx);
        }}
      />

      {/* Quest Complete Celebration View */}
      {showCompleteScreen ? (
        <section className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-lg ring-4 ring-amber-200">
          <div className="animate-star-pop text-7xl" aria-hidden="true">
            🏆⭐🎉
          </div>
          <h2 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">
            Quest Complete!
          </h2>
          <p className="mt-2 text-lg font-semibold text-slate-600">
            You earned {earnedIndices.size} of {activeExercises.length} stars!
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={handleReplayQuest}
              className="touch-card rounded-3xl bg-sky-600 px-8 py-4 text-xl font-extrabold text-white shadow-md hover:bg-sky-500"
            >
              🔄 Play Again
            </button>
            <button
              type="button"
              onClick={() => setShowParentBridge(true)}
              className="touch-card rounded-3xl bg-amber-200 px-7 py-4 text-xl font-extrabold text-amber-950 shadow-sm hover:bg-amber-300"
            >
              🏡 Parent Bridge
            </button>
          </div>
        </section>
      ) : (
        /* Main Tablet-First Exercise Canvas */
        <section className="flex flex-1 flex-col justify-between gap-6 rounded-3xl bg-white/95 p-5 shadow-lg ring-2 ring-sky-200 sm:p-7">
          {/* Prompt Row: Big Audio Replay Button + Visual Cue + Hint */}
          <div className="flex flex-wrap items-center gap-4">
            <AudioReplayButton
              onClick={handlePlayPrompt}
              isPlaying={isPromptSpeaking}
              ariaLabel="Play question audio"
            />

            <div className="min-w-[200px] flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-extrabold text-sky-900">
                  {isPhonicsBuilder ? "Phonics Builder" : "Tap Choice"}
                </span>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-extrabold capitalize ${
                    THEME_BADGE_STYLES[currentExercise.theme]
                  }`}
                >
                  {currentExercise.theme}
                </span>
              </div>

              <p className="text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl">
                {currentExercise.prompt.visualCueEmoji && (
                  <span className="mr-2" aria-hidden="true">
                    {currentExercise.prompt.visualCueEmoji}
                  </span>
                )}
                {currentExercise.prompt.text}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void playAudioKey(
                  currentExercise.hint.audioKey,
                  currentExercise.hint.text
                )
              }
              className="touch-card flex items-center gap-2 rounded-2xl bg-violet-100 px-5 py-3 text-lg font-extrabold text-violet-950 ring-2 ring-violet-200 hover:bg-violet-200"
              aria-label="Play audio hint"
            >
              <span aria-hidden="true">💡</span>
              <span>Hint</span>
            </button>
          </div>

          {/* Interactive Exercise Engine */}
          <div className="py-2">
            {currentExercise.type === "cvc-blending" ||
            currentExercise.type === "phoneme-segment" ? (
              <PhonicsBuilderEngine
                exercise={currentExercise}
                isSolved={isCurrentSolved}
                onAttempt={(ok) => void handleAttempt(ok)}
              />
            ) : (
              <TapChoiceEngine
                exercise={currentExercise}
                isSolved={isCurrentSolved}
                onAttempt={(ok) => void handleAttempt(ok)}
              />
            )}
          </div>

          {/* Bottom Feedback & Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-slate-100 pt-4">
            <div className="flex-1">
              {feedbackState === "correct" && (
                <div
                  role="status"
                  className="animate-star-pop inline-flex items-center gap-2 rounded-2xl bg-emerald-100 px-5 py-3 text-lg font-extrabold text-emerald-950"
                >
                  <span aria-hidden="true">🌟</span>
                  <span>{currentExercise.feedback.correctText}</span>
                </div>
              )}

              {feedbackState === "encourage" && (
                <div
                  role="status"
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-100 px-5 py-3 text-lg font-extrabold text-amber-950"
                >
                  <span aria-hidden="true">💛</span>
                  <span>{currentExercise.feedback.encourageText}</span>
                </div>
              )}

              {feedbackState === "idle" && (
                <p className="text-sm font-semibold text-slate-500">
                  Tap 🔈 anytime to hear the question again.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="touch-card rounded-2xl bg-slate-100 px-5 py-3.5 text-xl font-extrabold text-slate-800 hover:bg-slate-200"
                  aria-label="Previous exercise"
                >
                  ⬅️
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className={`touch-card flex items-center gap-2 rounded-2xl px-7 py-3.5 text-xl font-extrabold shadow-md ${
                  isCurrentSolved
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-sky-600 text-white hover:bg-sky-500"
                }`}
              >
                <span>
                  {currentIndex + 1 === activeExercises.length
                    ? "Finish"
                    : "Next"}
                </span>
                <span aria-hidden="true">➡️</span>
              </button>
            </div>
          </div>
        </section>
      )}

      <ParentBridgeModal
        isOpen={showParentBridge}
        onClose={() => setShowParentBridge(false)}
        currentSkill={currentSkill}
        currentExercise={currentExercise}
        masteryRecords={masteryRecords}
      />
    </div>
  );
}

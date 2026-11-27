"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  pickPraiseAudioKey,
  pickTryAgainAudioKey,
  PRAISE_AUDIO_SCRIPTS,
  TRY_AGAIN_AUDIO_SCRIPTS,
  type CompanionAvatarId,
  type StoryBook,
} from "@wee-sparks/curriculum-schema";
import {
  playAudioKey,
  playSfx,
  playSuccessThenPraise,
  stopAudio,
} from "@/lib/audio";
import type { LearnerProfile } from "@/lib/db";
import { recordAdaptiveAttempt } from "@/lib/adaptive/mastery";
import { syncAndUnlockStickers } from "@/lib/stickers";
import {
  EXERCISE_CARD_VARIANTS,
  SCREEN_TRANSITION_VARIANTS,
} from "@/lib/motion";
import {
  HINT_PULSE_INACTIVITY_MS,
  SKIP_UNLOCK_INACTIVITY_MS,
  type FeedbackPhase,
} from "@/lib/sessionStateMachine";
import { AudioReplayButton } from "../session/AudioReplayButton";
import { ExerciseStage } from "../session/ExerciseStage";
import { SparkyMascot, type MascotMood } from "../session/SparkyMascot";
import { StarProgressBar } from "../session/StarProgressBar";
import { StoryBeatCard } from "./StoryBeatCard";
import { StorySceneIllustration } from "./StorySceneIllustration";

interface StoryPlayerProps {
  story: StoryBook;
  learner: LearnerProfile | null;
  avatarId: CompanionAvatarId;
  availableStories?: readonly StoryBook[];
  onSelectStory?: (story: StoryBook) => void;
  onExitStory: () => void;
}

type StoryStagePhase = "beat" | "exercise" | "finale";

/**
 * Interactive Storytelling Screen Flow weaving illustrated NI story beats
 * with CCEA Foundation Stage (P1–P2) literacy & numeracy exercises.
 * Reuses ExerciseStage & Dexie local mastery/sticker persistence.
 */
export function StoryPlayer({
  story,
  learner,
  avatarId,
  availableStories = [],
  onSelectStory,
  onExitStory,
}: StoryPlayerProps) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [stagePhase, setStagePhase] = useState<StoryStagePhase>("beat");
  const [earnedIndices, setEarnedIndices] = useState<Set<number>>(
    () => new Set()
  );
  const [feedbackPhase, setFeedbackPhase] = useState<FeedbackPhase>("idle");
  const [retriesOnCurrent, setRetriesOnCurrent] = useState(0);
  const [hintUsedOnCurrent, setHintUsedOnCurrent] = useState(false);
  const [hintPulseActive, setHintPulseActive] = useState(false);
  const [skipUnlocked, setSkipUnlocked] = useState(false);
  const [isPromptSpeaking, setIsPromptSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isFinaleSpeaking, setIsFinaleSpeaking] = useState(false);
  const [activityNonce, setActivityNonce] = useState(0);

  const startedAtRef = useRef(Date.now());
  const solvedStepLockRef = useRef<string | null>(null);

  // Reset full story state if story changes
  useEffect(() => {
    stopAudio();
    setChapterIndex(0);
    setStagePhase("beat");
    setEarnedIndices(new Set());
    setFeedbackPhase("idle");
    setRetriesOnCurrent(0);
    setHintUsedOnCurrent(false);
    setHintPulseActive(false);
    setSkipUnlocked(false);
    setIsPromptSpeaking(false);
    setIsThinking(false);
    solvedStepLockRef.current = null;
    startedAtRef.current = Date.now();
    return () => {
      stopAudio();
    };
  }, [story.storyId]);

  const currentChapter = story.chapters[chapterIndex] ?? story.chapters[0]!;
  const currentExercise = currentChapter.exercise;
  const currentStepKey = `${story.storyId}:${chapterIndex}:${currentExercise.id}`;
  const isCurrentSolved = earnedIndices.has(chapterIndex);

  // Reset per-chapter exercise guards when entering an exercise
  useEffect(() => {
    if (stagePhase !== "exercise") return;
    startedAtRef.current = Date.now();
    solvedStepLockRef.current = null;
    setFeedbackPhase("idle");
    setRetriesOnCurrent(0);
    setHintUsedOnCurrent(false);
    setHintPulseActive(false);
    setSkipUnlocked(false);
    setIsThinking(false);
  }, [chapterIndex, stagePhase]);

  // 8s inactivity -> gentle hint pulse during active story exercise
  useEffect(() => {
    if (stagePhase !== "exercise" || isCurrentSolved || hintPulseActive) return;
    const timer = window.setTimeout(() => {
      setHintPulseActive(true);
    }, HINT_PULSE_INACTIVITY_MS);
    return () => window.clearTimeout(timer);
  }, [stagePhase, isCurrentSolved, hintPulseActive, chapterIndex, activityNonce]);

  // 25s inactivity -> gentle skip unlock during active story exercise
  useEffect(() => {
    if (stagePhase !== "exercise" || isCurrentSolved || skipUnlocked) return;
    const timer = window.setTimeout(() => {
      setSkipUnlocked(true);
    }, SKIP_UNLOCK_INACTIVITY_MS);
    return () => window.clearTimeout(timer);
  }, [stagePhase, isCurrentSolved, skipUnlocked, chapterIndex, activityNonce]);

  const handlePlayPrompt = useCallback(() => {
    setActivityNonce((n) => n + 1);
    playSfx("tap");
    void playAudioKey(
      currentExercise.prompt.audioKey,
      currentExercise.prompt.text,
      {
        onStart: () => setIsPromptSpeaking(true),
        onEnd: () => setIsPromptSpeaking(false),
      }
    );
  }, [currentExercise]);

  const handlePlayHint = useCallback(() => {
    setActivityNonce((n) => n + 1);
    playSfx("tap");
    setHintUsedOnCurrent(true);
    setHintPulseActive(false);
    setIsThinking(true);
    void playAudioKey(
      currentExercise.hint.audioKey,
      currentExercise.hint.text,
      {
        onEnd: () => setIsThinking(false),
      }
    );
  }, [currentExercise]);

  const handleAttempt = async (isCorrect: boolean) => {
    if (
      isCorrect &&
      (isCurrentSolved || solvedStepLockRef.current === currentStepKey)
    ) {
      return;
    }

    setActivityNonce((n) => n + 1);
    const retriesCount = isCorrect ? retriesOnCurrent : retriesOnCurrent + 1;
    const durationMs = Date.now() - startedAtRef.current;

    if (!isCorrect) {
      setRetriesOnCurrent(retriesCount);
      setFeedbackPhase("encourage");
      if (retriesCount >= 3) {
        setSkipUnlocked(true);
      }
      playSfx("retry");
      const tryAgainKey = pickTryAgainAudioKey(
        `${currentStepKey}:${retriesCount}`
      );
      void playAudioKey(tryAgainKey, TRY_AGAIN_AUDIO_SCRIPTS[tryAgainKey]);
      if (learner?.id !== undefined) {
        await recordAdaptiveAttempt({
          learnerId: learner.id,
          exerciseId: currentExercise.id,
          skillId: currentExercise.skillId,
          isCorrect: false,
          retriesCount,
          hintUsed: hintUsedOnCurrent,
          durationMs,
        });
      }
      return;
    }

    solvedStepLockRef.current = currentStepKey;
    setFeedbackPhase("correct");
    setEarnedIndices((prev) => {
      const next = new Set(prev);
      next.add(chapterIndex);
      return next;
    });

    const praiseKey = pickPraiseAudioKey(currentStepKey);
    void playSuccessThenPraise(praiseKey, PRAISE_AUDIO_SCRIPTS[praiseKey]);

    if (learner?.id !== undefined) {
      await recordAdaptiveAttempt({
        learnerId: learner.id,
        exerciseId: currentExercise.id,
        skillId: currentExercise.skillId,
        isCorrect: true,
        retriesCount,
        hintUsed: hintUsedOnCurrent,
        durationMs,
      });
      await syncAndUnlockStickers(learner.id, false);
    }
  };

  const advanceChapter = (celebrateFinale: boolean) => {
    stopAudio();
    playSfx("tap");
    if (chapterIndex + 1 < story.chapters.length) {
      setChapterIndex((prev) => prev + 1);
      setStagePhase("beat");
    } else {
      setStagePhase("finale");
      if (celebrateFinale && earnedIndices.size > 0) {
        void playSuccessThenPraise(story.finaleAudioKey, story.finaleText);
      }
    }
  };

  const handleRestartStory = () => {
    stopAudio();
    playSfx("snap");
    setChapterIndex(0);
    setEarnedIndices(new Set());
    setStagePhase("beat");
  };

  const mascotMood: MascotMood =
    stagePhase === "finale"
      ? "celebrating"
      : stagePhase === "beat"
      ? currentChapter.companionMood
      : feedbackPhase === "correct"
      ? "celebrating"
      : feedbackPhase === "encourage"
      ? "encouraging"
      : isThinking
      ? "thinking"
      : "idle";

  const companionAvatarId = avatarId ?? story.companionAvatarId;
  const otherStories = availableStories.filter(
    (item) => item.storyId !== story.storyId
  );

  return (
    <div className="no-print mx-auto flex min-h-screen max-w-5xl flex-col gap-4 overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5">
      {/* Top Story Strip: Companion + Causeway Chapter Path + Home */}
      <header className="flex items-center gap-3">
        <SparkyMascot
          avatarId={companionAvatarId}
          mood={mascotMood}
          size="sm"
          onTap={() => {
            if (stagePhase === "exercise") {
              handlePlayPrompt();
            } else if (stagePhase === "beat") {
              playSfx("tap");
              void playAudioKey(
                currentChapter.narrationAudioKey,
                currentChapter.narrationText
              );
            } else {
              playSfx("tap");
              void playAudioKey(story.finaleAudioKey, story.finaleText);
            }
          }}
        />

        <StarProgressBar
          total={story.chapters.length}
          currentIndex={chapterIndex}
          earnedIndices={earnedIndices}
          avatarId={companionAvatarId}
        />

        <button
          type="button"
          onClick={() => {
            stopAudio();
            playSfx("tap");
            onExitStory();
          }}
          aria-label="Back to Who's playing"
          className="touch-card flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/85 text-2xl shadow-sm ring-2 ring-sky-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
        >
          🏠
        </button>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {stagePhase === "beat" && (
          <motion.div
            key={`beat-${currentChapter.chapterId}`}
            variants={SCREEN_TRANSITION_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-1 flex-col"
          >
            <StoryBeatCard
              storyTitle={story.title}
              chapter={currentChapter}
              chapterIndex={chapterIndex}
              totalChapters={story.chapters.length}
              companionAvatarId={companionAvatarId}
              onStartChallenge={() => setStagePhase("exercise")}
            />
          </motion.div>
        )}

        {stagePhase === "exercise" && (
          <motion.div
            key={`exercise-${currentStepKey}`}
            variants={EXERCISE_CARD_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-1 flex-col"
          >
            <ExerciseStage
              exercise={currentExercise}
              stepKey={currentStepKey}
              isSolved={isCurrentSolved}
              isFinalStep={chapterIndex === story.chapters.length - 1}
              isPromptSpeaking={isPromptSpeaking}
              hintPulseActive={hintPulseActive}
              skipAvailable={skipUnlocked || retriesOnCurrent >= 3}
              feedbackPhase={feedbackPhase}
              retriesCount={retriesOnCurrent}
              avatarId={companionAvatarId}
              onPlayPrompt={handlePlayPrompt}
              onPlayHint={handlePlayHint}
              onAttempt={(ok) => void handleAttempt(ok)}
              onThinkingChange={setIsThinking}
              onUserInteraction={() => setActivityNonce((n) => n + 1)}
              onNext={() => advanceChapter(true)}
              onSkip={() => advanceChapter(false)}
            />
          </motion.div>
        )}

        {stagePhase === "finale" && (
          <motion.div
            key={`finale-${story.storyId}`}
            variants={SCREEN_TRANSITION_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-1 flex-col"
          >
            <section className="flex flex-1 flex-col justify-between gap-5 rounded-3xl bg-white/95 p-6 text-center shadow-xl ring-4 ring-amber-200 sm:p-8">
              <div className="space-y-4">
                <StorySceneIllustration
                  illustration={story.finaleIllustration}
                  companionAvatarId={companionAvatarId}
                  companionMood="celebrating"
                />

                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-black text-amber-900">
                  <span>🏅</span>
                  <span>{story.rewardBadgeTitle}</span>
                  <span>·</span>
                  <span>
                    ⭐ {earnedIndices.size} / {story.chapters.length} Stars
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <AudioReplayButton
                    onClick={() => {
                      playSfx("tap");
                      void playAudioKey(story.finaleAudioKey, story.finaleText, {
                        onStart: () => setIsFinaleSpeaking(true),
                        onEnd: () => setIsFinaleSpeaking(false),
                      });
                    }}
                    isPlaying={isFinaleSpeaking}
                    ariaLabel="Hear story ending"
                  />
                  <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
                    {story.finaleTitle}
                  </h2>
                </div>

                <p className="mx-auto max-w-2xl text-lg font-bold leading-relaxed text-slate-700">
                  {story.finaleText}
                </p>

                <div className="mx-auto max-w-2xl rounded-2xl bg-sky-50 p-4 text-left ring-1 ring-sky-200">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-sky-900">
                    🏡 Grown-Up Read-Together Tip
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {story.offlineParentTip}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 border-t-2 border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleRestartStory}
                  className="touch-card rounded-3xl bg-emerald-700 px-7 py-4 text-lg font-black text-white shadow-md hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500"
                >
                  🔁 Read Again
                </button>

                {otherStories.length > 0 && onSelectStory && (
                  <button
                    type="button"
                    onClick={() => {
                      stopAudio();
                      playSfx("snap");
                      onSelectStory(otherStories[0]!);
                    }}
                    className="touch-card rounded-3xl bg-indigo-600 px-7 py-4 text-lg font-black text-white shadow-md hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
                  >
                    📖 Next Story: {otherStories[0]!.yearGroup}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    stopAudio();
                    playSfx("tap");
                    onExitStory();
                  }}
                  className="touch-card rounded-3xl bg-sky-700 px-7 py-4 text-lg font-black text-white shadow-md hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
                >
                  🏠 Back Home
                </button>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

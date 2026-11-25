"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  getMicroSkillById,
  type ContentPack,
  type Exercise,
} from "@wee-sparks/curriculum-schema";
import {
  playAudioKey,
  playSfx,
  preloadAudioKeys,
  stopAudio,
} from "@/lib/audio";
import {
  db,
  ensureDefaultLearner,
  setStoredActiveLearnerId,
  updateLearnerTheme,
  type LearnerProfile,
  type LearnerThemePreference,
} from "@/lib/db";
import {
  getLearnerMasterySnapshot,
  recordAdaptiveAttempt,
} from "@/lib/adaptive/mastery";
import {
  composeAdaptiveSession,
  type ComposedSession,
  type SessionSlotRole,
} from "@/lib/adaptive/sessionComposer";
import { AudioReplayButton } from "./AudioReplayButton";
import { StarProgressBar } from "./StarProgressBar";
import { TapChoiceEngine } from "./TapChoiceEngine";
import { PhonicsBuilderEngine } from "./PhonicsBuilderEngine";
import { NumberLineEngine } from "./NumberLineEngine";
import { DragSortEngine } from "./DragSortEngine";
import { TraceCanvasEngine } from "./TraceCanvasEngine";
import { ParentBridgeModal } from "./ParentBridgeModal";
import { PrintablePracticeSheet } from "./PrintablePracticeSheet";
import { SparkyMascot, type MascotMood } from "./SparkyMascot";
import { ThemePicker } from "./ThemePicker";

interface KidSessionPlayerProps {
  pack: ContentPack;
}

const THEME_BADGE_STYLES: Record<Exercise["theme"], string> = {
  space: "bg-indigo-100 text-indigo-900",
  dinosaurs: "bg-emerald-100 text-emerald-900",
  animals: "bg-amber-100 text-amber-900",
  vehicles: "bg-rose-100 text-rose-900",
};

const SLOT_ROLE_BADGE: Record<
  SessionSlotRole,
  { label: string; className: string }
> = {
  warmup: {
    label: "🌱 Warm-up",
    className: "bg-amber-100 text-amber-900",
  },
  focus: {
    label: "🎯 Focus",
    className: "bg-sky-100 text-sky-900",
  },
  review: {
    label: "🔁 Review",
    className: "bg-emerald-100 text-emerald-900",
  },
};

/**
 * Tablet-first Kid Session Player for Northern Ireland CCEA Foundation Stage (P1–P2).
 * Composes adaptive sessions from local Dexie mastery state, supports learner theme
 * switching, and updates skill mastery deterministically on every attempt.
 */
export function KidSessionPlayer({ pack }: KidSessionPlayerProps) {
  const [learner, setLearner] = useState<LearnerProfile | null>(null);
  const [selectedTheme, setSelectedTheme] =
    useState<LearnerThemePreference>("all");
  const [session, setSession] = useState<ComposedSession>(() =>
    composeAdaptiveSession({
      exercises: pack.exercises,
      masteryRecords: [],
      selectedTheme: "all",
      sessionLength: 6,
    })
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [earnedIndices, setEarnedIndices] = useState<Set<number>>(
    () => new Set()
  );
  const [retriesOnCurrent, setRetriesOnCurrent] = useState(0);
  const [hintUsedOnCurrent, setHintUsedOnCurrent] = useState(false);
  const [feedbackState, setFeedbackState] = useState<
    "idle" | "correct" | "encourage"
  >("idle");
  const [isThinking, setIsThinking] = useState(false);
  const [isPromptSpeaking, setIsPromptSpeaking] = useState(false);
  const [showParentBridge, setShowParentBridge] = useState(false);
  const [showCompleteScreen, setShowCompleteScreen] = useState(false);

  const startedAtRef = useRef<number>(Date.now());
  const earnedIndicesRef = useRef<Set<number>>(earnedIndices);
  earnedIndicesRef.current = earnedIndices;

  const activeItems = session.items;
  const currentItem = activeItems[currentIndex] ?? activeItems[0];
  const currentExercise: Exercise = currentItem?.exercise ?? pack.exercises[0]!;
  const currentSkill = getMicroSkillById(currentExercise.skillId);
  const isCurrentSolved = earnedIndices.has(currentIndex);

  const startAdaptiveSession = useCallback(
    async (learnerId: number, theme: LearnerThemePreference) => {
      stopAudio();
      const snapshot = await getLearnerMasterySnapshot(learnerId);
      const nextSession = composeAdaptiveSession({
        exercises: pack.exercises,
        masteryRecords: snapshot.masteryRecords,
        recentAttempts: snapshot.recentAttempts,
        selectedTheme: theme,
        sessionLength: 6,
      });

      setSession(nextSession);
      setCurrentIndex(0);
      setEarnedIndices(new Set());
      setRetriesOnCurrent(0);
      setHintUsedOnCurrent(false);
      setFeedbackState("idle");
      setIsThinking(false);
      setShowCompleteScreen(false);
      startedAtRef.current = Date.now();
    },
    [pack.exercises]
  );

  // Hydrate learner profile & compose initial adaptive session from Dexie mastery state
  useEffect(() => {
    let active = true;

    void ensureDefaultLearner().then(async (profile) => {
      if (!active) return;
      setLearner(profile);
      const theme = profile.preferredTheme ?? "all";
      setSelectedTheme(theme);

      if (profile.id !== undefined) {
        const snapshot = await getLearnerMasterySnapshot(profile.id);
        if (!active) return;
        const composed = composeAdaptiveSession({
          exercises: pack.exercises,
          masteryRecords: snapshot.masteryRecords,
          recentAttempts: snapshot.recentAttempts,
          selectedTheme: theme,
          sessionLength: 6,
        });
        setSession(composed);
      }
    });

    return () => {
      active = false;
      stopAudio();
    };
  }, [pack.exercises]);

  // Pre-warm static phoneme audio files for the active exercise
  useEffect(() => {
    const keys: string[] = [currentExercise.prompt.audioKey];
    if (currentExercise.type === "cvc-blending") {
      keys.push(
        currentExercise.wordAudioKey,
        ...currentExercise.phonemes.map((p) => p.audioKey)
      );
    } else if (currentExercise.type === "initial-sound-match") {
      keys.push(currentExercise.targetSoundAudioKey);
    } else if (currentExercise.type === "high-frequency-word") {
      keys.push(
        currentExercise.targetWordAudioKey,
        currentExercise.contextAudioKey
      );
    } else if (currentExercise.type === "trace-glyph") {
      keys.push(
        currentExercise.glyphAudioKey,
        currentExercise.antiReversalAudioKey
      );
    } else if (currentExercise.type === "number-line-hop") {
      keys.push(currentExercise.hopperVisual.audioKey);
    }
    preloadAudioKeys(keys);
  }, [currentExercise]);

  const masteryRecords = useLiveQuery(
    async () => {
      if (!learner?.id) return [];
      return db.skillMastery.where("learnerId").equals(learner.id).toArray();
    },
    [learner?.id],
    []
  );

  const handlePlayPrompt = useCallback(() => {
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

  useEffect(() => {
    startedAtRef.current = Date.now();
    setRetriesOnCurrent(0);
    setHintUsedOnCurrent(false);
    setFeedbackState(
      earnedIndicesRef.current.has(currentIndex) ? "correct" : "idle"
    );
    setIsThinking(false);
    setIsPromptSpeaking(false);
    stopAudio();
  }, [currentIndex, session]);

  const handleSelectLearner = async (nextLearner: LearnerProfile) => {
    setLearner(nextLearner);
    const nextTheme = nextLearner.preferredTheme ?? "all";
    setSelectedTheme(nextTheme);
    if (nextLearner.id !== undefined) {
      setStoredActiveLearnerId(nextLearner.id);
      await startAdaptiveSession(nextLearner.id, nextTheme);
    }
  };

  const handleThemeChange = async (nextTheme: LearnerThemePreference) => {
    playSfx("tap");
    setSelectedTheme(nextTheme);

    if (learner?.id !== undefined) {
      const updated = await updateLearnerTheme(learner.id, nextTheme);
      if (updated) setLearner(updated);
      await startAdaptiveSession(learner.id, nextTheme);
    } else {
      const nextSession = composeAdaptiveSession({
        exercises: pack.exercises,
        masteryRecords: [],
        selectedTheme: nextTheme,
        sessionLength: 6,
      });
      setSession(nextSession);
      setCurrentIndex(0);
      setEarnedIndices(new Set());
      setShowCompleteScreen(false);
      setFeedbackState("idle");
    }
  };

  const handleHintTap = () => {
    playSfx("tap");
    setHintUsedOnCurrent(true);
    setIsThinking(true);
    void playAudioKey(
      currentExercise.hint.audioKey,
      currentExercise.hint.text,
      { onEnd: () => setIsThinking(false) }
    );
  };

  const handleAttempt = async (isCorrect: boolean) => {
    const nextRetries = isCorrect ? retriesOnCurrent : retriesOnCurrent + 1;
    if (!isCorrect) {
      setRetriesOnCurrent(nextRetries);
    }

    if (isCorrect) {
      playSfx("success");
      setIsThinking(false);
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
      playSfx("retry");
      setIsThinking(false);
      setFeedbackState("encourage");
      void playAudioKey(
        currentExercise.feedback.encourageAudioKey,
        currentExercise.feedback.encourageText
      );
    }

    if (learner?.id !== undefined) {
      await recordAdaptiveAttempt({
        learnerId: learner.id,
        exerciseId: currentExercise.id,
        skillId: currentExercise.skillId,
        isCorrect,
        retriesCount: nextRetries,
        hintUsed: hintUsedOnCurrent,
        durationMs: Date.now() - startedAtRef.current,
      });
    }
  };

  const handleNext = () => {
    playSfx("tap");
    stopAudio();
    if (currentIndex + 1 < activeItems.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      playSfx("success");
      setShowCompleteScreen(true);
      void playAudioKey(
        "feedback/quest-complete",
        "Amazing work! You earned every star in this quest!"
      );
    }
  };

  const handleStartFreshAdaptiveQuest = () => {
    playSfx("tap");
    if (learner?.id !== undefined) {
      void startAdaptiveSession(learner.id, selectedTheme);
    } else {
      setCurrentIndex(0);
      setEarnedIndices(new Set());
      setShowCompleteScreen(false);
      setFeedbackState("idle");
    }
  };

  const mascotMood: MascotMood = showCompleteScreen
    ? "celebrating"
    : feedbackState === "correct"
    ? "celebrating"
    : feedbackState === "encourage"
    ? "encouraging"
    : isThinking
    ? "thinking"
    : "idle";

  const slotBadge = currentItem
    ? SLOT_ROLE_BADGE[currentItem.slotRole]
    : SLOT_ROLE_BADGE.focus;

  return (
    <>
      <div className="no-print mx-auto flex min-h-screen max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
      {/* Top Tablet HUD */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SparkyMascot mood={mascotMood} size="sm" onTap={handlePlayPrompt} />
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              ✨ Wee Sparks
            </h1>
            <p className="text-xs font-bold text-sky-800 sm:text-sm">
              {learner?.displayName ?? "Wee Explorer"} · Adaptive CCEA{" "}
              {pack.yearGroup}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleStartFreshAdaptiveQuest}
            className="touch-card rounded-2xl bg-sky-100 px-4 py-3 text-sm font-extrabold text-sky-950 ring-2 ring-sky-200 hover:bg-sky-200 sm:text-base"
          >
            🎯 New Quest
          </button>

          <button
            type="button"
            onClick={() => {
              playSfx("tap");
              setShowParentBridge(true);
            }}
            className="touch-card rounded-2xl bg-amber-100 px-4 py-3 text-sm font-extrabold text-amber-950 ring-2 ring-amber-300 hover:bg-amber-200 sm:text-base"
          >
            🏡 Parent Bridge
          </button>
        </div>
      </header>

      {/* Theme Switcher (>= 64px x 64px tactile buttons) */}
      <ThemePicker
        selectedTheme={selectedTheme}
        onSelectTheme={(theme) => void handleThemeChange(theme)}
      />

      {/* Star Progress Bar */}
      <StarProgressBar
        total={activeItems.length}
        currentIndex={currentIndex}
        earnedIndices={earnedIndices}
      />

      {/* Quest Complete Celebration View */}
      {showCompleteScreen ? (
        <section className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-lg ring-4 ring-amber-200">
          <SparkyMascot
            mood="celebrating"
            onTap={handleStartFreshAdaptiveQuest}
          />
          <h2 className="mt-5 text-3xl font-black text-slate-900 sm:text-4xl">
            Quest Complete!
          </h2>
          <p className="mt-2 text-lg font-bold text-slate-600">
            You earned {earnedIndices.size} of {activeItems.length} stars!
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={handleStartFreshAdaptiveQuest}
              className="touch-card rounded-3xl bg-sky-600 px-8 py-4 text-xl font-extrabold text-white shadow-md hover:bg-sky-500"
            >
              ✨ Next Adaptive Quest
            </button>
            <button
              type="button"
              onClick={() => {
                playSfx("tap");
                setShowParentBridge(true);
              }}
              className="touch-card rounded-3xl bg-amber-200 px-7 py-4 text-xl font-extrabold text-amber-950 shadow-sm hover:bg-amber-300"
            >
              🏡 Parent Bridge
            </button>
          </div>
        </section>
      ) : (
        /* Main Tablet-First Exercise Canvas */
        <section className="flex flex-1 flex-col justify-between gap-6 rounded-3xl bg-white/95 p-5 shadow-lg ring-2 ring-sky-200 sm:p-7">
          {/* Prompt Row: Big Audio Replay Button + Prompt + Hint */}
          <div className="flex flex-wrap items-center gap-4">
            <AudioReplayButton
              onClick={handlePlayPrompt}
              isPlaying={isPromptSpeaking}
              ariaLabel="Play question audio"
            />

            <div className="min-w-[200px] flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-extrabold ${slotBadge.className}`}
                >
                  {slotBadge.label}
                </span>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-extrabold capitalize ${
                    THEME_BADGE_STYLES[currentExercise.theme]
                  }`}
                >
                  {currentExercise.theme}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-700">
                  {currentSkill.code}
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
              onClick={handleHintTap}
              className="touch-card flex items-center gap-2 rounded-2xl bg-violet-100 px-5 py-4 text-lg font-extrabold text-violet-950 ring-2 ring-violet-200 hover:bg-violet-200"
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
                onThinkingChange={setIsThinking}
              />
            ) : currentExercise.type === "number-line-hop" ? (
              <NumberLineEngine
                exercise={currentExercise}
                isSolved={isCurrentSolved}
                onAttempt={(ok) => void handleAttempt(ok)}
              />
            ) : currentExercise.type === "trace-glyph" ? (
              <TraceCanvasEngine
                exercise={currentExercise}
                isSolved={isCurrentSolved}
                onAttempt={(ok) => void handleAttempt(ok)}
              />
            ) : currentExercise.type === "shape-sort" ||
              currentExercise.type === "uk-coin-match" ||
              (currentExercise.type === "ten-frame-count" &&
                currentExercise.mode === "build-on-frame") ? (
              <DragSortEngine
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
            <div className="flex flex-1 items-center gap-3">
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
                <p className="text-sm font-bold text-slate-500">
                  Tap Sparky or 🔈 anytime to hear the question again.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    playSfx("tap");
                    setCurrentIndex((prev) => prev - 1);
                  }}
                  className="touch-card rounded-2xl bg-slate-100 px-5 py-4 text-xl font-extrabold text-slate-800 hover:bg-slate-200"
                  aria-label="Previous exercise"
                >
                  ⬅️
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className={`touch-card flex items-center gap-2 rounded-2xl px-7 py-4 text-xl font-extrabold shadow-md ${
                  isCurrentSolved
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-sky-600 text-white hover:bg-sky-500"
                }`}
              >
                <span>
                  {currentIndex + 1 === activeItems.length ? "Finish" : "Next"}
                </span>
                <span aria-hidden="true">➡️</span>
              </button>
            </div>
          </div>
        </section>
      )}

      <ParentBridgeModal
        isOpen={showParentBridge}
        onClose={() => {
          playSfx("tap");
          setShowParentBridge(false);
        }}
        learner={learner}
        onSelectLearner={(next) => void handleSelectLearner(next)}
        currentSkill={currentSkill}
        currentExercise={currentExercise}
        packSkillIds={pack.skillIds}
        masteryRecords={masteryRecords}
        session={session}
      />
      </div>

      {/* Dedicated A4 print-only target for 1-click Printable Practice Sheet */}
      <div className="print-only-sheet hidden">
        <PrintablePracticeSheet
          learner={learner}
          packSkillIds={pack.skillIds}
          masteryRecords={masteryRecords}
        />
      </div>
    </>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  getMicroSkillById,
  type Exercise,
  type MicroSkillId,
} from "@wee-sparks/curriculum-schema";
import {
  isMusicEnabled,
  isSfxEnabled,
  playAudioKey,
  playSfx,
  preloadAudioKeys,
  setMusicEnabled,
  setSfxEnabled,
  stopAmbientMusic,
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
  type YearGroupFilter,
} from "@/lib/adaptive/sessionComposer";
import {
  getLearnerLifetimeStars,
  syncAndUnlockStickers,
  type StickerDefinition,
} from "@/lib/stickers";
import { AudioReplayButton } from "./AudioReplayButton";
import { StarProgressBar } from "./StarProgressBar";
import { TapChoiceEngine } from "./TapChoiceEngine";
import { PhonicsBuilderEngine } from "./PhonicsBuilderEngine";
import { NumberLineEngine } from "./NumberLineEngine";
import { DragSortEngine } from "./DragSortEngine";
import { TraceCanvasEngine } from "./TraceCanvasEngine";
import { ParentBridgeModal } from "./ParentBridgeModal";
import { PrintablePracticeSheet } from "./PrintablePracticeSheet";
import { CelebrationStickerChest } from "./CelebrationStickerChest";
import { SparkyMascot, type MascotMood } from "./SparkyMascot";
import { ThemePicker } from "./ThemePicker";

interface KidSessionPlayerProps {
  exercises: readonly Exercise[];
  availableSkillIds: readonly MicroSkillId[];
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

const YEAR_FILTER_OPTIONS: ReadonlyArray<{
  id: YearGroupFilter;
  label: string;
}> = [
  { id: "P1", label: "P1" },
  { id: "P2", label: "P2" },
  { id: "all", label: "All" },
];

/**
 * Tablet-first Kid Session Player for Northern Ireland CCEA Foundation Stage (P1–P2).
 * Features Giant's Causeway stepping-stone progress, Sound/Music toggles, P1/P2/All
 * stage switcher, Sticker Chest rewards in Dexie, and all 5 interactive engines.
 */
export function KidSessionPlayer({
  exercises,
  availableSkillIds,
}: KidSessionPlayerProps) {
  const [learner, setLearner] = useState<LearnerProfile | null>(null);
  const [yearGroupFilter, setYearGroupFilter] =
    useState<YearGroupFilter>("P1");
  const [selectedTheme, setSelectedTheme] =
    useState<LearnerThemePreference>("all");
  const [sfxOn, setSfxOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);

  const [session, setSession] = useState<ComposedSession>(() =>
    composeAdaptiveSession({
      exercises,
      masteryRecords: [],
      yearGroupFilter: "P1",
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
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showCompleteScreen, setShowCompleteScreen] = useState(false);
  const [newlyUnlockedStickers, setNewlyUnlockedStickers] = useState<
    StickerDefinition[]
  >([]);
  const [lifetimeStars, setLifetimeStars] = useState(0);

  const startedAtRef = useRef<number>(Date.now());
  const earnedIndicesRef = useRef<Set<number>>(earnedIndices);
  earnedIndicesRef.current = earnedIndices;
  const sessionRequestIdRef = useRef(0);
  const solvedStepLockRef = useRef<string | null>(null);
  const advancingRef = useRef(false);

  const activeItems = session.items;
  const currentItem = activeItems[currentIndex] ?? activeItems[0];
  const currentExercise: Exercise | undefined =
    currentItem?.exercise ?? exercises[0];
  const currentSkill = currentExercise
    ? getMicroSkillById(currentExercise.skillId)
    : null;
  const isCurrentSolved = earnedIndices.has(currentIndex);

  const scopedSkillIds = useMemo<MicroSkillId[]>(() => {
    if (yearGroupFilter === "all") return [...availableSkillIds];
    return availableSkillIds.filter(
      (id) => getMicroSkillById(id).yearGroup === yearGroupFilter
    );
  }, [availableSkillIds, yearGroupFilter]);

  const startAdaptiveSession = useCallback(
    async (
      learnerId: number,
      yearFilter: YearGroupFilter,
      theme: LearnerThemePreference
    ) => {
      const requestId = ++sessionRequestIdRef.current;
      stopAudio();
      const [snapshot, stars] = await Promise.all([
        getLearnerMasterySnapshot(learnerId),
        getLearnerLifetimeStars(learnerId),
      ]);
      if (requestId !== sessionRequestIdRef.current) return;

      const nextSession = composeAdaptiveSession({
        exercises,
        masteryRecords: snapshot.masteryRecords,
        recentAttempts: snapshot.recentAttempts,
        yearGroupFilter: yearFilter,
        selectedTheme: theme,
        sessionLength: 6,
      });

      solvedStepLockRef.current = null;
      advancingRef.current = false;
      setLifetimeStars(stars);
      setSession(nextSession);
      setCurrentIndex(0);
      setEarnedIndices(new Set());
      setRetriesOnCurrent(0);
      setHintUsedOnCurrent(false);
      setFeedbackState("idle");
      setIsThinking(false);
      setShowCompleteScreen(false);
      setNewlyUnlockedStickers([]);
      startedAtRef.current = Date.now();
    },
    [exercises]
  );

  // Hydrate audio prefs, active learner profile & initial adaptive session
  useEffect(() => {
    let active = true;
    setSfxOn(isSfxEnabled());
    setMusicOn(isMusicEnabled());

    void ensureDefaultLearner().then(async (profile) => {
      if (!active) return;
      setLearner(profile);
      const theme = profile.preferredTheme ?? "all";
      const yr: YearGroupFilter = profile.yearGroup ?? "P1";
      setSelectedTheme(theme);
      setYearGroupFilter(yr);

      if (profile.id !== undefined) {
        const [snapshot, stars] = await Promise.all([
          getLearnerMasterySnapshot(profile.id),
          getLearnerLifetimeStars(profile.id),
        ]);
        if (!active) return;
        setLifetimeStars(stars);
        const composed = composeAdaptiveSession({
          exercises,
          masteryRecords: snapshot.masteryRecords,
          recentAttempts: snapshot.recentAttempts,
          yearGroupFilter: yr,
          selectedTheme: theme,
          sessionLength: 6,
        });
        setSession(composed);
      }
    });

    return () => {
      active = false;
      stopAudio();
      stopAmbientMusic();
    };
  }, [exercises]);

  // Pre-warm static phoneme audio files for the active exercise
  useEffect(() => {
    if (!currentExercise) return;
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

  const unlockedStickers = useLiveQuery(
    async () => {
      if (!learner?.id) return [];
      return db.stickers.where("learnerId").equals(learner.id).toArray();
    },
    [learner?.id],
    []
  );

  const handlePlayPrompt = useCallback(() => {
    if (!currentExercise) return;
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
    solvedStepLockRef.current = null;
    advancingRef.current = false;
    setRetriesOnCurrent(0);
    setHintUsedOnCurrent(false);
    setFeedbackState(
      earnedIndicesRef.current.has(currentIndex) ? "correct" : "idle"
    );
    setIsThinking(false);
    setIsPromptSpeaking(false);
    stopAudio();
  }, [currentIndex, session]);

  const handleToggleSfx = () => {
    const next = !sfxOn;
    setSfxOn(next);
    setSfxEnabled(next);
    if (next) playSfx("tap");
  };

  const handleToggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    setMusicEnabled(next);
    playSfx("tap");
  };

  const handleSelectLearner = async (nextLearner: LearnerProfile) => {
    setLearner(nextLearner);
    const nextTheme = nextLearner.preferredTheme ?? "all";
    const nextYear: YearGroupFilter = nextLearner.yearGroup ?? "P1";
    setSelectedTheme(nextTheme);
    setYearGroupFilter(nextYear);
    if (nextLearner.id !== undefined) {
      setStoredActiveLearnerId(nextLearner.id);
      await startAdaptiveSession(nextLearner.id, nextYear, nextTheme);
    }
  };

  const handleYearFilterChange = async (nextYear: YearGroupFilter) => {
    playSfx("tap");
    setYearGroupFilter(nextYear);
    if (learner?.id !== undefined) {
      await startAdaptiveSession(learner.id, nextYear, selectedTheme);
    } else {
      const nextSession = composeAdaptiveSession({
        exercises,
        masteryRecords: [],
        yearGroupFilter: nextYear,
        selectedTheme,
        sessionLength: 6,
      });
      setSession(nextSession);
      setCurrentIndex(0);
      setEarnedIndices(new Set());
      setShowCompleteScreen(false);
      setFeedbackState("idle");
    }
  };

  const handleThemeChange = async (nextTheme: LearnerThemePreference) => {
    playSfx("tap");
    setSelectedTheme(nextTheme);

    if (learner?.id !== undefined) {
      const updated = await updateLearnerTheme(learner.id, nextTheme);
      if (updated) setLearner(updated);
      await startAdaptiveSession(learner.id, yearGroupFilter, nextTheme);
    } else {
      const nextSession = composeAdaptiveSession({
        exercises,
        masteryRecords: [],
        yearGroupFilter,
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
    if (!currentExercise) return;
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
    if (!currentExercise) return;
    const stepKey = `${currentIndex}:${currentExercise.id}`;

    // Guard against rapid double-taps recording duplicate solves/stars in Dexie
    if (isCorrect && (isCurrentSolved || solvedStepLockRef.current === stepKey)) {
      return;
    }
    if (isCorrect) {
      solvedStepLockRef.current = stepKey;
    }

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

      if (isCorrect) {
        const result = await syncAndUnlockStickers(learner.id, false);
        setLifetimeStars(result.totalStars);
      }
    }
  };

  const handleNext = async () => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    playSfx("tap");
    stopAudio();

    if (currentIndex + 1 < activeItems.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      playSfx("success");
      if (learner?.id !== undefined) {
        const reward = await syncAndUnlockStickers(learner.id, true);
        setLifetimeStars(reward.totalStars);
        setNewlyUnlockedStickers(reward.newlyUnlocked);
      }
      setShowCompleteScreen(true);
      void playAudioKey(
        "feedback/quest-complete",
        "Amazing work! You crossed the Giant's Causeway and earned stars for your sticker chest!"
      );
    }
  };

  const handleStartFreshAdaptiveQuest = () => {
    playSfx("tap");
    if (learner?.id !== undefined) {
      void startAdaptiveSession(learner.id, yearGroupFilter, selectedTheme);
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

  if (!currentExercise || !currentSkill) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 p-6 text-center">
        <SparkyMascot mood="thinking" />
        <h2 className="text-2xl font-black text-slate-900">
          No exercises loaded for this filter yet!
        </h2>
        <button
          type="button"
          onClick={() => void handleYearFilterChange("all")}
          className="touch-card rounded-2xl bg-sky-600 px-8 py-4 text-lg font-extrabold text-white shadow-md hover:bg-sky-500"
        >
          Show All P1–P2 Exercises
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="no-print mx-auto flex min-h-screen max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
        {/* Top Tablet HUD: Mascot, P1/P2/All Stage Selector, Sound/Music, Stickers, Parent Bridge */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SparkyMascot
              mood={mascotMood}
              size="sm"
              onTap={handlePlayPrompt}
            />
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                ✨ Wee Sparks
              </h1>
              <p className="text-xs font-bold text-sky-800 sm:text-sm">
                {learner?.displayName ?? "Wee Explorer"} · CCEA{" "}
                {yearGroupFilter === "all" ? "P1–P2" : yearGroupFilter}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* P1 / P2 / All Stage Selector (>= 64px touch targets) */}
            <div
              className="flex items-center gap-1 rounded-2xl bg-white/90 p-1 ring-2 ring-sky-100"
              role="group"
              aria-label="Choose CCEA stage"
            >
              {YEAR_FILTER_OPTIONS.map((opt) => {
                const isActive = yearGroupFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => void handleYearFilterChange(opt.id)}
                    className={`touch-card rounded-xl px-4 py-2 text-sm font-black sm:text-base ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-50 text-slate-700 hover:bg-indigo-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Sound SFX Toggle */}
            <button
              type="button"
              aria-pressed={sfxOn}
              aria-label={sfxOn ? "Mute sound effects" : "Enable sound effects"}
              onClick={handleToggleSfx}
              className={`touch-card rounded-2xl px-4 py-3 text-lg font-extrabold ${
                sfxOn
                  ? "bg-emerald-100 text-emerald-950 ring-2 ring-emerald-300"
                  : "bg-slate-100 text-slate-500 ring-2 ring-slate-200"
              }`}
            >
              {sfxOn ? "🔔" : "🔕"}
            </button>

            {/* Gentle Music Toggle */}
            <button
              type="button"
              aria-pressed={musicOn}
              aria-label={musicOn ? "Stop background music" : "Play gentle background music"}
              onClick={handleToggleMusic}
              className={`touch-card rounded-2xl px-4 py-3 text-lg font-extrabold ${
                musicOn
                  ? "bg-violet-100 text-violet-950 ring-2 ring-violet-300"
                  : "bg-white text-slate-600 ring-2 ring-slate-200 hover:bg-violet-50"
              }`}
            >
              🎵
            </button>

            {/* Sticker Chest Button */}
            <button
              type="button"
              onClick={() => {
                playSfx("tap");
                setShowStickerModal(true);
              }}
              className="touch-card rounded-2xl bg-yellow-100 px-4 py-3 text-sm font-extrabold text-amber-950 ring-2 ring-amber-300 hover:bg-yellow-200 sm:text-base"
            >
              🎁 {unlockedStickers.length}
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx("tap");
                setShowParentBridge(true);
              }}
              className="touch-card rounded-2xl bg-amber-100 px-4 py-3 text-sm font-extrabold text-amber-950 ring-2 ring-amber-300 hover:bg-amber-200 sm:text-base"
            >
              🏡 Parent
            </button>
          </div>
        </header>

        {/* Theme Switcher + New Quest */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ThemePicker
            selectedTheme={selectedTheme}
            onSelectTheme={(theme) => void handleThemeChange(theme)}
          />
          <button
            type="button"
            onClick={handleStartFreshAdaptiveQuest}
            className="touch-card rounded-2xl bg-sky-100 px-4 py-3 text-sm font-extrabold text-sky-950 ring-2 ring-sky-200 hover:bg-sky-200 sm:text-base"
          >
            🎯 New Quest
          </button>
        </div>

        {/* Giant's Causeway Stepping-Stone Progress Path */}
        <StarProgressBar
          total={activeItems.length}
          currentIndex={currentIndex}
          earnedIndices={earnedIndices}
        />

        {/* Post-Session Celebration & Sticker Chest */}
        {showCompleteScreen ? (
          <CelebrationStickerChest
            mode="post-session"
            starsThisSession={earnedIndices.size}
            totalExercises={activeItems.length}
            lifetimeStars={lifetimeStars}
            unlockedRecords={unlockedStickers}
            newlyUnlocked={newlyUnlockedStickers}
            onPlayNextQuest={handleStartFreshAdaptiveQuest}
            onOpenParentBridge={() => {
              playSfx("tap");
              setShowParentBridge(true);
            }}
          />
        ) : (
          /* Main Tablet-First Exercise Canvas with bouncy entrance per card */
          <section
            key={currentExercise.id}
            className="animate-card-enter flex flex-1 flex-col justify-between gap-6 rounded-3xl bg-white/95 p-5 shadow-lg ring-2 ring-sky-200 sm:p-7"
          >
            {/* Prompt Row */}
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

            {/* Interactive Exercise Engine Router */}
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
                  onClick={() => void handleNext()}
                  className={`touch-card flex items-center gap-2 rounded-2xl px-7 py-4 text-xl font-extrabold shadow-md ${
                    isCurrentSolved
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
                      : "bg-sky-600 text-white hover:bg-sky-500"
                  }`}
                >
                  <span>
                    {currentIndex + 1 === activeItems.length
                      ? "Finish"
                      : "Next"}
                  </span>
                  <span aria-hidden="true">➡️</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Anytime Sticker Chest Modal */}
        {showStickerModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="My Sticker Chest"
          >
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
              <CelebrationStickerChest
                mode="chest-modal"
                lifetimeStars={lifetimeStars}
                unlockedRecords={unlockedStickers}
                newlyUnlocked={[]}
                onClose={() => {
                  playSfx("tap");
                  setShowStickerModal(false);
                }}
              />
            </div>
          </div>
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
          packSkillIds={scopedSkillIds}
          masteryRecords={masteryRecords}
          session={session}
        />
      </div>

      {/* Dedicated A4 print-only target for 1-click Printable Practice Sheet */}
      <div className="print-only-sheet hidden">
        <PrintablePracticeSheet
          learner={learner}
          packSkillIds={scopedSkillIds}
          masteryRecords={masteryRecords}
        />
      </div>
    </>
  );
}

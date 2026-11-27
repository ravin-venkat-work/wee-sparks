"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "motion/react";
import {
  getMicroSkillById,
  pickPraiseAudioKey,
  pickTryAgainAudioKey,
  PRAISE_AUDIO_SCRIPTS,
  TRY_AGAIN_AUDIO_SCRIPTS,
  type Exercise,
  type MicroSkillId,
  type StoryBook,
} from "@wee-sparks/curriculum-schema";
import {
  isCalmModeEnabled,
  isMusicEnabled,
  isSfxEnabled,
  playAudioKey,
  playSfx,
  playSuccessThenPraise,
  preloadAudioKeys,
  setCalmModeEnabled,
  setMusicEnabled,
  setSfxEnabled,
  stopAmbientMusic,
  stopAudio,
  subscribeCalmMode,
} from "@/lib/audio";
import {
  db,
  ensureDefaultLearner,
  loadActiveLearner,
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
  type YearGroupFilter,
} from "@/lib/adaptive/sessionComposer";
import {
  getLearnerLifetimeStars,
  syncAndUnlockStickers,
} from "@/lib/stickers";
import { resolveCompanionAvatarId } from "@/lib/avatars";
import { getStoriesForYearFilter } from "@/lib/stories";
import { shouldConfirmSessionExit } from "@/lib/sensory";
import { runIfParentGateUnlocked } from "@/lib/parentGate";
import {
  EXERCISE_CARD_VARIANTS,
  SCREEN_TRANSITION_VARIANTS,
} from "@/lib/motion";
import {
  AUTO_ADVANCE_DELAY_MS,
  canAutoAdvance,
  canInteractionPauseAutoAdvance,
  createInitialSessionState,
  deriveMascotMood,
  HINT_PULSE_INACTIVITY_MS,
  isSkipAvailable,
  isWithinPostSolveWindow,
  sessionStateReducer,
  shouldCelebrateQuest,
  shouldTrackHintInactivity,
  shouldTrackSkipInactivity,
  SKIP_UNLOCK_INACTIVITY_MS,
} from "@/lib/sessionStateMachine";
import { StarProgressBar } from "./StarProgressBar";
import { ExerciseStage } from "./ExerciseStage";
import { WelcomeScreen } from "./WelcomeScreen";
import { ParentGateModal } from "./ParentGate";
import { ParentBridgeModal } from "./ParentBridgeModal";
import { PrintablePracticeSheet } from "./PrintablePracticeSheet";
import { CelebrationStickerChest } from "./CelebrationStickerChest";
import { LeaveSessionModal } from "./LeaveSessionModal";
import { SparkyMascot } from "./SparkyMascot";
import { StoryPlayer } from "../story/StoryPlayer";
import { HomeIconSvg } from "../icons/KidUiIcons";

interface KidSessionPlayerProps {
  exercises: readonly Exercise[];
  availableSkillIds: readonly MicroSkillId[];
}

/**
 * Child-first Kid Session Player with a clean Welcome -> Playing -> Celebrating flow.
 * Powered by `sessionStateReducer` (`idle -> thinking/encourage -> correct -> advancing`):
 * - Automatically advances after a correct answer and its spoken praise finish,
 *   while letting children linger (replay audio) or tap the big icon-only Next anytime.
 * - Pulses the icon-only 💡 hint button gently after 8 seconds of inactivity.
 * - Keeps all grown-up settings and printing strictly behind ParentGate.
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
  const [calmMode, setCalmMode] = useState(false);
  const [showParentGateChallenge, setShowParentGateChallenge] = useState(false);
  const [parentGateUnlocked, setParentGateUnlocked] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showStickerChestModal, setShowStickerChestModal] = useState(false);
  const [activeStory, setActiveStory] = useState<StoryBook | null>(null);
  const [activityNonce, setActivityNonce] = useState(0);

  const [state, dispatch] = useReducer(
    sessionStateReducer,
    exercises,
    (initialExercises) =>
      createInitialSessionState(
        composeAdaptiveSession({
          exercises: initialExercises,
          masteryRecords: [],
          yearGroupFilter: "P1",
          selectedTheme: "all",
          sessionLength: 6,
        })
      )
  );

  const startedAtRef = useRef<number>(Date.now());
  const sessionRequestIdRef = useRef(0);
  const solvedStepLockRef = useRef<string | null>(null);
  const advancingRef = useRef(false);
  const autoAdvanceTimerRef = useRef<number | null>(null);

  const activeItems = state.session.items;
  const currentItem = activeItems[state.currentIndex] ?? activeItems[0];
  const currentExercise: Exercise | null =
    currentItem?.exercise ?? exercises[0] ?? null;
  const currentSkill = currentExercise
    ? getMicroSkillById(currentExercise.skillId)
    : null;
  const isCurrentSolved = state.earnedIndices.has(state.currentIndex);
  const currentStepKey = currentExercise
    ? `${state.currentIndex}:${currentExercise.id}`
    : "";

  const activeStepKeyRef = useRef(currentStepKey);
  activeStepKeyRef.current = currentStepKey;

  const stateRef = useRef(state);
  stateRef.current = state;

  const parentGateOpenRef = useRef(false);
  parentGateOpenRef.current =
    parentGateUnlocked || showParentGateChallenge || showLeaveConfirm;

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const scopedSkillIds = useMemo<MicroSkillId[]>(() => {
    if (yearGroupFilter === "all") return [...availableSkillIds];
    return availableSkillIds.filter(
      (id) => getMicroSkillById(id).yearGroup === yearGroupFilter
    );
  }, [availableSkillIds, yearGroupFilter]);

  const composeAndLoadSession = useCallback(
    async (
      learnerId: number,
      yearFilter: YearGroupFilter,
      theme: LearnerThemePreference,
      enterPlaying: boolean
    ) => {
      const requestId = ++sessionRequestIdRef.current;
      clearAutoAdvanceTimer();
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
      startedAtRef.current = Date.now();
      dispatch({
        type: "START_SESSION",
        session: nextSession,
        lifetimeStars: stars,
        enterPlaying,
      });
    },
    [clearAutoAdvanceTimer, exercises]
  );

  // Hydrate sensory/audio prefs and any existing local learner WITHOUT silently creating one
  useEffect(() => {
    let active = true;
    setSfxOn(isSfxEnabled());
    setMusicOn(isMusicEnabled());
    setCalmMode(isCalmModeEnabled());
    const unsubscribeCalm = subscribeCalmMode((next) => {
      setCalmMode(next);
      if (next) {
        setMusicOn(false);
      }
    });

    void loadActiveLearner().then(async (profile) => {
      if (!active || !profile) return;
      setLearner(profile);
      const theme = profile.preferredTheme ?? "all";
      const yr: YearGroupFilter = profile.yearGroup ?? "P1";
      setSelectedTheme(theme);
      setYearGroupFilter(yr);

      if (profile.id !== undefined) {
        await composeAndLoadSession(profile.id, yr, theme, false);
      }
    });

    return () => {
      active = false;
      unsubscribeCalm();
      clearAutoAdvanceTimer();
      stopAudio();
      stopAmbientMusic();
    };
  }, [clearAutoAdvanceTimer, composeAndLoadSession]);

  // Pre-warm audio keys for the active exercise
  useEffect(() => {
    if (!currentExercise || state.screen !== "playing") return;
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
  }, [currentExercise, state.screen]);

  // Reset per-step guards whenever moving to a new step
  useEffect(() => {
    clearAutoAdvanceTimer();
    startedAtRef.current = Date.now();
    solvedStepLockRef.current = null;
    advancingRef.current = false;
    stopAudio();
  }, [clearAutoAdvanceTimer, state.currentIndex, state.session]);

  const trackHintInactivity = shouldTrackHintInactivity(state);
  const trackSkipInactivity = shouldTrackSkipInactivity(state);

  // 8-second inactivity detector to gently pulse the icon-only 💡 hint button
  useEffect(() => {
    if (
      parentGateUnlocked ||
      showParentGateChallenge ||
      showLeaveConfirm ||
      !trackHintInactivity
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      dispatch({ type: "HINT_INACTIVITY_ELAPSED" });
    }, HINT_PULSE_INACTIVITY_MS);

    return () => window.clearTimeout(timer);
  }, [
    trackHintInactivity,
    state.currentIndex,
    state.session,
    activityNonce,
    parentGateUnlocked,
    showParentGateChallenge,
    showLeaveConfirm,
  ]);

  // 25-second inactivity detector to reveal the gentle Skip button
  // (intentionally decoupled from hintPulseActive so the 8s hint pulse never resets the 25s clock)
  useEffect(() => {
    if (
      parentGateUnlocked ||
      showParentGateChallenge ||
      showLeaveConfirm ||
      !trackSkipInactivity
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      dispatch({ type: "SKIP_INACTIVITY_ELAPSED" });
    }, SKIP_UNLOCK_INACTIVITY_MS);

    return () => window.clearTimeout(timer);
  }, [
    trackSkipInactivity,
    state.currentIndex,
    state.session,
    activityNonce,
    parentGateUnlocked,
    showParentGateChallenge,
    showLeaveConfirm,
  ]);

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

  const handleUserInteraction = useCallback(() => {
    setActivityNonce((n) => n + 1);
    // General pointer taps (including double-taps on a just-solved card) never pause auto-advance
    dispatch({ type: "USER_ACTIVITY", source: "pointer", nowMs: Date.now() });
  }, []);

  const handlePlayPrompt = useCallback(() => {
    if (!currentExercise) return;
    const nowMs = Date.now();
    // Ignore stray taps during the 1s post-solve double-tap grace window
    if (isWithinPostSolveWindow(stateRef.current, nowMs)) {
      return;
    }

    setActivityNonce((n) => n + 1);
    if (canInteractionPauseAutoAdvance(stateRef.current, "audio-replay", nowMs)) {
      clearAutoAdvanceTimer();
      dispatch({
        type: "PAUSE_AUTO_ADVANCE",
        source: "audio-replay",
        nowMs,
      });
    } else {
      dispatch({ type: "USER_ACTIVITY", source: "audio-replay", nowMs });
    }

    playSfx("tap");
    void playAudioKey(
      currentExercise.prompt.audioKey,
      currentExercise.prompt.text,
      {
        onStart: () => dispatch({ type: "SET_SPEAKING", speaking: true }),
        onEnd: () => dispatch({ type: "SET_SPEAKING", speaking: false }),
      }
    );
  }, [clearAutoAdvanceTimer, currentExercise]);

  const handlePlayHint = useCallback(() => {
    if (!currentExercise) return;
    const nowMs = Date.now();
    // Ignore stray taps during the 1s post-solve double-tap grace window
    if (isWithinPostSolveWindow(stateRef.current, nowMs)) {
      return;
    }

    setActivityNonce((n) => n + 1);
    if (canInteractionPauseAutoAdvance(stateRef.current, "hint", nowMs)) {
      clearAutoAdvanceTimer();
    }
    playSfx("tap");
    dispatch({ type: "USE_HINT", nowMs });
    void playAudioKey(
      currentExercise.hint.audioKey,
      currentExercise.hint.text,
      {
        onEnd: () => dispatch({ type: "SET_THINKING", thinking: false }),
      }
    );
  }, [clearAutoAdvanceTimer, currentExercise]);

  const handleStartForLearner = async (
    nextLearner: LearnerProfile,
    enterPlaying: boolean
  ) => {
    setLearner(nextLearner);
    const nextTheme = nextLearner.preferredTheme ?? "all";
    const nextYear: YearGroupFilter = nextLearner.yearGroup ?? "P1";
    setSelectedTheme(nextTheme);
    setYearGroupFilter(nextYear);
    if (nextLearner.id !== undefined) {
      setStoredActiveLearnerId(nextLearner.id);
      await composeAndLoadSession(
        nextLearner.id,
        nextYear,
        nextTheme,
        enterPlaying
      );
    }
  };

  const handleUnlockParentSettings = useCallback(() => {
    clearAutoAdvanceTimer();
    stopAudio();
    setShowParentGateChallenge(false);
    setParentGateUnlocked(true);
  }, [clearAutoAdvanceTimer]);

  const handleRequestParentChallenge = useCallback(() => {
    clearAutoAdvanceTimer();
    stopAudio();
    setShowParentGateChallenge(true);
  }, [clearAutoAdvanceTimer]);

  const handleSwitchLearnerFromSettings = async (
    nextLearner: LearnerProfile
  ) => {
    const gated = runIfParentGateUnlocked(parentGateUnlocked, () => nextLearner);
    if (!gated.allowed) return;
    setActiveStory(null);
    await handleStartForLearner(gated.result, state.screen === "playing");
  };

  const handleProfileUpdatedFromSettings = async (
    updatedLearner: LearnerProfile
  ) => {
    const gated = runIfParentGateUnlocked(
      parentGateUnlocked,
      () => updatedLearner
    );
    if (!gated.allowed) return;
    if (gated.result.id === learner?.id) {
      await handleStartForLearner(gated.result, state.screen === "playing");
    }
  };

  const handleYearChange = async (nextYear: YearGroupFilter) => {
    const gated = runIfParentGateUnlocked(parentGateUnlocked, () => nextYear);
    if (!gated.allowed) return;
    playSfx("tap");
    setYearGroupFilter(gated.result);
    if (learner?.id !== undefined) {
      await composeAndLoadSession(
        learner.id,
        gated.result,
        selectedTheme,
        state.screen === "playing"
      );
    }
  };

  const handleThemeChange = async (nextTheme: LearnerThemePreference) => {
    const gated = runIfParentGateUnlocked(parentGateUnlocked, () => nextTheme);
    if (!gated.allowed) return;
    playSfx("tap");
    setSelectedTheme(gated.result);
    if (learner?.id !== undefined) {
      const updated = await updateLearnerTheme(learner.id, gated.result);
      if (updated) setLearner(updated);
      await composeAndLoadSession(
        learner.id,
        yearGroupFilter,
        gated.result,
        state.screen === "playing"
      );
    }
  };

  const handleToggleSfx = () => {
    runIfParentGateUnlocked(parentGateUnlocked, () => {
      const next = !sfxOn;
      setSfxOn(next);
      setSfxEnabled(next);
      if (next) playSfx("tap");
    });
  };

  const handleQuickStart = async () => {
    const profile = await ensureDefaultLearner();
    setActiveStory(null);
    await handleStartForLearner(profile, true);
  };

  const handleToggleCalmMode = () => {
    const next = !calmMode;
    setCalmMode(next);
    setCalmModeEnabled(next);
    if (next) {
      setMusicOn(false);
    }
    playSfx("tap");
  };

  const handleToggleMusic = () => {
    runIfParentGateUnlocked(parentGateUnlocked, () => {
      const next = !musicOn;
      setMusicOn(next);
      setMusicEnabled(next);
      playSfx("tap");
    });
  };

  const advanceToNextOrCelebrate = useCallback(
    async (playTapCue: boolean) => {
      const snapshot = stateRef.current;
      if (
        advancingRef.current ||
        !snapshot.earnedIndices.has(snapshot.currentIndex)
      ) {
        return;
      }
      advancingRef.current = true;
      clearAutoAdvanceTimer();
      if (playTapCue) playSfx("tap");
      stopAudio();

      if (snapshot.currentIndex + 1 < snapshot.session.items.length) {
        dispatch({ type: "ADVANCE_STEP" });
      } else if (shouldCelebrateQuest(snapshot)) {
        if (learner?.id !== undefined) {
          const reward = await syncAndUnlockStickers(
            learner.id,
            snapshot.newlyUnlockedStickers.length === 0
          );
          dispatch({
            type: "MERGE_STICKERS",
            totalStars: reward.totalStars,
            unlocked: reward.newlyUnlocked,
          });
        }
        dispatch({ type: "FINISH_QUEST" });
        void playSuccessThenPraise(
          "feedback/quest-complete",
          "Amazing work! You earned stars for your sticker chest!"
        );
      } else {
        dispatch({ type: "FINISH_QUEST" });
      }
    },
    [clearAutoAdvanceTimer, learner?.id]
  );

  const handleSkipStep = useCallback(async () => {
    const snapshot = stateRef.current;
    if (advancingRef.current || !isSkipAvailable(snapshot)) return;

    advancingRef.current = true;
    clearAutoAdvanceTimer();
    stopAudio();

    const isLastStep =
      snapshot.currentIndex + 1 >= snapshot.session.items.length;

    // Gentle skip: awards NO star and plays NO praise on skipped steps.
    // On the final step, only celebrate if at least one earlier step was solved.
    if (isLastStep && shouldCelebrateQuest(snapshot)) {
      if (learner?.id !== undefined) {
        const reward = await syncAndUnlockStickers(
          learner.id,
          snapshot.newlyUnlockedStickers.length === 0
        );
        dispatch({
          type: "MERGE_STICKERS",
          totalStars: reward.totalStars,
          unlocked: reward.newlyUnlocked,
        });
      }
      dispatch({ type: "SKIP_STEP" });
      void playSuccessThenPraise(
        "feedback/quest-complete",
        "Amazing work! You earned stars for your sticker chest!"
      );
      return;
    }

    dispatch({ type: "SKIP_STEP" });
  }, [clearAutoAdvanceTimer, learner?.id]);

  const handleAttempt = async (isCorrect: boolean) => {
    if (!currentExercise) return;
    const stepKey = `${state.currentIndex}:${currentExercise.id}`;

    if (isCorrect && (isCurrentSolved || solvedStepLockRef.current === stepKey)) {
      return;
    }

    setActivityNonce((n) => n + 1);
    const retriesCount = isCorrect
      ? state.retriesOnCurrent
      : state.retriesOnCurrent + 1;
    const hintUsed = state.hintUsedOnCurrent;
    const durationMs = Date.now() - startedAtRef.current;

    if (!isCorrect) {
      dispatch({ type: "RECORD_RETRY" });
      playSfx("retry");
      const tryAgainKey = pickTryAgainAudioKey(
        `${state.currentIndex}:${currentExercise.id}:${retriesCount}`
      );
      void playAudioKey(tryAgainKey, TRY_AGAIN_AUDIO_SCRIPTS[tryAgainKey]);
      if (learner?.id !== undefined) {
        await recordAdaptiveAttempt({
          learnerId: learner.id,
          exerciseId: currentExercise.id,
          skillId: currentExercise.skillId,
          isCorrect: false,
          retriesCount,
          hintUsed,
          durationMs,
        });
      }
      return;
    }

    solvedStepLockRef.current = stepKey;
    dispatch({ type: "RECORD_CORRECT", nowMs: Date.now() });

    // Persist progress + stickers in parallel with the non-overlapping jingle -> praise audio
    const persistPromise = (async () => {
      if (learner?.id === undefined) return;
      await recordAdaptiveAttempt({
        learnerId: learner.id,
        exerciseId: currentExercise.id,
        skillId: currentExercise.skillId,
        isCorrect: true,
        retriesCount,
        hintUsed,
        durationMs,
      });
      const result = await syncAndUnlockStickers(learner.id, false);
      dispatch({
        type: "MERGE_STICKERS",
        totalStars: result.totalStars,
        unlocked: result.newlyUnlocked,
      });
    })();

    const praiseKey = pickPraiseAudioKey(
      `${state.currentIndex}:${currentExercise.id}`
    );
    const praiseCompleted = await playSuccessThenPraise(
      praiseKey,
      PRAISE_AUDIO_SCRIPTS[praiseKey]
    );
    await persistPromise;

    // Ignore if user already moved on or opened ParentGate
    if (
      activeStepKeyRef.current !== stepKey ||
      advancingRef.current ||
      parentGateOpenRef.current
    ) {
      return;
    }

    // Only pause auto-advance if an explicit replay/hint tap paused it
    if (!praiseCompleted || !canAutoAdvance(stateRef.current)) {
      return;
    }

    dispatch({ type: "BEGIN_ADVANCE" });
    clearAutoAdvanceTimer();
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      if (
        activeStepKeyRef.current !== stepKey ||
        advancingRef.current ||
        parentGateOpenRef.current ||
        stateRef.current.autoAdvancePaused
      ) {
        return;
      }
      void advanceToNextOrCelebrate(false);
    }, AUTO_ADVANCE_DELAY_MS);
  };

  const handleStartFreshQuest = () => {
    playSfx("tap");
    if (learner?.id !== undefined) {
      void composeAndLoadSession(
        learner.id,
        yearGroupFilter,
        selectedTheme,
        true
      );
    }
  };

  const mascotMood = deriveMascotMood(state);
  const activeAvatarId = resolveCompanionAvatarId(learner);
  const visibleStories = useMemo(
    () => getStoriesForYearFilter(yearGroupFilter),
    [yearGroupFilter]
  );

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {activeStory ? (
          <motion.div
            key={`screen-story-${activeStory.storyId}`}
            variants={SCREEN_TRANSITION_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <StoryPlayer
              story={activeStory}
              learner={learner}
              avatarId={activeAvatarId}
              availableStories={visibleStories}
              onSelectStory={(nextStory) => setActiveStory(nextStory)}
              onExitStory={() => {
                setActiveStory(null);
                dispatch({ type: "GO_WELCOME" });
              }}
            />
          </motion.div>
        ) : state.screen === "welcome" ? (
          <motion.div
            key="screen-welcome"
            variants={SCREEN_TRANSITION_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <WelcomeScreen
              activeLearner={learner}
              stories={visibleStories}
              calmMode={calmMode}
              onToggleCalmMode={handleToggleCalmMode}
              onSelectLearner={(profile) => {
                setActiveStory(null);
                void handleStartForLearner(profile, true);
              }}
              onQuickStart={() => void handleQuickStart()}
              onStartStory={(story) => {
                clearAutoAdvanceTimer();
                stopAudio();
                setActiveStory(story);
              }}
              onOpenStickerChest={() => setShowStickerChestModal(true)}
              onParentUnlock={handleUnlockParentSettings}
              onRequestParentChallenge={handleRequestParentChallenge}
            />
          </motion.div>
        ) : (
          <motion.div
            key="screen-session"
            variants={SCREEN_TRANSITION_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            className="no-print mx-auto flex min-h-screen max-w-5xl flex-col gap-4 overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5"
          >
            {/* Minimal Child Top Strip: Companion + Stepping-Stone Path + Discreet Home */}
            <header className="flex items-center gap-3">
              <SparkyMascot
                avatarId={activeAvatarId}
                mood={mascotMood}
                size="sm"
                onTap={handlePlayPrompt}
              />

              <StarProgressBar
                total={activeItems.length}
                currentIndex={state.currentIndex}
                earnedIndices={state.earnedIndices}
                avatarId={activeAvatarId}
              />

              <button
                type="button"
                onClick={() => {
                  clearAutoAdvanceTimer();
                  playSfx("tap");
                  stopAudio();
                  if (
                    shouldConfirmSessionExit({
                      mode: "quest",
                      stage: state.screen,
                    })
                  ) {
                    setShowLeaveConfirm(true);
                  } else {
                    dispatch({ type: "GO_WELCOME" });
                  }
                }}
                aria-label="Back to Who's playing"
                className="touch-card flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/85 shadow-sm ring-2 ring-sky-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
              >
                <HomeIconSvg className="h-8 w-8" />
              </button>
            </header>

            <AnimatePresence mode="wait" initial={false}>
              {state.screen === "celebrating" ? (
                <motion.div
                  key="stage-celebrating"
                  variants={SCREEN_TRANSITION_VARIANTS}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-1 flex-col"
                >
                  <CelebrationStickerChest
                    mode="post-session"
                    avatarId={activeAvatarId}
                    starsThisSession={state.earnedIndices.size}
                    totalExercises={activeItems.length}
                    lifetimeStars={state.lifetimeStars}
                    unlockedRecords={unlockedStickers}
                    newlyUnlocked={state.newlyUnlockedStickers}
                    onPlayNextQuest={handleStartFreshQuest}
                    onFinishForToday={() => {
                      clearAutoAdvanceTimer();
                      playSfx("tap");
                      stopAudio();
                      dispatch({ type: "GO_WELCOME" });
                    }}
                    onParentUnlock={handleUnlockParentSettings}
                    onRequestParentChallenge={handleRequestParentChallenge}
                  />
                </motion.div>
              ) : currentExercise ? (
                <motion.div
                  key={currentStepKey}
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
                    isFinalStep={
                      activeItems.length > 0 &&
                      state.currentIndex === activeItems.length - 1
                    }
                    isPromptSpeaking={state.isPromptSpeaking}
                    hintPulseActive={state.hintPulseActive}
                    skipAvailable={isSkipAvailable(state)}
                    feedbackPhase={state.phase}
                    retriesCount={state.retriesOnCurrent}
                    avatarId={activeAvatarId}
                    onPlayPrompt={handlePlayPrompt}
                    onPlayHint={handlePlayHint}
                    onAttempt={(ok) => void handleAttempt(ok)}
                    onThinkingChange={(thinking) =>
                      dispatch({ type: "SET_THINKING", thinking })
                    }
                    onUserInteraction={handleUserInteraction}
                    onNext={() => void advanceToNextOrCelebrate(true)}
                    onSkip={() => void handleSkipStep()}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="stage-empty"
                  variants={SCREEN_TRANSITION_VARIANTS}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl bg-white p-8 text-center shadow-lg"
                >
                  <SparkyMascot mood="thinking" />
                  <button
                    type="button"
                    onClick={() => {
                      playSfx("tap");
                      dispatch({ type: "GO_WELCOME" });
                    }}
                    aria-label="Back to Who's playing"
                    className="touch-card flex h-20 w-24 items-center justify-center rounded-3xl bg-sky-700 text-4xl text-white shadow-md hover:bg-sky-800"
                  >
                    🏠
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spoken-free ParentGate Challenge Modal */}
      <ParentGateModal
        isOpen={showParentGateChallenge && !parentGateUnlocked}
        onUnlock={handleUnlockParentSettings}
        onCancel={() => setShowParentGateChallenge(false)}
      />

      {/* Single Gated Parent Settings & Parent Bridge Modal */}
      <ParentBridgeModal
        isOpen={parentGateUnlocked}
        isGateUnlocked={parentGateUnlocked}
        onClose={() => {
          playSfx("tap");
          setParentGateUnlocked(false);
        }}
        learner={learner}
        onSelectLearner={(next) => void handleSwitchLearnerFromSettings(next)}
        onProfileUpdated={(updated) =>
          void handleProfileUpdatedFromSettings(updated)
        }
        yearGroupFilter={yearGroupFilter}
        onChangeYearGroup={(yr) => void handleYearChange(yr)}
        selectedTheme={selectedTheme}
        onChangeTheme={(theme) => void handleThemeChange(theme)}
        sfxOn={sfxOn}
        onToggleSfx={handleToggleSfx}
        musicOn={musicOn}
        onToggleMusic={handleToggleMusic}
        calmMode={calmMode}
        onToggleCalmMode={handleToggleCalmMode}
        onStartFreshQuest={handleStartFreshQuest}
        unlockedStickers={unlockedStickers}
        currentSkill={currentSkill}
        currentExercise={currentExercise}
        packSkillIds={scopedSkillIds}
        masteryRecords={masteryRecords}
        session={state.session}
      />

      {/* Quick-peek Sticker Chest modal launched from Wee World */}
      {showStickerChestModal && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="My Sticker Chest"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <CelebrationStickerChest
              mode="chest-modal"
              avatarId={activeAvatarId}
              lifetimeStars={state.lifetimeStars}
              unlockedRecords={unlockedStickers}
              newlyUnlocked={[]}
              onClose={() => {
                playSfx("tap");
                setShowStickerChestModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Gentle mid-quest exit confirmation dialog */}
      <LeaveSessionModal
        isOpen={showLeaveConfirm}
        mode="quest"
        starsEarned={state.earnedIndices.size}
        avatarId={activeAvatarId}
        onKeepPlaying={() => setShowLeaveConfirm(false)}
        onConfirmLeave={() => {
          setShowLeaveConfirm(false);
          clearAutoAdvanceTimer();
          stopAudio();
          dispatch({ type: "GO_WELCOME" });
        }}
      />

      {/* Dedicated A4 print-only target — mounted ONLY after passing ParentGate */}
      {parentGateUnlocked && (
        <div className="print-only-sheet hidden">
          <PrintablePracticeSheet
            learner={learner}
            packSkillIds={scopedSkillIds}
            masteryRecords={masteryRecords}
          />
        </div>
      )}
    </>
  );
}

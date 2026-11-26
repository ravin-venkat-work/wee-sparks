import type { ComposedSession } from "./adaptive/sessionComposer";
import type { StickerDefinition } from "./stickers";

export const HINT_PULSE_INACTIVITY_MS = 8000;
export const SKIP_UNLOCK_RETRIES = 3;
export const SKIP_UNLOCK_INACTIVITY_MS = 25000;
export const POST_SOLVE_DOUBLE_TAP_WINDOW_MS = 1000;
export const AUTO_ADVANCE_DELAY_MS = 700;

export type PlayerScreen = "welcome" | "playing" | "celebrating";

export type FeedbackPhase =
  | "idle"
  | "thinking"
  | "encourage"
  | "correct"
  | "advancing";

export type SessionMascotMood =
  | "idle"
  | "thinking"
  | "encouraging"
  | "celebrating";

export type InteractionSource =
  | "pointer"
  | "answer-card"
  | "audio-replay"
  | "hint";

export interface SessionState {
  screen: PlayerScreen;
  session: ComposedSession;
  currentIndex: number;
  earnedIndices: Set<number>;
  phase: FeedbackPhase;
  solvedAtMs: number | null;
  retriesOnCurrent: number;
  hintUsedOnCurrent: boolean;
  hintPulseActive: boolean;
  skipInactivityElapsed: boolean;
  autoAdvancePaused: boolean;
  isPromptSpeaking: boolean;
  newlyUnlockedStickers: StickerDefinition[];
  lifetimeStars: number;
}

export type SessionAction =
  | {
      type: "START_SESSION";
      session: ComposedSession;
      lifetimeStars: number;
      enterPlaying: boolean;
    }
  | { type: "GO_WELCOME" }
  | { type: "SET_SPEAKING"; speaking: boolean }
  | { type: "SET_THINKING"; thinking: boolean }
  | {
      type: "USER_ACTIVITY";
      source?: InteractionSource;
      nowMs?: number;
    }
  | { type: "HINT_INACTIVITY_ELAPSED" }
  | { type: "SKIP_INACTIVITY_ELAPSED" }
  | { type: "USE_HINT"; nowMs?: number }
  | { type: "RECORD_RETRY" }
  | { type: "RECORD_CORRECT"; nowMs?: number }
  | {
      type: "PAUSE_AUTO_ADVANCE";
      source: InteractionSource;
      nowMs?: number;
    }
  | { type: "BEGIN_ADVANCE" }
  | { type: "ADVANCE_STEP" }
  | { type: "SKIP_STEP" }
  | { type: "FINISH_QUEST" }
  | {
      type: "MERGE_STICKERS";
      totalStars: number;
      unlocked: StickerDefinition[];
    };

export function createInitialSessionState(
  session: ComposedSession
): SessionState {
  return {
    screen: "welcome",
    session,
    currentIndex: 0,
    earnedIndices: new Set(),
    phase: "idle",
    solvedAtMs: null,
    retriesOnCurrent: 0,
    hintUsedOnCurrent: false,
    hintPulseActive: false,
    skipInactivityElapsed: false,
    autoAdvancePaused: false,
    isPromptSpeaking: false,
    newlyUnlockedStickers: [],
    lifetimeStars: 0,
  };
}

/**
 * True during the 1-second grace window immediately after solving a step,
 * so rapid double-taps never interrupt praise or pause auto-advance.
 */
export function isWithinPostSolveWindow(
  state: Pick<SessionState, "phase" | "solvedAtMs">,
  nowMs: number = Date.now()
): boolean {
  if (
    (state.phase !== "correct" && state.phase !== "advancing") ||
    state.solvedAtMs === null
  ) {
    return false;
  }
  return nowMs - state.solvedAtMs < POST_SOLVE_DOUBLE_TAP_WINDOW_MS;
}

/**
 * Only explicit audio replay or hint taps — and only after the 1s post-solve
 * double-tap grace window — may pause auto-advance. Pointer taps on the
 * just-solved answer card or general stage never pause auto-advance.
 */
export function canInteractionPauseAutoAdvance(
  state: Pick<SessionState, "phase" | "solvedAtMs">,
  source: InteractionSource | undefined,
  nowMs: number = Date.now()
): boolean {
  if (state.phase !== "correct" && state.phase !== "advancing") {
    return false;
  }
  if (source !== "audio-replay" && source !== "hint") {
    return false;
  }
  if (isWithinPostSolveWindow(state, nowMs)) {
    return false;
  }
  return true;
}

/**
 * True only when the child has earned at least one star in the session.
 * Prevents celebrating or playing quest-complete praise when every step was skipped.
 */
export function shouldCelebrateQuest(
  state: Pick<SessionState, "earnedIndices">
): boolean {
  return state.earnedIndices.size > 0;
}

/**
 * True once the child has had 3 wrong tries OR 25s of inactivity on an unsolved step.
 */
export function isSkipAvailable(
  state: Pick<
    SessionState,
    | "screen"
    | "phase"
    | "currentIndex"
    | "earnedIndices"
    | "retriesOnCurrent"
    | "skipInactivityElapsed"
  >
): boolean {
  if (state.screen !== "playing") return false;
  if (state.earnedIndices.has(state.currentIndex)) return false;
  if (state.phase === "correct" || state.phase === "advancing") return false;
  return (
    state.retriesOnCurrent >= SKIP_UNLOCK_RETRIES ||
    state.skipInactivityElapsed
  );
}

/**
 * Pure finite state machine reducer for KidSessionPlayer:
 *   idle -> thinking / encourage -> correct -> advancing -> (next idle | celebrating)
 *
 * Also manages:
 * - 8-second inactivity hint pulse (`hintPulseActive`)
 * - 3-retry or 25-second inactivity gentle skip (`SKIP_STEP`, awarding no star)
 * - solved-only quest celebration (`shouldCelebrateQuest`)
 * - double-tap immunity on just-solved cards + 1s post-solve grace window
 * - explicit audio-replay / hint linger override (`autoAdvancePaused`)
 */
export function sessionStateReducer(
  state: SessionState,
  action: SessionAction
): SessionState {
  switch (action.type) {
    case "START_SESSION":
      return {
        ...state,
        screen: action.enterPlaying ? "playing" : state.screen,
        session: action.session,
        currentIndex: 0,
        earnedIndices: new Set(),
        phase: "idle",
        solvedAtMs: null,
        retriesOnCurrent: 0,
        hintUsedOnCurrent: false,
        hintPulseActive: false,
        skipInactivityElapsed: false,
        autoAdvancePaused: false,
        isPromptSpeaking: false,
        newlyUnlockedStickers: [],
        lifetimeStars: action.lifetimeStars,
      };

    case "GO_WELCOME":
      return {
        ...state,
        screen: "welcome",
        phase: "idle",
        solvedAtMs: null,
        hintPulseActive: false,
        skipInactivityElapsed: false,
        autoAdvancePaused: false,
        isPromptSpeaking: false,
      };

    case "SET_SPEAKING":
      return {
        ...state,
        isPromptSpeaking: action.speaking,
        hintPulseActive: action.speaking ? false : state.hintPulseActive,
      };

    case "SET_THINKING": {
      if (state.phase === "correct" || state.phase === "advancing") {
        return state;
      }
      return {
        ...state,
        hintPulseActive: action.thinking ? false : state.hintPulseActive,
        phase: action.thinking
          ? "thinking"
          : state.phase === "thinking"
          ? "idle"
          : state.phase,
      };
    }

    case "USER_ACTIVITY": {
      const nowMs = action.nowMs ?? Date.now();
      const shouldPause = canInteractionPauseAutoAdvance(
        state,
        action.source,
        nowMs
      );
      const nextPhase =
        shouldPause && state.phase === "advancing" ? "correct" : state.phase;

      if (
        !state.hintPulseActive &&
        (!shouldPause || state.autoAdvancePaused) &&
        nextPhase === state.phase
      ) {
        return state;
      }

      return {
        ...state,
        phase: nextPhase,
        hintPulseActive: false,
        autoAdvancePaused: shouldPause ? true : state.autoAdvancePaused,
      };
    }

    case "HINT_INACTIVITY_ELAPSED": {
      if (!shouldTrackHintInactivity(state)) {
        return state;
      }
      return {
        ...state,
        hintPulseActive: true,
      };
    }

    case "SKIP_INACTIVITY_ELAPSED": {
      if (!shouldTrackSkipInactivity(state)) {
        return state;
      }
      return {
        ...state,
        skipInactivityElapsed: true,
      };
    }

    case "USE_HINT": {
      const nowMs = action.nowMs ?? Date.now();
      if (state.phase === "correct" || state.phase === "advancing") {
        if (!canInteractionPauseAutoAdvance(state, "hint", nowMs)) {
          return state;
        }
        return {
          ...state,
          hintPulseActive: false,
          autoAdvancePaused: true,
          phase: "correct",
        };
      }
      return {
        ...state,
        hintUsedOnCurrent: true,
        hintPulseActive: false,
        phase: "thinking",
      };
    }

    case "RECORD_RETRY": {
      if (state.phase === "correct" || state.phase === "advancing") {
        return state;
      }
      return {
        ...state,
        retriesOnCurrent: state.retriesOnCurrent + 1,
        hintPulseActive: false,
        phase: "encourage",
      };
    }

    case "RECORD_CORRECT": {
      const nextEarned = new Set(state.earnedIndices);
      nextEarned.add(state.currentIndex);
      return {
        ...state,
        earnedIndices: nextEarned,
        solvedAtMs: action.nowMs ?? Date.now(),
        hintPulseActive: false,
        skipInactivityElapsed: false,
        autoAdvancePaused: false,
        phase: "correct",
      };
    }

    case "PAUSE_AUTO_ADVANCE": {
      const nowMs = action.nowMs ?? Date.now();
      if (!canInteractionPauseAutoAdvance(state, action.source, nowMs)) {
        return state;
      }
      return {
        ...state,
        phase: "correct",
        autoAdvancePaused: true,
      };
    }

    case "BEGIN_ADVANCE": {
      if (
        state.screen !== "playing" ||
        state.phase !== "correct" ||
        state.autoAdvancePaused
      ) {
        return state;
      }
      return {
        ...state,
        phase: "advancing",
        hintPulseActive: false,
      };
    }

    case "ADVANCE_STEP": {
      // Next is only permitted once the current step is solved
      if (!state.earnedIndices.has(state.currentIndex)) {
        return state;
      }
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.session.items.length) {
        if (!shouldCelebrateQuest(state)) {
          return {
            ...state,
            screen: "welcome",
            phase: "idle",
            solvedAtMs: null,
            hintPulseActive: false,
            skipInactivityElapsed: false,
            autoAdvancePaused: false,
            isPromptSpeaking: false,
          };
        }
        return {
          ...state,
          screen: "celebrating",
          phase: "correct",
          solvedAtMs: null,
          hintPulseActive: false,
          skipInactivityElapsed: false,
          autoAdvancePaused: false,
          isPromptSpeaking: false,
        };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        phase: state.earnedIndices.has(nextIndex) ? "correct" : "idle",
        solvedAtMs: null,
        retriesOnCurrent: 0,
        hintUsedOnCurrent: false,
        hintPulseActive: false,
        skipInactivityElapsed: false,
        autoAdvancePaused: false,
        isPromptSpeaking: false,
      };
    }

    case "SKIP_STEP": {
      if (!isSkipAvailable(state)) {
        return state;
      }
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.session.items.length) {
        if (shouldCelebrateQuest(state)) {
          return {
            ...state,
            screen: "celebrating",
            phase: "correct",
            solvedAtMs: null,
            retriesOnCurrent: 0,
            hintUsedOnCurrent: false,
            hintPulseActive: false,
            skipInactivityElapsed: false,
            autoAdvancePaused: false,
            isPromptSpeaking: false,
          };
        }
        return {
          ...state,
          screen: "welcome",
          phase: "idle",
          solvedAtMs: null,
          retriesOnCurrent: 0,
          hintUsedOnCurrent: false,
          hintPulseActive: false,
          skipInactivityElapsed: false,
          autoAdvancePaused: false,
          isPromptSpeaking: false,
        };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        phase: state.earnedIndices.has(nextIndex) ? "correct" : "idle",
        solvedAtMs: null,
        retriesOnCurrent: 0,
        hintUsedOnCurrent: false,
        hintPulseActive: false,
        skipInactivityElapsed: false,
        autoAdvancePaused: false,
        isPromptSpeaking: false,
      };
    }

    case "FINISH_QUEST":
      if (!shouldCelebrateQuest(state)) {
        return {
          ...state,
          screen: "welcome",
          phase: "idle",
          solvedAtMs: null,
          hintPulseActive: false,
          skipInactivityElapsed: false,
          autoAdvancePaused: false,
          isPromptSpeaking: false,
        };
      }
      return {
        ...state,
        screen: "celebrating",
        phase: "correct",
        solvedAtMs: null,
        hintPulseActive: false,
        skipInactivityElapsed: false,
        autoAdvancePaused: false,
        isPromptSpeaking: false,
      };

    case "MERGE_STICKERS": {
      if (action.unlocked.length === 0) {
        return { ...state, lifetimeStars: action.totalStars };
      }
      const seen = new Set(state.newlyUnlockedStickers.map((s) => s.id));
      const merged = [
        ...state.newlyUnlockedStickers,
        ...action.unlocked.filter((s) => !seen.has(s.id)),
      ];
      return {
        ...state,
        lifetimeStars: action.totalStars,
        newlyUnlockedStickers: merged,
      };
    }
  }
}

export function deriveMascotMood(
  state: Pick<SessionState, "screen" | "phase">
): SessionMascotMood {
  if (
    state.screen === "celebrating" ||
    state.phase === "correct" ||
    state.phase === "advancing"
  ) {
    return "celebrating";
  }
  if (state.phase === "encourage") return "encouraging";
  if (state.phase === "thinking") return "thinking";
  return "idle";
}

export function shouldTrackHintInactivity(
  state: Pick<
    SessionState,
    "screen" | "phase" | "isPromptSpeaking" | "hintPulseActive"
  >
): boolean {
  return (
    state.screen === "playing" &&
    !state.isPromptSpeaking &&
    !state.hintPulseActive &&
    (state.phase === "idle" ||
      state.phase === "thinking" ||
      state.phase === "encourage")
  );
}

export function shouldTrackSkipInactivity(
  state: Pick<
    SessionState,
    | "screen"
    | "phase"
    | "currentIndex"
    | "earnedIndices"
    | "retriesOnCurrent"
    | "skipInactivityElapsed"
  >
): boolean {
  return (
    state.screen === "playing" &&
    !state.earnedIndices.has(state.currentIndex) &&
    !isSkipAvailable(state) &&
    (state.phase === "idle" ||
      state.phase === "thinking" ||
      state.phase === "encourage")
  );
}

export function canAutoAdvance(
  state: Pick<SessionState, "screen" | "phase" | "autoAdvancePaused">
): boolean {
  return (
    state.screen === "playing" &&
    state.phase === "correct" &&
    !state.autoAdvancePaused
  );
}

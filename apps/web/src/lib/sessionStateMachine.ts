import type { ComposedSession } from "./adaptive/sessionComposer";
import type { StickerDefinition } from "./stickers";

export const HINT_PULSE_INACTIVITY_MS = 8000;
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

export interface SessionState {
  screen: PlayerScreen;
  session: ComposedSession;
  currentIndex: number;
  earnedIndices: Set<number>;
  phase: FeedbackPhase;
  retriesOnCurrent: number;
  hintUsedOnCurrent: boolean;
  hintPulseActive: boolean;
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
  | { type: "USER_ACTIVITY" }
  | { type: "HINT_INACTIVITY_ELAPSED" }
  | { type: "USE_HINT" }
  | { type: "RECORD_RETRY" }
  | { type: "RECORD_CORRECT" }
  | { type: "PAUSE_AUTO_ADVANCE" }
  | { type: "BEGIN_ADVANCE" }
  | { type: "ADVANCE_STEP" }
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
    retriesOnCurrent: 0,
    hintUsedOnCurrent: false,
    hintPulseActive: false,
    autoAdvancePaused: false,
    isPromptSpeaking: false,
    newlyUnlockedStickers: [],
    lifetimeStars: 0,
  };
}

/**
 * Pure finite state machine reducer for KidSessionPlayer:
 *   idle -> thinking / encourage -> correct -> advancing -> (next idle | celebrating)
 *
 * Also manages:
 * - 8-second inactivity hint pulse (`hintPulseActive`)
 * - linger / pause override (`autoAdvancePaused`) so children who replay audio
 *   or linger on a solved step can advance at their own pace with the big Next button.
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
        retriesOnCurrent: 0,
        hintUsedOnCurrent: false,
        hintPulseActive: false,
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
        hintPulseActive: false,
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
      const shouldPauseAuto =
        state.phase === "correct" || state.phase === "advancing";
      const nextPhase =
        state.phase === "advancing" ? "correct" : state.phase;
      if (
        !state.hintPulseActive &&
        (!shouldPauseAuto || state.autoAdvancePaused) &&
        nextPhase === state.phase
      ) {
        return state;
      }
      return {
        ...state,
        phase: nextPhase,
        hintPulseActive: false,
        autoAdvancePaused: shouldPauseAuto ? true : state.autoAdvancePaused,
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

    case "USE_HINT": {
      if (state.phase === "correct" || state.phase === "advancing") {
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
        hintPulseActive: false,
        autoAdvancePaused: false,
        phase: "correct",
      };
    }

    case "PAUSE_AUTO_ADVANCE": {
      if (state.phase !== "correct" && state.phase !== "advancing") {
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
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.session.items.length) {
        return {
          ...state,
          screen: "celebrating",
          phase: "correct",
          hintPulseActive: false,
          autoAdvancePaused: false,
          isPromptSpeaking: false,
        };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        phase: state.earnedIndices.has(nextIndex) ? "correct" : "idle",
        retriesOnCurrent: 0,
        hintUsedOnCurrent: false,
        hintPulseActive: false,
        autoAdvancePaused: false,
        isPromptSpeaking: false,
      };
    }

    case "FINISH_QUEST":
      return {
        ...state,
        screen: "celebrating",
        phase: "correct",
        hintPulseActive: false,
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

export function canAutoAdvance(
  state: Pick<SessionState, "screen" | "phase" | "autoAdvancePaused">
): boolean {
  return (
    state.screen === "playing" &&
    state.phase === "correct" &&
    !state.autoAdvancePaused
  );
}

"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type LearnerProfile } from "@/lib/db";
import { playAudioKey, playSfx } from "@/lib/audio";
import { SparkyMascot } from "./SparkyMascot";
import { AudioReplayButton } from "./AudioReplayButton";
import { ParentGateTrigger } from "./ParentGate";

interface WelcomeScreenProps {
  onSelectLearner: (learner: LearnerProfile) => void;
  onParentUnlock: () => void;
  onRequestParentChallenge: () => void;
}

/**
 * Child-first "Who's playing?" welcome screen.
 * Displays big tactile avatar buttons for existing Dexie learners so a child
 * can tap their own picture to start playing immediately, with a ParentGate
 * corner trigger (hold 3s or tap for spoken-free sum) tucked away from play.
 */
export function WelcomeScreen({
  onSelectLearner,
  onParentUnlock,
  onRequestParentChallenge,
}: WelcomeScreenProps) {
  const learners = useLiveQuery(
    () => db.learners.orderBy("id").toArray(),
    [],
    []
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  const playWelcomePrompt = () => {
    playSfx("tap");
    void playAudioKey(
      "prompt/whos-playing",
      "Who's playing? Tap your picture to start!",
      {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      }
    );
  };

  return (
    <div className="no-print relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-8 sm:px-6">
      {/* Discreet ParentGate trigger tucked in top-right corner */}
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ParentGateTrigger
          onUnlock={onParentUnlock}
          onRequestChallenge={onRequestParentChallenge}
        />
      </div>

      {/* Sparky + Big Audio Prompt */}
      <div className="flex flex-col items-center text-center">
        <SparkyMascot mood="idle" onTap={playWelcomePrompt} />

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
          <AudioReplayButton
            onClick={playWelcomePrompt}
            isPlaying={isSpeaking}
            ariaLabel="Hear welcome prompt: Who's playing?"
          />
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Who&apos;s playing?
          </h1>
        </div>
      </div>

      {/* Big Avatar Buttons for Existing Learners */}
      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
        {learners.map((profile) => (
          <button
            key={profile.id ?? profile.displayName}
            type="button"
            onClick={() => {
              playSfx("snap");
              onSelectLearner(profile);
            }}
            aria-label={`Play as ${profile.displayName}`}
            className="touch-card flex min-h-[156px] flex-col items-center justify-center gap-3 rounded-3xl border-4 border-sky-200 bg-white p-6 text-center shadow-md ring-2 ring-sky-100 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
          >
            <span
              className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-6xl shadow-inner ring-4 ring-amber-200"
              aria-hidden="true"
            >
              {profile.avatarEmoji}
            </span>
            <span className="text-2xl font-black text-slate-900">
              {profile.displayName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

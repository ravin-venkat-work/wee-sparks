"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { StoryBook } from "@wee-sparks/curriculum-schema";
import { db, type LearnerProfile } from "@/lib/db";
import { getCompanionAvatar, resolveCompanionAvatarId } from "@/lib/avatars";
import { playAudioKey, playSfx } from "@/lib/audio";
import { CompanionAvatarSvg } from "../avatars/CompanionAvatarSvg";
import { StorySceneIllustration } from "../story/StorySceneIllustration";
import { SparkyMascot } from "./SparkyMascot";
import { AudioReplayButton } from "./AudioReplayButton";
import { ParentGateTrigger } from "./ParentGate";

interface WelcomeScreenProps {
  activeLearner?: LearnerProfile | null;
  stories?: readonly StoryBook[];
  onSelectLearner: (learner: LearnerProfile) => void;
  onStartStory?: (story: StoryBook) => void;
  onParentUnlock: () => void;
  onRequestParentChallenge: () => void;
}

/**
 * Child-first "Who's playing?" welcome screen.
 * Displays big tactile animated avatar buttons for existing Dexie learners so a
 * child can tap their own picture to start an Adaptive Quest immediately, plus
 * an illustrated Story Adventures shelf and a discreet ParentGate corner trigger.
 */
export function WelcomeScreen({
  activeLearner = null,
  stories = [],
  onSelectLearner,
  onStartStory,
  onParentUnlock,
  onRequestParentChallenge,
}: WelcomeScreenProps) {
  const learners = useLiveQuery(
    () => db.learners.orderBy("id").toArray(),
    [],
    []
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  const heroAvatarId = resolveCompanionAvatarId(activeLearner ?? learners[0]);

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

      {/* Companion Mascot + Big Audio Prompt */}
      <div className="flex flex-col items-center text-center">
        <SparkyMascot
          avatarId={heroAvatarId}
          mood="idle"
          onTap={playWelcomePrompt}
        />

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

      {/* Big Animated Avatar Buttons for Existing Learners */}
      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
        {learners.map((profile) => {
          const avatarId = resolveCompanionAvatarId(profile);
          const avatarDef = getCompanionAvatar(avatarId);
          return (
            <button
              key={profile.id ?? profile.displayName}
              type="button"
              onClick={() => {
                playSfx("snap");
                onSelectLearner(profile);
              }}
              aria-label={`Play as ${profile.displayName}`}
              className="touch-card flex min-h-[168px] flex-col items-center justify-center gap-3 rounded-3xl border-4 border-sky-200 bg-white p-6 text-center shadow-md ring-2 ring-sky-100 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
            >
              <span
                className={`flex h-24 w-24 items-center justify-center rounded-full p-2 shadow-inner ring-4 ${avatarDef.badgeBgClass} ${avatarDef.ringClass}`}
                aria-hidden="true"
              >
                <CompanionAvatarSvg avatarId={avatarId} mood="idle" />
              </span>
              <span className="text-2xl font-black text-slate-900">
                {profile.displayName}
              </span>
              <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-extrabold text-sky-900">
                {profile.yearGroup} · {avatarDef.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Illustrated Story Adventures Shelf */}
      {stories.length > 0 && onStartStory && (
        <section
          aria-labelledby="story-adventures-heading"
          className="mt-10 w-full max-w-3xl"
        >
          <div className="mb-3 flex items-center justify-center gap-2 text-center">
            <span className="text-2xl" aria-hidden="true">
              📖
            </span>
            <h2
              id="story-adventures-heading"
              className="text-xl font-black text-slate-900 sm:text-2xl"
            >
              Story Adventures
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stories.map((story) => (
              <button
                key={story.storyId}
                type="button"
                onClick={() => {
                  playSfx("snap");
                  onStartStory(story);
                }}
                aria-label={`Start story: ${story.title}`}
                className="touch-card flex flex-col gap-3 rounded-3xl border-4 border-amber-200 bg-white p-4 text-left shadow-md transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
              >
                <StorySceneIllustration
                  illustration={story.coverIllustration}
                  companionAvatarId={story.companionAvatarId}
                  companionMood="idle"
                  compact
                />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-black leading-snug text-slate-900">
                      {story.title}
                    </h3>
                    <p className="mt-0.5 text-sm font-semibold text-slate-600">
                      {story.subtitle}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-indigo-600 px-3 py-1 text-xs font-extrabold text-white">
                    {story.yearGroup}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-extrabold text-slate-600">
                    {story.chapters.length} Story Chapters
                  </span>
                  <span className="rounded-xl bg-sky-700 px-3 py-1.5 text-xs font-extrabold text-white">
                    Read &amp; Play ➡️
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

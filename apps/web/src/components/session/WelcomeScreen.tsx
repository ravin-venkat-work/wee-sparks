"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { StoryBook } from "@wee-sparks/curriculum-schema";
import { db, type LearnerProfile } from "@/lib/db";
import { STICKER_CATALOG } from "@/lib/stickers";
import { getCompanionAvatar, resolveCompanionAvatarId } from "@/lib/avatars";
import { playAudioKey, playSfx } from "@/lib/audio";
import { CompanionAvatarSvg } from "../avatars/CompanionAvatarSvg";
import {
  ArrowRightIconSvg,
  BookIconSvg,
  ChestIconSvg,
  MoonCalmIconSvg,
  PlayIconSvg,
  StarIconSvg,
} from "../icons/KidUiIcons";
import { StorySceneIllustration } from "../story/StorySceneIllustration";
import { FirstRunSetupCard } from "./FirstRunSetupCard";
import { SparkyMascot } from "./SparkyMascot";
import { AudioReplayButton } from "./AudioReplayButton";
import { ParentGateTrigger } from "./ParentGate";

interface WelcomeScreenProps {
  activeLearner?: LearnerProfile | null;
  stories?: readonly StoryBook[];
  calmMode?: boolean;
  onToggleCalmMode?: () => void;
  onSelectLearner: (learner: LearnerProfile) => void;
  onQuickStart: () => void;
  onStartStory?: (story: StoryBook) => void;
  onOpenStickerChest?: () => void;
  onParentUnlock: () => void;
  onRequestParentChallenge: () => void;
}

/**
 * Panoramic Giant's Causeway coastal header illustration for Wee World.
 */
function WeeWorldCausewayBanner() {
  return (
    <svg
      viewBox="0 0 640 120"
      preserveAspectRatio="xMidYMid slice"
      className="h-24 w-full sm:h-28"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="weeWorldSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="55%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>
      </defs>
      <rect width="640" height="120" fill="url(#weeWorldSky)" />
      {/* Sun & soft clouds */}
      <circle cx="566" cy="36" r="22" fill="#FDE047" />
      <circle cx="566" cy="36" r="30" fill="#FDE047" opacity="0.25" />
      <g fill="#FFFFFF" opacity="0.9">
        <ellipse cx="110" cy="32" rx="34" ry="12" />
        <ellipse cx="136" cy="28" rx="22" ry="11" />
        <ellipse cx="360" cy="26" rx="32" ry="11" />
        <ellipse cx="386" cy="24" rx="20" ry="10" />
      </g>
      {/* Rolling Antrim green hills */}
      <path
        d="M0 78 Q120 42 250 74 T500 68 T640 76 L640 120 L0 120 Z"
        fill="#4ADE80"
      />
      {/* North Channel sea */}
      <path
        d="M0 84 Q80 74 160 84 T320 84 T480 84 T640 84 L640 120 L0 120 Z"
        fill="#0284C7"
      />
      {/* Hexagonal Giant's Causeway basalt stepping stones */}
      {[
        { x: 26, y: 86, w: 38, top: "#CBD5E1", side: "#475569" },
        { x: 68, y: 92, w: 38, top: "#FDE047", side: "#B45309" },
        { x: 110, y: 88, w: 38, top: "#E2E8F0", side: "#64748B" },
        { x: 472, y: 90, w: 38, top: "#CBD5E1", side: "#475569" },
        { x: 514, y: 84, w: 38, top: "#FDE047", side: "#B45309" },
        { x: 556, y: 92, w: 38, top: "#E2E8F0", side: "#64748B" },
      ].map((stone, idx) => (
        <g key={idx}>
          <rect
            x={stone.x}
            y={stone.y}
            width={stone.w}
            height={120 - stone.y}
            rx="3"
            fill={stone.side}
          />
          <polygon
            points={`${stone.x + stone.w / 2},${stone.y - 8} ${stone.x + stone.w},${stone.y} ${stone.x + stone.w / 2},${stone.y + 8} ${stone.x},${stone.y}`}
            fill={stone.top}
            stroke="#334155"
            strokeWidth="1.4"
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * Causeway-themed "Wee World" Home Hub.
 * - On a fresh device (zero local profiles), shows the friendly first-run setup
 *   card with a 1-tap Quick Start option.
 * - When local profiles exist, presents a warm Giant's Causeway hub featuring
 *   Today's Quest, quick sibling switcher cards, a Sticker Chest peek, Story
 *   Quests, Calm Mode toggle, and ParentGate controls.
 */
export function WelcomeScreen({
  activeLearner = null,
  stories = [],
  calmMode = false,
  onToggleCalmMode,
  onSelectLearner,
  onQuickStart,
  onStartStory,
  onOpenStickerChest,
  onParentUnlock,
  onRequestParentChallenge,
}: WelcomeScreenProps) {
  const learners = useLiveQuery(() => db.learners.orderBy("id").toArray(), []);
  const primaryLearner = activeLearner ?? learners?.[0] ?? null;

  const primaryStats = useLiveQuery(
    async () => {
      if (!primaryLearner?.id) return { stars: 0, stickers: 0 };
      const [attempts, stickers] = await Promise.all([
        db.attempts.where("learnerId").equals(primaryLearner.id).toArray(),
        db.stickers.where("learnerId").equals(primaryLearner.id).count(),
      ]);
      return {
        stars: attempts.filter((a) => a.isCorrect).length,
        stickers,
      };
    },
    [primaryLearner?.id],
    { stars: 0, stickers: 0 }
  );

  const [isSpeaking, setIsSpeaking] = useState(false);

  const isLoading = learners === undefined;
  const hasLearners = (learners?.length ?? 0) > 0;
  const heroAvatarId = resolveCompanionAvatarId(primaryLearner);
  const heroAvatarDef = getCompanionAvatar(heroAvatarId);

  const playWelcomePrompt = () => {
    playSfx("tap");
    void playAudioKey(
      "prompt/whos-playing",
      hasLearners && primaryLearner
        ? `Welcome to Wee World, ${primaryLearner.displayName}! Tap Today's Quest or pick a story adventure!`
        : "Welcome to Wee Sparks! Let's set up your first explorer, or tap Quick Start to play straight away!",
      {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      }
    );
  };

  return (
    <div className="no-print relative mx-auto flex min-h-screen max-w-4xl flex-col items-center px-4 pb-12 pt-24 sm:px-6 sm:pt-20">
      {/* Discreet Calm Mode & ParentGate controls tucked in top-right corner */}
      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-5">
        {onToggleCalmMode && (
          <button
            type="button"
            aria-pressed={calmMode}
            onClick={onToggleCalmMode}
            aria-label={
              calmMode
                ? "Calm mode is on: quiet audio and reduced motion"
                : "Turn on calm mode for quiet audio and reduced motion"
            }
            className={`touch-card flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold shadow-sm ring-1 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 sm:text-sm ${
              calmMode
                ? "bg-indigo-700 text-white ring-indigo-800"
                : "bg-white/90 text-slate-700 ring-slate-200 hover:bg-white"
            }`}
          >
            <MoonCalmIconSvg className="h-5 w-5" />
            <span>{calmMode ? "Calm: On" : "Calm Mode"}</span>
          </button>
        )}

        <ParentGateTrigger
          onUnlock={onParentUnlock}
          onRequestChallenge={onRequestParentChallenge}
        />
      </div>

      {/* Causeway-Themed Wee World Banner + Mascot */}
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border-4 border-sky-200 bg-white shadow-md">
        <WeeWorldCausewayBanner />

        <div className="-mt-10 flex flex-col items-center px-5 pb-6 text-center sm:px-7">
          <SparkyMascot
            avatarId={heroAvatarId}
            mood="idle"
            onTap={playWelcomePrompt}
          />

          <span className="mt-3 rounded-full bg-sky-100 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-sky-900">
            Wee World · Giant&apos;s Causeway Hub
          </span>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
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
      </div>

      {/* First-Run Setup Flow (zero profiles) OR Wee World Quest Hub */}
      {isLoading ? (
        <div
          aria-live="polite"
          className="mt-8 rounded-3xl bg-white/80 px-8 py-6 text-base font-extrabold text-slate-600 shadow-sm ring-2 ring-sky-100"
        >
          Loading local profiles…
        </div>
      ) : !hasLearners ? (
        <FirstRunSetupCard
          onComplete={onSelectLearner}
          onQuickStart={onQuickStart}
        />
      ) : (
        <div className="mt-7 w-full max-w-3xl space-y-8">
          {/* Today's Quest Hero Card + Sticker Chest Peek */}
          {primaryLearner && (
            <section
              aria-labelledby="todays-quest-heading"
              className="rounded-3xl border-4 border-emerald-200 bg-gradient-to-br from-white via-sky-50/60 to-emerald-50/70 p-5 shadow-md sm:p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl p-2 shadow-inner ring-4 ${heroAvatarDef.badgeBgClass} ${heroAvatarDef.ringClass}`}
                    aria-hidden="true"
                  >
                    <CompanionAvatarSvg avatarId={heroAvatarId} mood="idle" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-800">
                      Today&apos;s Causeway Quest · {primaryLearner.yearGroup}
                    </p>
                    <h2
                      id="todays-quest-heading"
                      className="text-2xl font-black text-slate-900"
                    >
                      {primaryLearner.displayName} &amp; {heroAvatarDef.name}
                    </h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-extrabold text-slate-700">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-950">
                        <StarIconSvg className="h-4 w-4" />
                        <span>{primaryStats.stars} Stars</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-sky-950">
                        <ChestIconSvg className="h-4 w-4" />
                        <span>
                          {primaryStats.stickers} / {STICKER_CATALOG.length}{" "}
                          Stickers
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playSfx("snap");
                      onSelectLearner(primaryLearner);
                    }}
                    aria-label={`Play as ${primaryLearner.displayName}`}
                    className="touch-card inline-flex flex-1 items-center justify-center gap-2.5 rounded-3xl bg-emerald-700 px-7 py-4 text-lg font-black text-white shadow-md hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 sm:flex-initial"
                  >
                    <PlayIconSvg className="h-6 w-6" />
                    <span>Today&apos;s Quest</span>
                  </button>

                  {onOpenStickerChest && (
                    <button
                      type="button"
                      onClick={() => {
                        playSfx("tap");
                        onOpenStickerChest();
                      }}
                      aria-label={`Open ${primaryLearner.displayName}'s Sticker Chest`}
                      className="touch-card inline-flex items-center justify-center gap-2 rounded-3xl bg-amber-100 px-5 py-4 text-base font-black text-amber-950 ring-2 ring-amber-300 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500"
                    >
                      <ChestIconSvg className="h-7 w-7" />
                      <span>Stickers</span>
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Switch Explorer Cards (when multiple children share this device) */}
          {learners.length > 1 && (
            <section aria-labelledby="switch-explorer-heading">
              <h2
                id="switch-explorer-heading"
                className="mb-3 text-center text-lg font-black text-slate-800"
              >
                Or Pick Another Explorer
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      className="touch-card flex items-center gap-4 rounded-3xl border-4 border-sky-200 bg-white p-4 text-left shadow-sm transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
                    >
                      <span
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl p-1.5 ring-2 ${avatarDef.badgeBgClass} ${avatarDef.ringClass}`}
                        aria-hidden="true"
                      >
                        <CompanionAvatarSvg avatarId={avatarId} mood="idle" />
                      </span>
                      <div className="flex-1">
                        <div className="text-xl font-black text-slate-900">
                          {profile.displayName}
                        </div>
                        <div className="text-xs font-extrabold text-sky-900">
                          {profile.yearGroup} · {avatarDef.name}
                        </div>
                      </div>
                      <span className="rounded-2xl bg-sky-700 p-3 text-white">
                        <ArrowRightIconSvg className="h-5 w-5" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Illustrated Story Quests Shelf */}
          {stories.length > 0 && onStartStory && (
            <section aria-labelledby="story-adventures-heading">
              <div className="mb-3 flex items-center justify-center gap-2 text-center">
                <BookIconSvg className="h-7 w-7" />
                <h2
                  id="story-adventures-heading"
                  className="text-xl font-black text-slate-900 sm:text-2xl"
                >
                  Story Quests
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
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-1.5 text-xs font-extrabold text-white">
                        <span>Read &amp; Play</span>
                        <ArrowRightIconSvg className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

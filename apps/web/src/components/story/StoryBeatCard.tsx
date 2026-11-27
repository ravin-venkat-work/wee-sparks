"use client";

import { useEffect, useState } from "react";
import type {
  CompanionAvatarId,
  StoryChapter,
} from "@wee-sparks/curriculum-schema";
import { playAudioKey, playSfx, stopAudio } from "@/lib/audio";
import { AudioReplayButton } from "../session/AudioReplayButton";
import { StorySceneIllustration } from "./StorySceneIllustration";

interface StoryBeatCardProps {
  storyTitle: string;
  chapter: StoryChapter;
  chapterIndex: number;
  totalChapters: number;
  companionAvatarId: CompanionAvatarId;
  onStartChallenge: () => void;
}

/**
 * Illustrated story beat card that reads a short NI-flavoured narrative segment
 * with audio replay before transitioning smoothly into the chapter's interactive
 * CCEA P1/P2 literacy or numeracy challenge.
 */
export function StoryBeatCard({
  storyTitle,
  chapter,
  chapterIndex,
  totalChapters,
  companionAvatarId,
  onStartChallenge,
}: StoryBeatCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const playNarration = () => {
    void playAudioKey(chapter.narrationAudioKey, chapter.narrationText, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  useEffect(() => {
    playNarration();
    return () => {
      stopAudio();
    };
    // Re-trigger narration whenever advancing to a new story chapter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.chapterId]);

  return (
    <section className="flex flex-1 flex-col justify-between gap-5 rounded-3xl bg-white/95 p-5 shadow-lg ring-2 ring-amber-200 sm:p-7">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-amber-100 px-3.5 py-1 text-xs font-black uppercase tracking-wide text-amber-900">
            📖 {storyTitle}
          </span>
          <span className="rounded-full bg-sky-100 px-3.5 py-1 text-xs font-extrabold text-sky-900">
            Chapter {chapterIndex + 1} of {totalChapters}
          </span>
        </div>

        <StorySceneIllustration
          illustration={chapter.illustration}
          companionAvatarId={companionAvatarId}
          companionMood={chapter.companionMood}
        />

        <div className="flex flex-wrap items-start gap-4 pt-1">
          <AudioReplayButton
            onClick={() => {
              playSfx("tap");
              playNarration();
            }}
            isPlaying={isSpeaking}
            ariaLabel={`Hear story chapter: ${chapter.title}`}
          />

          <div className="min-w-[200px] flex-1 space-y-1.5">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              {chapter.visualCueEmoji && (
                <span className="mr-2" aria-hidden="true">
                  {chapter.visualCueEmoji}
                </span>
              )}
              {chapter.title}
            </h2>
            <p className="text-lg font-bold leading-relaxed text-slate-700 sm:text-xl">
              {chapter.narrationText}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t-2 border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => {
            stopAudio();
            playSfx("snap");
            onStartChallenge();
          }}
          className="touch-card flex min-h-[68px] items-center justify-center gap-3 rounded-3xl bg-sky-700 px-8 py-4 text-xl font-black text-white shadow-md hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
        >
          <span>Play Challenge</span>
          <span aria-hidden="true">➡️</span>
        </button>
      </div>
    </section>
  );
}

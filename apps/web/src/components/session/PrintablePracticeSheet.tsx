"use client";

import {
  getMicroSkillById,
  type MicroSkill,
  type MicroSkillId,
} from "@wee-sparks/curriculum-schema";
import type { LearnerProfile, SkillMasteryRecord } from "@/lib/db";

interface PrintablePracticeSheetProps {
  learner: LearnerProfile | null;
  packSkillIds: readonly MicroSkillId[];
  masteryRecords: readonly SkillMasteryRecord[];
}

interface PrioritySkillItem {
  skill: MicroSkill;
  record?: SkillMasteryRecord;
}

/**
 * Selects up to 3 lowest-mastery skills for the active learner so the
 * printable practice sheet targets what they need most right now.
 */
export function selectLowestMasterySkills(
  packSkillIds: readonly MicroSkillId[],
  masteryRecords: readonly SkillMasteryRecord[],
  limit = 3
): PrioritySkillItem[] {
  const masteryMap = new Map<MicroSkillId, SkillMasteryRecord>(
    masteryRecords.map((r) => [r.skillId, r])
  );

  const uniqueSkillIds = Array.from(
    new Set<MicroSkillId>([
      ...packSkillIds,
      ...masteryRecords.map((r) => r.skillId),
    ])
  );

  return uniqueSkillIds
    .map((id) => ({
      skill: getMicroSkillById(id),
      record: masteryMap.get(id),
    }))
    .sort((a, b) => {
      const scoreA = a.record ? a.record.masteryScore : -0.1;
      const scoreB = b.record ? b.record.masteryScore : -0.1;
      if (scoreA !== scoreB) return scoreA - scoreB;
      return a.skill.code.localeCompare(b.skill.code);
    })
    .slice(0, limit);
}

function renderSkillActivityBlock(skill: MicroSkill) {
  switch (skill.id) {
    case "ccea-p1-lit-initial-satpin":
      return (
        <div className="mt-2 space-y-2">
          <p className="text-xs font-bold text-slate-700">
            1. Say each pure sound aloud, trace the letter, then draw something
            that starts with it:
          </p>
          <div className="grid grid-cols-6 gap-2 text-center">
            {["s", "a", "t", "p", "i", "n"].map((letter) => (
              <div
                key={letter}
                className="rounded-xl border-2 border-dashed border-slate-400 p-2"
              >
                <div className="text-2xl font-black text-slate-400">
                  {letter}
                </div>
                <div className="mt-2 h-6 border-b border-slate-300" />
              </div>
            ))}
          </div>
        </div>
      );

    case "ccea-p1-lit-cvc-blend-satpin":
      return (
        <div className="mt-2 space-y-2">
          <p className="text-xs font-bold text-slate-700">
            Tap each dot below the Elkonin sound boxes, blend the word, and draw
            a quick sketch beside it:
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["s", "a", "t"],
              ["p", "i", "n"],
              ["t", "a", "p"],
            ].map((word) => (
              <div
                key={word.join("")}
                className="rounded-xl border border-slate-300 p-2 text-center"
              >
                <div className="flex justify-center gap-1">
                  {word.map((ch, idx) => (
                    <div key={`${ch}-${idx}`} className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded border-2 border-slate-700 text-lg font-black">
                        {ch}
                      </div>
                      <span className="mt-1 h-2 w-2 rounded-full bg-slate-700" />
                    </div>
                  ))}
                </div>
                <div className="mt-2 h-8 rounded border border-dashed border-slate-300" />
              </div>
            ))}
          </div>
        </div>
      );

    case "ccea-p1-lit-hfw-p1":
      return (
        <div className="mt-2 space-y-2 text-sm text-slate-800">
          <p className="text-xs font-bold text-slate-700">
            Word Bank: <span className="font-black">the · in · and · to</span>
          </p>
          <ul className="space-y-1.5 font-semibold">
            <li>1. Look at ________ moon!</li>
            <li>2. The egg is ________ the nest.</li>
            <li>3. A pig ________ an ant.</li>
            <li>4. Drive the bus ________ the park.</li>
          </ul>
        </div>
      );

    case "ccea-p1-num-ten-frames-1-10":
      return (
        <div className="mt-2 space-y-2">
          <p className="text-xs font-bold text-slate-700">
            Draw dots inside each Ten-Frame to build the number, then write how
            many empty squares are left:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[4, 7].map((target) => (
              <div key={target} className="space-y-1">
                <div className="text-xs font-black text-slate-900">
                  Draw {target} counters (Empty left: ____)
                </div>
                <div className="grid grid-cols-5 border-2 border-slate-800">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-7 border border-slate-500"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "ccea-p1-num-bonds-to-5":
      return (
        <div className="mt-2 space-y-2">
          <p className="text-xs font-bold text-slate-700">
            Hop along the number line and fill in the missing number to make 5:
          </p>
          <div className="flex justify-between border-b-2 border-slate-800 px-2 pb-1 text-xs font-black">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-sm font-bold">
            <div>2 + ___ = 5</div>
            <div>4 + ___ = 5</div>
            <div>3 + ___ = 5</div>
          </div>
        </div>
      );

    case "ccea-p2-lit-digraphs-sh-ch-th-ng":
      return (
        <div className="mt-2 space-y-2">
          <p className="text-xs font-bold text-slate-700">
            Underline the two-letter team sound (sh, ch, th, ng) in each word, then read aloud:
          </p>
          <div className="grid grid-cols-4 gap-2 text-center text-lg font-black">
            {["ship", "chip", "moth", "ring"].map((w) => (
              <div key={w} className="rounded-lg border border-slate-300 py-2">
                {w}
              </div>
            ))}
          </div>
        </div>
      );

    case "ccea-p2-lit-cvcc-ccvc":
      return (
        <div className="mt-2 space-y-2">
          <p className="text-xs font-bold text-slate-700">
            Tap all 4 dots and blend each 4-sound Stage 2 word:
          </p>
          <div className="grid grid-cols-4 gap-2 text-center text-base font-black">
            {["f·r·o·g", "s·t·o·p", "t·e·n·t", "s·t·e·p"].map((w) => (
              <div key={w} className="rounded-lg border border-slate-300 py-2">
                {w}
              </div>
            ))}
          </div>
        </div>
      );

    case "ccea-p2-num-bonds-to-10":
    case "ccea-p2-num-add-sub-within-20":
      return (
        <div className="mt-2 space-y-2 text-sm font-bold text-slate-800">
          <p className="text-xs font-bold text-slate-700">
            Complete the number bonds and 0–20 jumps:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>7 + ___ = 10</div>
            <div>6 + ___ = 10</div>
            <div>12 + ___ = 20</div>
            <div>8 + 5 = ___</div>
          </div>
        </div>
      );

    case "ccea-p1-num-coins-1p-5p":
    case "ccea-p2-num-coins-to-20p":
      return (
        <div className="mt-2 space-y-1.5 text-sm font-semibold text-slate-800">
          <p className="text-xs font-bold text-slate-700">
            {skill.yearGroup === "P2"
              ? "Circle UK coins that add up to 15p (use real 1p, 2p, 5p, 10p, 20p coins at home!):"
              : "Circle UK coins that add up to 5p (use real 1p, 2p, 5p coins at home!):"}
          </p>
          <div className="flex flex-wrap gap-2">
            {(skill.yearGroup === "P2"
              ? ["10p", "5p", "2p", "2p", "1p", "20p"]
              : ["2p", "2p", "1p", "1p", "5p"]
            ).map((coin, i) => (
              <span
                key={`${coin}-${i}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-700 text-xs font-black"
              >
                {coin}
              </span>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="mt-2 rounded-xl border border-dashed border-slate-400 p-3 text-xs text-slate-700">
          Draw or write 3 examples together using the Parent Tip above!
          <div className="mt-3 h-10 border-b border-slate-300" />
        </div>
      );
  }
}

/**
 * Clean, ink-friendly A4 printable practice sheet tailored to the active
 * learner's lowest-mastery CCEA micro-skills and offlineParentTip guidance.
 */
export function PrintablePracticeSheet({
  learner,
  packSkillIds,
  masteryRecords,
}: PrintablePracticeSheetProps) {
  const prioritySkills = selectLowestMasterySkills(
    packSkillIds,
    masteryRecords,
    3
  );
  const todayLabel = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="rounded-2xl border-2 border-slate-300 bg-white p-6 text-slate-900 print:rounded-none print:border-0 print:p-0">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Northern Ireland CCEA Foundation Stage · Screen-Free Practice
          </p>
          <h2 className="text-2xl font-black text-slate-950">
            ✨ Wee Sparks Practice Sheet
          </h2>
        </div>
        <div className="text-right text-xs font-bold text-slate-700">
          <div>
            Learner: {learner?.displayName ?? "Wee Explorer"} (
            {learner?.yearGroup ?? "P1"})
          </div>
          <div>Date: {todayLabel}</div>
        </div>
      </header>

      <div className="mt-4 space-y-4">
        {prioritySkills.map(({ skill, record }, idx) => {
          const masteryPct = record ? Math.round(record.masteryScore * 100) : 0;
          return (
            <section
              key={skill.id}
              className="break-inside-avoid rounded-xl border border-slate-300 p-4"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-black text-slate-950">
                  {idx + 1}. {skill.code} — {skill.title}
                </h3>
                <span className="text-xs font-bold text-slate-600">
                  Current Mastery: {masteryPct}%
                </span>
              </div>

              <p className="mt-1 rounded-lg bg-slate-100 px-3 py-2 text-xs leading-relaxed text-slate-800">
                <span className="font-black">Parent Tip:</span>{" "}
                {skill.offlineParentTip}
              </p>

              {renderSkillActivityBlock(skill)}
            </section>
          );
        })}
      </div>

      <footer className="mt-4 flex items-center justify-between border-t border-slate-300 pt-3 text-xs font-bold text-slate-700">
        <span>Draw a star in the box when finished!</span>
        <div className="flex h-10 w-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-500 text-slate-400">
          ☆
        </div>
      </footer>
    </article>
  );
}

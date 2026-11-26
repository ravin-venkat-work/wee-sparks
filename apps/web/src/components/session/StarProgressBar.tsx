"use client";

import { motion, useReducedMotion } from "motion/react";
import { MOTION_EASE, MOTION_SPRING } from "@/lib/motion";
import { SparkySvg } from "./SparkyMascot";

interface StarProgressBarProps {
  total: number;
  currentIndex: number;
  earnedIndices: ReadonlySet<number>;
}

/**
 * Hexagonal Giant's Causeway basalt stepping stone SVG tile.
 * Pure visual progress cue — zero text or numbers to read.
 */
function CausewayStone({
  index,
  earned,
  current,
  prefersReducedMotion,
}: {
  index: number;
  earned: boolean;
  current: boolean;
  prefersReducedMotion: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col items-center transition-transform duration-300 ${
        current ? "scale-110 -translate-y-1" : earned ? "animate-stone-pop" : ""
      }`}
    >
      {/* Shared-layout SVG Sparky hopping in an arc from stone to stone */}
      {current && (
        <motion.div
          layoutId="causeway-sparky-hop"
          transition={MOTION_SPRING.card}
          className="pointer-events-none absolute -top-7 z-10"
        >
          <motion.div
            key={`hop-${index}`}
            initial={{ y: 0, scale: 1 }}
            animate={
              prefersReducedMotion
                ? { y: 0, scale: 1 }
                : { y: [0, -16, 0], scale: [1, 1.15, 1] }
            }
            transition={{ duration: 0.42, ease: MOTION_EASE.smooth }}
          >
            <SparkySvg
              mood={earned ? "celebrating" : "idle"}
              animated={!prefersReducedMotion}
              className="h-9 w-9 drop-shadow-sm sm:h-10 sm:w-10"
            />
          </motion.div>
        </motion.div>
      )}

      <svg
        viewBox="0 0 56 52"
        className="h-11 w-12 sm:h-12 sm:w-14"
        aria-hidden="true"
      >
        {/* Basalt 3D column side */}
        <polygon
          points="8,24 28,36 48,24 48,38 28,50 8,38"
          fill={earned ? "#B45309" : current ? "#0284C7" : "#64748B"}
        />
        {/* Hexagonal top face */}
        <polygon
          points="28,4 48,15 48,26 28,37 8,26 8,15"
          fill={earned ? "#FDE047" : current ? "#BAE6FD" : "#E2E8F0"}
          stroke={earned ? "#CA8A04" : current ? "#0369A1" : "#94A3B8"}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {earned ? (
          <path
            d="M28 11 L30.8 17 L37.2 17.8 L32.4 22 L33.6 28.4 L28 25.2 L22.4 28.4 L23.6 22 L18.8 17.8 L25.2 17 Z"
            fill="#F59E0B"
            stroke="#92400E"
            strokeWidth="1.2"
          />
        ) : (
          <circle
            cx="28"
            cy="20.5"
            r="4.2"
            fill={current ? "#0284C7" : "#CBD5E1"}
          />
        )}
      </svg>
    </div>
  );
}

/**
 * Pure visual Giant's Causeway basalt stepping-stone progress path.
 * Contains zero text labels ("Step x/y", star counts, or titles) so
 * pre-readers track progress purely through golden stars and Sparky hopping
 * smoothly from stone to stone.
 */
export function StarProgressBar({
  total,
  currentIndex,
  earnedIndices,
}: StarProgressBarProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());

  return (
    <div
      className="flex flex-1 items-center justify-around gap-1.5 rounded-3xl bg-gradient-to-r from-sky-100 via-cyan-100/80 to-sky-100 px-3 pb-2 pt-6 shadow-sm ring-2 ring-sky-200"
      role="progressbar"
      aria-label="Quest progress"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={earnedIndices.size}
    >
      {Array.from({ length: total }).map((_, idx) => {
        const isEarned = earnedIndices.has(idx);
        const isCurrent = idx === currentIndex;
        return (
          <div
            key={idx}
            aria-current={isCurrent ? "step" : undefined}
            className={idx % 2 === 1 ? "translate-y-1" : "-translate-y-0.5"}
          >
            <CausewayStone
              index={idx}
              earned={isEarned}
              current={isCurrent}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
        );
      })}
    </div>
  );
}

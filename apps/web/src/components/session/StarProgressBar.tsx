"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CompanionAvatarId } from "@wee-sparks/curriculum-schema";
import { MOTION_EASE, MOTION_SPRING } from "@/lib/motion";
import { CompanionAvatarSvg } from "../avatars/CompanionAvatarSvg";

interface StarProgressBarProps {
  total: number;
  currentIndex: number;
  earnedIndices: ReadonlySet<number>;
  avatarId?: CompanionAvatarId;
}

interface OverlayPosition {
  x: number;
  y: number;
  ready: boolean;
}

/**
 * Hexagonal Giant's Causeway basalt stepping stone SVG tile.
 * Stone lift & stagger transforms live strictly on this motion element so
 * Sparky's overlay hop is never distorted by a CSS-transformed parent.
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
  const staggerY = index % 2 === 1 ? 3 : -2;
  const targetY = prefersReducedMotion ? staggerY : current ? staggerY - 4 : staggerY;
  const targetScale = prefersReducedMotion ? 1 : current ? 1.08 : 1;

  return (
    <motion.div
      animate={{ scale: targetScale, y: targetY }}
      transition={MOTION_SPRING.snappy}
      className={`flex flex-col items-center ${earned && !current ? "animate-stone-pop" : ""}`}
    >
      <svg
        viewBox="0 0 56 52"
        className="h-9 w-10 sm:h-12 sm:w-14"
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
    </motion.div>
  );
}

/**
 * Pure visual Giant's Causeway basalt stepping-stone progress path.
 * Renders Sparky in a separate, un-transformed overlay layer positioned
 * directly from the active stone's measured DOM rect so hops stay smooth
 * across 6+ stones even on narrow tablet viewports.
 */
export function StarProgressBar({
  total,
  currentIndex,
  earnedIndices,
  avatarId = "sparky",
}: StarProgressBarProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stoneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [sparkyPos, setSparkyPos] = useState<OverlayPosition>({
    x: 0,
    y: 0,
    ready: false,
  });
  const hasMeasuredRef = useRef(false);

  const clampedIndex =
    total > 0 ? Math.min(Math.max(0, currentIndex), total - 1) : 0;

  const measureActiveStone = useCallback(() => {
    const trackEl = trackRef.current;
    const stoneEl = stoneRefs.current[clampedIndex];
    if (!trackEl || !stoneEl) return;

    const trackRect = trackEl.getBoundingClientRect();
    const stoneRect = stoneEl.getBoundingClientRect();

    const nextX = stoneRect.left - trackRect.left + stoneRect.width / 2;
    const nextY = stoneRect.top - trackRect.top;

    setSparkyPos((prev) => {
      if (
        prev.ready &&
        Math.abs(prev.x - nextX) < 0.5 &&
        Math.abs(prev.y - nextY) < 0.5
      ) {
        return prev;
      }
      return { x: nextX, y: nextY, ready: true };
    });
  }, [clampedIndex]);

  useLayoutEffect(() => {
    measureActiveStone();
  }, [measureActiveStone, total]);

  useEffect(() => {
    if (sparkyPos.ready) {
      hasMeasuredRef.current = true;
    }
  }, [sparkyPos.ready]);

  useEffect(() => {
    const trackEl = trackRef.current;
    if (!trackEl || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      measureActiveStone();
    });
    observer.observe(trackEl);
    return () => observer.disconnect();
  }, [measureActiveStone]);

  const isCurrentEarned = earnedIndices.has(clampedIndex);

  return (
    <div
      ref={trackRef}
      className="relative flex flex-1 items-center justify-around gap-1 rounded-3xl bg-gradient-to-r from-sky-100 via-cyan-100/80 to-sky-100 px-2 pb-2 pt-7 shadow-sm ring-2 ring-sky-200 sm:gap-1.5 sm:px-3"
      role="progressbar"
      aria-label="Quest progress"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={earnedIndices.size}
    >
      {/* Stone slots (un-transformed anchors used for accurate rect measurement) */}
      {Array.from({ length: total }).map((_, idx) => {
        const isEarned = earnedIndices.has(idx);
        const isCurrent = idx === clampedIndex;
        return (
          <div
            key={idx}
            ref={(el) => {
              stoneRefs.current[idx] = el;
            }}
            data-testid={`causeway-stone-${idx}`}
            aria-current={isCurrent ? "step" : undefined}
            className="flex items-center justify-center"
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

      {/* Dedicated un-transformed overlay layer for Sparky's smooth stone-to-stone hop */}
      {total > 0 && sparkyPos.ready && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 overflow-visible"
        >
          <motion.div
            data-testid="causeway-sparky"
            initial={false}
            animate={{
              x: sparkyPos.x,
              y: sparkyPos.y,
            }}
            transition={
              prefersReducedMotion || !hasMeasuredRef.current
                ? { duration: 0 }
                : MOTION_SPRING.card
            }
            className="absolute left-0 top-0 -ml-4 -mt-7 sm:-ml-5 sm:-mt-8"
          >
            <motion.div
              key={`hop-${clampedIndex}`}
              initial={{ y: 0, scale: 1 }}
              animate={
                prefersReducedMotion || !hasMeasuredRef.current
                  ? { y: 0, scale: 1 }
                  : { y: [0, -16, 0], scale: [1, 1.14, 1] }
              }
              transition={{ duration: 0.42, ease: MOTION_EASE.smooth }}
            >
              <CompanionAvatarSvg
                avatarId={avatarId}
                mood={isCurrentEarned ? "celebrating" : "idle"}
                animated={!prefersReducedMotion}
                className="h-8 w-8 drop-shadow-sm sm:h-10 sm:w-10"
              />
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
